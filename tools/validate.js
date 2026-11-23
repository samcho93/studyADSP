#!/usr/bin/env node
// 자격증 문제은행형 데이터 검사 — 브라우저와 같은 방식으로 불러와 구조를 확인한다.
//   node tools/validate.js <장 id>      예: node tools/validate.js ch01
//   node tools/validate.js exam         모의고사 data/mock/m01.js … (강좌 설정의 회차 수만큼)
//   node tools/validate.js all          모든 장 + 모의고사
//   --no-run   실행 가능한(runnable) 코드 문제의 출력 확인(Wandbox)을 건너뜀
// 불러오는 순서: js/course.js → js/cert-loader.js → data/chapters/<id>.js → CERT_COURSE.build()
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const noRun = args.includes('--no-run');
const target = args.find((a) => !a.startsWith('--')) || 'all';

let errors = 0, warns = 0;
const err = (where, msg) => { errors++; console.log(`  ✗ ${where}: ${msg}`); };
const warn = (where, msg) => { warns++; console.log(`  ! ${where}: ${msg}`); };
const str = (v) => typeof v === 'string' && v.trim().length > 0;
const LANGS = ['c', 'cpp', 'java', 'python', 'sql'];
const RUN_LANGS = ['c', 'cpp', 'java', 'python'];
const COMPILERS = { c: 'gcc-13.2.0-c', cpp: 'gcc-13.2.0', java: 'openjdk-jdk-22+36', python: 'cpython-3.12.7' };

// ---------------------------------------------------------------- 불러오기
const ctx = { console };
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
function load(rel, must) {
  const f = path.join(ROOT, rel);
  if (!fs.existsSync(f)) { if (must) err(rel, '파일 없음'); return false; }
  try { vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: rel }); return true; }
  catch (e) { err(rel, '구문/실행 오류: ' + e.message); return false; }
}
if (!load('js/course.js', true) || !ctx.CERT_COURSE) { console.log('js/course.js 를 불러오지 못했습니다'); process.exit(1); }
load('js/cert-loader.js', true);
const C = ctx.CERT_COURSE;
const subjects = C.subjects || [];
const order = C.order || [];
const trackOf = (sid) => ((subjects.find((s) => s.id === sid) || {}).track === 'practical' ? 'practical' : 'written');
const writtenIds = subjects.filter((s) => s.track !== 'practical').map((s) => s.id);
const hasPractical = subjects.some((s) => s.track === 'practical');

