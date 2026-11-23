# ADSP 자격증대비 — 데이터 작성 가이드 (자격증 문제은행형)

- 작성 형태: 자격증 대비 / 대상: 일반 / 수준: 입문 / 단원당 학습 시간: 50분
- 문제 구성: 단원별 확인 문제 5개 · 모의고사 1회 × 20문항 (형식: 객관식, 단답형)
- 문체: 존댓말, 핵심 요약 · 암기 포인트 · 기출 유형 중심

이 강좌는 빌드 없는 정적 사이트입니다. 모든 데이터는 브라우저가 `<script>` 로 불러오는 **JS 파일**입니다
(`index.html` 을 파일로 바로 열어도 동작하도록 JSON fetch 를 쓰지 않음).

## 1. 구조 — 과목 → 장 → 문제

| 화면 | 데이터 | 누가 만드나 |
|---|---|---|
| 과목 목록 (필기 1과목, 2과목 … / 실기 과목) | `js/course.js` 의 `CERT_COURSE.subjects` | lectureBuilder (`docs/curriculum.json` 의 **parts**) |
| 장 목록 · 순서 | `js/course.js` 의 `CERT_COURSE.order` | lectureBuilder (`docs/curriculum.json` 의 **chapters**) |
| 장 페이지: **이론 / 기출 유형 / 생성 문제** 탭 | `data/chapters/<장 id>.js` | 장 작성 단계 (이 가이드) |
| 모의고사 n회 (타이머 · OMR 현황판 · 채점 · 과락) | `data/mock/m01.js` … | 모의고사 작성 단계 |
| 오답노트 · 풀이 기록 | 브라우저 localStorage | 자동 |

`js/course.js`, `docs/curriculum.json`, 엔진 파일(`js/app.js`, `js/cert-loader.js`, `js/runner.js`, `css/style.css`, `index.html`)은 고치지 않습니다.

### 커리큘럼 설계 규칙 (docs/curriculum.json)
- **Part = 과목**, **chapter = 과목 안의 장(단원 묶음)**, **section = 장 안의 소단원** (이론의 `<h3>` 하나).
  예) 필기 1과목 "소프트웨어 설계" = part 1, 그 안의 "1장 요구사항 확인", "2장 화면 설계" … = chapters (part: 1).
- 시험의 과목 구성(출제 기준)을 그대로 parts 로 씁니다. 과목이 하나뿐인 시험이면 part 하나.
- **실기(주관식 · 필답형) 과목**이 있으면 그 part 에 `"track": "practical"` 을 붙입니다. 없으면 필기(4지선다) 과목입니다.
  실기 과목은 문제 형식에 단답형(short)이 포함될 때만 만듭니다.
- 과목마다 장 3~6개, 장마다 소단원 2~6개가 알맞습니다. 출제 비중이 큰 과목에 장을 더 배정합니다.

## 2. 장 파일 — `data/chapters/<id>.js`

```js
CERT_COURSE.addChapter({
  id: 'ch01',                       // curriculum 의 장 id 그대로
  html: String.raw`<h3>소단원 1</h3><p>…</p> <h3>소단원 2</h3> …`,
  past: [ 문제, … ],                // 기출 유형 문제 탭
  generated: [ 문제, … ],           // 생성(예상) 문제 탭
});
```

- `CERT_COURSE.addChapter` 를 **한 번** 호출합니다. 다른 코드는 넣지 않습니다.
- 이 장이 속한 과목은 `js/course.js` 의 `order` 에서 `subject` 로, 그 과목의 형식은 `subjects[].track` 으로 확인합니다.
  - track 이 `practical` 이 아니면 → 문제는 모두 **필기 객관식(MCQ)**
  - track 이 `practical` 이면 → 문제는 모두 **실기 주관식(SA)**
- 장 제목 · 번호는 화면이 붙입니다. html 은 `<h3>` 부터 시작합니다.
- 예시: `docs/examples/sample-chapter.js`(필기), `docs/examples/sample-practical.js`(실기) — 다른 강좌의 데이터이므로 **형식과 분량만** 참고합니다.

### 2-1. 이론 html
- 계획의 소단원(section)마다 `<h3>` 하나 (장 페이지 왼쪽에 "이 장의 내용" 목차로 나옴).
- 허용 태그: `h3, h4, p, ul, ol, li, table/tr/th/td, strong, b, code, pre, br, mark`
  그리고 상자 두 가지: `<div class="tip">핵심 · 암기 팁</div>`, `<div class="warn">자주 틀리는 포인트 · 함정</div>`.
- 권장 흐름(소단원마다): 핵심 개념 요약(표 · 목록 위주) → 자주 나오는 비교표 → "이렇게 나온다"(출제 유형) → 함정(`warn`) → 암기 팁(`tip`).
- 그림이 꼭 필요하면 인라인 `<svg>` (색은 `var(--primary)`, `var(--border)`, `var(--text)`)를 씁니다. `<script>` · 외부 이미지 금지.
- 분량: 소단원 하나에 50분 학습 분량. 시험에 나오는 정의 · 분류 · 순서 · 수치는 빠짐없이.

### 2-2. 필기 객관식 문제 (MCQ)
```js
{ q: "문제 본문 (간단한 HTML 가능: <b>, <br>, <code>, <table>)",
  code: String.raw`선택: 코드`, lang: "c|cpp|java|python|sql",   // code 가 있을 때만
  choices: ["보기1", "보기2", "보기3", "보기4"],   // 정확히 4개, 번호(①, 1.) 붙이지 말 것
  answer: 2,                                       // 1~4 (1부터)
  exp: "해설: 왜 정답인지 + 오답 포인트 2~4문장",
  src: "기출 빈출 유형" }
```

