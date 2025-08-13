// 전역 변수
let currentPage = 'main';
let currentQuestionIndex = 0;
let userAnswers = {};
let participantInfo = {};

// 백엔드 API URL (Railway 배포 후 업데이트 필요)
const API_BASE_URL = 'https://doppingtest-production.up.railway.app';

// 퀴즈 데이터
const questions = [
    {
        id: 1,
        type: 'ox_with_text',
        question: '나는 도핑의 실제 이름을 알고 있다.',
        options: ['O', 'X'],
        correctAnswer: 'O',
        textInput: true,
        textPlaceholder: '도핑의 실제 이름을 입력하세요'
    },
                    {
                    id: 2,
                    type: 'ox',
                    question: '도핑의 생년월일은 1993년 4월 11일이다.',
                    options: ['O', 'X'],
                    correctAnswer: 'X'
                },
    {
        id: 3,
        type: 'image_choice',
        question: '이중 도핑이 가장 좋아하는 남자연예인은?',
        options: [
            { name: '홍경', image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA5MjNfMjU0%2FMDAxNjk1NDU1MjM2NTkx.nfsxq1krmNIsk-fE_a-60q6SwL-zQ5hgnUM0M2dFgwIg.XUQ4VIt83Q7tykBY5Bn9J9sz2jqmtbznao1q0S0RXg0g.JPEG.kbeautynews%2F%25B9%25E8%25BF%25EC_%25C8%25AB%25B0%25E6_%25C7%25C1%25B7%25CE%25C7%25CA_%25BB%25E7%25C1%25F8%2528%25BB%25E7%25C1%25F8%25C1%25A6%25B0%25F8-%25B8%25C5%25B4%25CF%25C1%25F6%25B8%25D5%25C6%25AEmmm%2529.jpg&type=sc960_832' },
            { name: '김우빈', image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fimgnews.naver.net%2Fimage%2F410%2F2024%2F09%2F12%2F0001023296_001_20240912192110594.png&type=sc960_832' },
            { name: '이도현', image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDAxMTdfMTYw%2FMDAxNzA1NDgzNzUxMDI2.RLdl05gz9Pni6bZL-pg-yinQJ3uFmZyIUzRPvQt-5MMg.LJ5jr2F6m88d6QNpHMzUNdv4fGWq2OzRqeB08MRhOpEg.JPEG.skt9386%2FScreenshot_2024-01-17_at_18.18.27.JPG&type=sc960_832' }
        ],
        correctAnswer: '김우빈'
    },
    {
        id: 4,
        type: 'image_choice',
        question: '이중 도핑이 가장 싫어하는 엑스 유저는?',
        options: [
            { name: '최범', image: 'https://pbs.twimg.com/profile_images/1954562991816667136/9uuc1m6d_400x400.jpg' },
            { name: '박군', image: 'https://pbs.twimg.com/profile_images/1954893088633344001/wVedS5Q8_400x400.jpg' },
            { name: '토오지', image: 'https://pbs.twimg.com/profile_images/1914099096023158784/YfRdN5wG_400x400.jpg' },
            { name: '수달킴', image: 'https://pbs.twimg.com/profile_images/1942070279317917696/9ucxD4l5_400x400.jpg' },
            { name: '카페인', image: 'https://pbs.twimg.com/profile_images/1943100424342683648/4D0hvBSO_400x400.jpg' },
            { name: '샤펜', image: 'https://pbs.twimg.com/profile_images/1918247225656033280/pudxrp8U_400x400.jpg' }
        ],
        correctAnswer: '최범'
    },
    {
        id: 5,
        type: 'ox',
        question: '도핑은 4살 차이나는 친오빠가 있다',
        options: ['O', 'X'],
        correctAnswer: 'X'
    },
    {
        id: 6,
        type: 'choice',
        question: '도핑이 살고 싶어하는 집은?',
        options: [
            '초호화 세련된 단독주택 in 한남동',
            '부비트랩과 지뢰가 설치된 아무도 들어올 수 없는 고립 주택 in 인적없는 곳',
            '대학병원 및 핫한 플레이스가 가득한 지역 아파트 in 서울',
            '너른 동해 바다가 보이는 펜트하우스 in 부산 해운대',
            '숲속에 지어진 나무 오두막 in 제주도'
        ],
        correctAnswer: '부비트랩과 지뢰가 설치된 아무도 들어올 수 없는 고립 주택 in 인적없는 곳'
    },
    {
        id: 7,
        type: 'ox',
        question: '도핑은 애완동물(개, 고양이 등)을 키우고 있다.',
        options: ['O', 'X'],
        correctAnswer: 'X'
    },
    {
        id: 8,
        type: 'choice',
        question: '도핑이 가장 좋아하는 음식은?',
        options: [
            '치킨',
            '피자',
            '초밥',
            '떡볶이',
            '햄버거'
        ],
        correctAnswer: '떡볶이'
    },
    {
        id: 9,
        type: 'ox',
        question: '도핑은 운동을 좋아한다.',
        options: ['O', 'X'],
        correctAnswer: 'X'
    },
    {
        id: 10,
        type: 'choice',
        question: '도핑이 가장 좋아하는 계절은?',
        options: [
            '봄',
            '여름',
            '가을',
            '겨울'
        ],
        correctAnswer: '겨울'
    }
];

// 페이지 전환 함수
function showPage(pageId) {
    // 모든 페이지 숨기기
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 해당 페이지 보이기
    document.getElementById(pageId).classList.add('active');
    currentPage = pageId;
    
    // 특정 페이지별 초기화
    if (pageId === 'main-page') {
        loadRankings();
    } else if (pageId === 'quiz-page') {
        showQuestion(0);
    }
}

// 랭킹 로드
async function loadRankings() {
    const rankingList = document.getElementById('ranking-list');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/rankings`);
        const rankings = await response.json();
        
        if (rankings.length === 0) {
            rankingList.innerHTML = '<div class="loading">아직 참여자가 없어요!</div>';
            return;
        }
        
        rankingList.innerHTML = rankings.map((rank, index) => `
            <div class="ranking-item">
                <div class="rank-number">${index + 1}</div>
                <div class="rank-info">
                    <div class="rank-nickname">${rank.nickname}</div>
                    <div class="rank-score">${rank.score}점</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('랭킹 로드 실패:', error);
        rankingList.innerHTML = '<div class="loading">랭킹을 불러올 수 없어요 😢</div>';
    }
}

// 퀴즈 표시
function showQuestion(index) {
    const question = questions[index];
    const quizContent = document.getElementById('quiz-content');
    const progressFill = document.getElementById('progress-fill');
    const currentQuestionSpan = document.getElementById('current-question');
    
    // 진행률 업데이트
    const progress = ((index + 1) / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
    currentQuestionSpan.textContent = index + 1;
    
    let questionHTML = `
        <div class="question">
            <h3>${question.question}</h3>
    `;
    
    if (question.type === 'ox' || question.type === 'ox_with_text') {
        questionHTML += `
            <div class="options">
                ${question.options.map(option => `
                    <label class="option ${userAnswers[question.id] === option ? 'selected' : ''}">
                        <input type="radio" name="q${question.id}" value="${option}" ${userAnswers[question.id] === option ? 'checked' : ''}>
                        <span>${option}</span>
                    </label>
                `).join('')}
            </div>
        `;
        
        if (question.type === 'ox_with_text' && userAnswers[question.id] === 'O') {
            questionHTML += `
                <div class="text-input">
                    <input type="text" id="text-answer-${question.id}" 
                           placeholder="${question.textPlaceholder}" 
                           value="${userAnswers[`${question.id}_text`] || ''}">
                </div>
            `;
        }
    } else if (question.type === 'image_choice') {
        questionHTML += `
            <div class="image-options">
                ${question.options.map(option => `
                    <div class="image-option ${userAnswers[question.id] === option.name ? 'selected' : ''}" 
                         onclick="selectImageOption(${question.id}, '${option.name}')">
                        <img src="${option.image}" alt="${option.name}">
                        <p>${option.name}</p>
                    </div>
                `).join('')}
            </div>
        `;
    } else if (question.type === 'choice') {
        questionHTML += `
            <div class="options">
                ${question.options.map(option => `
                    <label class="option ${userAnswers[question.id] === option ? 'selected' : ''}">
                        <input type="radio" name="q${question.id}" value="${option}" ${userAnswers[question.id] === option ? 'checked' : ''}>
                        <span>${option}</span>
                    </label>
                `).join('')}
            </div>
        `;
    }
    
    questionHTML += '</div>';
    quizContent.innerHTML = questionHTML;
    
    // 이벤트 리스너 추가
    addQuestionEventListeners(question);
}

// 이미지 옵션 선택
function selectImageOption(questionId, optionName) {
    userAnswers[questionId] = optionName;
    showQuestion(currentQuestionIndex);
}

// 퀴즈 이벤트 리스너 추가
function addQuestionEventListeners(question) {
    if (question.type === 'ox' || question.type === 'ox_with_text' || question.type === 'choice') {
        const options = document.querySelectorAll(`input[name="q${question.id}"]`);
        options.forEach(option => {
            option.addEventListener('change', (e) => {
                userAnswers[question.id] = e.target.value;
                
                // O/X 문제에서 O 선택 시 텍스트 입력 필드 표시
                if (question.type === 'ox_with_text' && e.target.value === 'O') {
                    setTimeout(() => {
                        const textInput = document.getElementById(`text-answer-${question.id}`);
                        if (textInput) {
                            textInput.addEventListener('input', (e) => {
                                userAnswers[`${question.id}_text`] = e.target.value;
                            });
                        }
                    }, 100);
                }
                
                showQuestion(currentQuestionIndex);
            });
        });
    }
}

// 다음 문제로
function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
        updateNavigationButtons();
    } else {
        submitQuiz();
    }
}

// 이전 문제로
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
        updateNavigationButtons();
    }
}

