# 도핑테스트 🎯

도핑에 대한 애정도를 퀴즈를 통해 평가하고 실시간 랭킹을 공개하는 웹사이트입니다.

## 🚀 기능

- **퀴즈 시스템**: 도핑에 대한 다양한 질문들
- **실시간 랭킹**: 참여자들의 점수 순위 표시
- **선물 시스템**: 1-3등에게 선물 제공
- **반응형 디자인**: 모바일/데스크톱 모두 지원
- **SPA 구조**: 페이지 전환 없이 부드러운 사용자 경험

## 🛠 기술 스택

### 프론트엔드
- HTML5
- CSS3 (반응형 디자인)
- Vanilla JavaScript
- Google Fonts (Gaegu)

### 백엔드
- Node.js
- Express.js
- Supabase (PostgreSQL)

### 배포
- Netlify (프론트엔드)
- Railway (백엔드)
- Supabase (데이터베이스)

## 📁 프로젝트 구조

```
dopping/
├── index.html          # 메인 HTML 파일
├── styles.css          # CSS 스타일
├── script.js           # 프론트엔드 JavaScript
├── server.js           # 백엔드 Express 서버
├── package.json        # Node.js 의존성
└── README.md           # 프로젝트 문서
```

## 🚀 배포 가이드

### 1. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 다음 테이블 생성:

```sql
-- 참여자 테이블 생성
CREATE TABLE participants (
    id SERIAL PRIMARY KEY,
    nickname VARCHAR(100) NOT NULL UNIQUE,
    score INTEGER NOT NULL DEFAULT 0,
    answers JSONB,
    gifts JSONB,
    score_adjustment_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_participants_score ON participants(score DESC);
CREATE INDEX idx_participants_created_at ON participants(created_at DESC);

-- RLS 정책 설정 (선택사항)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
```

3. Settings > API에서 URL과 anon key 복사

### 2. Railway 배포 (백엔드)

1. [Railway](https://railway.app)에서 새 프로젝트 생성
2. GitHub 저장소 연결
3. 환경 변수 설정:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   NODE_ENV=production
   ```
4. 배포 후 제공되는 URL 복사

### 3. Netlify 배포 (프론트엔드)

1. [Netlify](https://netlify.com)에서 새 사이트 생성
2. GitHub 저장소 연결
3. 빌드 설정:
   - Build command: (비워두기)
   - Publish directory: `/` (루트)
4. 배포 후 제공되는 URL 복사

### 4. API URL 업데이트

`script.js` 파일에서 `API_BASE_URL`을 Railway에서 제공한 URL로 업데이트:

```javascript
const API_BASE_URL = 'https://your-railway-app.railway.app';
```

## 🎮 퀴즈 문제

현재 포함된 문제들:

1. **도핑의 실제 이름** (O/X + 텍스트 입력)
2. **생년월일** (O/X)
3. **좋아하는 남자연예인** (이미지 선택)
4. **싫어하는 엑스 유저** (이미지 선택)
5. **친오빠** (O/X)
6. **살고 싶은 집** (선택형)

## 🎁 선물 시스템

### 1등 선물
- 스타벅스 5만원
- 치킨 5만원
- 올리브영 5만원

### 2등 선물
- 스타벅스 3만원
- 치킨 3만원
- 올리브영 3만원

### 3등 선물
- 스타벅스 1만원
- 치킨 1만원
- 올리브영 1만원

## 🔧 로컬 개발

### 백엔드 실행

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에 Supabase 정보 입력

# 개발 서버 실행
npm run dev
```

### 프론트엔드 실행

```bash
# 로컬 서버 실행 (Python)
python -m http.server 8000

# 또는 Node.js
npx serve .
```

## 📊 API 엔드포인트

### GET /api/rankings
랭킹 조회 (상위 10명)

### POST /api/submit
퀴즈 결과 제출

### GET /api/participants
전체 참여자 목록 (관리자용)

### GET /api/stats
통계 정보

### GET /api/health
서버 상태 확인

## 🎨 디자인 특징

- **컬러 팔레트**: 연핑크, 노란색, 하늘색
- **폰트**: Gaegu (둥글둥글한 귀여운 폰트)
- **반응형**: 모바일 우선 디자인
- **애니메이션**: 부드러운 전환 효과

## 🔒 보안 고려사항

- CORS 설정으로 허용된 도메인만 접근 가능
- 환경 변수로 민감한 정보 보호
- 입력값 검증 및 sanitization

## 📝 관리자 기능

- 참여자 목록 조회
- 점수 수정 (부정행위 방지)
- 통계 확인

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👤 연락처

도핑 - [@your_twitter](https://twitter.com/your_twitter)

프로젝트 링크: [https://github.com/your-username/dopping-test](https://github.com/your-username/dopping-test)

---

⭐ 이 프로젝트가 마음에 드시면 스타를 눌러주세요!
