# ADSP 자격증대비 — 작업 규칙

이 저장소는 lectureBuilder 로 만든 강좌입니다. 엔진: **자격증 문제은행형** (원본 강좌 studyJungchegi 의 엔진을 그대로 사용).

## 구조
- `js/course.js` — 강좌 설정 · 차시 순서(`CERT_COURSE.order`). lectureBuilder 가 `docs/curriculum.json` 으로 생성합니다. 직접 고치지 마세요.
- `data/chapters/<id>.js` — 차시 콘텐츠. 형식은 **`docs/LESSON_GUIDE.md`** 를 반드시 따릅니다. 예시: `docs/examples/sample-chapter.js`.
- 엔진 파일(js/ · css/ · py/ · server/ · tools/ · index.html 등)은 lectureBuilder 가 엔진을 갱신할 때 덮어씁니다.
  강좌만의 기능 · 스타일은 `js/custom.js` · `css/custom.css` 에 넣습니다 (덮어쓰지 않음).

## 강좌 정보
- 작성 형태: 자격증 대비 / 대상: 일반 / 수준: 입문
- 문제 구성: 단원별 확인 문제 5개 · 모의고사 1회 × 20문항 (형식: 객관식, 단답형)
- 문체: 존댓말, 핵심 요약 · 암기 포인트 · 기출 유형 중심

## 규칙
- 레슨을 고친 뒤 `node tools/validate.js <id>` 로 오류 0 을 확인합니다.
- 로컬 미리보기: `node tools/serve.js 8080` (Windows: start.bat)
- `lecture/` (원본 강의자료)는 저작권 때문에 커밋하지 않습니다.
