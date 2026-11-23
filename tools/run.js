// Wandbox로 코드 실행해 출력 확인: node tools/run.js <c|cpp|java|python> <파일> [stdin파일]
const fs = require('fs');
const [lang, file, stdinFile] = process.argv.slice(2);
const C = { c: 'gcc-13.2.0-c', cpp: 'gcc-13.2.0', java: 'openjdk-jdk-22+36', python: 'cpython-3.12.7' };
let code = fs.readFileSync(file, 'utf8');
if (lang === 'java') code = code.replace(/public\s+(final\s+)?class\s+/g, 'class ');
fetch('https://wandbox.org/api/compile.json', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ compiler: C[lang], code, stdin: stdinFile ? fs.readFileSync(stdinFile, 'utf8') : '' })
}).then(r => r.json()).then(r => {
  if (r.compiler_error) console.log('[compile]\n' + r.compiler_error);
  process.stdout.write(r.program_output || '');
  if (r.program_error) console.log('[stderr]\n' + r.program_error);
}).catch(e => console.error('실행 실패:', e.message));
