/* 자격증 문제은행형 엔진 — 강좌 설정(js/course.js) → 앱 데이터(WRITTEN · PRACTICAL) 조립
 * - js/course.js : window.CERT_COURSE = { subjects, order, mock, ... }  (lectureBuilder 가 생성)
 * - data/chapters/<id>.js : CERT_COURSE.addChapter({ id, html, past, generated })  (장 하나)
 * - data/mock/mNN.js : MOCKS[n] = { written, practical }  (모의고사 회차 — 앱이 열 때 불러옴)
 * 장 파일을 차례로 불러온 뒤 과목별로 합쳐 window.WRITTEN / window.PRACTICAL 을 만든다.
 * 문제 번호(오답노트 · 풀이 기록 키)는 curriculum 순서로 고정된다.
 * node(검사 도구)에서도 쓸 수 있도록 DOM 부분은 document 가 있을 때만 실행한다.
 */
(function (root) {
  var C = root.CERT_COURSE;
  if (!C) return;

  var EMPTY = '<p class="empty">이 장의 이론은 아직 준비 중입니다.</p>';
  var trackOf = function (s) { return s && s.track === 'practical' ? 'practical' : 'written'; };

  // 과목별로 합치기 (중복 호출 가능 — 매번 새로 만든다)
  C.build = function () {
    var W = {}, P = {};
    var subs = C.subjects || [];
    var wNo = 0, pNo = 0;
    subs.forEach(function (s) {
      var chs = (C.order || []).filter(function (o) { return o.subject === s.id; });
      if (trackOf(s) === 'written') {
        var w = { id: s.id, no: ++wNo, title: s.title, desc: s.desc || '', chapters: [], past: [], generated: [], chMap: { past: [], generated: [] } };
        chs.forEach(function (o, ci) {
          var d = (C.chapters || {})[o.id] || {};
          w.chapters.push({ id: o.id, title: o.title, html: d.html || EMPTY });
          (d.past || []).forEach(function (q) { w.past.push(q); w.chMap.past.push(ci); });
          (d.generated || []).forEach(function (q) { w.generated.push(q); w.chMap.generated.push(ci); });
        });
        if (s.related) w.related = s.related;
        W[s.id] = w;
      } else {
        var p = { id: s.id, order: ++pNo, title: s.title, desc: s.desc || '', chapters: [], questions: [], chMap: [], links: s.links || [] };
        chs.forEach(function (o, ci) {
          var d = (C.chapters || {})[o.id] || {};
          p.chapters.push({ id: o.id, title: o.title, html: d.html || EMPTY });
          (d.past || []).forEach(function (q) { p.questions.push(q); p.chMap.push(ci); });
          // 앱은 src 에 '생성' 이 들어간 실기 문항을 '생성 문제' 로 분류한다
          (d.generated || []).forEach(function (q) {
            if (!/생성/.test(q.src || '')) q = Object.assign({}, q, { src: q.src ? '생성 · ' + q.src : '생성 문제' });
            p.questions.push(q); p.chMap.push(ci);
          });
        });
        P[s.id] = p;
      }
    });
    return { WRITTEN: W, PRACTICAL: P };
  };

  if (typeof document === 'undefined' || !document.createElement) return;

  // 장 파일을 순서대로 불러온다 (async=false → 넣은 순서대로 실행). 없는 파일은 '준비 중' 으로 남김
  C.ready = new Promise(function (resolve) {
    var ids = (C.order || []).map(function (o) { return o.id; });
    var left = ids.length;
    function done() {
      var r = C.build();
      root.WRITTEN = r.WRITTEN;
      root.PRACTICAL = r.PRACTICAL;
      applyNav();
      resolve(r);
    }
    if (!left) return done();
    ids.forEach(function (id) {
      var s = document.createElement('script');
      s.src = 'data/chapters/' + id + '.js' + (C.version ? '?v=' + C.version : '');
      s.async = false;
      s.onload = s.onerror = function () { if (--left === 0) done(); };
      document.head.appendChild(s);
    });
  });

  // 메뉴: 강좌에 없는 기능은 숨긴다
  function applyNav() {
    var subs = C.subjects || [];
    var hasP = subs.some(function (s) { return trackOf(s) === 'practical'; });
    var hasW = subs.some(function (s) { return trackOf(s) === 'written'; });
    var runnable = Object.keys(root.PRACTICAL || {}).some(function (k) { return root.PRACTICAL[k].questions.some(function (q) { return q.runnable; }); });
    var show = {
      written: hasW,
      practical: hasP,
      mock: !!(C.mock && C.mock.sets),
      playground: C.playground != null ? !!C.playground : runnable,
      links: !!((C.links || []).length),
    };
    var labels = C.navLabels || {};
    Object.keys(show).forEach(function (k) {
      var a = document.querySelector('#nav [data-nav="' + k + '"]');
      if (!a) return;
      if (!show[k]) a.style.display = 'none';
      if (labels[k]) a.textContent = labels[k];
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
