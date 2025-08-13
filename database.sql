-- 도핑테스트 데이터베이스 설정
-- Supabase SQL Editor에서 실행하세요

-- 기존 객체 정리 (안전한 삭제 순서)
DROP TRIGGER IF EXISTS update_participants_updated_at ON participants;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS get_stats();
DROP VIEW IF EXISTS rankings;

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Allow public read access" ON participants;
DROP POLICY IF EXISTS "Allow authenticated insert" ON participants;
DROP POLICY IF EXISTS "Allow authenticated update" ON participants;

-- 참여자 테이블 생성
CREATE TABLE IF NOT EXISTS participants (
    id SERIAL PRIMARY KEY,
    nickname VARCHAR(100) NOT NULL UNIQUE,
    score INTEGER NOT NULL DEFAULT 0,
    answers JSONB,
    gifts JSONB,
    score_adjustment_reason TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기존 테이블에 IP 주소 컬럼 추가 (테이블이 이미 존재하는 경우)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participants' AND column_name = 'ip_address'
    ) THEN
        ALTER TABLE participants ADD COLUMN ip_address VARCHAR(45);
    END IF;
END $$;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_participants_score ON participants(score DESC);
CREATE INDEX IF NOT EXISTS idx_participants_created_at ON participants(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_participants_nickname ON participants(nickname);
CREATE INDEX IF NOT EXISTS idx_participants_ip_address ON participants(ip_address);

-- 업데이트 트리거 함수 생성 (search_path 설정 추가)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = public;

-- 업데이트 트리거 생성
CREATE TRIGGER update_participants_updated_at 
    BEFORE UPDATE ON participants 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security 활성화 (선택사항)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- RLS 정책 설정 (모든 사용자가 읽기 가능, 인증된 사용자만 쓰기 가능)
CREATE POLICY "Allow public read access" ON participants
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON participants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON participants
    FOR UPDATE USING (true);

-- 샘플 데이터 삽입 (테스트용)
INSERT INTO participants (nickname, score, answers, gifts) VALUES
('테스트유저1', 50, '{"1": "O", "1_text": "김도핑", "2": "O", "3": "김우빈", "4": "카페인", "5": "O", "6": "대학병원 및 핫한 플레이스가 가득한 지역 아파트 in 서울"}', '{"gift1": "스타벅스5만원", "gift2": "치킨3만원", "gift3": "올리브영1만원"}'),
('테스트유저2', 40, '{"1": "X", "2": "O", "3": "홍경", "4": "최범", "5": "X", "6": "초호화 세련된 단독주택 in 한남동"}', '{"gift1": "치킨5만원", "gift2": "스타벅스3만원", "gift3": "치킨1만원"}'),
('테스트유저3', 30, '{"1": "O", "1_text": "도핑", "2": "X", "3": "이도현", "4": "박군", "5": "O", "6": "부비트랩과 지뢰가 설치된 아무도 들어올 수 없는 고립 주택 in 인적없는 곳"}', '{"gift1": "올리브영5만원", "gift2": "올리브영3만원", "gift3": "스타벅스1만원"}')
ON CONFLICT (nickname) DO NOTHING;

-- 뷰 생성 (랭킹 조회용) - SECURITY INVOKER 명시적 설정
CREATE OR REPLACE VIEW rankings 
WITH (security_invoker = true)
AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY score DESC, created_at ASC) as rank,
    nickname,
    score,
    created_at
FROM participants
ORDER BY score DESC, created_at ASC;

-- 통계 함수 생성 (search_path 설정 추가)
CREATE OR REPLACE FUNCTION get_stats()
RETURNS TABLE (
    total_participants BIGINT,
    average_score NUMERIC,
    max_score INTEGER,
    min_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_participants,
        ROUND(AVG(score)::NUMERIC, 1) as average_score,
        MAX(score)::INTEGER as max_score,
        MIN(score)::INTEGER as min_score
    FROM participants;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 권한 설정
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 테이블 정보 확인
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'participants'
ORDER BY ordinal_position;
