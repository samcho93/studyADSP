// 형식 예시 — 실기(주관식, track: "practical") 과목의 장 하나 (다른 강좌의 데이터: 형식 · 분량만 참고)
CERT_COURSE.addChapter({
  id: 'ch07',
  html: String.raw`
<h3>자료형과 서식 지정자</h3>
<table>
<tr><th>자료형</th><th>크기(일반적)</th><th>서식</th><th>비고</th></tr>
<tr><td>char</td><td>1byte</td><td>%c / %d</td><td>문자는 내부적으로 정수(ASCII). 'A'=65, 'a'=97, '0'=48</td></tr>
<tr><td>int</td><td>4byte</td><td>%d, %o(8진), %x(16진)</td><td>정수 / 정수 = 정수(소수점 버림)</td></tr>
<tr><td>float / double</td><td>4 / 8byte</td><td>%f, %.2f, %lf</td><td>%f 기본 소수 6자리</td></tr>
<tr><td>char *</td><td>포인터</td><td>%s</td><td>'\0'을 만날 때까지 출력</td></tr>
</table>
<ul>
<li><code>%5d</code>: 5칸 오른쪽 정렬, <code>%-5d</code>: 왼쪽 정렬, <code>%05d</code>: 빈칸을 0으로</li>
<li><code>%.1f</code>: 소수 첫째 자리까지(반올림), <code>%6.2f</code>: 전체 6칸</li>
<li><code>(double)a / b</code> 처럼 한쪽만 실수로 바꾸면 실수 나눗셈이 된다.</li>
</ul>
<div class="warn"><code>double d = 7 / 2;</code> 의 결과는 3.5가 아니라 <b>3.0</b>. 정수 나눗셈이 먼저 끝난 뒤에 대입된다.</div>

<h3>연산자 우선순위</h3>
<table>
<tr><th>순위</th><th>연산자</th></tr>
<tr><td>1 (높음)</td><td>() [] -> . 후위 ++ --</td></tr>
<tr><td>2</td><td>단항: ! ~ 전위 ++ -- * &amp; (형변환) sizeof (오른쪽→왼쪽)</td></tr>
<tr><td>3</td><td>* / %</td></tr>
<tr><td>4</td><td>+ -</td></tr>
<tr><td>5</td><td>&lt;&lt; &gt;&gt;</td></tr>
<tr><td>6</td><td>&lt; &lt;= &gt; &gt;=</td></tr>
<tr><td>7</td><td>== !=</td></tr>
<tr><td>8~10</td><td>&amp; → ^ → |</td></tr>
<tr><td>11~12</td><td>&amp;&amp; → ||</td></tr>
<tr><td>13</td><td>?: (조건)</td></tr>
<tr><td>14 (낮음)</td><td>= += -= ... (오른쪽→왼쪽), 그 다음 , (콤마)</td></tr>
</table>
<div class="tip">암기: <b>단산시관비논삼대콤</b> (단항 → 산술 → 시프트 → 관계 → 비트 → 논리 → 삼항 → 대입 → 콤마). 비트 연산자 &amp;는 == 보다 낮으므로 <code>a &amp; 1 == 0</code>은 <code>a &amp; (1 == 0)</code>으로 해석된다.</div>
<p><b>단락 평가(short-circuit)</b>: <code>A &amp;&amp; B</code>에서 A가 거짓이면 B를 실행하지 않고, <code>A || B</code>에서 A가 참이면 B를 실행하지 않는다. B 안의 ++ 도 실행되지 않는다.</p>

<h3>증감 연산자</h3>
<pre>int a = 5, b;
b = a++;   // b = 5, a = 6  (후위: 먼저 사용, 나중에 증가)
b = ++a;   // a = 7, b = 7  (전위: 먼저 증가, 나중에 사용)</pre>
<div class="warn">한 식 안에서 같은 변수를 두 번 이상 증감(<code>i++ + i++</code>)하거나 printf 인자 안에서 증감하는 코드는 정의되지 않은 동작이다. 시험은 보통 한 번만 증감하는 형태로 낸다.</div>

<h3>비트 연산</h3>
<table>
<tr><th>연산</th><th>의미</th><th>예 (a=12: 1100, b=10: 1010)</th></tr>
<tr><td>a &amp; b</td><td>AND</td><td>1000 = 8</td></tr>
<tr><td>a | b</td><td>OR</td><td>1110 = 14</td></tr>
<tr><td>a ^ b</td><td>XOR(다르면 1)</td><td>0110 = 6</td></tr>
<tr><td>~a</td><td>NOT</td><td>-(a+1) = -13</td></tr>
<tr><td>a &lt;&lt; n</td><td>왼쪽 시프트</td><td>a × 2<sup>n</sup></td></tr>
<tr><td>a &gt;&gt; n</td><td>오른쪽 시프트</td><td>a ÷ 2<sup>n</sup> (음수는 내림 방향)</td></tr>
</table>
<div class="tip"><code>~x = -x - 1</code> 공식을 외우면 2의 보수 계산 없이 바로 답이 나온다. <code>n &amp; 1</code>이 1이면 홀수, <code>n &amp; (n-1) == 0</code>이면 2의 거듭제곱.</div>
`,
  past: [
    { q: "다음 C 프로그램의 실행 결과를 쓰시오.",
      lang: "c",
      runnable: true,
      code: String.raw`#include <stdio.h>

int main(void) {
    int a = 5, b = 10, c;
    c = a++ + ++b;
    printf("%d %d %d\n", a, b, c);
    c = --a * b--;
    printf("%d %d %d\n", a, b, c);
    return 0;
}`,
      answer: "6 11 16\n5 10 55",
      exp: "a++는 5를 사용한 뒤 a=6, ++b는 먼저 증가해 11을 사용하므로 c=16. 다음 줄에서 --a는 5로 감소 후 사용, b--는 11을 사용한 뒤 10으로 감소하므로 c=5*11=55.",
      src: "2020년 기출 빈출 유형(증감 연산자)" },
    { q: "다음 C 프로그램의 실행 결과를 쓰시오.",
      lang: "c",
      runnable: true,
      code: String.raw`#include <stdio.h>

int main(void) {
    int a = 12, b = 10;
    printf("%d\n", a & b);
    printf("%d\n", a | b);
    printf("%d\n", a ^ b);
    printf("%d\n", ~a);
    printf("%d\n", a << 2);
    printf("%d\n", b >> 1);
    return 0;
}`,
      answer: "8\n14\n6\n-13\n48\n5",
      exp: "12=1100, 10=1010. AND 1000=8, OR 1110=14, XOR 0110=6. ~a는 -(a+1)=-13. a<<2는 12×4=48, b>>1은 10÷2=5.",
      src: "2020년 기출 빈출 유형(비트 연산)" },
    { q: "다음 C 프로그램의 실행 결과를 쓰시오.",
      lang: "c",
      runnable: true,
      code: String.raw`#include <stdio.h>

int main(void) {
    int a = 3, b = 4, c = 5;
    int r1 = a + b * c % 3;
    int r2 = (a < b) + (b == c) * 2 + !c;
    int r3 = b & 4 == 4;
    printf("%d %d %d\n", r1, r2, r3);
    printf("%.2f %d\n", (float)c / 2, c / 2 * 2);
    return 0;
}`,
      answer: "5 1 0\n2.50 4",
      exp: "b * c % 3은 왼쪽부터 (20 % 3) = 2이므로 r1 = 5. r2는 1 + 0*2 + !5(0) = 1. ==가 &보다 우선하므로 b & 4 == 4는 b & (4 == 4) = 4 & 1 = 0. (float)c / 2는 실수 나눗셈 2.50, c / 2 * 2는 정수 나눗셈 2에 2를 곱해 4.",
      src: "기출 빈출 유형" }
  ],
  generated: [
    { q: "다음 C 프로그램의 실행 결과를 쓰시오.",
      lang: "c",
      runnable: true,
      code: String.raw`#include <stdio.h>

int main(void) {
    int a = 7, b = 2;
    double d = a / b;
    printf("%d %.1f %.2f\n", a / b, d, (double)a / b);
    printf("%d %c\n", 'A' + 2, 'a' + 1);
    printf("[%5.1f][%-3d]\n", 3.14159, 7);
    return 0;
}`,
      answer: "3 3.0 3.50\n67 b\n[  3.1][7  ]",
      exp: "a/b는 정수 나눗셈 3이고, d에는 3이 대입되어 3.0. (double)a/b는 3.5 → %.2f로 3.50. 'A'+2=67을 %d로, 'a'+1을 %c로 출력하면 b. %5.1f는 5칸 오른쪽 정렬, %-3d는 3칸 왼쪽 정렬.",
      src: "기출 변형 생성문제" },
    { q: "다음 C 프로그램의 실행 결과를 쓰시오.",
      lang: "c",
      runnable: true,
      code: String.raw`#include <stdio.h>

int main(void) {
    int a = 0, b = 5, c;
    c = a++ && b++;
    printf("%d %d %d\n", a, b, c);
    c = a++ || b++;
    printf("%d %d %d\n", a, b, c);
    c = b > 3 ? a << 2 : a >> 1;
    printf("%d\n", c + 3 * 2 % 4);
    return 0;
}`,
      answer: "1 5 0\n2 5 1\n10",
      exp: "a++는 0(거짓)을 내놓아 && 오른쪽 b++는 실행되지 않음(단락 평가) → a=1, b=5, c=0. 다음 a++는 1(참)이라 || 오른쪽이 생략 → a=2, c=1. b>3이 참이므로 c=2<<2=8, 3*2%4=2 → 10.",
      src: "기출 변형 생성문제" },
    { q: "다음 C 프로그램의 실행 결과를 쓰시오.",
      lang: "c",
      runnable: true,
      code: String.raw`#include <stdio.h>

int main(void) {
    int n = 45, cnt = 0, i;
    for (i = 0; i < 8; i++)
        if (n & (1 << i))
            cnt++;
    printf("%d\n", cnt);
    printf("%d\n", n ^ 0xFF);
    printf("%d\n", (n >> 2) & 3);
    return 0;
}`,
      answer: "4\n210\n3",
      exp: "45 = 00101101로 1인 비트는 4개. 0xFF(11111111)와 XOR하면 비트가 반전되어 11010010 = 210. 45>>2 = 1011(11)이고 &3(11)은 하위 2비트 11 = 3.",
      src: "기출 변형 생성문제" },
    { q: "다음 C 프로그램의 실행 결과를 쓰시오.",
      lang: "c",
      runnable: true,
      code: String.raw`#include <stdio.h>

int main(void) {
    int a = 6, b = 11;
    a ^= b;
    b ^= a;
    a ^= b;
    printf("%d %d\n", a, b);
    printf("%d\n", (a & 1) + (b & 1));
    printf("%d\n", -a >> 1);
    printf("%d\n", (16 & (16 - 1)) == 0);
    return 0;
}`,
      answer: "11 6\n1\n-6\n1",
      exp: "XOR 세 번으로 임시 변수 없이 교환 → a=11, b=6. a&1=1(홀수), b&1=0 → 1. -11>>1은 산술 시프트로 내림 방향 -5.5 → -6. 16&15=0이므로 비교 결과 1(2의 거듭제곱 판별).",
      src: "기출 변형 생성문제" }
  ],
});
