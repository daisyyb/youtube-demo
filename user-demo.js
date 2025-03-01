const express = require('express');
const app = express();
const conn = require('./db_demo'); // DB 연결 객체
const bcrypt = require('bcrypt'); // 비밀번호 암호화
const jwt = require('jsonwebtoken'); // JWT 추가
const saltRounds = 10; // 암호화 강도 설정
require('dotenv').config(); // .env 파일 로드

const SECRET_KEY = process.env.SECRET_KEY || "mySecretKey"; // 환경변수에서 가져오거나 기본값 설정

app.use(express.json()); // JSON 데이터 사용

// 서버 실행
app.listen(7777, () => {
    console.log("✅ 서버 실행 중 (포트 7777)");
});

// MySQL 연결 테스트
conn.connect((err) => {
    if (err) {
        console.error("❌ MySQL 연결 오류:", err);
        return;
    }
    console.log("✅ MySQL 연결 성공!");
});

// 회원가입
app.post('/join', async (req, res) => {
    const { email, name, password, contact } = req.body;

    if (!email || !name || !password) {
        return res.status(400).json({ message: "필수 입력값(email, name, password)을 확인하세요." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds); // 비밀번호 암호화

        const sql = 'INSERT INTO users (email, name, password, contact, created_at) VALUES (?, ?, ?, ?, NOW())';
        conn.query(sql, [email, name, hashedPassword, contact], (err, result) => {
            if (err) {
                console.error("회원가입 오류:", err);
                return res.status(500).json({ message: '서버 오류' });
            }

            res.status(201).json({ message: `${name}님 환영합니다!`, userId: result.insertId });
        });
    } catch (error) {
        console.error("암호화 오류:", error);
        res.status(500).json({ message: "서버 오류" });
    }
});

// 로그인 (JWT 적용)
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "이메일과 비밀번호를 입력하세요." });
    }

    const sql = 'SELECT id, name, password FROM users WHERE email = ?';
    conn.query(sql, [email], async (err, results) => {
        if (err) {
            console.error("로그인 오류:", err);
            return res.status(500).json({ message: '서버 오류' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "해당 이메일의 사용자가 없습니다." });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password); // 비밀번호 비교

        if (!match) {
            return res.status(400).json({ message: "비밀번호가 틀렸습니다." });
        }

        // JWT 토큰 생성 (유효기간 1시간)
        const token = jwt.sign({ userId: user.id, name: user.name }, SECRET_KEY, { expiresIn: '1h' });

        res.cookie("tocken", token)
        
        res.status(200).json({ 
            message: `${user.name}님, 로그인 성공!`, 
            userId: user.id,
            token // JWT 반환
        });
    });
});

// 회원 정보 조회 (id 기반)
app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT id, email, name, contact, created_at FROM users WHERE id = ?'; // password 제외

    conn.query(sql, [id], (err, results) => {
        if (err) {
            console.error("회원 조회 오류:", err);
            return res.status(500).json({ message: '서버 오류' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: '해당 회원 정보가 없습니다.' });
        }

        res.status(200).json(results[0]);
    });
});

// 회원 정보 수정 (email, name, contact 만 변경 가능)
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { email, name, contact } = req.body;

    if (!email || !name) {
        return res.status(400).json({ message: "이메일과 이름은 필수 입력값입니다." });
    }

    const sql = 'UPDATE users SET email = ?, name = ?, contact = ? WHERE id = ?';
    conn.query(sql, [email, name, contact, id], (err, result) => {
        if (err) {
            console.error("회원 수정 오류:", err);
            return res.status(500).json({ message: '서버 오류' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '해당 회원을 찾을 수 없습니다.' });
        }

        res.status(200).json({ message: `회원 정보가 수정되었습니다.` });
    });
});

// 회원 삭제
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM users WHERE id = ?';

    conn.query(sql, [id], (err, result) => {
        if (err) {
            console.error("회원 삭제 오류:", err);
            return res.status(500).json({ message: '서버 오류' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '해당 회원을 찾을 수 없습니다.' });
        }

        res.status(200).json({ message: `회원번호 ${id}번 탈퇴 완료` });
    });
});
