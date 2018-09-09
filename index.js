var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var path = require('path');

var addr = "";
var nick = "";

var playerList = [
];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// 리스트 만들기
function List() {
    this.elements = {};
    this.idx = 0;
    this.length = 0;
}
List.prototype.add = function(element) {
    this.length++;
    this.elements[this.idx++] = element;
};

List.prototype.get = (idx)=> {
    return this.elements[idx];
};

// 접속한 유저 리스트
var userList = new List();

// 서버 포트
http.listen(2700, '0.0.0.0');

require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    addr = add;
});

// 메인 페이지 접속
app.post('/room', (req, res) =>{
    nick = req.body.nameInput;
    res.render(path.join('chat.ejs'));
});

app.get('/', (req, res)=>{
    res.render('name.ejs');
});

// 유저 접속
io.on('connection', (socket)=> {
    // console.log(nick + '-------in');

    // 중복유저를 확인하고 유저목록 저장
    if(!(nick=='')){
        var player = { joinnick : '', joinaddr : '' }
        var chNick = nick;
        var chAddr = socket.client.conn.remoteAddress;
        
        // 이미 있는 닉네임인지 확인
        var checkNick = playerList.filter((player)=>{
            return player.joinnick==chNick
        });
        
        // 이미 접속한 ip인지 확인
        var checkAddr = playerList.filter((player)=>{
            return player.joinaddr==chAddr
        });
        
        // 체크 후 문제가 없으면 유저를 저장한다.
        if(checkNick=='' && checkAddr==''){
            player.joinnick = chNick;
            player.joinaddr = chAddr;
            playerList.push(player);
        };
    };

    console.log(playerList);

    io.emit('guestIn', nick);
    // userList.add(userList.length);

    socket.emit('user join', nick);

    // 채팅 업데이트
    socket.on('chat message', function (msg, userName) {
        io.emit('chat message', userName + ' >> ' + msg);
    });

    // 퇴장하면 접속 유저 목록에서 제외해준다.
    socket.on('disconnect', function () {
        var s = playerList.findIndex((player)=>{
            return player.joinnick==chNick
        })
        playerList.splice(s, 1);
        console.log('user out-----------------------');
        io.emit('guestOut', nick);
        });
});