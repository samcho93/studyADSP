CERT_COURSE.addChapter({
  id: 'ch06',
  html: String.raw`
<h3>1. R 기초 — 자료 구조와 기본 문법</h3>
<p>3과목 "데이터 분석"의 첫 장입니다. 시험에서 R 은 <b>짧은 코드의 실행 결과를 고르는 문제</b>로 나옵니다. 함수를 많이 아는 것보다 <b>인덱싱 규칙 · 자료형 변환 · 행렬 채우는 순서 · seq/rep 결과</b>를 정확히 예측하는 것이 핵심입니다. 이 단원의 코드는 모두 손으로 결과를 적어 보면서 읽어 주세요.</p>

<h4>1-1. R 의 기본 문법</h4>
<table>
<tr><th>항목</th><th>문법</th><th>예 / 결과</th></tr>
<tr><td>할당</td><td><code>&lt;-</code>, <code>=</code>, <code>-&gt;</code></td><td><code>x &lt;- 3</code>, <code>3 -&gt; x</code> 모두 x 에 3 저장</td></tr>
<tr><td>주석</td><td><code>#</code></td><td><code># 이 줄은 실행되지 않음</code></td></tr>
<tr><td>연속 정수</td><td><code>a:b</code></td><td><code>1:5</code> → 1 2 3 4 5, <code>5:1</code> → 5 4 3 2 1</td></tr>
<tr><td>나머지 · 몫</td><td><code>%%</code>, <code>%/%</code></td><td><code>7 %% 3</code> → 1, <code>7 %/% 3</code> → 2</td></tr>
<tr><td>거듭제곱</td><td><code>^</code> 또는 <code>**</code></td><td><code>2^3</code> → 8</td></tr>
<tr><td>포함 여부</td><td><code>%in%</code></td><td><code>3 %in% c(1,2,3)</code> → TRUE</td></tr>
<tr><td>도움말 · 패키지</td><td><code>help()</code>, <code>?함수</code>, <code>install.packages()</code>, <code>library()</code></td><td>설치는 한 번, 불러오기(library)는 세션마다</td></tr>
</table>
<p>R 은 <b>벡터 연산</b>이 기본입니다. <code>c(1,2,3) * 2</code> → 2 4 6 처럼 원소마다 계산되고, 길이가 다르면 짧은 쪽을 <b>반복(재사용, recycling)</b>합니다. 예) <code>c(1,2,3,4) + c(10,20)</code> → 11 22 13 24.</p>

<h4>1-2. R 의 자료 구조 (5가지)</h4>
<table>
<tr><th>자료 구조</th><th>차원</th><th>원소 타입</th><th>생성 함수</th><th>특징</th></tr>
<tr><td><b>벡터(vector)</b></td><td>1차원</td><td><mark>모두 같은 타입</mark></td><td><code>c()</code>, <code>seq()</code>, <code>rep()</code></td><td>R 의 가장 기본 단위. 스칼라(값 하나)도 길이 1 인 벡터</td></tr>
<tr><td><b>행렬(matrix)</b></td><td>2차원</td><td>모두 같은 타입</td><td><code>matrix()</code>, <code>rbind()</code>, <code>cbind()</code></td><td>행 × 열. 기본은 <mark>열 우선(byrow=FALSE)</mark>으로 채움</td></tr>
<tr><td><b>배열(array)</b></td><td>n차원(3차원 이상)</td><td>모두 같은 타입</td><td><code>array()</code></td><td><code>array(1:24, dim=c(2,3,4))</code> → 2행 3열 행렬이 4개</td></tr>
<tr><td><b>리스트(list)</b></td><td>1차원(원소가 무엇이든)</td><td><mark>서로 다른 타입 가능</mark></td><td><code>list()</code></td><td>벡터 · 행렬 · 다른 리스트까지 담을 수 있음. <code>[[ ]]</code> 로 원소 자체 추출</td></tr>
<tr><td><b>데이터 프레임(data frame)</b></td><td>2차원</td><td><mark>열 안에서는 같은 타입, 열끼리는 다른 타입 가능</mark></td><td><code>data.frame()</code></td><td>분석에서 가장 많이 쓰는 표 형태. 각 열의 길이가 같아야 함</td></tr>
</table>
<p>범주형 자료는 <b>팩터(factor)</b>로 저장합니다. <code>factor(c("남","여","남"))</code> → 수준(levels)은 "남", "여". 정렬된 범주(등급 등)는 <code>ordered()</code> 또는 <code>factor(..., ordered=TRUE)</code>.</p>

<h4>1-3. 벡터 생성 함수 — seq · rep 결과 예측</h4>
<table>
<tr><th>코드</th><th>결과</th><th>설명</th></tr>
<tr><td><code>seq(1, 10, by=3)</code></td><td>1 4 7 10</td><td>1 부터 3 씩 증가, 10 을 넘지 않을 때까지</td></tr>
<tr><td><code>seq(2, 11, by=4)</code></td><td>2 6 10</td><td>다음 값 14 는 11 을 넘으므로 멈춤</td></tr>
<tr><td><code>seq(0, 1, length.out=5)</code></td><td>0.00 0.25 0.50 0.75 1.00</td><td>구간을 <b>개수</b>로 등분</td></tr>
<tr><td><code>seq(10, 1, by=-3)</code></td><td>10 7 4 1</td><td>감소 수열은 by 가 음수</td></tr>
<tr><td><code>seq(5)</code></td><td>1 2 3 4 5</td><td><code>1:5</code> 와 같음</td></tr>
<tr><td><code>rep(1:2, times=3)</code></td><td>1 2 1 2 1 2</td><td><mark>times = 벡터 전체를 반복</mark></td></tr>
<tr><td><code>rep(1:2, each=3)</code></td><td>1 1 1 2 2 2</td><td><mark>each = 원소 하나씩 반복</mark></td></tr>
<tr><td><code>rep(c("a","b"), times=c(2,1))</code></td><td>"a" "a" "b"</td><td>원소별 반복 횟수 지정</td></tr>
<tr><td><code>rep(1:2, each=2, times=2)</code></td><td>1 1 2 2 1 1 2 2</td><td>each 를 먼저 적용한 뒤 전체를 times 만큼</td></tr>
</table>

<h4>1-4. 인덱싱 — R 은 1부터, 음수는 "제외"</h4>
<p><code>x &lt;- c(10, 20, 30, 40, 50)</code> 일 때</p>
<table>
<tr><th>코드</th><th>결과</th><th>포인트</th></tr>
<tr><td><code>x[1]</code></td><td>10</td><td><mark>인덱스는 1 부터</mark> (파이썬 · C 의 0 이 아님)</td></tr>
<tr><td><code>x[-2]</code></td><td>10 30 40 50</td><td><mark>음수 인덱스 = 그 위치를 제외</mark> (뒤에서 두 번째가 아님!)</td></tr>
<tr><td><code>x[c(1,3)]</code></td><td>10 30</td><td>여러 위치를 벡터로 지정</td></tr>
<tr><td><code>x[2:4]</code></td><td>20 30 40</td><td>범위 지정</td></tr>
<tr><td><code>x[-c(1,2)]</code></td><td>30 40 50</td><td>여러 위치 제외</td></tr>
<tr><td><code>x[x &gt; 25]</code></td><td>30 40 50</td><td>논리 인덱싱 — 조건이 TRUE 인 원소만</td></tr>
<tr><td><code>x[6]</code></td><td>NA</td><td>범위를 벗어나면 오류가 아니라 NA</td></tr>
<tr><td><code>length(x)</code></td><td>5</td><td>원소 개수</td></tr>
</table>
<p>행렬 · 데이터 프레임은 <code>[행, 열]</code> 입니다. <code>m[2, ]</code> 는 2행 전체, <code>m[ , 3]</code> 은 3열 전체. 데이터 프레임의 열은 <code>df$열이름</code> 으로도 꺼냅니다. 리스트는 <code>lst[1]</code> 이 <b>리스트(포장째)</b>, <code>lst[[1]]</code> 이 <b>원소 자체</b>입니다.</p>

<h4>1-5. 행렬 — 열 우선으로 채워진다</h4>
<table>
<tr><th>코드</th><th>결과</th></tr>
<tr><td><code>m &lt;- matrix(1:6, nrow=2)</code></td><td>
<pre>     [,1] [,2] [,3]
[1,]    1    3    5
[2,]    2    4    6</pre></td></tr>
<tr><td><code>matrix(1:6, nrow=2, byrow=TRUE)</code></td><td>
<pre>     [,1] [,2] [,3]
[1,]    1    2    3
[2,]    4    5    6</pre></td></tr>
<tr><td><code>dim(m)</code></td><td>2 3 (행 수, 열 수)</td></tr>
<tr><td><code>m[2, 3]</code></td><td>6</td></tr>
<tr><td><code>t(m)</code></td><td>전치 행렬(3행 2열)</td></tr>
<tr><td><code>apply(m, 1, sum)</code></td><td>9 12 → <mark>1 = 행 방향</mark> (행별 합)</td></tr>
<tr><td><code>apply(m, 2, sum)</code></td><td>3 7 11 → <mark>2 = 열 방향</mark> (열별 합)</td></tr>
<tr><td><code>rbind(1:3, 4:6)</code></td><td>벡터를 <b>행</b>으로 쌓음 → 2행 3열</td></tr>
<tr><td><code>cbind(1:3, 4:6)</code></td><td>벡터를 <b>열</b>로 붙임 → 3행 2열</td></tr>
</table>
<p>apply 계열 함수 정리: <code>apply</code>(행렬 · 배열의 행/열에 함수 적용), <code>lapply</code>(리스트로 반환), <code>sapply</code>(가능하면 벡터 · 행렬로 단순화해 반환), <code>tapply</code>(그룹별 적용, 예: <code>tapply(점수, 반, mean)</code>).</p>

<h4>1-6. 자료형과 강제 변환</h4>
<p>벡터는 한 가지 타입만 담을 수 있으므로, 서로 다른 타입을 <code>c()</code> 로 묶으면 <b>더 표현력이 큰 타입으로 자동 변환</b>됩니다.</p>
<p><mark>character(문자) &gt; numeric(숫자) &gt; logical(논리)</mark> (세분하면 character &gt; complex &gt; double &gt; integer &gt; logical)</p>
<table>
<tr><th>코드</th><th>결과</th><th>설명</th></tr>
<tr><td><code>c(1, "a", TRUE)</code></td><td>"1" "a" "TRUE"</td><td>문자가 하나라도 있으면 <mark>전부 문자형</mark></td></tr>
<tr><td><code>c(1, TRUE, FALSE)</code></td><td>1 1 0</td><td>논리 + 숫자 → 숫자 (TRUE=1, FALSE=0)</td></tr>
<tr><td><code>sum(c(TRUE, FALSE, TRUE))</code></td><td>2</td><td>TRUE 개수 세기에 자주 씀</td></tr>
<tr><td><code>as.numeric("3.5")</code></td><td>3.5</td><td>명시적 변환</td></tr>
<tr><td><code>as.numeric("abc")</code></td><td>NA (경고)</td><td>숫자로 못 바꾸면 NA</td></tr>
<tr><td><code>class(c(1, "a"))</code></td><td>"character"</td><td>타입 확인: <code>class()</code>, <code>mode()</code>, <code>is.numeric()</code> 등</td></tr>
</table>

<h4>1-7. NA · NULL · NaN · Inf 구분</h4>
<table>
<tr><th>값</th><th>의미</th><th>예</th><th>확인 함수 / 길이</th></tr>
<tr><td><b>NA</b></td><td><mark>결측값</mark>(Not Available) — 값이 있어야 하는데 없음</td><td><code>c(1, NA, 3)</code></td><td><code>is.na()</code>, <code>length(NA)</code> = <b>1</b></td></tr>
<tr><td><b>NULL</b></td><td><mark>아무것도 없음</mark>(빈 객체) — 값 자체가 존재하지 않음</td><td><code>x &lt;- NULL</code></td><td><code>is.null()</code>, <code>length(NULL)</code> = <b>0</b></td></tr>
<tr><td><b>NaN</b></td><td>숫자가 아님(Not a Number) — 정의되지 않는 계산</td><td><code>0/0</code></td><td><code>is.nan()</code>. <code>is.na(NaN)</code> 도 TRUE</td></tr>
<tr><td><b>Inf</b></td><td>무한대</td><td><code>1/0</code> → Inf, <code>-1/0</code> → -Inf</td><td><code>is.infinite()</code></td></tr>
</table>
<p><code>c(1, NULL, 3)</code> → 1 3 (NULL 은 자리를 차지하지 않음), <code>c(1, NA, 3)</code> → 1 NA 3 (NA 는 자리를 차지). <code>mean(c(1, NA, 3))</code> → <b>NA</b>, <code>mean(c(1, NA, 3), na.rm=TRUE)</code> → <b>2</b>.</p>

<h4>1-8. 자주 쓰는 확인 · 통계 함수</h4>
<table>
<tr><th>함수</th><th>역할</th><th>함수</th><th>역할</th></tr>
<tr><td><code>head(df)</code> / <code>tail(df)</code></td><td>앞 / 뒤 <b>6행</b>(기본값) 보기</td><td><code>mean()</code></td><td>평균</td></tr>
<tr><td><code>str(df)</code></td><td>구조: 관측치 수 · 변수 수 · 각 변수 타입 · 앞부분 값</td><td><code>median()</code></td><td>중앙값</td></tr>
<tr><td><code>summary(df)</code></td><td>수치형: <mark>Min · 1st Qu. · Median · Mean · 3rd Qu. · Max</mark> (6개), 팩터: 범주별 빈도</td><td><code>var()</code> / <code>sd()</code></td><td>분산 / 표준편차 — <b>표본(n−1)</b> 기준</td></tr>
<tr><td><code>dim()</code> / <code>nrow()</code> / <code>ncol()</code></td><td>차원 / 행 수 / 열 수</td><td><code>quantile()</code></td><td>사분위수(0%, 25%, 50%, 75%, 100%)</td></tr>
<tr><td><code>length()</code></td><td>벡터 원소 수(데이터 프레임은 <b>열 수</b>)</td><td><code>table()</code></td><td>범주별 빈도표</td></tr>
<tr><td><code>names()</code> / <code>colnames()</code></td><td>이름 확인 · 변경</td><td><code>cor()</code></td><td>상관계수(기본 피어슨)</td></tr>
<tr><td><code>sort()</code> / <code>order()</code></td><td>정렬된 값 / 정렬 순서의 <b>인덱스</b></td><td><code>range()</code> / <code>IQR()</code></td><td>최솟값·최댓값 / Q3 − Q1</td></tr>
</table>
<p>예) <code>quantile(1:9)</code> → 0%: 1, 25%: 3, 50%: 5, 75%: 7, 100%: 9. <code>table(c("A","B","A"))</code> → A 2, B 1. <code>order(c(30,10,20))</code> → 2 3 1 (가장 작은 값이 2번째 위치에 있다는 뜻).</p>

<h4>이렇게 나온다</h4>
<ul>
<li><b>코드 결과 고르기</b>: <code>x[-2]</code>, <code>rep(…, each=)</code>, <code>seq(…, by=)</code>, <code>matrix(1:6, nrow=2)[1, ]</code> 의 결과로 옳은 것은?</li>
<li><b>자료형</b>: <code>c(1, "a", TRUE)</code> 의 class, 또는 "벡터는 서로 다른 타입을 담을 수 있다" 같은 틀린 설명 찾기.</li>
<li><b>자료 구조 설명</b>: 리스트 · 데이터 프레임 · 행렬의 특징 중 옳지 않은 것.</li>
<li><b>apply 방향</b>: <code>apply(m, 1, …)</code> 과 <code>apply(m, 2, …)</code> 의 결과 구분.</li>
<li><b>함수 역할</b>: summary 결과에 포함되지 않는 것(예: 표준편차, 최빈값), str 이 보여 주는 정보.</li>
</ul>

<div class="warn"><b>자주 틀리는 포인트</b><br>
• <code>x[-2]</code> 는 "뒤에서 두 번째"나 "두 번째 원소"가 아니라 <b>두 번째 원소를 뺀 나머지</b>입니다.<br>
• <code>matrix(1:6, nrow=2)</code> 는 <b>열부터</b> 채워 1행이 1 3 5 입니다. 행부터 채우려면 <code>byrow=TRUE</code>.<br>
• <code>rep(1:2, times=2)</code>(1 2 1 2)와 <code>rep(1:2, each=2)</code>(1 1 2 2)를 바꿔 기억하기 쉽습니다.<br>
• NA 는 길이 1 인 "빈 값", NULL 은 길이 0 인 "없음"입니다. <code>c()</code> 안의 NULL 은 사라집니다.<br>
• summary 에는 <b>분산 · 표준편차가 없습니다</b> (최소 · Q1 · 중앙값 · 평균 · Q3 · 최대).<br>
• var · sd 는 n 이 아니라 <b>n−1</b> 로 나눈 표본 통계량입니다.</div>

<div class="tip"><b>암기 팁</b><br>
• 자료 구조: "<b>같은 타입</b> = 벡터 · 행렬 · 배열 / <b>다른 타입</b> = 리스트 · 데이터 프레임(열끼리)".<br>
• 형 변환: "<b>문 &gt; 숫 &gt; 논</b>" — 문자 하나가 전부를 문자로 만든다.<br>
• apply: "<b>1 은 행(가로 줄), 2 는 열(세로 줄)</b>" — dim() 결과의 순서(행, 열)와 같습니다.<br>
• matrix 는 "세로로 먼저 내려간다" — 신문 기사처럼 열부터.</div>

<h3>2. 데이터 마트와 결측값 · 이상값 · EDA</h3>
<p>분석에 들어가기 전, 흩어진 데이터를 <b>분석용 데이터 세트(데이터 마트)</b>로 정리하고, 그 안의 <b>결측값 · 이상값</b>을 처리하며, <b>탐색적 분석(EDA)</b>으로 자료의 모양을 파악하는 단계입니다. 시험에서는 <b>요약 변수 vs 파생 변수</b>, <b>다중 대치법 3단계</b>, <b>IQR 이상값 경계 계산</b>, <b>EDA 4R</b> 이 단골입니다.</p>

<h4>2-1. 데이터 마트(Data Mart)</h4>
<p><mark>데이터 웨어하우스(DW)와 사용자 사이에 있는 중간층</mark>으로, 특정 부서 · 업무 · 분석 목적에 맞게 데이터 웨어하우스의 데이터를 추출 · 요약해 둔 <b>소규모 데이터 저장소</b>입니다. 분석 관점에서는 "모델링에 바로 쓸 수 있도록 고객(분석 단위) 1명당 1행으로 정리한 분석용 테이블"이라고 이해하면 됩니다. 데이터 마트를 잘 만들어 두면 이후 분석 · 모델링 시간이 크게 줄어듭니다.</p>

<h4>2-2. 요약 변수 vs 파생 변수</h4>
<table>
<tr><th>구분</th><th>요약 변수 (Summary Variable)</th><th>파생 변수 (Derived Variable)</th></tr>
<tr><td>정의</td><td>수집된 정보를 분석에 맞게 <b>종합(집계)</b>한 변수. 데이터 마트에서 가장 기본이 되는 변수</td><td>사용자(분석자)가 <b>특정 조건을 만족하거나 특정 함수</b>에 의해 값을 만들어 <b>의미를 부여</b>한 변수</td></tr>
<tr><td>핵심 성질</td><td><mark>재활용성이 높음</mark> — 많은 모델에 공통으로 사용</td><td><mark>주관적일 수 있으므로 논리적 타당성</mark>을 갖춰야 함</td></tr>
<tr><td>예</td><td>기간별 구매 금액 · 횟수 · 구매 여부, 위클리 쇼퍼, 상품별 구매 금액 · 순서, 유통 채널별 구매 금액, 단어 빈도, 초기 행동 변수, 트렌드 변수, 연속형 변수의 구간화</td><td>근무 시간 구매 지수, 주 구매 매장 · 주 활동 지역, 주 구매 상품 등급, 가격 선호대, 시즌 선호 고객, 라이프 스테이지 · 라이프스타일, 행사 민감 고객, 휴면 가망 고객, 고객 생애 가치(LTV)</td></tr>
<tr><td>만드는 방식</td><td>합계 · 횟수 · 평균 등 <b>단순 집계</b> (자동화하기 쉬움)</td><td>분석자의 <b>판단 · 정의 · 규칙</b>이 들어감 (세분화 · 행동 예측 · 캠페인 반응 예측에 활용)</td></tr>
</table>

<h4>2-3. 데이터 마트 구성에 쓰는 R 패키지</h4>
<table>
<tr><th>패키지</th><th>핵심 기능</th><th>대표 함수 / 예</th></tr>
<tr><td><b>reshape</b> (reshape2)</td><td>데이터를 <b>재구조화</b>(녹였다가 다시 주조). 변수를 조합해 여러 모양의 요약표를 만듦</td><td><mark>melt</mark>: 식별자(id) 변수를 기준으로 나머지 변수를 <b>variable · value</b> 두 열로 녹임 (wide → long)<br><mark>cast</mark>(reshape2 는 dcast · acast): 녹인 데이터를 원하는 모양으로 다시 요약 (long → wide)<br><code>melt(df, id=c("month","day"))</code>, <code>cast(md, day ~ variable, mean)</code></td></tr>
<tr><td><b>sqldf</b></td><td>R 의 데이터 프레임에 <mark>SQL 문</mark>을 그대로 사용 (SAS 의 PROC SQL 과 비슷)</td><td><code>sqldf("select * from iris where Species = 'setosa'")</code></td></tr>
<tr><td><b>plyr</b></td><td>apply 함수를 기반으로 <b>split → apply → combine</b>(나누고 · 적용하고 · 합침). 함수 이름 앞 두 글자 = <b>입력형 + 출력형</b></td><td>d = 데이터 프레임, l = 리스트, a = 배열, _ = 출력 없음<br><mark>ddply</mark>: 데이터 프레임 → 데이터 프레임, <code>ldply</code>: 리스트 → 데이터 프레임, <code>dlply</code>: 데이터 프레임 → 리스트<br><code>ddply(df, "year", summarise, mean_x = mean(x))</code></td></tr>
<tr><td><b>data.table</b></td><td>데이터 프레임보다 <mark>빠른 그룹 연산 · 정렬 · 검색</mark>. <b>key</b> 를 지정하면 이진 탐색으로 빠르게 찾음. 짧은 문법</td><td><code>DT[i, j, by]</code> → <code>DT[x &gt; 0, mean(y), by = g]</code></td></tr>
</table>

<h4>2-4. 탐색적 자료 분석(EDA)과 4가지 주제(4R)</h4>
<p><b>EDA(Exploratory Data Analysis)</b>는 <mark>존 튜키(J. Tukey)</mark>가 제안한 방법으로, 가설이나 모형을 먼저 세우지 않고 <b>데이터를 다양한 각도에서 보면서 특징 · 구조 · 패턴을 파악</b>하는 과정입니다. (가설을 세우고 확인하는 것은 확증적 자료 분석 CDA)</p>
<table>
<tr><th>주제</th><th>영문</th><th>의미</th><th>예</th></tr>
<tr><td><b>저항성</b></td><td><mark>Resistance</mark></td><td>자료 일부가 파손(이상값 등)되어도 결과가 <b>크게 영향받지 않는</b> 성질</td><td>평균 대신 <b>중앙값</b>, 절사평균 사용</td></tr>
<tr><td><b>잔차 해석</b></td><td><mark>Residual</mark></td><td>관측값이 주 경향(적합값)에서 <b>얼마나 벗어났는지</b> 살펴봄</td><td>잔차 = 관측값 − 예측값, 잔차가 큰 관측치를 따로 검토</td></tr>
<tr><td><b>자료 재표현</b></td><td><mark>Re-expression</mark></td><td>원래 변수를 <b>변환</b>해 분포의 대칭성 · 선형성 · 분산 안정성을 높이고 해석을 쉽게 함</td><td><b>로그 · 제곱근 · 역수 변환</b></td></tr>
<tr><td><b>현시성</b></td><td><mark>Revelation</mark></td><td>데이터를 <b>그래프로 시각화</b>해 구조를 쉽게 드러냄</td><td>상자 그림, 줄기-잎 그림, 히스토그램, 산점도</td></tr>
</table>
<p>R 에서 EDA 의 출발점은 <code>head()</code> · <code>str()</code> · <code>summary()</code> 로 구조와 요약 통계를 보고, <code>hist()</code> · <code>boxplot()</code> · <code>plot()</code> 으로 그려 보는 것입니다.</p>

<h4>2-5. 결측값(Missing Value) 처리</h4>
<p>결측값은 R 에서 <b>NA</b> 로 표시됩니다. 결측값 처리는 전체 작업 시간에서 큰 비중을 차지하므로, 무조건 지우기보다 <b>결측의 원인과 비율을 보고</b> 방법을 고릅니다. 결측 발생 유형은 <b>완전 무작위 결측(MCAR)</b>, <b>무작위 결측(MAR)</b>, <b>비무작위 결측(MNAR)</b> 으로 나눕니다.</p>
<table>
<tr><th>분류</th><th>방법</th><th>설명</th><th>장단점</th></tr>
<tr><td rowspan="3"><b>단순 대치법</b><br>(Single Imputation)</td><td><mark>완전 응답 개체 분석</mark><br>(Complete Analysis)</td><td>결측값이 있는 레코드를 <b>삭제</b>하고 완전한 자료만 분석</td><td>간단하지만 자료가 줄어 <b>효율성 상실</b>, 결측이 무작위가 아니면 <b>통계적 추론의 타당성</b> 문제</td></tr>
<tr><td><mark>평균 대치법</mark><br>(Mean Imputation)</td><td>관측된 자료의 <b>평균</b>으로 결측값을 채움. 비조건부(전체 평균) · 조건부(회귀 분석으로 예측한 값) 평균 대치</td><td>자료를 버리지 않지만, 같은 값이 여러 번 들어가 <mark>분산(표준오차)이 과소 추정</mark>됨</td></tr>
<tr><td><mark>단순 확률 대치법</mark><br>(Single Stochastic Imputation)</td><td>평균 대치에 <b>확률적 변동</b>을 추가. <b>Hot-deck</b>(비슷한 응답자의 값으로 대치), <b>Nearest Neighbor</b>(가장 가까운 관측치의 값으로 대치)</td><td>평균 대치법의 표준오차 과소 추정 문제를 <b>보완</b></td></tr>
<tr><td><b>다중 대치법</b><br>(Multiple Imputation)</td><td colspan="2">단순 대치를 한 번이 아니라 <b>m 번</b> 수행해 m 개의 가상 완전 자료를 만들고 분석. <mark>① 대치(Imputation) → ② 분석(Analysis) → ③ 결합(Combination)</mark></td><td>추정의 불확실성을 반영. R 의 <b>Amelia</b>(시계열 · 횡단면 자료), <b>mice</b> 패키지</td></tr>
</table>
<table>
<tr><th>R 함수</th><th>역할</th><th>예 (<code>x &lt;- c(1, NA, 3)</code>)</th></tr>
<tr><td><code>is.na(x)</code></td><td>원소마다 결측 여부(TRUE/FALSE)</td><td>FALSE TRUE FALSE, <code>sum(is.na(x))</code> → 1 (결측 개수)</td></tr>
<tr><td><code>complete.cases(df)</code></td><td><b>행</b>마다 결측이 하나도 없으면 TRUE</td><td><code>df[complete.cases(df), ]</code> → 완전한 행만</td></tr>
<tr><td><code>na.omit(df)</code></td><td>결측이 있는 <b>행을 삭제</b></td><td><code>na.omit(x)</code> → 1 3</td></tr>
<tr><td><code>mean(x, na.rm=TRUE)</code></td><td>결측을 빼고 계산</td><td>2</td></tr>
<tr><td><code>x[is.na(x)] &lt;- mean(x, na.rm=TRUE)</code></td><td>평균 대치</td><td>1 2 3</td></tr>
<tr><td>DMwR 의 <code>centralImputation()</code> · <code>knnImputation()</code>, randomForest 의 <code>rfImpute()</code></td><td>중앙값 · 최빈값 대치, k-최근접 이웃 대치, 랜덤 포레스트 대치</td><td>-</td></tr>
</table>

<h4>2-6. 이상값(Outlier) 탐지와 처리</h4>
<p>이상값은 다른 관측치와 동떨어진 값입니다. <mark>이상값이라고 무조건 삭제하는 것이 아닙니다.</mark> 입력 실수처럼 잘못된 값(bad data)은 제거하지만, 실제로 일어난 의미 있는 극단값은 분석에 포함해야 하고, <b>부정 사용 방지(Fraud Detection)</b> 처럼 이상값 자체가 분석 목적인 경우도 있습니다.</p>
<table>
<tr><th>탐지 방법</th><th>기준 (이 범위를 벗어나면 이상값)</th></tr>
<tr><td><b>ESD</b> (Extreme Studentized Deviation)</td><td><mark>평균 ± 3 × 표준편차(σ)</mark></td></tr>
<tr><td><b>기하평균 활용</b></td><td><mark>기하평균 ± 2.5 × 표준편차</mark></td></tr>
<tr><td><b>사분위수(IQR) 활용</b></td><td><mark>Q1 − 1.5 × IQR 미만, Q3 + 1.5 × IQR 초과</mark> (IQR = Q3 − Q1)</td></tr>
<tr><td><b>상자 그림</b>(Box plot)</td><td>수염 밖에 점으로 찍힌 값 (R: <code>boxplot(x)$out</code>)</td></tr>
<tr><td>그 밖에</td><td>군집 분석으로 동떨어진 군집 찾기, 분포 · 산점도 시각화, 도메인 지식</td></tr>
</table>
<p><b>계산 예</b>: Q1 = 30, Q3 = 50 이면 IQR = 20, 1.5 × IQR = 30 → 아래 경계 30 − 30 = <b>0</b>, 위 경계 50 + 30 = <b>80</b>. 데이터 −5, 0, 42, 80, 81, 120 중 이상값은 <b>−5, 81, 120</b> 의 3개입니다 (경계값 0 과 80 은 이상값이 아님).</p>
<p><b>처리 방법</b>: <mark>절단(Trimming)</mark> — 이상값을 삭제, <mark>조정(Winsorizing)</mark> — 상한값 · 하한값을 넘는 값을 경계값으로 바꿈. 그 밖에 변환(로그 등)이나 별도 범주로 분리하기도 합니다.</p>

<h4>2-7. 상자 그림(Box plot) 읽기</h4>
<svg viewBox="0 0 520 130" width="100%" style="max-width:520px" role="img" aria-label="상자 그림 구조">
<line x1="20" y1="70" x2="500" y2="70" stroke="var(--border)" stroke-width="1"/>
<line x1="90" y1="70" x2="170" y2="70" stroke="var(--text)" stroke-width="2"/>
<line x1="90" y1="55" x2="90" y2="85" stroke="var(--text)" stroke-width="2"/>
<rect x="170" y="45" width="160" height="50" fill="none" stroke="var(--primary)" stroke-width="2"/>
<line x1="240" y1="45" x2="240" y2="95" stroke="var(--primary)" stroke-width="3"/>
<line x1="330" y1="70" x2="410" y2="70" stroke="var(--text)" stroke-width="2"/>
<line x1="410" y1="55" x2="410" y2="85" stroke="var(--text)" stroke-width="2"/>
<circle cx="460" cy="70" r="5" fill="none" stroke="var(--primary)" stroke-width="2"/>
<circle cx="485" cy="70" r="5" fill="none" stroke="var(--primary)" stroke-width="2"/>
<text x="90" y="112" font-size="12" text-anchor="middle" fill="var(--text)">아래 수염 끝</text>
<text x="170" y="35" font-size="12" text-anchor="middle" fill="var(--text)">Q1</text>
<text x="240" y="35" font-size="12" text-anchor="middle" fill="var(--text)">중앙값</text>
<text x="330" y="35" font-size="12" text-anchor="middle" fill="var(--text)">Q3</text>
<text x="410" y="112" font-size="12" text-anchor="middle" fill="var(--text)">위 수염 끝</text>
<text x="472" y="112" font-size="12" text-anchor="middle" fill="var(--text)">이상값</text>
<text x="250" y="125" font-size="12" text-anchor="middle" fill="var(--text)">상자 길이 = IQR</text>
</svg>
<ul>
<li><b>상자</b>: Q1 ~ Q3 (자료의 가운데 50%), 상자 길이 = IQR.</li>
<li><b>상자 안의 선</b>: <mark>중앙값</mark> (평균이 아님!). 중앙값이 상자 한쪽에 치우치면 분포가 비대칭.</li>
<li><b>수염(whisker)</b>: 경계(Q1 − 1.5 IQR, Q3 + 1.5 IQR) <b>안쪽에 있는 가장 먼 관측값</b>까지.</li>
<li><b>점</b>: 수염 밖의 이상값 후보.</li>
</ul>

<h4>이렇게 나온다</h4>
<ul>
<li><b>요약 · 파생 변수 구분</b>: "재활용성이 높다", "논리적 타당성이 필요하다", 주어진 예(기간별 구매 금액, 라이프 스테이지 등)가 어느 쪽인지.</li>
<li><b>패키지 기능 매칭</b>: melt · cast 는 reshape, SQL 문은 sqldf, ddply 는 plyr, 빠른 그룹 연산 · key 는 data.table.</li>
<li><b>EDA 4R</b>: "로그 변환으로 분포를 대칭으로" → 재표현, "중앙값 사용" → 저항성, "그래프로" → 현시성.</li>
<li><b>결측값 처리법 설명</b>: 다중 대치법의 단계 순서, 평균 대치법의 단점, Hot-deck 이 속한 방법.</li>
<li><b>IQR 계산</b>: Q1 · Q3 를 주고 경계값 또는 이상값 개수를 묻는 문제.</li>
<li><b>이상값 설명 중 틀린 것</b>: "이상값은 반드시 제거해야 한다" 가 대표적 오답.</li>
</ul>

<div class="warn"><b>자주 틀리는 포인트</b><br>
• "이상값은 분석 결과를 왜곡하므로 <b>항상 삭제</b>한다" → 틀림. 의미 있는 이상값은 포함하고, 사기 탐지처럼 이상값이 목적인 분석도 있습니다.<br>
• 다중 대치법 순서는 <b>대치 → 분석 → 결합</b>. "분석 → 대치 → 결합" 처럼 섞은 보기에 주의하세요.<br>
• 평균 대치법은 <b>분산 · 표준오차를 과소 추정</b>합니다(과대 추정 아님). 이를 보완한 것이 단순 확률 대치법(Hot-deck 등).<br>
• "재활용성이 높다" 는 <b>요약 변수</b>의 특징입니다. 파생 변수는 주관적이므로 <b>논리적 타당성</b>이 필요합니다.<br>
• IQR 경계는 <b>1.5 × IQR</b>, ESD 는 <b>3σ</b>, 기하평균은 <b>2.5σ</b> — 숫자를 서로 바꾼 보기가 나옵니다.<br>
• 상자 그림 안의 선은 <b>중앙값</b>, 수염 끝은 경계값 자체가 아니라 경계 안쪽의 실제 관측값입니다.<br>
• EDA 를 제안한 사람은 <b>튜키</b>입니다.</div>

<div class="tip"><b>암기 팁</b><br>
• 요약 변수 = "<b>요</b>약은 <b>재</b>활용" / 파생 변수 = "<b>파</b>생은 <b>타</b>당성".<br>
• EDA 4R = "<b>저 · 잔 · 재 · 현</b>" (Resistance · Residual · Re-expression · Revelation).<br>
• 다중 대치 = "<b>대 · 분 · 결</b>" (대치 → 분석 → 결합).<br>
• 이상값 기준 숫자 = "<b>3 · 2.5 · 1.5</b>" → ESD 평균 ± 3σ, 기하평균 ± 2.5σ, 사분위수 ± 1.5 IQR.<br>
• plyr 함수 이름 = "입력 + 출력 + ply" → <b>dd</b>ply 는 데이터 프레임 넣고 데이터 프레임 받기.</div>
`,
  past: [
    { q: "다음 R 코드의 실행 결과로 옳은 것은?",
      code: String.raw`x <- c(5, 10, 15, 20, 25)
x[-2]`,
      choices: ["10", "5 15 20 25", "20", "5 10 15 20"],
      answer: 2,
      exp: "R 에서 음수 인덱스는 해당 위치의 원소를 '제외'한다는 뜻입니다. 따라서 두 번째 원소 10 을 뺀 5 15 20 25 가 출력됩니다. 10 은 x[2], 20 은 뒤에서 두 번째 원소를 떠올린 함정이며, 5 10 15 20 은 마지막 원소를 뺀 x[-5] 의 결과입니다.",
      src: "R 인덱싱 빈출 유형" },
    { q: "다음 R 코드를 실행했을 때 출력되는 값은?",
      code: String.raw`m <- matrix(1:6, nrow = 2)
m[1, ]`,
      choices: ["1 2 3", "1 2", "1 3 5", "2 4 6"],
      answer: 3,
      exp: "matrix() 는 기본값 byrow = FALSE 로 열부터 값을 채우므로 1열이 (1, 2), 2열이 (3, 4), 3열이 (5, 6) 이 됩니다. m[1, ] 은 1행 전체이므로 1 3 5 입니다. 1 2 3 은 byrow = TRUE 일 때의 1행, 2 4 6 은 2행, 1 2 는 1열입니다.",
      src: "기출 빈출 유형" },
    { q: "R 에서 <code>y &lt;- c(3, \"b\", FALSE)</code> 를 실행한 뒤 <code>class(y)</code> 의 결과로 옳은 것은?",
      choices: ["\"numeric\"", "\"logical\"", "\"list\"", "\"character\""],
      answer: 4,
      exp: "벡터는 한 가지 타입만 담을 수 있어, 서로 다른 타입을 c() 로 묶으면 character > numeric > logical 순서로 더 큰 타입으로 강제 변환됩니다. 문자 \"b\" 가 있으므로 모든 원소가 문자형(\"3\", \"b\", \"FALSE\")이 됩니다. 서로 다른 타입을 그대로 담으려면 list() 를 써야 합니다.",
      src: "자료형 변환 빈출 유형" },
    { q: "데이터 마트를 구성하는 변수 중 <b>요약 변수</b>에 대한 설명으로 옳지 <b>않은</b> 것은?",
      choices: ["수집된 정보를 분석에 맞게 종합한 변수로, 데이터 마트에서 가장 기본이 되는 변수이다.", "많은 분석 모델에 공통으로 사용될 수 있어 재활용성이 높다.", "분석자가 특정 조건이나 함수로 의미를 부여한 변수이므로 매우 주관적일 수 있어 논리적 타당성을 갖추어야 한다.", "기간별 구매 금액, 구매 횟수, 상품별 구매 여부 등이 대표적인 예이다."],
      answer: 3,
      exp: "사용자가 특정 조건을 만족하거나 특정 함수에 의해 값을 만들어 의미를 부여한 변수로, 주관적일 수 있어 논리적 타당성이 필요한 것은 파생 변수의 설명입니다. 요약 변수는 단순 집계로 만든 기본 변수이며 재활용성이 높습니다.",
      src: "요약 변수 · 파생 변수 빈출 유형" },
    { q: "결측값 처리 방법 중 <b>다중 대치법(Multiple Imputation)</b>의 진행 단계를 순서대로 나열한 것은?",
      choices: ["대치(Imputation) → 분석(Analysis) → 결합(Combination)", "분석(Analysis) → 대치(Imputation) → 결합(Combination)", "결합(Combination) → 대치(Imputation) → 분석(Analysis)", "대치(Imputation) → 결합(Combination) → 분석(Analysis)"],
      answer: 1,
      exp: "다중 대치법은 단순 대치를 m 번 수행해 m 개의 가상 완전 자료를 만들고(대치), 각 자료를 분석한 뒤(분석), 그 결과를 하나로 합칩니다(결합). 결합을 분석보다 먼저 두는 보기는 '자료를 합친 뒤 분석한다'로 착각하게 만드는 함정입니다.",
      src: "결측값 처리 빈출 유형" },
    { q: "탐색적 자료 분석(EDA)의 4가지 주제 중, 한쪽으로 치우친 소득 자료에 <b>로그 변환</b>을 적용해 분포를 대칭에 가깝게 만들고 해석을 쉽게 하는 것과 관련된 주제는?",
      choices: ["저항성(Resistance)", "잔차 해석(Residual)", "자료 재표현(Re-expression)", "현시성(Revelation)"],
      answer: 3,
      exp: "로그 · 제곱근 · 역수 변환처럼 원래 변수를 적당한 척도로 바꿔 분포의 대칭성이나 선형성을 높이는 것은 자료 재표현입니다. 저항성은 이상값 등에 영향을 덜 받는 성질(중앙값 등), 잔차 해석은 주 경향에서 벗어난 정도의 검토, 현시성은 그래프를 통한 시각화입니다.",
      src: "EDA 4R 빈출 유형" },
    { q: "이상값(Outlier)에 대한 설명으로 옳지 <b>않은</b> 것은?",
      choices: ["ESD 방법은 평균에서 표준편차의 3배 이상 떨어진 값을 이상값으로 본다.", "사분위수를 이용하면 Q1 − 1.5 × IQR 보다 작거나 Q3 + 1.5 × IQR 보다 큰 값을 이상값으로 판단한다.", "부정 사용 방지 시스템처럼 이상값 자체를 찾아내는 것이 분석의 목적인 경우도 있다.", "이상값은 분석 결과를 왜곡하므로 원인과 관계없이 반드시 삭제해야 한다."],
      answer: 4,
      exp: "이상값이라고 무조건 삭제하지 않습니다. 입력 오류 같은 잘못된 값은 제거하지만, 실제로 발생한 의미 있는 극단값은 분석에 포함해야 하며, 사기 탐지(Fraud Detection)처럼 이상값 자체가 목적인 분석도 있습니다. 1, 2번은 대표적인 이상값 탐지 기준입니다.",
      src: "이상값 처리 빈출 유형" },
  ],
  generated: [
    { q: "다음 R 코드의 실행 결과로 옳은 것은?",
      code: String.raw`v <- rep(1:3, each = 2)
v[4]`,
      choices: ["1", "2", "3", "4"],
      answer: 2,
      exp: "rep(1:3, each = 2) 는 각 원소를 2번씩 반복해 1 1 2 2 3 3 을 만듭니다. 네 번째 원소는 2 입니다. times = 2 와 혼동해 1 2 3 1 2 3 으로 계산하면 1 을 고르게 됩니다.",
      src: "생성 문제" },
    { q: "R 의 NA, NULL, NaN 에 대한 설명으로 옳지 <b>않은</b> 것은?",
      choices: ["NA 는 결측값을 나타내며 is.na() 로 확인한다.", "0/0 의 결과는 NaN 이며 is.na(NaN) 도 TRUE 를 반환한다.", "length(NULL) 의 결과는 1 이다.", "c(1, NULL, 3) 의 결과는 길이가 2 인 벡터 1 3 이다."],
      answer: 3,
      exp: "NULL 은 '아무것도 없는' 빈 객체이므로 length(NULL) 은 0 입니다. 반면 NA 는 자리를 차지하는 결측값이라 length(NA) 는 1 입니다. 그래서 c() 안의 NULL 은 사라져 c(1, NULL, 3) 은 1 3 이 됩니다.",
      src: "생성 문제" },
    { q: "다음 R 코드의 실행 결과로 옳은 것은?",
      code: String.raw`m <- matrix(1:6, nrow = 2)
apply(m, 2, sum)`,
      choices: ["9 12", "6 15", "21", "3 7 11"],
      answer: 4,
      exp: "matrix(1:6, nrow = 2) 는 열 우선으로 채워져 1열 (1,2), 2열 (3,4), 3열 (5,6) 입니다. apply 의 두 번째 인자 2 는 열 방향이므로 열별 합 3 7 11 이 나옵니다. 9 12 는 행별 합(apply(m, 1, sum)), 6 15 는 byrow = TRUE 로 잘못 채운 뒤 행별 합을 구한 값입니다.",
      src: "생성 문제" },
    { q: "R 의 자료 구조에 대한 설명으로 옳은 것은?",
      choices: ["벡터는 숫자와 문자를 원래 타입 그대로 함께 저장할 수 있다.", "리스트는 벡터, 행렬, 다른 리스트 등 서로 다른 타입의 객체를 원소로 가질 수 있다.", "행렬은 열마다 서로 다른 타입을 가질 수 있다.", "데이터 프레임은 각 열의 길이가 서로 달라도 생성할 수 있다."],
      answer: 2,
      exp: "리스트는 서로 다른 타입 · 구조의 객체를 담을 수 있는 자료 구조입니다. 벡터와 행렬은 모든 원소가 같은 타입이어야 하고(섞으면 강제 변환), 데이터 프레임은 열끼리 타입이 달라도 되지만 모든 열의 길이가 같아야 합니다.",
      src: "생성 문제" },
    { q: "어떤 변수의 1사분위수(Q1)가 20, 3사분위수(Q3)가 40 일 때, 사분위수 범위(IQR) 기준으로 다음 값 중 <b>이상값의 개수</b>는?<br>−12, −10, 30, 70, 71, 95",
      choices: ["2개", "3개", "4개", "5개"],
      answer: 2,
      exp: "IQR = 40 − 20 = 20, 1.5 × IQR = 30 이므로 아래 경계는 20 − 30 = −10, 위 경계는 40 + 30 = 70 입니다. 경계를 벗어난 −12, 71, 95 의 3개가 이상값이며, 경계값과 같은 −10 과 70 은 이상값이 아닙니다.",
      src: "생성 문제" },
    { q: "결측값 대치 방법에 대한 설명으로 옳지 <b>않은</b> 것은?",
      choices: ["완전 응답 개체 분석은 결측값이 있는 레코드를 삭제하므로 자료가 줄어 효율성이 떨어질 수 있다.", "평균 대치법은 같은 값을 반복해 채우므로 추정량의 표준오차가 과대 추정되는 문제가 있다.", "Hot-deck 대치는 단순 확률 대치법에 속한다.", "다중 대치법은 여러 개의 대치 자료를 만들어 추정의 불확실성을 반영한다."],
      answer: 2,
      exp: "평균 대치법은 결측 자리를 모두 같은 평균값으로 채워 자료의 흩어짐이 줄어들므로 분산 · 표준오차가 '과소' 추정됩니다. 이를 보완하기 위해 확률적 변동을 넣은 것이 Hot-deck, Nearest Neighbor 등의 단순 확률 대치법입니다.",
      src: "생성 문제" },
    { q: "데이터 마트 구성에 사용하는 R 패키지와 기능의 연결로 옳지 <b>않은</b> 것은?",
      choices: ["reshape — melt 로 식별자 변수 기준으로 데이터를 녹이고 cast 로 원하는 형태로 요약한다.", "sqldf — 데이터 프레임에 SQL 문을 사용해 데이터를 조회 · 처리한다.", "plyr — ddply 는 리스트를 입력받아 배열을 반환하는 함수이다.", "data.table — key 를 지정해 빠른 검색과 그룹 연산을 수행한다."],
      answer: 3,
      exp: "plyr 함수 이름의 앞 두 글자는 입력형과 출력형을 뜻하며 d 는 데이터 프레임, l 은 리스트, a 는 배열입니다. ddply 는 데이터 프레임을 입력받아 데이터 프레임을 반환합니다. 리스트를 받아 배열을 반환하는 함수는 laply 입니다.",
      src: "생성 문제" },
  ],
});
