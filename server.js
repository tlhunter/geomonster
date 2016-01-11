#!/usr/bin/env node

var express = require('express');
var app = express();
var server = require('http').createServer(app)
var io = require('socket.io').listen(server, { log: false});

var geomonster = require('geomonster');
var port_number = parseInt(process.argv[2], 10) || 80;
var host = process.argv[3] || '0.0.0.0';
var monster_count = parseInt(process.argv[4], 10) || 1000;

geomonster
	.setSockets(io)
	.initializeMonsterPopulation(monster_count)
	.initializeMonsterMovement();

server.listen(port_number, host);

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/public/index.html');
});

app.get('/all-monsters', function (req, res) {
	res.send(geomonster.getAllMonsters());
});

app.get('/all-players', function (req, res) {
	res.send(geomonster.getAllPlayers());
});

app.get('/monster-types', function (req, res) {
	res.send(geomonster.getMonsterTypes());
});

app.use('/', express.static(__dirname + '/public'));

//io.sockets.on('connection', function (socket) {
  //socket.emit('news', { hello: 'world' });
  //socket.on('my other event', function (data) {
    //console.log(data);
  //});
//});
