/* ADSP 자격증대비 — 강좌 설정
 * lectureBuilder 가 docs/curriculum.json 으로 생성합니다. (직접 고치면 다음 생성 때 덮어씀)
 * subjects = 과목(curriculum 의 parts, track: written 필기 객관식 | practical 실기 주관식), order = 장(curriculum 의 chapters)
 * 각 장은 data/chapters/<id>.js 에서 CERT_COURSE.addChapter({...}) 로 등록, 모의고사는 data/mock/m01.js …
 */
window.CERT_COURSE = {
  "id": "studyADSP",
  "title": "ADSP 자격증대비",
  "shortTitle": "ADSP 자격증대비",
  "subtitle": "",
  "icon": "🎓",
  "intro": "ADsP(데이터분석 준전문가) 필기 시험을 <b>과목 → 장</b> 순서로 정리한 입문자용 대비 강좌입니다. 1과목 데이터 이해, 2과목 데이터 분석 기획, 3과목 데이터 분석(출제 비중 60%)의 핵심 이론을 표와 암기 포인트로 요약하고, 장마다 기출 유형과 예상 문제로 바로 확인합니다. 마지막에는 실전과 같은 모의고사(타이머 · OMR · 과락 판정)로 마무리합니다.",
  "certName": "",
  "storeKey": "cert.studyADSP",
  "mock": {
    "sets": 10,
    "perSet": 20,
    "minutes": 30,
    "passAvg": 60,
    "cutoff": 40
  },
  "links": [],
  "related": {},
  "subjects": [
    {
      "id": "s1",
      "part": 1,
      "track": "written",
      "title": "1과목. 데이터 이해",
      "desc": "데이터 · 정보 · 지식, 데이터베이스, 빅데이터의 가치와 위기 요인, 데이터 사이언티스트 (10문항 · 과락 40%)"
    },
    {
      "id": "s2",
      "part": 2,
      "track": "written",
      "title": "2과목. 데이터 분석 기획",
      "desc": "분석 기획 유형 · 방법론(KDD · CRISP-DM · 빅데이터 분석 방법론), 분석 과제 도출, 마스터 플랜 · 거버넌스 (10문항 · 과락 40%)"
    },
    {
      "id": "s3",
      "part": 3,
      "track": "written",
      "title": "3과목. 데이터 분석",
      "desc": "R 기초 · 데이터 마트, 통계 분석(추정 · 검정 · 회귀 · 시계열 · 다변량), 정형 데이터 마이닝(분류 · 군집 · 연관) (30문항 · 과락 40%)"
    }
  ],
  "order": [
    {
      "id": "ch01",
      "no": "01",
      "part": 1,
      "subject": "s1",
      "title": "데이터의 이해",
      "icon": "📊"
    },
    {
      "id": "ch02",
      "no": "02",
      "part": 1,
      "subject": "s1",
      "title": "데이터의 가치와 미래",
      "icon": "🚀"
    },
    {
      "id": "ch03",
      "no": "03",
      "part": 1,
      "subject": "s1",
      "title": "가치 창조를 위한 데이터 사이언스와 전략 인사이트",
      "icon": "🧑‍🔬"
    },
    {
      "id": "ch04",
      "no": "04",
      "part": 2,
      "subject": "s2",
      "title": "데이터 분석 기획의 이해",
      "icon": "🧭"
    },
    {
      "id": "ch05",
      "no": "05",
      "part": 2,
      "subject": "s2",
      "title": "분석 마스터 플랜과 거버넌스",
      "icon": "🗺️"
    },
    {
      "id": "ch06",
      "no": "06",
      "part": 3,
      "subject": "s3",
      "title": "R 기초와 데이터 마트 · 탐색적 분석",
      "icon": "🧰"
    },
    {
      "id": "ch07",
      "no": "07",
      "part": 3,
      "subject": "s3",
      "title": "통계 분석 기초 — 표본 · 확률분포 · 추정 · 가설검정",
      "icon": "📐"
    },
    {
      "id": "ch08",
      "no": "08",
      "part": 3,
      "subject": "s3",
      "title": "회귀 분석 · 다변량 분석 · 시계열 분석",
      "icon": "📈"
    },
    {
      "id": "ch09",
      "no": "09",
      "part": 3,
      "subject": "s3",
      "title": "정형 데이터 마이닝 ① — 분류 분석과 모형 평가",
      "icon": "🌳"
    },
    {
      "id": "ch10",
      "no": "10",
      "part": 3,
      "subject": "s3",
      "title": "정형 데이터 마이닝 ② — 군집 분석과 연관 분석",
      "icon": "🧩"
    }
  ],
  "chapters": {},
  "addChapter": function (ch) { this.chapters[ch.id] = ch; }
};
