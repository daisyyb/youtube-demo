//e express 모듈셋

const express = require('express')
const app = express()
app.listen(7777)

let db = new Map()
var id = 1 //하나의 객체를 구별하기 위한 방법이었다.

//로그인
app.use(express.json()) // http 외 모듈 사용 'json' 모든곳에 사용가능 이제제
app.post('/login', function (req, res) {
    console.log(req.body);

    const { userId, password } = req.body;
    let foundUser = null;

    db.forEach(function (user, id) {
        if (user.userId === userId) {
            foundUser = user;
        }
    });

    if (!foundUser) {
        return res.status(404).json({
            message: "해당 ID를 가진 사용자가 없습니다."
        });
    }

    if (foundUser.password !== password) {
        return res.status(400).json({
            message: "패스워드가 틀렸습니다."
        });
    }
    
    res.status(200).json({
        message: `${foundUser.name}님, 로그인 성공!`
    });
});


//회원가입
app.post('/join', function (req, res) {
    console.log(req.body);

    // 입력값 검증
    if (!req.body.name || !req.body.userId) {
        return res.status(400).json({
            message: `입력 값을 다시 확인하세요`
        });
    }

    // 회원 정보 저장
    db.set(id, req.body);
    res.status(201).json({
        message: `${req.body.name}님 환영합니다.`,
        userId: id
    });
    id++; // 아이디 증가
});


//회원 개별조회
app.get('/users/:id', function (req, res) {
    let {id} = req.params
    id = parseInt(id)

    const user = db.get(id)
    if(user == undefined){
        res.status(400).json({
        message : "회원정보가 없어용."
        })
    }else{
        res.status(200).json({
            userId : user.userId,
            name : user.name
        })

    }
    console.log(id)
})

app.delete('/users/:id', function (req, res) {
    let { id } = req.params;
    id = parseInt(id);

    if (!db.has(id)) {
        return res.status(404).json({
            message: '해당 회원을 찾을 수 없습니다.'
        });
    }

    db.delete(id);

    res.status(200).json({
        message: `회원번호 ${id}번 탈퇴 완료`
    });
});
