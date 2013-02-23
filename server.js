#!/usr/bin/env node

var express = require('express');
var app = express();
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);

var geomonster = require('geomonster');

geomonster
	.initializeMonsterPopulation(1000)
	.initializeMonsterMovement();

server.listen(parseInt(process.argv[2], 10) || 80);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

app.get('/all-monsters', function (req, res) {
	res.send(geomonster.getAllMonsters());
});

app.get('/monster-types', function (req, res) {
	res.send(geomonster.getMonsterTypes());
});

app.use('/', express.static(__dirname + '/public'));

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
