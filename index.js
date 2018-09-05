var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var path = require('path');

var addr = "";
var nick = "";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// 리스트 만들기
function List() {
    this.elements = {};
    this.idx = 0;
    this.length = 0;
}
List.prototype.add = function (element) {
    this.length++;
    this.elements[this.idx++] = element;
};

List.prototype.get = function (idx) {
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
app.post('/room', function (req, res) {
    // res.sendfile('chat.ejs');
    console.log(">>>>>>>>>>>>>"+req.body.nameInput+"-----------??????????????????????");
    // res.sendfile('chat.ejs');
    nick = req.body.nameInput;
    // res.sendfile(path.join(__dirname+'/views', 'chat.ejs'));
    res.render(path.join('chat.ejs'));
    // res.render('chat.ejs');
});

app.get('/', (req, res)=>{
    res.render('name.ejs');
});

// 유저 접속
io.on('connection', function (socket) {
    console.log(nick + '-------in');
    io.to(socket.id).emit('enter user', nick);
    io.emit('guestIn', nick);
    // userList.add(userList.length);

    socket.on('enter user', (nick)=>{
        console.log(socket.id);
    })

    socket.on('user join', (res)=>{
        socket.join(res);
        console.log(res+'--------------my name!');
    });

    // 채팅 업데이트
    console.log('connection' + nick);
    socket.on('chat message', function (msg) {
        io.emit('chat message', nick + ' >> ' + msg);
    });

    socket.on('disconnect', function () {
            io.emit('guestOut', nick);
        });
});