#!/usr/bin/env node

var express = require('express');
var app = express();
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);

server.listen(parseInt(process.argv[2], 10) || 80);

app.use('/', express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
