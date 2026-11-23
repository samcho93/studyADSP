// 자격증 문제은행 - 해시 라우팅 SPA
(function () {
  const $app = document.getElementById('app');
  const W = () => window.WRITTEN || {};
  const P = () => window.PRACTICAL || {};
  // 강좌 설정(js/course.js) — 과목 · 모의고사 구성
  const C = window.CERT_COURSE || {};
  const MOCK = Object.assign({ sets: 0, minutes: 150, passAvg: 60, cutoff: 40 }, C.mock || {});
  const MOCK_COUNT = MOCK.sets;
  const SUBJ = (C.subjects || []).filter(s => s.track !== 'practical').map(s => s.id);
  const SUBJ_NAME = Object.fromEntries((C.subjects || []).map(s => [s.id, s.title]));
  const HAS_P = (C.subjects || []).some(s => s.track === 'practical');
  const CN = ['①', '②', '③', '④'];

  // ---------- 유틸 ----------
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const h = (tag, attrs = {}, html = '') => { const e = document.createElement(tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (html) e.innerHTML = html; return e; };
  const pad = n => String(n).padStart(2, '0');
  const NS = (C.storeKey || 'cert') + '.';
  const store = {
    get(k, d) { try { const v = localStorage.getItem(NS + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch (e) { /* 저장 불가 환경 */ } },
    del(k) { try { localStorage.removeItem(NS + k); } catch (e) { /* noop */ } },
  };
  const norm = s => String(s ?? '').toLowerCase().replace(/[\s"'`“”‘’]/g, '');
  function checkSA(q, input) {
    const v = norm(input);
    if (!v) return false;
    return [q.answer, ...(q.accept || [])].some(a => norm(a) === v);
  }
  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = () => rej(new Error(src + ' 로드 실패'));
      document.head.appendChild(s);
    });
  }
  async function loadMock(n) {
    window.MOCKS = window.MOCKS || {};
    if (!MOCKS[n]) await loadScript(`data/mock/m${pad(n)}.js`);
    return MOCKS[n];
  }

  // 오답노트: key -> {t: 제목, at: 시각}
  const wrongs = {
    all() { return store.get('wrong', {}); },
    add(key, title) { const w = this.all(); w[key] = { t: title, at: Date.now() }; store.set('wrong', w); },
    remove(key) { const w = this.all(); delete w[key]; store.set('wrong', w); },
  };

  // ---------- 문제 렌더링 ----------
  function codeBlock(q) {
    if (!q.code) return '';
    return `<pre class="code"><code>${esc(q.code)}</code></pre>`;
  }

  // 객관식. mode: 'practice'(즉시 채점) | 'exam'(선택만) | 'review'(채점 결과 표시)
  function renderMCQ(q, num, opts = {}) {
    const mode = opts.mode || 'practice';
    const el = h('div', { class: 'q', id: opts.anchor || '' });
    const saved = mode === 'practice' && opts.key ? store.get('a.' + opts.key, null) : null;
    el.innerHTML = `
      <div class="q-head"><span class="num">${num}번</span>${q.src ? `<span class="tag">${esc(q.src)}</span>` : ''}${opts.extraTag || ''}<span class="spacer"></span><span class="result-badge"></span></div>
      <div class="q-body">${q.q}</div>${codeBlock(q)}
      <ol class="choices">${q.choices.map((c, i) => `<li><button data-i="${i + 1}"><span class="cn">${CN[i]}</span><span>${c}</span></button></li>`).join('')}</ol>
      <div class="exp" hidden></div>
      ${mode === 'practice' ? '<div class="row" style="margin-top:10px"><button class="btn small" data-act="show">정답 보기</button></div>' : ''}`;
    const btns = [...el.querySelectorAll('.choices button')];
    const expEl = el.querySelector('.exp');
    const badge = el.querySelector('.result-badge');

    function reveal(picked) {
      btns.forEach(b => {
        const i = +b.dataset.i;
        b.disabled = true;
        if (i === q.answer) b.classList.add('correct');
        else if (i === picked) b.classList.add('wrong');
      });
      expEl.hidden = false;
      expEl.innerHTML = `<span class="ans">정답: ${CN[q.answer - 1]}</span><br>${q.exp}`;
      if (picked) {
        const ok = picked === q.answer;
        badge.className = 'result-badge ' + (ok ? 'ok' : 'bad');
        badge.textContent = ok ? '정답 ✓' : '오답 ✗';
      } else if (mode === 'review') {
        badge.className = 'result-badge bad'; badge.textContent = '미응답';
      }
      const sb = el.querySelector('[data-act=show]'); if (sb) sb.remove();
    }
    el.reveal = reveal;

    if (mode === 'practice') {
      btns.forEach(b => b.addEventListener('click', () => {
        const picked = +b.dataset.i;
        reveal(picked);
        if (opts.key) {
          store.set('a.' + opts.key, picked);
          if (picked !== q.answer) wrongs.add(opts.key, opts.title || '');
        }
        opts.onAnswer && opts.onAnswer(picked === q.answer);
      }));
      el.querySelector('[data-act=show]').addEventListener('click', () => reveal(null));
      if (saved) reveal(saved);
    } else if (mode === 'exam') {
      const cur = opts.value;
      btns.forEach(b => {
        if (+b.dataset.i === cur) b.classList.add('picked');
        b.addEventListener('click', () => {
          btns.forEach(x => x.classList.remove('picked'));
          b.classList.add('picked');
          opts.onPick && opts.onPick(+b.dataset.i);
        });
      });
    } else if (mode === 'review') {
      reveal(opts.value || null);
    }
    return el;
  }

  // 주관식(실기). mode: 'practice' | 'exam' | 'review'
  function renderSA(q, num, opts = {}) {
    const mode = opts.mode || 'practice';
    const el = h('div', { class: 'q', id: opts.anchor || '' });
    el.innerHTML = `
      <div class="q-head"><span class="num">${num}번</span>${q.src ? `<span class="tag">${esc(q.src)}</span>` : ''}${q.runnable ? `<span class="tag blue">${esc(Runner.COMPILERS[q.lang]?.name || q.lang)} 실행 가능</span>` : ''}${opts.extraTag || ''}<span class="spacer"></span><span class="result-badge"></span></div>
      <div class="q-body">${q.q}</div>
      <div class="q-code"></div>
      <div class="answer-input">
        <textarea rows="${q.runnable ? 3 : 1}" placeholder="답안을 입력하세요" spellcheck="false"></textarea>
        ${mode === 'practice' ? '<button class="btn primary" data-act="check">채점</button><button class="btn" data-act="show">정답 보기</button>' : ''}
      </div>
      <div class="exp" hidden></div>`;
    const codeHost = el.querySelector('.q-code');
    if (q.runnable && window.Runner) {
      Runner.create(codeHost, { lang: q.lang, code: q.code, langs: [q.lang] });
    } else if (q.code) {
      codeHost.innerHTML = codeBlock(q);
    }
    const input = el.querySelector('.answer-input textarea');
    const expEl = el.querySelector('.exp');
    const badge = el.querySelector('.result-badge');
    if (opts.value) input.value = opts.value;

    function setBadge(ok) {
      if (ok == null) { badge.className = 'result-badge'; badge.textContent = ''; return; }
      badge.className = 'result-badge ' + (ok ? 'ok' : 'bad');
      badge.textContent = ok ? '정답 ✓' : '오답 ✗';
    }
    function reveal(ok, withSelfMark) {
      expEl.hidden = false;
      const ansHtml = /\n/.test(q.answer) ? `<pre class="code">${esc(q.answer)}</pre>` : esc(q.answer);
      expEl.innerHTML = `<span class="ans">정답:</span> ${ansHtml}${q.accept && q.accept.length ? `<br><small style="color:var(--muted)">허용 답안: ${q.accept.map(esc).join(' / ')}</small>` : ''}<br>${q.exp}
        ${withSelfMark ? '<div class="row" style="margin-top:8px"><span style="font-size:13px;color:var(--muted)">자동 채점이 틀렸다면:</span><span class="selfmark"><button class="btn small" data-m="1">맞음으로 처리</button><button class="btn small" data-m="0">틀림으로 처리</button></span></div>' : ''}`;
      setBadge(ok);
      expEl.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => {
        const v = b.dataset.m === '1';
        setBadge(v);
        opts.onMark && opts.onMark(v);
      }));
    }
    el.reveal = reveal;

    if (mode === 'practice') {
      const saved = opts.key ? store.get('a.' + opts.key, null) : null;
      el.querySelector('[data-act=check]').addEventListener('click', () => {
        const ok = checkSA(q, input.value);
        reveal(ok, true);
        if (opts.key) { store.set('a.' + opts.key, { v: input.value, ok }); if (!ok) wrongs.add(opts.key, opts.title || ''); }
        opts.onMark = v => { if (opts.key) { store.set('a.' + opts.key, { v: input.value, ok: v }); v ? wrongs.remove(opts.key) : wrongs.add(opts.key, opts.title || ''); } };
      });
      el.querySelector('[data-act=show]').addEventListener('click', () => reveal(null, false));
      if (saved) { input.value = saved.v || ''; reveal(saved.ok, false); }
    } else if (mode === 'exam') {
      input.addEventListener('input', () => opts.onInput && opts.onInput(input.value));
    } else if (mode === 'review') {
      input.readOnly = true;
      reveal(opts.ok, true);
    }
    return el;
  }

  // ---------- 페이지 ----------
  function setTitle(t) { const T = C.shortTitle || C.title || ''; document.title = t ? `${t} · ${T}` : T; }

  function pageHome() {
    setTitle('');
    const ws = Object.values(W()), ps = Object.values(P());
    const nPast = ws.reduce((a, s) => a + (s.past?.length || 0), 0);
    const nGen = ws.reduce((a, s) => a + (s.generated?.length || 0), 0);
    const nPrac = ps.reduce((a, t) => a + (t.questions?.length || 0), 0);
    const nRun = ps.reduce((a, t) => a + (t.questions || []).filter(q => q.runnable).length, 0);
    $app.innerHTML = `
      <section class="card hero">
        <h1>${esc(C.icon || '')} ${esc(C.title || '')}</h1>
        ${C.intro ? `<p class="lead">${C.intro}</p>` : ''}
        <div class="row">${SUBJ.length ? '<a class="btn primary" href="#/written">필기 공부 시작</a>' : ''}${ps.length ? `<a class="btn${SUBJ.length ? '' : ' primary'}" href="#/practical">실기 공부</a>` : ''}${MOCK_COUNT ? '<a class="btn" href="#/mock">모의고사 풀기</a>' : ''}</div>
        <div class="stats">
          ${SUBJ.length ? `<div class="stat"><b>${nPast}</b><span>필기 기출 유형</span></div><div class="stat"><b>${nGen}</b><span>필기 생성 문제</span></div>` : ''}
          ${ps.length ? `<div class="stat"><b>${nPrac}</b><span>실기 문제</span></div>` : ''}
          ${nRun ? `<div class="stat"><b>${nRun}</b><span>실행 가능한 코드 문제</span></div>` : ''}
          ${MOCK_COUNT ? `<div class="stat"><b>${MOCK_COUNT}회</b><span>모의고사</span></div>` : ''}
        </div>
      </section>
      ${SUBJ.length ? `<h2>필기 과목</h2>
      <div class="grid">${SUBJ.map((k, i) => subjCard(k, i)).join('')}</div>` : ''}
      ${ps.length ? `<h2>실기 과목</h2><div class="grid">${practicalTopics().map(t => `<a class="card" href="#/practical/${t.id}"><span class="num">실기 ${t.order}</span><h3>${esc(t.title)}</h3><p>${esc(t.desc || '')}</p><div class="meta"><span>${t.chapters.length}개 장</span><span>문제 ${t.questions.length}</span></div></a>`).join('')}</div>` : ''}
      ${window.HomeInfo ? HomeInfo.html() : ''}
      <p class="note">이 사이트의 기출 문항은 출제된 개념을 바탕으로 재구성한 유형 문제입니다.</p>`;
    if (window.HomeInfo) HomeInfo.bind($app);
  }
  function subjCard(k, i) {
    const s = W()[k];
    if (!s) return `<div class="card"><span class="num">${i + 1}과목</span><h3>${SUBJ_NAME[k]}</h3><p>준비 중</p></div>`;
    const done = [...s.past.map((_, j) => `w:${k}:past:${j}`), ...s.generated.map((_, j) => `w:${k}:gen:${j}`)].filter(x => store.get('a.' + x, null) != null).length;
    const total = s.past.length + s.generated.length;
    return `<a class="card" href="#/written/${k}"><span class="num">${i + 1}과목</span><h3>${esc(s.title)}</h3><p>${esc(s.desc || '')}</p>
      <div class="meta"><span>이론 ${s.chapters.length}단원</span><span>기출 ${s.past.length}</span><span>생성 ${s.generated.length}</span></div>
      <div class="row" style="margin-top:8px"><div class="progress"><i style="width:${total ? done / total * 100 : 0}%"></i></div><small style="color:var(--muted)">${done}/${total}</small></div></a>`;
  }

  function pageWrittenList() {
    setTitle('필기 이론');
    $app.innerHTML = `<div class="crumbs"><a href="#/">홈</a> › 필기</div><h1>필기 이론</h1>
      <p class="lead">과목별 핵심 이론을 읽고, 기출 유형 문제와 생성 문제로 바로 확인하세요. 보기를 누르면 즉시 채점되고 해설이 나옵니다.</p>
      <div class="grid">${SUBJ.map((k, i) => subjCard(k, i)).join('')}</div>`;
  }

  // 문제 진행률(풀이 수, 정답 수)
  function progressOf(s, sid, kind, idxs) {
    const list = kind === 'past' ? s.past : s.generated;
    let done = 0, ok = 0;
    idxs.forEach(g => {
      const a = store.get(`a.w:${sid}:${kind}:${g}`, null);
      if (a == null) return;
      done++; if (a === list[g].answer) ok++;
    });
    return { done, ok, n: idxs.length };
  }
  // 단원 ci(0-based)에 속한 문제의 전체 배열 인덱스
  function chIdx(s, kind, ci) {
    const list = kind === 'past' ? s.past : s.generated;
    const m = s.chMap && s.chMap[kind === 'past' ? 'past' : 'generated'];
    return list.map((_, g) => g).filter(g => (m ? m[g] === ci : false));
  }

  // 과목 첫 화면: 단원 목록
  function pageWritten(sid) {
    const s = W()[sid];
    if (!s) return notFound();
    setTitle(s.title);
    const all = kind => (kind === 'past' ? s.past : s.generated).map((_, g) => g);
    const pAll = progressOf(s, sid, 'past', all('past')), gAll = progressOf(s, sid, 'gen', all('gen'));
    $app.innerHTML = `<div class="crumbs"><a href="#/">홈</a> › <a href="#/written">필기</a> › ${s.no}과목</div>
      <h1>${s.no}과목 ${esc(s.title)}</h1><p class="lead">${esc(s.desc || '')}</p>
      <h2>단원별 학습</h2>
      <div class="grid">${s.chapters.map((c, ci) => {
        const p = progressOf(s, sid, 'past', chIdx(s, 'past', ci)), g = progressOf(s, sid, 'gen', chIdx(s, 'gen', ci));
        const tot = p.n + g.n, done = p.done + g.done;
        return `<a class="card" href="#/written/${sid}/${ci + 1}"><span class="num">${ci + 1}장</span><h3>${esc(c.title.replace(/^\d+\.\s*/, ''))}</h3>
          <div class="meta"><span>기출 ${p.n}</span><span>생성 ${g.n}</span></div>
          <div class="row" style="margin-top:8px"><div class="progress"><i style="width:${tot ? done / tot * 100 : 0}%"></i></div><small style="color:var(--muted)">${done}/${tot}</small></div></a>`;
      }).join('')}</div>
      <h2>과목 전체 문제</h2>
      <div class="row"><a class="btn" href="#/written/${sid}/past">기출 유형 전체 (${pAll.done}/${pAll.n})</a><a class="btn" href="#/written/${sid}/gen">생성 문제 전체 (${gAll.done}/${gAll.n})</a></div>
      <div style="margin-top:20px">${samBox(sid)}</div>`;
  }

  // 과목 전체 기출/생성 문제
  function pageWrittenAll(sid, kind) {
    const s = W()[sid];
    if (!s) return notFound();
    setTitle(`${s.title} ${kind === 'past' ? '기출' : '생성'}`);
    const list = kind === 'past' ? s.past : s.generated;
    $app.innerHTML = `<div class="crumbs"><a href="#/">홈</a> › <a href="#/written">필기</a> › <a href="#/written/${sid}">${s.no}과목</a> › ${kind === 'past' ? '기출 유형 전체' : '생성 문제 전체'}</div>
      <h1>${s.no}과목 ${kind === 'past' ? '기출 유형' : '생성 문제'} 전체 <small style="font-size:16px;color:var(--muted)">${list.length}문항</small></h1><div id="tabBody"></div>`;
    quizList(document.getElementById('tabBody'), list, i => `w:${sid}:${kind}:${i}`, i => `${s.no}과목 ${kind === 'past' ? '기출' : '생성'} ${i + 1}번`, renderMCQ);
  }

  // 단원 페이지: 이론 / 이 단원 기출 / 이 단원 생성
  function pageChapter(sid, n, tab) {
    const s = W()[sid];
    const ci = n - 1, c = s && s.chapters[ci];
    if (!c) return notFound();
    tab = tab || 'theory';
    const title = c.title.replace(/^\d+\.\s*/, '');
    setTitle(`${s.no}과목 ${n}장 ${title}`);
    const pIdx = chIdx(s, 'past', ci), gIdx = chIdx(s, 'gen', ci);
    const nav = s.chapters.map((x, i) => `<a href="#/written/${sid}/${i + 1}" class="${i === ci ? 'active' : ''}">${i + 1}. ${esc(x.title.replace(/^\d+\.\s*/, ''))}</a>`).join('');
    const prev = ci > 0 ? `<a class="btn" href="#/written/${sid}/${n - 1}">← ${n - 1}장</a>` : '';
    const next = ci < s.chapters.length - 1 ? `<a class="btn" href="#/written/${sid}/${n + 1}">${n + 1}장 →</a>` : `<a class="btn" href="#/written/${sid}">단원 목록</a>`;
    $app.innerHTML = `<div class="crumbs"><a href="#/">홈</a> › <a href="#/written">필기</a> › <a href="#/written/${sid}">${s.no}과목 ${esc(s.title)}</a> › ${n}장</div>
      <div class="layout-side">
        <aside class="toc card" style="padding:10px"><div class="toc-head">${s.no}과목 단원</div>${nav}<div id="subToc"></div></aside>
        <div>
          <span class="num">${s.no}과목 · ${n}장</span><h1>${esc(title)}</h1>
          <div class="tabs">
            <button data-tab="theory">이론</button>
            <button data-tab="past">기출 유형 (${pIdx.length})</button>
            <button data-tab="gen">생성 문제 (${gIdx.length})</button>
          </div>
          <div id="tabBody"></div>
          <div class="row chapter-nav">${prev}<span class="spacer"></span>${next}</div>
        </div>
      </div>`;
    $app.querySelectorAll('.tabs button').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
      b.addEventListener('click', () => { location.hash = `#/written/${sid}/${n}${b.dataset.tab === 'theory' ? '' : '/' + b.dataset.tab}`; });
    });
    const body = document.getElementById('tabBody');
    if (tab === 'theory') {
      body.innerHTML = `<article class="theory card">${c.html}
        <div class="row" style="margin-top:24px"><a class="btn primary" href="#/written/${sid}/${n}/past">이 단원 기출 유형 풀기 (${pIdx.length}) →</a><a class="btn" href="#/written/${sid}/${n}/gen">생성 문제 풀기 (${gIdx.length})</a></div></article>`;
      // 소단원(h3) 목차
      const hs = [...body.querySelectorAll('.theory h3')];
      document.getElementById('subToc').innerHTML = hs.length ? '<div class="toc-head">이 장의 내용</div>' + hs.map((hh, i) => { hh.id = 'sec' + i; return `<a href="javascript:void 0" data-sec="${i}" class="sub">${esc(hh.textContent)}</a>`; }).join('') : '';
      document.querySelectorAll('[data-sec]').forEach(a => a.addEventListener('click', () => document.getElementById('sec' + a.dataset.sec).scrollIntoView({ behavior: 'smooth' })));
    } else {
      const kind = tab === 'past' ? 'past' : 'gen';
      const idxs = kind === 'past' ? pIdx : gIdx;
      const src = kind === 'past' ? s.past : s.generated;
      if (!idxs.length) { body.innerHTML = '<p class="empty">이 단원에 연결된 문제가 아직 없습니다.</p>'; return; }
      quizList(body, idxs.map(g => src[g]), i => `w:${sid}:${kind}:${idxs[i]}`, i => `${s.no}과목 ${n}장 ${kind === 'past' ? '기출' : '생성'} ${i + 1}번`, renderMCQ);
    }
  }

  // 문제 목록 + 툴바(진행률, 정답 전체 보기, 기록 초기화)
  function quizList(body, list, keyOf, titleOf, render) {
    body.innerHTML = '';
    const bar = h('div', { class: 'toolbar' });
    bar.innerHTML = `<div class="progress"><i></i></div><span class="prog-txt" style="font-size:14px;color:var(--muted)"></span>
      <button class="btn small" data-act="all">전체 정답 보기</button><button class="btn small" data-act="reset">풀이 기록 초기화</button>`;
    body.appendChild(bar);
    const wrap = h('div', { class: 'qlist' });
    const els = list.map((q, i) => render(q, i + 1, { key: keyOf(i), title: titleOf(i), onAnswer: update, onMark: update }));
    els.forEach(e => wrap.appendChild(e));
    body.appendChild(wrap);
    function update() {
      let done = 0, ok = 0;
      list.forEach((q, i) => {
        const a = store.get('a.' + keyOf(i), null);
        if (a == null) return;
        done++;
        if (typeof a === 'number' ? a === q.answer : a.ok) ok++;
      });
      bar.querySelector('.progress i').style.width = (list.length ? done / list.length * 100 : 0) + '%';
      bar.querySelector('.prog-txt').textContent = `${done}/${list.length} 풀이 · 정답 ${ok}`;
    }
    update();
    bar.querySelector('[data-act=all]').addEventListener('click', () => els.forEach(e => { if (!e.querySelector('.exp:not([hidden])')) e.reveal(null, false); }));
    bar.querySelector('[data-act=reset]').addEventListener('click', () => {
      if (!confirm('이 목록의 풀이 기록을 초기화할까요?')) return;
      list.forEach((_, i) => store.del('a.' + keyOf(i)));
      route();
    });
  }

  function practicalTopics() { return Object.values(P()).sort((a, b) => (a.order || 0) - (b.order || 0)); }

  function pagePracticalList() {
    setTitle('실기');
    const ts = practicalTopics();
    $app.innerHTML = `<div class="crumbs"><a href="#/">홈</a> › 실기</div><h1>실기 (필답형)</h1>
      <p class="lead">주제별 핵심 이론과 주관식 문제. 답을 입력해 자동 채점하고, 프로그래밍 문제는 코드를 직접 수정·실행해 결과를 확인할 수 있습니다.</p>
      <div class="grid">${ts.map(t => `<a class="card" href="#/practical/${t.id}"><span class="num">주제 ${t.order}</span><h3>${esc(t.title)}</h3><p>${esc(t.desc || '')}</p>
        <div class="meta">${t.chapters ? `<span>${t.chapters.length}개 장</span>` : ""}<span>문제 ${t.questions.length}</span>${t.questions.some(q => q.runnable) ? '<span class="tag blue">코드 실행</span>' : ''}</div></a>`).join('') || '<p class="empty">준비 중입니다.</p>'}</div>
      ${ts.some(t => t.questions.some(q => q.runnable)) ? '<h2>직접 코딩해 보기</h2><div class="card"><p style="margin:0">C · C++ · Java · Python 코드를 자유롭게 실행하려면 <a href="#/playground">코드 실행기</a>를 이용하세요.</p></div>' : ''}`;
  }

  // 실기 문제 분류: src에 "생성"이 있으면 생성 문제
  const isGen = q => /생성/.test(q.src || '');
  // 실기 주제의 단원 ci 문항(전체 인덱스). ci가 null이면 전체
  function pIdxOf(t, kind, ci) {
    return t.questions.map((_, g) => g).filter(g => (kind === 'gen') === isGen(t.questions[g]) && (ci == null || (t.chMap && t.chMap[g] === ci)));
  }
  function pProgress(pid, idxs) {
    let done = 0;
    idxs.forEach(g => { if (store.get(`a.p:${pid}:${g}`, null) != null) done++; });
    return done;
  }
  function linksBox(t) {
    return t.links && t.links.length ? `<div class="tip"><b>추천 강좌</b><ul style="margin:6px 0 0">${t.links.map(l => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.title)}</a></li>`).join('')}</ul></div>` : '';
  }
  const chTitle = c => c.title.replace(/^\d+\.\s*/, '');

  // 실기 주제 첫 화면: 단원 목록 (단원이 없는 주제는 이론+문제 한 화면)
  function pagePractical(pid) {
    const t = P()[pid];
    if (!t) return notFound();
    setTitle(t.title);
    const crumbs = `<div class="crumbs"><a href="#/">홈</a> › <a href="#/practical">실기</a> › 주제 ${t.order}</div>`;
    if (!t.chapters) {
      $app.innerHTML = `${crumbs}<h1>${esc(t.title)}</h1><p class="lead">${esc(t.desc || '')}</p>
        <article class="theory card">${samBox(pid)}${linksBox(t)}${t.html}<div class="row" style="margin-top:20px"><a class="btn primary" href="#/practical/${pid}/q">문제 풀기 →</a></div></article>`;
      return;
    }
    const pa = pIdxOf(t, 'past'), ge = pIdxOf(t, 'gen');
    $app.innerHTML = `${crumbs}<h1>${esc(t.title)}</h1><p class="lead">${esc(t.desc || '')}</p>
      <h2>단원별 학습</h2>
      <div class="grid">${t.chapters.map((c, ci) => {
        const p = pIdxOf(t, 'past', ci), g = pIdxOf(t, 'gen', ci), all = p.concat(g), done = pProgress(pid, all);
        return `<a class="card" href="#/practical/${pid}/${ci + 1}"><span class="num">${ci + 1}장</span><h3>${esc(chTitle(c))}</h3>
          <div class="meta"><span>기출 ${p.length}</span><span>생성 ${g.length}</span>${t.questions.some((q, i) => q.runnable && t.chMap[i] === ci) ? '<span class="tag blue">코드 실행</span>' : ''}</div>
          <div class="row" style="margin-top:8px"><div class="progress"><i style="width:${all.length ? done / all.length * 100 : 0}%"></i></div><small style="color:var(--muted)">${done}/${all.length}</small></div></a>`;
      }).join('')}</div>
      <h2>주제 전체 문제</h2>
      <div class="row"><a class="btn" href="#/practical/${pid}/past">기출 유형 전체 (${pProgress(pid, pa)}/${pa.length})</a><a class="btn" href="#/practical/${pid}/gen">생성 문제 전체 (${pProgress(pid, ge)}/${ge.length})</a><a class="btn" href="#/practical/${pid}/q">전체 문제 (${t.questions.length})</a></div>
      <div style="margin-top:20px">${samBox(pid)}${linksBox(t)}</div>`;
  }

  // 실기 주제 전체 문제 (kind: past | gen | q)
  function pagePracticalAll(pid, kind) {
    const t = P()[pid];
    if (!t) return notFound();
    const idxs = kind === 'q' ? t.questions.map((_, g) => g) : pIdxOf(t, kind);
    const label = kind === 'past' ? '기출 유형 전체' : kind === 'gen' ? '생성 문제 전체' : '전체 문제';
    setTitle(`${t.title} ${label}`);
    $app.innerHTML = `<div class="crumbs"><a href="#/">홈</a> › <a href="#/practical">실기</a> › <a href="#/practical/${pid}">주제 ${t.order}</a> › ${label}</div>
      <h1>${esc(t.title)} · ${label} <small style="font-size:16px;color:var(--muted)">${idxs.length}문항</small></h1><div id="tabBody"></div>`;
    quizList(document.getElementById('tabBody'), idxs.map(g => t.questions[g]), i => `p:${pid}:${idxs[i]}`, i => `실기 ${t.title} ${idxs[i] + 1}번`, renderSA);
  }

  // 실기 단원 페이지: 이론 / 이 단원 기출 / 이 단원 생성
  function pagePracticalChapter(pid, n, tab) {
    const t = P()[pid];
    const ci = n - 1, c = t && t.chapters && t.chapters[ci];
    if (!c) return notFound();
    tab = tab || 'theory';
    setTitle(`${t.title} ${n}장 ${chTitle(c)}`);
    const pIdx = pIdxOf(t, 'past', ci), gIdx = pIdxOf(t, 'gen', ci);
    const nav = t.chapters.map((x, i) => `<a href="#/practical/${pid}/${i + 1}" class="${i === ci ? 'active' : ''}">${i + 1}. ${esc(chTitle(x))}</a>`).join('');
    const prev = ci > 0 ? `<a class="btn" href="#/practical/${pid}/${n - 1}">← ${n - 1}장</a>` : '';
    const next = ci < t.chapters.length - 1 ? `<a class="btn" href="#/practical/${pid}/${n + 1}">${n + 1}장 →</a>` : `<a class="btn" href="#/practical/${pid}">단원 목록</a>`;
    $app.innerHTML = `<div class="crumbs"><a href="#/">홈</a> › <a href="#/practical">실기</a> › <a href="#/practical/${pid}">${esc(t.title)}</a> › ${n}장</div>
      <div class="layout-side">
        <aside class="toc card" style="padding:10px"><div class="toc-head">실기 주제 ${t.order} 단원</div>${nav}<div id="subToc"></div></aside>
        <div>
          <span class="num">실기 · ${esc(t.title)} · ${n}장</span><h1>${esc(chTitle(c))}</h1>
          <div class="tabs">
            <button data-tab="theory">이론</button>
            <button data-tab="past">기출 유형 (${pIdx.length})</button>
            <button data-tab="gen">생성 문제 (${gIdx.length})</button>
          </div>
          <div id="tabBody"></div>
          <div class="row chapter-nav">${prev}<span class="spacer"></span>${next}</div>
        </div>
      </div>`;
    $app.querySelectorAll('.tabs button').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
      b.addEventListener('click', () => { location.hash = `#/practical/${pid}/${n}${b.dataset.tab === 'theory' ? '' : '/' + b.dataset.tab}`; });
    });
    const body = document.getElementById('tabBody');
    if (tab === 'theory') {
      body.innerHTML = `<article class="theory card">${ci === 0 ? linksBox(t) : ''}${c.html}
        <div class="row" style="margin-top:24px"><a class="btn primary" href="#/practical/${pid}/${n}/past">이 단원 기출 유형 풀기 (${pIdx.length}) →</a><a class="btn" href="#/practical/${pid}/${n}/gen">생성 문제 풀기 (${gIdx.length})</a></div></article>`;
      const hs = [...body.querySelectorAll('.theory h3')];
      document.getElementById('subToc').innerHTML = hs.length ? '<div class="toc-head">이 장의 내용</div>' + hs.map((hh, i) => { hh.id = 'sec' + i; return `<a href="javascript:void 0" data-sec="${i}" class="sub">${esc(hh.textContent)}</a>`; }).join('') : '';
      document.querySelectorAll('[data-sec]').forEach(a => a.addEventListener('click', () => document.getElementById('sec' + a.dataset.sec).scrollIntoView({ behavior: 'smooth' })));
    } else {
      const idxs = tab === 'past' ? pIdx : gIdx;
      if (!idxs.length) { body.innerHTML = '<p class="empty">이 단원에 연결된 문제가 아직 없습니다.</p>'; return; }
      quizList(body, idxs.map(g => t.questions[g]), i => `p:${pid}:${idxs[i]}`, i => `실기 ${t.title} ${n}장 ${idxs[i] + 1}번`, renderSA);
    }
  }

  // ---------- 모의고사 ----------
  function pageMockList() {
    setTitle('모의고사');
    let rows = '';
    for (let n = 1; n <= MOCK_COUNT; n++) {
      const st = store.get('mock.' + n, {});
      const w = st.w && st.w.result, p = st.p && st.p.result;
      rows += `<div class="card"><span class="num">제${n}회</span><h3>모의고사 ${n}회</h3>
        <div class="meta">${SUBJ.length ? `<span>필기: ${w ? `${w.avg.toFixed(1)}점 <span class="${w.pass ? 'pass' : 'fail'}">${w.pass ? '합격' : '불합격'}</span>` : '미응시'}</span>` : ''}
        ${HAS_P ? `<span>실기: ${p ? `${p.score}점 <span class="${p.pass ? 'pass' : 'fail'}">${p.pass ? '합격' : '불합격'}</span>` : '미응시'}</span>` : ''}</div>
        <div class="row" style="margin-top:12px">${SUBJ.length ? `<a class="btn primary small" href="#/mock/${n}/written">필기 풀기</a>` : ''}${HAS_P ? `<a class="btn small" href="#/mock/${n}/practical">실기 풀기</a>` : ''}</div></div>`;
    }
    $app.innerHTML = `<div class="crumbs"><a href="#/">홈</a> › 모의고사</div><h1>실전 모의고사 ${MOCK_COUNT}회</h1>
      <p class="lead">실제 시험처럼 시간을 재며 풉니다 (${MOCK.minutes}분). 제출하면 채점·해설이 표시되고 결과가 이 브라우저에 저장됩니다.</p>
      <div class="grid">${rows}</div>`;
  }

  function fmtTime(sec) { sec = Math.max(0, Math.floor(sec)); return `${pad(Math.floor(sec / 3600))}:${pad(Math.floor(sec / 60) % 60)}:${pad(sec % 60)}`; }
  let timerHandle = null;
  function startTimer(el, st, save, limit, onEnd) {
    clearInterval(timerHandle);
    if (!st.start) { st.start = Date.now(); save(); }
    const tick = () => {
      const left = limit - (Date.now() - st.start) / 1000;
      el.textContent = '남은 시간 ' + fmtTime(left);
      el.classList.toggle('low', left < 600);
      if (left <= 0) { clearInterval(timerHandle); onEnd(); }
    };
    tick(); timerHandle = setInterval(tick, 1000);
  }

  async function pageMock(n, part) {
    n = +n;
    if (!(n >= 1 && n <= MOCK_COUNT)) return notFound();
    $app.innerHTML = '<p class="empty">모의고사를 불러오는 중…</p>';
    let m;
    try { m = await loadMock(n); } catch (e) { $app.innerHTML = `<p class="empty">제${n}회 모의고사 데이터를 불러오지 못했습니다.</p>`; return; }
    if (!m) return notFound();
    const all = store.get('mock.' + n, {});
    const key = part === 'practical' || (!part && !SUBJ.length) ? 'p' : 'w';
    const st = all[key] || (all[key] = { ans: {} });
    const save = () => { all[key] = st; store.set('mock.' + n, all); };
    const isW = key === 'w';
    const list = (isW ? m.written : m.practical) || [];
    setTitle(`제${n}회 모의고사 ${isW ? '필기' : '실기'}`);
    $app.innerHTML = `<div class="crumbs"><a href="#/">홈</a> › <a href="#/mock">모의고사</a> › 제${n}회 ${isW ? '필기' : '실기'}</div>
      <h1>제${n}회 모의고사 · ${isW ? '필기' : '실기'}</h1>
      <p class="lead">${list.length}문항 · ${MOCK.minutes}분 · ${isW ? `평균 ${MOCK.passAvg}점 이상${MOCK.cutoff ? ` & 과목별 ${MOCK.cutoff}점 이상` : ''} 합격` : `${MOCK.passAvg}점 이상 합격${list.some(q => q.runnable) ? ' · 코드 문제는 실행 가능' : ''}`}${m.theme ? ` · 출제 방향: ${esc(m.theme)}` : ''}</p>
      <div class="exam-bar"><span class="timer"></span><span class="answered" style="font-size:14px;color:var(--muted)"></span><span class="spacer"></span>
        ${((isW ? m.practical : m.written) || []).length ? `<a class="btn small" href="#/mock/${n}/${isW ? 'practical' : 'written'}">${isW ? '실기로' : '필기로'} 이동</a>` : ''}
        <button class="btn small" data-act="retry">다시 풀기</button><button class="btn primary small" data-act="submit">제출하고 채점</button></div>
      <div id="result"></div>
      <div class="card" style="padding:12px;margin-bottom:14px"><div class="omr"></div></div>
      <div id="qs"></div>`;
    const qs = document.getElementById('qs');
    const omr = $app.querySelector('.omr');
    const submitted = !!st.result;
    const els = [];
    list.forEach((q, i) => {
      if (isW && (i === 0 || list[i - 1].subj !== q.subj)) qs.appendChild(h('div', { class: 'subj-head' }, `${SUBJ.indexOf(q.subj) + 1}과목 ${esc(SUBJ_NAME[q.subj] || '')}`));
      const opts = { anchor: `mq${i + 1}`, value: st.ans[i] };
      let el;
      if (submitted) {
        if (isW) el = renderMCQ(q, i + 1, { ...opts, mode: 'review' });
        else el = renderSA(q, i + 1, { ...opts, mode: 'review', ok: st.marks[i], onMark: v => { st.marks[i] = v; gradePractical(); } });
      } else {
        if (isW) el = renderMCQ(q, i + 1, { ...opts, mode: 'exam', onPick: v => { st.ans[i] = v; save(); updateOmr(); } });
        else el = renderSA(q, i + 1, { ...opts, mode: 'exam', onInput: v => { st.ans[i] = v; save(); updateOmr(); } });
      }
      els.push(el); qs.appendChild(el);
    });
    function updateOmr() {
      omr.innerHTML = list.map((q, i) => {
        let cls = '';
        if (submitted) cls = isW ? (st.ans[i] === q.answer ? 'ok' : 'bad') : (st.marks[i] ? 'ok' : 'bad');
        else if (st.ans[i] != null && st.ans[i] !== '') cls = 'done';
        return `<a href="javascript:void 0" data-q="${i + 1}" class="${cls}">${i + 1}</a>`;
      }).join('');
      omr.querySelectorAll('a').forEach(a => a.addEventListener('click', () => document.getElementById('mq' + a.dataset.q).scrollIntoView({ behavior: 'smooth', block: 'center' })));
      const cnt = list.filter((_, i) => st.ans[i] != null && st.ans[i] !== '').length;
      $app.querySelector('.answered').textContent = `응답 ${cnt}/${list.length}`;
    }
    updateOmr();

    function gradeWritten() {
      const per = SUBJ.map(s => {
        const idx = list.map((q, i) => (q.subj === s ? i : -1)).filter(i => i >= 0);
        const ok = idx.filter(i => st.ans[i] === list[i].answer).length;
        return { s, ok, n: idx.length, score: idx.length ? ok / idx.length * 100 : 0 };
      }).filter(p => p.n);
      const avg = per.length ? per.reduce((a, p) => a + p.score, 0) / per.length : 0;
      const pass = avg >= MOCK.passAvg && per.every(p => p.score >= MOCK.cutoff);
      st.result = { avg, pass, per: per.map(p => p.score), subj: per.map(p => p.s) };
      list.forEach((q, i) => { if (st.ans[i] !== q.answer) wrongs.add(`m:${n}:w:${i}`, `모의고사 ${n}회 필기 ${i + 1}번`); });
      save();
      return per;
    }
    function gradePractical() {
      const score = Math.round(list.reduce((a, _, i) => a + (st.marks[i] ? 1 : 0), 0) * 100 / (list.length || 1));
      st.result = { score, pass: score >= MOCK.passAvg };
      list.forEach((_, i) => { st.marks[i] ? wrongs.remove(`m:${n}:p:${i}`) : wrongs.add(`m:${n}:p:${i}`, `모의고사 ${n}회 실기 ${i + 1}번`); });
      save(); showResult(); updateOmr();
    }
    function showResult() {
      const r = st.result; if (!r) return;
      const box = document.getElementById('result');
      if (isW) {
        box.innerHTML = `<div class="card" style="margin-bottom:14px"><h2 style="margin-top:0">채점 결과 <span class="${r.pass ? 'pass' : 'fail'}">${r.pass ? '합격' : '불합격'}</span></h2>
          <table class="score-table"><tr>${(r.subj || SUBJ).map(s => `<th>${SUBJ.indexOf(s) + 1}과목</th>`).join('')}<th>평균</th></tr>
          <tr>${r.per.map(v => `<td class="${v < MOCK.cutoff ? 'fail' : ''}">${v.toFixed(0)}</td>`).join('')}<td><b>${r.avg.toFixed(1)}</b></td></tr></table>
          <p style="font-size:14px;color:var(--muted);margin:0">${MOCK.cutoff ? `${MOCK.cutoff}점 미만 과목은 과락입니다. ` : ''}틀린 문제는 오답노트에 저장되었습니다.</p></div>`;
      } else {
        box.innerHTML = `<div class="card" style="margin-bottom:14px"><h2 style="margin-top:0">채점 결과: ${r.score}점 / 100 <span class="${r.pass ? 'pass' : 'fail'}">${r.pass ? '합격' : '불합격'}</span></h2>
          <p style="font-size:14px;color:var(--muted);margin:0">자동 채점은 공백·대소문자를 무시하고 정답/허용 답안과 비교합니다. 서술형 등은 해설을 보고 각 문항의 "맞음/틀림으로 처리"로 직접 조정하세요.</p></div>`;
      }
    }
    if (submitted) {
      showResult();
      clearInterval(timerHandle);
      $app.querySelector('.timer').textContent = '채점 완료';
      $app.querySelector('[data-act=submit]').disabled = true;
    } else {
      startTimer($app.querySelector('.timer'), st, save, MOCK.minutes * 60, () => { alert('시험 시간이 종료되었습니다. 자동 제출합니다.'); doSubmit(true); });
    }
    function doSubmit(force) {
      const empty = list.filter((_, i) => st.ans[i] == null || st.ans[i] === '').length;
      if (!force && !confirm(empty ? `미응답 ${empty}문항이 있습니다. 제출할까요?` : '제출하고 채점할까요?')) return;
      if (isW) gradeWritten();
      else { st.marks = list.map((q, i) => checkSA(q, st.ans[i])); gradePractical(); }
      clearInterval(timerHandle);
      route();
      window.scrollTo(0, 0);
    }
    $app.querySelector('[data-act=submit]').addEventListener('click', () => doSubmit(false));
    $app.querySelector('[data-act=retry]').addEventListener('click', () => {
      if (!confirm('답안과 결과를 지우고 처음부터 다시 풀까요?')) return;
      all[key] = { ans: {} }; store.set('mock.' + n, all); route();
    });
  }

  // ---------- 코드 실행기 / 링크 / 오답노트 ----------
  // 관련 강좌 링크 — 강좌 설정 CERT_COURSE.related { 과목id: [{ title, url, d }] } · CERT_COURSE.links [{ lang, sam, note, items }]
  const SAM_BY_PAGE = C.related || {};
  function samBox(pageId) {
    const items = SAM_BY_PAGE[pageId];
    if (!items || !items.length) return '';
    return `<div class="tip"><b>함께 보면 좋은 강좌</b><ul style="margin:6px 0 0">${items.map(c => `<li><a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.title)}</a>${c.d ? ' — ' + esc(c.d) : ''}</li>`).join('')}</ul></div>`;
  }
  const COURSES = C.links || [];
  function pageLinks() {
    setTitle('강좌 링크');
    $app.innerHTML = `<div class="crumbs"><a href="#/">홈</a> › 강좌 링크</div><h1>강좌 링크</h1>
      ${C.linksIntro ? `<p class="lead">${C.linksIntro}</p>` : ''}
      ${COURSES.filter(c => c.sam).map(c => `<div class="card" style="margin-bottom:14px"><h3>${c.lang} ${c.note ? `<small style="font-weight:400;color:var(--muted);font-size:13px">${esc(c.note)}</small>` : ''}</h3>
        <div class="grid" style="margin-top:10px">${c.items.map(i => `<a class="card" href="${i.url}" target="_blank" rel="noopener" style="padding:14px"><h3 style="font-size:15px">${i.title}</h3><p>${i.d}</p></a>`).join('')}</div></div>`).join('')}
      ${COURSES.some(c => !c.sam) ? '<h2>기타 강좌</h2>' : ''}
      <div class="grid">${COURSES.filter(c => !c.sam).map(c => `<div class="card"><h3>${c.lang}</h3><ul class="link-list">${c.items.map(i => `<li><a href="${i.url}" target="_blank" rel="noopener">${i.title}</a><small>${i.d}</small></li>`).join('')}</ul></div>`).join('')}</div>`;
  }
  function pagePlayground() {
    setTitle('코드 실행기');
    $app.innerHTML = `<div class="crumbs"><a href="#/">홈</a> › 코드 실행기</div><h1>코드 실행기</h1>
      <p class="lead">C · C++ · Java · Python 코드를 작성하고 실행합니다. (Wandbox 온라인 컴파일러 사용, Java는 <code>public class Main</code> 그대로 작성하면 됩니다)</p><div id="pg"></div>
      ${COURSES.length ? `<h2>강좌 바로가기</h2><div class="row">${COURSES.flatMap(c => c.items || []).slice(0, 6).map(i => `<a class="btn small" href="${esc(i.url)}" target="_blank" rel="noopener">${esc(i.title)}</a>`).join('')}</div>` : ''}`;
    const draft = store.get('pg', null);
    const r = Runner.create(document.getElementById('pg'), { lang: draft?.lang || 'c', code: draft?.code });
    const sel = r.element.querySelector('select');
    const saveDraft = () => store.set('pg', { lang: sel.value, code: r.getCode() });
    r.element.addEventListener('keyup', saveDraft); sel.addEventListener('change', saveDraft);
  }

  async function resolveKey(key) {
    const p = key.split(':');
    if (p[0] === 'w') { const s = W()[p[1]]; const list = p[2] === 'past' ? s?.past : s?.generated; return list && { q: list[+p[3]], type: 'mcq' }; }
    if (p[0] === 'p') { const t = P()[p[1]]; return t && { q: t.questions[+p[2]], type: 'sa' }; }
    if (p[0] === 'm') { const m = await loadMock(+p[1]); const list = p[2] === 'w' ? m.written : m.practical; return { q: list[+p[3]], type: p[2] === 'w' ? 'mcq' : 'sa' }; }
    return null;
  }
  async function pageReview() {
    setTitle('오답노트');
    const w = wrongs.all();
    const keys = Object.keys(w).sort((a, b) => w[b].at - w[a].at);
    $app.innerHTML = `<div class="crumbs"><a href="#/">홈</a> › 오답노트</div><h1>오답노트 <small style="font-size:16px;color:var(--muted)">${keys.length}문항</small></h1>
      <p class="lead">틀린 문제가 자동으로 모입니다. 다시 풀어서 맞히면 "목록에서 제거"로 정리하세요.</p>
      <div class="row" style="margin-bottom:14px">${keys.length ? '<button class="btn small" data-act="clear">전체 비우기</button>' : ''}</div><div class="qlist" id="rv"></div>`;
    const rv = document.getElementById('rv');
    if (!keys.length) { rv.innerHTML = '<p class="empty">아직 틀린 문제가 없습니다. 👍</p>'; return; }
    const clr = $app.querySelector('[data-act=clear]');
    clr && clr.addEventListener('click', () => { if (confirm('오답노트를 모두 비울까요?')) { store.set('wrong', {}); route(); } });
    for (const k of keys) {
      let r = null;
      try { r = await resolveKey(k); } catch (e) { /* 데이터 없음 */ }
      if (!r || !r.q) continue;
      const tag = `<span class="tag blue">${esc(w[k].t)}</span>`;
      const el = r.type === 'mcq'
        ? renderMCQ(r.q, '', { mode: 'practice', extraTag: tag })
        : renderSA(r.q, '', { mode: 'practice', extraTag: tag });
      el.querySelector('.num').remove();
      const rm = h('button', { class: 'btn small' }, '목록에서 제거');
      rm.addEventListener('click', () => { wrongs.remove(k); el.remove(); });
      el.querySelector('.q-head').appendChild(rm);
      rv.appendChild(el);
    }
  }

  function notFound() { setTitle('없음'); $app.innerHTML = '<p class="empty">페이지를 찾을 수 없습니다. <a href="#/">홈으로</a></p>'; }

  // ---------- 라우터 ----------
  function route() {
    clearInterval(timerHandle);
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    const [a, b, c] = parts;
    document.querySelectorAll('#nav a').forEach(x => x.classList.toggle('active', x.dataset.nav === (a || '')));
    document.getElementById('nav').classList.remove('open');
    if (!a) pageHome();
    else if (a === 'written') { if (!b) pageWrittenList(); else if (!c) pageWritten(b); else if (c === 'past' || c === 'gen') pageWrittenAll(b, c); else pageChapter(b, +c, parts[3]); }
    else if (a === 'practical') { if (!b) pagePracticalList(); else if (!c || c === 'theory') pagePractical(b); else if (['past', 'gen', 'q'].includes(c)) pagePracticalAll(b, c); else pagePracticalChapter(b, +c, parts[3]); }
    else if (a === 'mock') b ? pageMock(b, c) : pageMockList();
    else if (a === 'playground') pagePlayground();
    else if (a === 'review') pageReview();
    else if (a === 'links') pageLinks();
    else notFound();
    window.app = { route, store, wrongs, renderMCQ, renderSA, quizList, parts };
    document.dispatchEvent(new CustomEvent('lb:render', { detail: { parts } }));
  }
  let lastPath = null;
  window.addEventListener('hashchange', () => { route(); if (location.hash !== lastPath) window.scrollTo(0, 0); lastPath = location.hash; });
  document.getElementById('menuBtn').addEventListener('click', () => document.getElementById('nav').classList.toggle('open'));
  const root = document.documentElement;
  const savedTheme = store.get('theme', null);
  if (savedTheme) root.dataset.theme = savedTheme;
  document.getElementById('themeBtn').addEventListener('click', () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    store.set('theme', root.dataset.theme);
  });
  (C.ready || Promise.resolve()).then(route);
})();
