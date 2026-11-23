/* 강좌별 추가 기능 — lectureBuilder 가 엔진을 갱신해도 이 파일은 덮어쓰지 않습니다.
 * 쓸 수 있는 전역: CERT_COURSE(강좌 설정 · 장 데이터) · WRITTEN · PRACTICAL(조립된 과목) · MOCKS(불러온 모의고사)
 *                  window.app = { route, store, wrongs, renderMCQ, renderSA, quizList, parts }
 * 화면이 바뀔 때마다:
 *   document.addEventListener('lb:render', function (e) {
 *     // e.detail.parts = 해시 경로 조각. 예: [] 홈, ['written','s1','2'] 1과목 2장, ['mock','1','written']
 *   });
 * 첫 화면에 시험 안내(시험 일정 · 합격 기준 등)를 넣으려면 여기서 window.HomeInfo 를 정의합니다:
 *   window.HomeInfo = { html: function () { return '<h2>시험 안내</h2><div class="card">…</div>'; }, bind: function (root) {} };
 */
