// express 모듈셋
const express = require('express');
const app = express();
app.listen(3333);
app.use(express.json());

let db = new Map();
var id = 1;

// 채널 전체 조회 및 생성
app
    .route('/channels')
    .get((req, res) => {
        res.json([...db.entries()]); // 전체 데이터 조회
    })
    .post((req, res) => {
        if (req.body.channelTitle) {
            db.set(id, req.body);
            res.status(201).json({
                message: `${db.get(id).channelTitle} 채널을 응원합니다!!`,
                channelId: id,
            });
            id++;
        } else {
            res.status(400).json({
                message: "요청을 제대로 보내주세요",
            });
        }
    });

// 특정 채널 조회, 수정, 삭제
app
    .route('/channels/:id')
    .get((req, res) => {
        let channelId = parseInt(req.params.id);
        if (db.has(channelId)) {
            res.json(db.get(channelId));
        } else {
            res.status(404).json({ message: "채널을 찾을 수 없습니다." });
        }
    })
    .put((req, res) => {
        let channelId = parseInt(req.params.id);
        if (db.has(channelId)) {
            db.set(channelId, req.body);
            res.json({ message: "채널 정보가 업데이트되었습니다.", updatedData: db.get(channelId) });
        } else {
            res.status(404).json({ message: "업데이트할 채널을 찾을 수 없습니다." });
        }
    })
    .delete((req, res) => {
        let channelId = parseInt(req.params.id);
        if (db.has(channelId)) {
            db.delete(channelId);
            res.json({ message: `채널 ${channelId}이 삭제되었습니다.` });
        } else {
            res.status(404).json({ message: "삭제할 채널을 찾을 수 없습니다." });
        }
    });

