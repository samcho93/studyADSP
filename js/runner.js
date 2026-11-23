// 브라우저 내장 코드 실행기: CodeMirror 편집기 + Wandbox 컴파일 API (Python은 실패 시 Pyodide로 대체)
(function () {
  const COMPILERS = {
    c: { name: 'C', compiler: 'gcc-13.2.0-c', mode: 'text/x-csrc', options: 'warning' },
    cpp: { name: 'C++', compiler: 'gcc-13.2.0', mode: 'text/x-c++src', options: 'warning,c++17' },
    java: { name: 'Java', compiler: 'openjdk-jdk-22+36', mode: 'text/x-java' },
    python: { name: 'Python', compiler: 'cpython-3.12.7', mode: 'python' },
  };
  const TEMPLATES = {
    c: '#include <stdio.h>\n\nint main(void) {\n    printf("Hello, World!\\n");\n    return 0;\n}\n',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n',
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n',
    python: 'print("Hello, World!")\n',
  };

  // Wandbox는 prog.java 로 저장하므로 public class 를 일반 class 로 바꿔 실행
  function prepare(lang, code) {
    if (lang === 'java') return code.replace(/public\s+(final\s+)?class\s+/g, (m, f) => (f || '') + 'class ');
    return code;
  }

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  async function runWandbox(lang, code, stdin, onRetry) {
    const c = COMPILERS[lang];
    const body = JSON.stringify({ compiler: c.compiler, options: c.options || '', code: prepare(lang, code), stdin: stdin || '' });
    let res;
    // 요청이 몰리면 429/5xx가 올 수 있어 잠시 후 재시도
    for (const wait of [0, 2000, 5000, 10000]) {
      if (wait) { onRetry && onRetry(wait); await sleep(wait); }
      res = await fetch('https://wandbox.org/api/compile.json', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      if (res.status !== 429 && res.status < 500) break;
    }
    if (!res.ok) throw new Error(res.status === 429 ? '실행 서버 요청이 많습니다(HTTP 429)' : 'HTTP ' + res.status);
    const r = await res.json();
    return {
      stdout: r.program_output || '',
      stderr: (r.compiler_error || '') + (r.program_error || ''),
      status: r.status, signal: r.signal,
    };
  }

  let pyodidePromise = null;
  function loadPyodide() {
    if (pyodidePromise) return pyodidePromise;
    pyodidePromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
      s.onload = () => window.loadPyodide().then(resolve, reject);
      s.onerror = () => reject(new Error('Pyodide 로드 실패'));
      document.head.appendChild(s);
    });
    return pyodidePromise;
  }
  async function runPyodide(code, stdin) {
    const py = await loadPyodide();
    let out = '', err = '';
    const lines = (stdin || '').split('\n'); let li = 0;
    py.setStdout({ batched: s => { out += s + '\n'; } });
    py.setStderr({ batched: s => { err += s + '\n'; } });
    py.setStdin({ stdin: () => (li < lines.length ? lines[li++] : null) });
    try { await py.runPythonAsync(code); } catch (e) { err += String(e.message || e); }
    return { stdout: out, stderr: err, status: err ? '1' : '0' };
  }

  async function run(lang, code, stdin, onRetry) {
    try {
      return await runWandbox(lang, code, stdin, onRetry);
    } catch (e) {
      if (lang === 'python') {
        const r = await runPyodide(code, stdin);
        r.note = '(Wandbox 연결 실패 → 브라우저 내 Pyodide로 실행)';
        return r;
      }
      throw e;
    }
  }

  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  // container 안에 실행기 위젯 생성
  function create(container, opts = {}) {
    const langs = opts.langs || Object.keys(COMPILERS);
    let lang = opts.lang && COMPILERS[opts.lang] ? opts.lang : langs[0];
    const wrap = document.createElement('div');
    wrap.className = 'runner';
    wrap.innerHTML = `
      <div class="runner-bar">
        <select aria-label="언어">${langs.map(l => `<option value="${l}"${l === lang ? ' selected' : ''}>${COMPILERS[l].name}</option>`).join('')}</select>
        <button class="btn primary small" data-act="run">▶ 실행</button>
        <button class="btn small" data-act="reset">초기화</button>
        <span class="spacer"></span>
        <span style="font-size:12px;color:var(--muted)">Ctrl+Enter 실행</span>
      </div>
      <div class="runner-editor"></div>
      <div class="runner-io">
        <div><label>입력 (stdin)</label><textarea spellcheck="false" placeholder="필요할 때만 입력"></textarea></div>
        <div><label>실행 결과</label><pre class="runner-out"><span class="info">▶ 실행 버튼을 누르면 결과가 여기에 표시됩니다.</span></pre></div>
      </div>`;
    container.appendChild(wrap);
    const sel = wrap.querySelector('select');
    const out = wrap.querySelector('.runner-out');
    const stdinEl = wrap.querySelector('.runner-io textarea');
    const host = wrap.querySelector('.runner-editor');
    if (langs.length === 1) sel.disabled = true;
    const initial = opts.code != null ? opts.code : TEMPLATES[lang];

    let cm = null, ta = null;
    if (window.CodeMirror) {
      cm = CodeMirror(host, {
        value: initial, mode: COMPILERS[lang].mode, theme: 'material-darker', lineNumbers: true,
        indentUnit: 4, tabSize: 4, matchBrackets: true, viewportMargin: Infinity,
        extraKeys: { 'Ctrl-Enter': () => doRun(), 'Cmd-Enter': () => doRun(), Tab: c => c.replaceSelection('    ') },
      });
    } else {
      ta = document.createElement('textarea');
      ta.className = 'plain'; ta.spellcheck = false; ta.value = initial;
      ta.addEventListener('keydown', e => {
        if (e.key === 'Tab') { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText('    ', s, ta.selectionEnd, 'end'); }
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); doRun(); }
      });
      host.appendChild(ta);
    }
    const getCode = () => (cm ? cm.getValue() : ta.value);
    const setCode = v => (cm ? cm.setValue(v) : (ta.value = v));

    sel.addEventListener('change', () => {
      const prevTemplate = getCode() === TEMPLATES[lang];
      lang = sel.value;
      if (cm) cm.setOption('mode', COMPILERS[lang].mode);
      if (prevTemplate || !getCode().trim()) setCode(TEMPLATES[lang]);
    });
    wrap.querySelector('[data-act=reset]').addEventListener('click', () => setCode(opts.code != null ? opts.code : TEMPLATES[lang]));
    const runBtn = wrap.querySelector('[data-act=run]');
    runBtn.addEventListener('click', () => doRun());

    async function doRun() {
      runBtn.disabled = true;
      out.innerHTML = '<span class="info">컴파일 및 실행 중…</span>';
      const t0 = performance.now();
      try {
        const r = await run(lang, getCode(), stdinEl.value, w => { out.innerHTML = `<span class="info">서버가 혼잡합니다. ${w / 1000}초 후 다시 시도합니다…</span>`; });
        const ms = Math.round(performance.now() - t0);
        let html = '';
        if (r.note) html += `<span class="info">${esc(r.note)}</span>\n`;
        html += esc(r.stdout);
        if (r.stderr) html += `<span class="err">${esc(r.stderr)}</span>`;
        if (!r.stdout && !r.stderr) html += '<span class="info">(출력 없음)</span>';
        html += `\n<span class="info">— 종료 코드 ${esc(r.status ?? '?')}${r.signal ? ' / ' + esc(r.signal) : ''} · ${ms}ms</span>`;
        out.innerHTML = html;
        if (opts.onResult) opts.onResult(r);
      } catch (e) {
        out.innerHTML = `<span class="err">실행 서버에 연결할 수 없습니다: ${esc(e.message)}\n인터넷 연결을 확인하거나 잠시 후 다시 시도하세요.</span>`;
      } finally {
        runBtn.disabled = false;
      }
    }
    if (cm) setTimeout(() => cm.refresh(), 0);
    return { getCode, setCode, run: doRun, element: wrap };
  }

  window.Runner = { create, run, COMPILERS, TEMPLATES };
})();
