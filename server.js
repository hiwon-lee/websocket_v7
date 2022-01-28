//const express = require('express');
//const http = require('http');
const WebSocket = require('ws');

const port = 6969;
//const server = http.createServer(express); //서버생성
const wss = new WebSocket.Server( { port: port } ) //서버를 웹소켓에 연결

let user_id = 0; //주민등록번호처럼 클라이언트에게 부여되는 고유한 값
let ALL_WS = [];

wss.on('connection', function connection(websocket) {

    user_id++;
    //console.log("NEW USER CONNECT("+user_id+")"); //디버깅 목적
    ALL_WS.push({"ws":websocket, "user_id":user_id}); //배열에 추가 요소 넣는것,(1)웹소켓,(2)사용자

    sendUserId(user_id);
    
    websocket.on("close", function close(code, reason){
        ALL_WS.forEach(function(element, index) { //element는 접근할 수 있는 모든 사용자
            if(element.ws == websocket) { //접속이 끊긴 유저..
                ALL_WS.splice(index, 1); //제거
            }
        });
        sendAllUsers();
    });

    websocket.on("message", function incoming(message){
         //message변수로 도착한 메시지를 확인할 수 있음
         //console.log(JSON.parse(message));
         message = JSON.parse(message);
         switch(message.code) {
             case "connect_name" : //사용자 추가
                 ALL_WS.forEach(function(element, index) {
                     if(element.user_id == message.user_id) {
                         element.user_name = message.name;
                     }
                 });
                 sendAllUsers();
                 break;
                 case "send_message" : //채팅 메시지 받음
                 ALL_WS.forEach(function(element, index) {
                     //element.ws 클라이언트와의 연결 지점
                     let data = {"code":"chat_message", "msg":message.msg, "sender_name": message.name};

                     element.ws.send(JSON.stringify(data));
                   
                 });
              
                 break;
         }
    });
    
    function sendAllUsers() { //전체 사용자 정보를 보냄
        let data = {"code":"all_users", "msg":JSON.stringify(ALL_WS)};

        ALL_WS.forEach(function(element, index) {
            element.ws.send(JSON.stringify(data));
            //console.log(data);
            //console.log(JSON.stringify(data));
        });

    }

    function sendUserId(user_id) {
        let data = {"code":"my_user_id", "msg":user_id};
        websocket.send(JSON.stringify(data)); //받아온 데이터를 문자열로 바꾸어서 서버에 보냄
    }
   


    // ws.on('message', function incoming(data) {

    //     wss.clients.forEach(function each(client) {
    //         if(client != ws && client.readyState == WebSocket.OPEN) {
                
    //             client.send(data.toString());
                
    //             console.log(data);
    //         }
    //     })
    // })
})

// server.listen(port, function() { //server on
//     console.log(`Server is listening on ${port}!`)
// })