// 네비게이션 버튼 업데이트
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    prevBtn.style.display = currentQuestionIndex > 0 ? 'inline-block' : 'none';
    nextBtn.textContent = currentQuestionIndex === questions.length - 1 ? '결과 보기' : '다음';
}

// 퀴즈 제출
async function submitQuiz() {
    // 점수 계산
    let score = 0;
    const maxScore = questions.length * 10;
    
    questions.forEach(question => {
        const userAnswer = userAnswers[question.id];
        
        if (question.id === 1) {
            // 첫 번째 문제: O를 선택하고 이름이 '김도연'이면 점수 부여
            if (userAnswer === 'O' && userAnswers['1_text'] === '김도연') {
                score += 10;
            }
        } else {
            // 나머지 문제들: 정답과 일치하면 점수 부여
            if (userAnswer === question.correctAnswer) {
                score += 10;
            }
        }
    });
    
    // 백엔드로 결과 전송
    try {
        const response = await fetch(`${API_BASE_URL}/api/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nickname: participantInfo.nickname,
                score: score,
                answers: userAnswers,
                gifts: {
                    gift1: participantInfo.gift1,
                    gift2: participantInfo.gift2,
                    gift3: participantInfo.gift3
                }
            })
        });
        
        const result = await response.json();
        
        if (result.error) {
            // 중복 참여 오류 처리
            alert(result.error);
            showPage('info-page');
            return;
        }
        
        showResult(score, result.rank);
    } catch (error) {
        console.error('결과 제출 실패:', error);
        // 오프라인 모드로 결과만 표시
        showResult(score, '?');
    }
}

// 결과 표시
function showResult(score, rank) {
    const resultContent = document.getElementById('result-content');
    
    resultContent.innerHTML = `
        <div class="result-score">${score}점</div>
        <div class="result-rank">${participantInfo.nickname}님은 ${rank}등이에요!</div>
        <p>아래에서 실시간 랭킹을 확인해보세요!</p>
    `;
    
    showPage('result-page');
    
    // 랭킹 새로고침
    setTimeout(loadRankings, 1000);
}

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    // 시작 버튼
    document.getElementById('start-btn').addEventListener('click', () => {
        showPage('info-page');
    });
    
    // 뒤로가기 버튼
    document.getElementById('back-to-main').addEventListener('click', () => {
        showPage('main-page');
    });
    
    // 참여자 정보 폼 제출
    document.getElementById('participant-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        participantInfo = {
            nickname: formData.get('nickname'),
            gift1: formData.get('gift1'),
            gift2: formData.get('gift2'),
            gift3: formData.get('gift3')
        };
        
        // 퀴즈 초기화
        currentQuestionIndex = 0;
        userAnswers = {};
        
        showPage('quiz-page');
    });
    
    // 퀴즈 네비게이션
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    document.getElementById('prev-btn').addEventListener('click', prevQuestion);
    
    // 결과 페이지 버튼
    document.getElementById('retry-btn').addEventListener('click', () => {
        currentQuestionIndex = 0;
        userAnswers = {};
        showPage('quiz-page');
    });
    
    document.getElementById('home-btn').addEventListener('click', () => {
        showPage('main-page');
    });
    
    // 초기 랭킹 로드
    loadRankings();
});

// 실시간 랭킹 업데이트 (5초마다)
setInterval(() => {
    if (currentPage === 'main-page') {
        loadRankings();
    }
}, 5000);
