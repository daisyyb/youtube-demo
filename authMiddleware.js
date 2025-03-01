const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY || "mySecretKey";

// JWT 검증 미들웨어
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>" 형태

    if (!token) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
        }

        req.user = decoded; // 검증된 사용자 정보 저장
        next();
    });
};

module.exports = verifyToken;