// ---------------------------------------------------------------- 문제 검사
const runQueue = [];
function common(q, where) {
  if (!q || typeof q !== 'object') { err(where, '문제 객체가 아님'); return false; }
  if (!str(q.q)) err(where, 'q(문제 본문) 누락');
  if (!str(q.exp)) err(where, 'exp(해설) 누락');
  if (q.code !== undefined && !str(q.code)) err(where, 'code 가 비어 있음');
  if (q.lang !== undefined && !LANGS.includes(q.lang)) err(where, 'lang 값 오류: ' + q.lang + ' (c|cpp|java|python|sql)');
  if (q.code && !q.lang) warn(where, 'code 가 있으면 lang 을 적으세요');
  if (q.src !== undefined && typeof q.src !== 'string') err(where, 'src 는 문자열');
  if (str(q.q) && /<pre|```/.test(q.q)) warn(where, '코드는 q 가 아니라 code 필드에 넣으세요');
  return true;
}
function checkMCQ(q, where) {
  if (!common(q, where)) return;
  if (!Array.isArray(q.choices) || q.choices.length !== 4 || !q.choices.every(str)) err(where, 'choices 는 문자열 정확히 4개');
  else {
    if (q.choices.some((c) => /^\s*[①②③④]|^\s*[1-4][.)]\s/.test(c))) warn(where, '보기에 번호(①, 1.)를 붙이지 마세요 — 화면이 붙입니다');
    if (new Set(q.choices.map((c) => c.trim())).size !== 4) err(where, '보기가 중복됨');
  }
  if (!Number.isInteger(q.answer) || q.answer < 1 || q.answer > 4) err(where, 'answer 는 1~4 정수 (1부터 시작)');
  if (q.runnable) warn(where, '객관식에는 runnable 을 쓰지 않습니다 (무시됨)');
}
function checkSA(q, where) {
  if (!common(q, where)) return;
  if (!str(q.answer)) err(where, 'answer(표시용 정답 문자열) 누락');
  if (q.choices !== undefined) err(where, '주관식(실기)에는 choices 를 쓰지 않습니다');
  if (q.accept !== undefined && (!Array.isArray(q.accept) || !q.accept.every(str))) err(where, 'accept 는 문자열 배열');
  if (q.runnable) {
    if (!q.code || !RUN_LANGS.includes(q.lang)) err(where, 'runnable 이면 code 와 lang(c|cpp|java|python) 필요');
    else runQueue.push({ q, where });
  }
}
function dupCheck(list, where) {
  const seen = new Map();
  list.forEach((q, i) => {
    if (!q || !str(q.q)) return;
    const k = (q.q + '|' + (q.code || '')).replace(/\s+/g, '');
    if (seen.has(k)) warn(`${where}[${i}]`, `[${seen.get(k)}] 와 같은 문제`);
    else seen.set(k, i);
  });
}

// ---------------------------------------------------------------- 장
function checkChapter(id) {
  const o = order.find((x) => x.id === id);
  const rel = `data/chapters/${id}.js`;
  const before = { errors, warns };
  if (!o) { err(id, 'js/course.js 의 order 에 없는 장 id'); return; }
  const others = Object.keys(C.chapters || {});
  if (!load(rel, true)) return report(id, before);
  const fresh = Object.keys(C.chapters || {}).filter((k) => !others.includes(k) || k === id);
  const d = (C.chapters || {})[id];
  if (!d) { err(rel, `CERT_COURSE.addChapter({ id: '${id}', … }) 가 호출되지 않음${fresh.length ? ' (등록된 id: ' + fresh.join(', ') + ')' : ''}`); return report(id, before); }
  const extra = Object.keys(d).filter((k) => !['id', 'html', 'past', 'generated', 'summary', 'title'].includes(k));
  if (extra.length) warn(rel, '알 수 없는 필드: ' + extra.join(', '));
  if (!str(d.html)) err(rel, 'html(이론) 누락');
  else {
    if (!/<h3[\s>]/.test(d.html)) err(rel, 'html 에 <h3> 소단원 제목이 없음 (단원마다 <h3> 하나 — 오른쪽 목차가 됨)');
    if (/<script[\s>]/i.test(d.html)) err(rel, 'html 에 <script> 를 넣을 수 없습니다');
    if (/<h1[\s>]|<h2[\s>]/.test(d.html)) warn(rel, '장 제목은 화면이 붙입니다. html 은 <h3> 부터 시작하세요');
  }
  const track = trackOf(o.subject);
  const check = track === 'practical' ? checkSA : checkMCQ;
  for (const kind of ['past', 'generated']) {
    if (d[kind] === undefined) { err(rel, `${kind} 배열 누락 (없으면 [])`); continue; }
    if (!Array.isArray(d[kind])) { err(rel, `${kind} 는 배열`); continue; }
    d[kind].forEach((q, i) => check(q, `${id}.${kind}[${i}]`));
  }
  const all = [].concat(d.past || [], d.generated || []);
  dupCheck(all, `${id}.문제`);
  if (!all.length) warn(rel, '문제가 하나도 없음');
  try { ctx.CERT_COURSE.build(); } catch (e) { err(rel, '과목 조립 실패: ' + e.message); }
  const h3 = str(d.html) ? (d.html.match(/<h3[\s>]/g) || []).length : 0;
  report(id, before, `${track === 'practical' ? '실기(주관식)' : '필기(객관식)'} · 소단원 ${h3} · 기출 유형 ${(d.past || []).length} · 생성 ${(d.generated || []).length}${all.some((q) => q && q.runnable) ? ' · 실행 문제 ' + all.filter((q) => q && q.runnable).length : ''}`);
}

// ---------------------------------------------------------------- 모의고사
function checkMock() {
  const before = { errors, warns };
  const M = C.mock || {};
  const sets = M.sets || 0;
  if (!sets) { err('exam', '강좌 설정에 모의고사가 없습니다 (CERT_COURSE.mock.sets = 0)'); return report('exam', before); }
  const info = [];
  for (let n = 1; n <= sets; n++) {
    const rel = `data/mock/m${String(n).padStart(2, '0')}.js`;
    if (!load(rel, true)) continue;
    const m = (ctx.MOCKS || {})[n];
    const w = `MOCKS[${n}]`;
    if (!m) { err(rel, `window.MOCKS = window.MOCKS || {}; MOCKS[${n}] = {…} 가 없음`); continue; }
    const W = m.written || [], P = m.practical || [];
    if (m.written !== undefined && !Array.isArray(m.written)) err(w, 'written 은 배열');
    if (m.practical !== undefined && !Array.isArray(m.practical)) err(w, 'practical 은 배열');
    if (W.length && !writtenIds.length) err(w, '필기 과목이 없는 강좌인데 written 문항이 있음');
    if (P.length && !hasPractical) err(w, '실기(track: practical) 과목이 없는 강좌인데 practical 문항이 있음');
    W.forEach((q, i) => {
      checkMCQ(q, `${w}.written[${i}]`);
      if (!writtenIds.includes(q && q.subj)) err(`${w}.written[${i}]`, `subj 는 필기 과목 id 중 하나: ${writtenIds.join(', ')} (현재 ${q && q.subj})`);
    });
    // 과목 순서대로 연속해서 배치 (화면이 과목 머리글을 붙이고 과목별 점수를 낸다)
    const seq = W.map((q) => q && q.subj).filter((s, i, a) => s !== a[i - 1]);
    if (new Set(seq).size !== seq.length) err(w, 'written 은 과목별로 모아서(1과목 → 2과목 …) 배치해야 함');
    else if (seq.some((s, i) => i && writtenIds.indexOf(s) < writtenIds.indexOf(seq[i - 1]))) warn(w, 'written 과목 순서가 강좌 과목 순서와 다름');
    P.forEach((q, i) => checkSA(q, `${w}.practical[${i}]`));
    dupCheck(W, `${w}.written`); dupCheck(P, `${w}.practical`);
    const total = W.length + P.length;
    if (M.perSet && total !== M.perSet) err(w, `문항 수 ${total} — 강좌 설정은 회차당 ${M.perSet}문항 (필기 ${W.length} + 실기 ${P.length})`);
    if (!total) err(w, '문항이 없음');
    info.push(`${n}회 필기 ${W.length}+실기 ${P.length}`);
  }
  report('exam', before, info.join(' / '));
}

function report(id, before, detail) {
  const e = errors - before.errors, w = warns - before.warns;
  console.log(`${e ? '✗' : '✓'} ${id}: 오류 ${e} · 경고 ${w}${detail ? ' — ' + detail : ''}`);
}

// ---------------------------------------------------------------- 코드 실행 확인 (Wandbox)
const normOut = (s) => String(s || '').replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').trim();
const INFRA = /OCI runtime|Resource temporarily unavailable|crun:|Internal Server Error/i;
async function wandbox(q, code, signal) {
  let res;
  for (const wait of [0, 2000, 6000]) {
    if (wait) await new Promise((r) => setTimeout(r, wait));
    res = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal,
      body: JSON.stringify({ compiler: COMPILERS[q.lang], code, stdin: q.stdin || '', options: q.lang === 'cpp' ? 'c++17' : '' }),
    });
    if (res.status !== 429 && res.status < 500) break;
  }
  if (!res.ok) return { http: res.status };
  return res.json();
}
async function runOne({ q, where }) {
  const code = q.lang === 'java' ? q.code.replace(/public\s+(final\s+)?class\s+/g, (m, f) => (f || '') + 'class ') : q.code;
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 90000);
  try {
    let r;
    // 실행 서버 쪽 일시 장애(컨테이너 생성 실패 등)는 잠시 뒤 다시 시도하고, 끝내 실패하면 경고만
    for (const wait of [0, 3000, 8000]) {
      if (wait) await new Promise((res) => setTimeout(res, wait));
      r = await wandbox(q, code, ac.signal);
      if (r.http) break;
      if (!INFRA.test(String(r.compiler_error || '') + String(r.program_error || '') + String(r.compiler_message || ''))) break;
    }
    if (r.http) { warn(where, `코드 실행 서버 응답 HTTP ${r.http} — 출력 확인 생략`); return; }
    const errText = String(r.compiler_error || '') + String(r.program_error || '');
    if (INFRA.test(errText)) { warn(where, '코드 실행 서버 일시 장애 — 출력 확인 생략 (' + errText.split('\n')[0].slice(0, 120) + ')'); return; }
    if (r.compiler_error && String(r.status) !== '0') { err(where, '컴파일 오류: ' + String(r.compiler_error).split('\n').slice(0, 3).join(' ')); return; }
    const out = normOut(r.program_output);
    const ok = [q.answer, ...(q.accept || [])].some((a) => normOut(a) === out);
    if (!ok) err(where, `answer 가 실제 출력과 다름\n      실제 출력: ${JSON.stringify(out).slice(0, 200)}\n      answer   : ${JSON.stringify(normOut(q.answer)).slice(0, 200)}${r.program_error ? '\n      stderr   : ' + JSON.stringify(String(r.program_error)).slice(0, 200) : ''}`);
  } catch (e) {
    warn(where, '코드 실행 서버에 연결하지 못함 — 출력 확인 생략 (' + (e.name === 'AbortError' ? '시간 초과' : e.message) + ')');
  } finally { clearTimeout(t); }
}

(async () => {
  if (target === 'all') {
    order.forEach((o) => { if (fs.existsSync(path.join(ROOT, 'data', 'chapters', o.id + '.js'))) checkChapter(o.id); else console.log(`- ${o.id}: 아직 없음 (data/chapters/${o.id}.js)`); });
    if (C.mock && C.mock.sets) checkMock();
  } else if (target === 'exam' || target === 'mock') checkMock();
  else checkChapter(target);

  if (runQueue.length) {
    if (noRun) console.log(`(코드 실행 확인 생략: runnable ${runQueue.length}문항 — --no-run)`);
    else {
      const before = { errors, warns };
      for (const item of runQueue) { await runOne(item); await new Promise((r) => setTimeout(r, 400)); }
      console.log(`코드 실행 확인: ${runQueue.length}문항 · 오류 ${errors - before.errors} · 경고 ${warns - before.warns}`);
    }
  }
  console.log(errors ? `\n오류 ${errors}건 · 경고 ${warns}건` : `\n✓ 검사 통과 (경고 ${warns}건)`);
  process.exit(errors ? 1 : 0);
})();
