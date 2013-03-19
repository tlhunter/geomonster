#!/usr/bin/env node
/**
 * This app is an in-memory databse of monster locations. Monsters will continuously move around.
 * A Node.js app will subscribe to these events, by reporting the latitude and longitude positions
 * of players. This service will then only report locations of monsters near those players.
 *
 * The database of monsters should be continuously backed up to REDIS in case of failure, and loaded on start.
 *
 * This app will be pretty simple, and should be pretty fast.
 * It will work over TCP, probably only with a single client. Should be easily swappable with a compiled process in the future.
 *
 * The only thing I have yet to anticipate is how to keep adding monsters around the player, especially as s/he moves around.
 */
var net = require('net');

var MAX_MONSTERS 				= 100000; // Upper limit of monsters to have in the world
var MONSTER_EXP_INCREASE 		= 1; // EXP Points
var MONSTER_EXP_TIMING 			= 5; // Seconds
var MONSTER_EXPIRATION 			= 60 * 60 * 12; // Seconds
var LISTEN_PORT 				= parseInt(process.argv[2], 10) || 12030;
var LISTEN_ADDRESS				= '127.0.0.1'; // only allow local with '127.0.0.1', or use null for anything

var monsters 					= [];
var monster_count				= 0;
var players 					= [];
var player_count				= 0;

// Example Player Object
var player = {
	"name": "Nucleocide",
	"id": 5000,
	"pos": {
		"lat": 100,
		"lon": 80
	},
	"last_seen": new Date(),
};

// Example Monster Object
var monster = {
	"id": 2000,
	"pos": {
		"lat": 80,
		"lon": 100
	},
	"level": 2,
	"type": 5,
	"exp": 100,
	"last_seen": new Date(),
	"created": new Date(),
	"persist": true
};

var server = net.createServer(function (socket) {
	console.log('CLIENT CONNECTED');
	socket.write('MONSTER DATABASE\r\n');

	socket.on('data', function(raw_data) {
		try {
			var data = JSON.parse(raw_data);
			if (typeof data.event == "undefined" || typeof data.data == "undefined") {
				console.log("bad data", data);
				throw new Error();
			}
			handleMessage(data, socket);
		} catch (e) {
			socket.write('ERROR PARSING JSON MESSAGE. Must have a .event and .data.\r\n');
			console.log("Received an unparseable message from the client:");
			console.log(raw_data.toString());
		}
	});

	socket.on('end', function() {
		console.log('CLIENT DISCONNECTED');
	});

	var monsterDatabase = {
		// Information about a player has been updated. Could be thought of as an add or update (UPSERT?!)
		input_player: function(data) {
			if (!data.id) {
				socket.write('Player needs ID\r\n');
				console.log("Got a player object but had had no ID.");
				return;
			}

			if (typeof(players[data.id]) == "undefined") {
				if (typeof data.name == 'undefined' || typeof data.name == 'undefined' || typeof data.name == 'undefined' || typeof data.name == 'undefined') {
					socket.write('BAD - MISSING DATA\r\n');
					console.log("Got player info for the first time but it was missing stuff.");
					return;
				}

				players[data.id] = {
					name: data.name,
					id: data.id,
					pos: {
						lat: data.pos.lat,
						lon: data.pos.lon,
					},
					last_seen: new Date(),
				};

				player_count++;

				console.log("Got a new player", data);
				socket.write('OK - NEW PLAYER\r\n');
			} else {
				var player = players[data.id];

				if (typeof data.name != 'undefined') player.name = data.name;
				if (typeof data.pos != 'undefined' && typeof data.pos.lat != 'undefined' && typeof data.pos.lon != 'undefined') {
					player.pos.lat = data.pos.lat;
					player.pos.lon = data.pos.lon;
				}
				player.last_seen = new Date();
				console.log("Updated a player", data);
				socket.write('OK - EDIT PLAYER\r\n');
			}
		},

		// A player should be removed from our list
		input_player_remove: function(data) {
			if (!data.id) {
				socket.write('Player needs ID\r\n');
				console.log("Got a player object but had had no ID.");
				return;
			}

			if (typeof players[data.id] !== 'undefined') {
				delete players[data.id];
				player_count--;
				socket.write('OK - DELETED\r\n');
			} else {
				socket.write('OK - NOBODY\r\n');
			}
		},

		// The server is manually adding a monster, possibly for an event or a company special
		input_monster: function(data) {
			if (!data.id) {
			}

			// this may happen
			monster_count++;
		},

		input_remove_monster: function(data) {
			if (typeof monsters[data.id] == 'undefined') {
				console.log("Asked to delete an inexistant monster");
				socket.write('WTF - NOMONSTER');
				return;
			}

			monsterDatabase.output_monster_remove(data.id);

			delete monsters[data.id];
			monster_count--;
		},

		input_kill_server: function(data) {
			// Persist monster database to redis or a big JSON file or something
			socket.end();
			console.log("You just massacred " + player_count + " players and " + monster_count + " monsters!");
			process.exit();
		},

		// Iterate through each monster, deleting them if LAST_SEEN > 12 hours AND !persist
		event_delete_old_monsters: function() {

		},

		// Iterate through each monster, incrementing their exp by one point, increasing level if applicable
		event_monster_experience: function() {

		},

		// Iterate through each monster, moving them slightly
		event_monster_movement: function() {

		},

		// Send the information about a monster to the other server, aka their position or level probably changed
		output_monster_info: function(id) {

		},

		// Send the information about a monster being removed to the other server
		output_monster_remove: function(id) {
			delete monsters[id];
			// Send message to all nearby players
		},
	};

	function handleMessage(data) {
		switch (data.event) {
			case "player":
				console.log("PLAYER EVENT");
				monsterDatabase.input_player(data.data);
				break;
			case "player-remove":
				console.log("PLAYER REMOVE EVENT");
				monsterDatabase.input_player_remove(data.data);
				break;
			case "monster":
				console.log("MONSTER EVENT");
				monsterDatabase.input_monster(data.data);
				break;
			case "monster-remove":
				console.log("MONSTER REMOVE EVENT");
				monsterDatabase.input_remove_monster(data.data);
				break;
			case "server-kill":
				console.log("SERVER KILL EVENT");
				monsterDatabase.input_kill_server(data.data);
				break;
		}
	};

}).listen(LISTEN_PORT, LISTEN_ADDRESS, function() {
	console.log("LISTENING ON " + LISTEN_ADDRESS + ":" + LISTEN_PORT);
}).on('error', function (e) {
	if (e.code == 'EADDRINUSE') {
		console.log("Address is already in use. Is Monster Database running twice?");
		process.exit();
	}
});
