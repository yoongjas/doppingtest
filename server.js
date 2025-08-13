const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Supabase 클라이언트 설정
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 데이터베이스 테이블 생성 (첫 실행 시)
async function initializeDatabase() {
    try {
        // 참여자 테이블 생성
        const { error: participantsError } = await supabase
            .from('participants')
            .select('*')
            .limit(1);
        
        if (participantsError && participantsError.code === 'PGRST116') {
            // 테이블이 없으면 생성
            const { error } = await supabase.rpc('create_participants_table');
            if (error) {
                console.log('테이블 생성 중 오류:', error);
            }
        }
    } catch (error) {
        console.log('데이터베이스 초기화 중 오류:', error);
    }
}

// API 엔드포인트

// 랭킹 조회
app.get('/api/rankings', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('participants')
            .select('nickname, score, created_at')
            .order('score', { ascending: false })
            .limit(10);
        
        if (error) {
            console.error('랭킹 조회 오류:', error);
            return res.status(500).json({ error: '랭킹을 불러올 수 없습니다.' });
        }
        
        res.json(data || []);
    } catch (error) {
        console.error('랭킹 조회 중 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 퀴즈 결과 제출
app.post('/api/submit', async (req, res) => {
    try {
        const { nickname, score, answers, gifts } = req.body;
        
        if (!nickname || score === undefined) {
            return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
        }
        
        // IP 주소 가져오기
        const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
        
        // 기존 참여자 확인 (닉네임 또는 IP로)
        const { data: existingParticipant } = await supabase
            .from('participants')
            .select('id, score, nickname, ip_address')
            .or(`nickname.eq.${nickname},ip_address.eq.${clientIP}`)
            .single();
        
        let participantId;
        
        if (existingParticipant) {
            // 중복 참여 방지: 같은 닉네임이나 IP로 이미 참여한 경우
            if (existingParticipant.nickname === nickname) {
                return res.status(400).json({ 
                    error: '이미 같은 닉네임으로 참여하셨습니다. 다른 닉네임을 사용해주세요.' 
                });
            }
            
            if (existingParticipant.ip_address === clientIP) {
                return res.status(400).json({ 
                    error: '이미 이 기기에서 참여하셨습니다. 다른 기기에서 참여해주세요.' 
                });
            }
        }
        
        // 새 참여자 추가
        const { data: newParticipant, error: insertError } = await supabase
            .from('participants')
            .insert([{
                nickname: nickname,
                score: score,
                answers: answers,
                gifts: gifts,
                ip_address: clientIP
            }])
            .select('id')
            .single();
        
        if (insertError) {
            console.error('참여자 추가 오류:', insertError);
            return res.status(500).json({ error: '결과 저장에 실패했습니다.' });
        }
        
        participantId = newParticipant.id;
        
        // 현재 순위 조회
        const { data: rankings } = await supabase
            .from('participants')
            .select('id, score')
            .order('score', { ascending: false });
        
        const rank = rankings.findIndex(p => p.id === participantId) + 1;
        
        res.json({ 
            success: true, 
            rank: rank,
            score: score,
            message: '결과가 성공적으로 저장되었습니다.'
        });
        
    } catch (error) {
        console.error('결과 제출 중 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 참여자 목록 조회 (관리자용)
app.get('/api/participants', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('participants')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('참여자 목록 조회 오류:', error);
            return res.status(500).json({ error: '참여자 목록을 불러올 수 없습니다.' });
        }
        
        res.json(data || []);
    } catch (error) {
        console.error('참여자 목록 조회 중 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 특정 참여자 조회
app.get('/api/participants/:nickname', async (req, res) => {
    try {
        const { nickname } = req.params;
        
        const { data, error } = await supabase
            .from('participants')
            .select('*')
            .eq('nickname', nickname)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: '참여자를 찾을 수 없습니다.' });
            }
            console.error('참여자 조회 오류:', error);
            return res.status(500).json({ error: '참여자 정보를 불러올 수 없습니다.' });
        }
        
        res.json(data);
    } catch (error) {
        console.error('참여자 조회 중 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 점수 수정 (관리자용)
app.put('/api/participants/:id/score', async (req, res) => {
    try {
        const { id } = req.params;
        const { score, reason } = req.body;
        
        if (score === undefined) {
            return res.status(400).json({ error: '점수를 입력해주세요.' });
        }
        
        const { error } = await supabase
            .from('participants')
            .update({ 
                score: score,
                score_adjustment_reason: reason,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);
        
        if (error) {
            console.error('점수 수정 오류:', error);
            return res.status(500).json({ error: '점수 수정에 실패했습니다.' });
        }
        
        res.json({ success: true, message: '점수가 성공적으로 수정되었습니다.' });
    } catch (error) {
        console.error('점수 수정 중 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 통계 조회
app.get('/api/stats', async (req, res) => {
    try {
        // 전체 참여자 수
        const { count: totalParticipants } = await supabase
            .from('participants')
            .select('*', { count: 'exact', head: true });
        
        // 평균 점수
        const { data: scores } = await supabase
            .from('participants')
            .select('score');
        
        const averageScore = scores && scores.length > 0 
            ? scores.reduce((sum, p) => sum + p.score, 0) / scores.length 
            : 0;
        
        // 최고 점수
        const { data: maxScoreData } = await supabase
            .from('participants')
            .select('score')
            .order('score', { ascending: false })
            .limit(1);
        
        const maxScore = maxScoreData && maxScoreData.length > 0 ? maxScoreData[0].score : 0;
        
        res.json({
            totalParticipants: totalParticipants || 0,
            averageScore: Math.round(averageScore * 10) / 10,
            maxScore: maxScore
        });
    } catch (error) {
        console.error('통계 조회 중 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 헬스 체크
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 루트 경로
app.get('/', (req, res) => {
    res.json({ 
        message: '도핑테스트 API 서버',
        version: '1.0.0',
        endpoints: {
            rankings: '/api/rankings',
            submit: '/api/submit',
            participants: '/api/participants',
            stats: '/api/stats',
            health: '/api/health'
        }
    });
});

// 서버 시작
app.listen(PORT, async () => {
    console.log(`🚀 도핑테스트 서버가 포트 ${PORT}에서 실행 중입니다!`);
    console.log(`📊 환경: ${process.env.NODE_ENV || 'development'}`);
    
    // 데이터베이스 초기화
    await initializeDatabase();
    
    console.log('✅ 서버가 성공적으로 시작되었습니다!');
});

// 에러 핸들링
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
