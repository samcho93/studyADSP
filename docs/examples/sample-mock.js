// 형식 예시 — 모의고사 1회 (다른 강좌의 데이터 일부: 형식만 참고. 실제 회차는 문항 수를 강좌 설정에 맞춤)
window.MOCKS = window.MOCKS || {};
MOCKS[1] = {
  no: 1, title: "제1회 모의고사", theme: "기본 빈출 개념 위주(난이도 하~중)",
  written: [
    { subj: "s1",
      q: "요구사항 개발 프로세스의 순서로 옳은 것은?",
      choices: ["도출 → 분석 → 명세 → 확인", "분석 → 도출 → 확인 → 명세", "도출 → 명세 → 분석 → 확인", "명세 → 도출 → 분석 → 확인"],
      answer: 1,
      exp: String.raw`요구사항 개발은 도출(Elicitation) → 분석(Analysis) → 명세(Specification) → 확인(Validation) 순으로 진행된다. 확인 단계는 명세된 요구사항이 이해관계자의 의도와 일치하는지 검증하는 마지막 단계이다.`,
      src: "2020년 3회 기출 유형" },
    { subj: "s1",
      q: "다음 중 비기능적 요구사항에 해당하는 것은?",
      choices: ["회원은 비밀번호를 변경할 수 있어야 한다.", "관리자는 상품을 등록할 수 있어야 한다.", "시스템은 1초 이내에 조회 결과를 응답해야 한다.", "사용자는 주문 내역을 조회할 수 있어야 한다."],
      answer: 3,
      exp: "응답 시간, 보안, 가용성 같은 품질·제약 조건은 비기능적 요구사항이다. 나머지 보기는 시스템이 수행해야 할 기능을 정의하므로 기능적 요구사항이다.",
      src: "2021년 1회 기출 유형" },
    { subj: "s1",
      q: "UML의 구성 요소에 해당하지 않는 것은?",
      choices: ["Things", "Process", "Relationships", "Diagrams"],
      answer: 2,
      exp: String.raw`UML은 사물(Things), 관계(Relationships), 다이어그램(Diagrams)의 3가지 요소로 구성된다. Process는 UML 구성 요소가 아니다.`,
      src: "2020년 4회 기출 유형" },
    { subj: "s2",
      q: "스택(Stack)에 A, B, C 순서로 입력한 뒤 pop을 2번 수행했을 때 마지막으로 꺼낸 값은?",
      choices: ["A", "C", "B", "알 수 없다"],
      answer: 3,
      exp: "스택은 LIFO 구조이므로 첫 번째 pop은 C, 두 번째 pop은 B가 출력된다.",
      src: "생성문제" },
    { subj: "s2",
      q: "다음 중 선형 자료구조가 아닌 것은?",
      choices: ["스택", "큐", "트리", "데크"],
      answer: 3,
      exp: "트리와 그래프는 비선형 자료구조이다. 배열·연결 리스트·스택·큐·데크는 선형 자료구조이다.",
      src: "2020년 3회 기출 유형" },
    { subj: "s2",
      q: "다음 트리를 후위 순회(Postorder)한 결과는? (루트 A, A의 왼쪽 자식 B, 오른쪽 자식 C, B의 왼쪽 자식 D, B의 오른쪽 자식 E)",
      choices: ["D E B C A", "A B D E C", "D B E A C", "D E C B A"],
      answer: 1,
      exp: "후위 순회는 왼쪽 → 오른쪽 → 루트 순이다. B의 서브트리에서 D, E, B를 방문한 뒤 C, 마지막으로 A를 방문한다.",
      src: "2021년 1회 기출 유형" }
  ],
  practical: [
    { q: "다음 C 프로그램의 실행 결과를 쓰시오.",
      code: String.raw`#include <stdio.h>
int main() {
    int a[5] = {64, 25, 12, 22, 11};
    int i, j, t;
    for (i = 0; i < 4; i++) {
        for (j = 0; j < 4 - i; j++) {
            if (a[j] > a[j + 1]) {
                t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
            }
        }
    }
    for (i = 0; i < 5; i++) printf("%d%s", a[i], i < 4 ? " " : "");
    return 0;
}`,
      lang: "c",
      runnable: true,
      answer: "11 12 22 25 64",
      accept: ["11 12 22 25 64"],
      exp: "인접한 두 원소를 비교해 큰 값을 뒤로 보내는 버블 정렬(오름차순)이다. 정렬 후 공백으로 구분하여 출력한다.",
      src: "2020년 4회 기출 유형" },
    { q: "다음 C 프로그램의 실행 결과를 쓰시오.",
      code: String.raw`#include <stdio.h>
int f(int n) {
    if (n <= 1) return n;
    return f(n - 1) + f(n - 2);
}
int main() {
    printf("%d", f(7));
    return 0;
}`,
      lang: "c",
      runnable: true,
      answer: "13",
      exp: "재귀로 피보나치 수를 구한다. f(0)=0, f(1)=1, 1, 2, 3, 5, 8, f(7)=13이다.",
      src: "2021년 1회 기출 유형" },
    { q: "다음 C 프로그램의 실행 결과를 쓰시오.",
      code: String.raw`#include <stdio.h>
int main() {
    char s[] = "KOREA";
    char *p = s;
    int i;
    for (i = 0; i < 5; i += 2) printf("%c", *(p + i));
    return 0;
}`,
      lang: "c",
      runnable: true,
      answer: "KRA",
      exp: "i가 0, 2, 4일 때 *(p + i)는 s[0]='K', s[2]='R', s[4]='A'이다.",
      src: "생성문제" }
  ],
};