### 2-3. 실기 주관식 문제 (SA)
```js
{ q: "문제 본문", code: String.raw`선택: 코드`, lang: "c|cpp|java|python|sql",
  runnable: true,                 // 프로그래밍 출력 문제일 때만 (lang 은 c/cpp/java/python)
  answer: "표시용 정답",            // 예: "15", "① 정규화 ② 반정규화"
  accept: ["허용 답안1", "허용 답안2"],  // 선택: 자동 채점용 다른 표현 (공백 · 대소문자 · 따옴표 무시하고 비교)
  exp: "해설", src: "기출 빈출 유형" }
```
- 자동 채점은 `answer` 와 `accept` 중 하나와 **같은지** 만 봅니다. 답이 여러 형태로 쓰일 수 있으면 accept 에 모두 넣습니다.
  서술형은 학생이 해설을 보고 "맞음/틀림으로 처리" 를 직접 누를 수 있습니다.
- `runnable: true` 문제는 화면에서 코드를 고쳐 실행할 수 있습니다(Wandbox: gcc 13 · OpenJDK 22 · CPython 3.12).
  **answer 는 실제 출력 그대로** (여러 줄이면 `\n` 포함, String.raw 로). 검사 도구가 실제로 실행해 비교합니다.
  Java 는 `public class Main`, C 는 `#include <stdio.h>` 를 포함한 완전한 프로그램.

### 2-4. 공통 규칙
- 문자열은 큰따옴표 또는 템플릿 리터럴. **`html` · `code` 처럼 길거나 백슬래시가 있는 값은 `String.raw\`...\``** 를 씁니다.
  String.raw 안에는 백틱(`` ` ``)과 `${` 를 넣을 수 없습니다 (필요하면 `&#96;` 로).
- 코드는 `q` 에 넣지 말고 `code` 필드에.
- **실제 기출 문제를 그대로 옮기지 않습니다(저작권).** 출제된 개념 · 유형을 바탕으로 자신의 문장으로 **새로 씁니다**.
  `past` 의 `src` 는 "기출 빈출 유형", "OO 개념 빈출" 처럼 적고, 특정 회차를 단정하지 않습니다. `generated` 의 src 는 "생성 문제" 또는 비워 둡니다.
- 문제 수: 문제 구성 설정의 "단원별 확인 문제 수" × 소단원 수 정도를 past 와 generated 에 반씩 나눕니다. 모든 문제에 exp 를 씁니다.
- 정답 위치(1~4)가 한쪽에 몰리지 않게, 오답 보기는 그럴듯하게(실제로 헷갈리는 개념) 만듭니다.
- 문제 순서가 오답노트 · 풀이 기록의 번호가 되므로, 배포 후에는 문제를 중간에 끼워 넣기보다 **배열 끝에 추가**합니다.

## 3. 모의고사 — `data/mock/m01.js` … `mNN.js`
```js
window.MOCKS = window.MOCKS || {};
MOCKS[1] = { no: 1, title: "제1회 모의고사", theme: "출제 방향 한 줄 (선택)",
  written: [ /* MCQ + subj: "s1" … 과목 순서대로 모아서 */ ],
  practical: [ /* SA — 실기 과목이 있을 때만 */ ] };
```
- 회차 수 = `CERT_COURSE.mock.sets`, 회차당 전체 문항 수(written + practical) = `CERT_COURSE.mock.perSet`, 시간 = `mock.minutes` 분.
- written 문항마다 `subj` 에 필기 과목 id(`js/course.js` 의 subjects[].id, 예: "s1")를 붙이고, **과목 순서대로 모아서** 배치합니다
  (화면이 과목 머리글을 붙이고 과목별 점수 · 과락을 계산). 과목마다 같은 수씩.
- 채점: 필기 = 과목별 100점 환산의 평균이 `passAvg`(60) 이상이고 모든 과목이 `cutoff`(40) 이상이면 합격.
  실기 = 맞은 문항 비율 × 100 이 passAvg 이상이면 합격.
- 장 파일의 문제를 복사하지 말고, 같은 범위에서 새 문항을 씁니다. 난이도 쉬움 30% · 보통 50% · 어려움 20%.
- 예시: `docs/examples/sample-mock.js` (일부만 담은 형식 예시).

## 4. 검사
```bash
node tools/validate.js ch01          # 장 하나
node tools/validate.js exam          # 모의고사 전체 회차
node tools/validate.js all           # 전부
node tools/validate.js ch01 --no-run # 코드 실행 확인(Wandbox) 생략
```
브라우저와 같은 순서(js/course.js → js/cert-loader.js → 장 파일)로 불러와 확인합니다:
addChapter id · `<h3>` 소단원 · 필드 누락 · 보기 4개 · answer 범위 · 중복 문제 · 모의고사 문항 수와 subj 배치 · runnable 코드의 실제 출력.
**오류 0** 이 될 때까지 고칩니다. 로컬 미리보기: `node tools/serve.js 8080` → http://localhost:8080

## 5. 확장 (엔진 파일은 고치지 않음)
- `js/custom.js` · `css/custom.css` 는 엔진을 갱신해도 덮어쓰지 않습니다.
- 첫 화면에 시험 안내(일정 · 응시 자격 · 합격 기준 · 합격률 등)를 넣으려면 `js/custom.js` 에서
  `window.HomeInfo = { html: () => '<h2>시험 안내</h2>…', bind: (root) => {} }` 를 정의합니다.
- 화면이 바뀔 때마다 `document.addEventListener('lb:render', e => { /* e.detail.parts */ })`.
