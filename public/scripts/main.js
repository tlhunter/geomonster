var watchID;
var geo;        // geolocation object
var map;        // google map object
var mapMarker;  // google map marker object
// position options
var MAXIMUM_AGE = 100; // miliseconds
var TIMEOUT = 4 * 1000;
var HIGHACCURACY = true;

var monsterTypes = {};
var mapIsReady = false;

var user_id = sessionStorage.getItem("user_id");
if (!user_id) {
	user_id = Math.floor(Math.random() * 900000 + 100000) + ''; // Random 6 digit number
	sessionStorage.setItem("user_id", user_id);
}

$(function() {
	$('#user_id').text(user_id);

	$.ajax({
		type: 'GET',
		url: '/monster-types',
		dataType: 'json',
		success: function(data) {
			monsterTypes = data;
			console.log("Start Watching");
			if (geo = getGeoLocation()) {
				startWatching();
			} else {
				alert('Geolocation not supported.')
			}
		},
		error: function(xhr, type) {
			alert('Ajax error!')
		}
	});
});

var socket = io.connect();
var monster_markers = {}; // Giant object of monsters, keys are their unique id
var players = {}; // object of players, keys are their unique id

function getGeoLocation() {
	try {
		if( !! navigator.geolocation ) return navigator.geolocation;
		else return undefined;
	} catch(e) {
		return undefined;
	}
}

function positionUpdate(position) {
	var lat = position.coords.latitude;
	var lon = position.coords.longitude;
	$('#position').text(lat + ', ' + lon);
	console.log("My position has changed to", position.coords.latitude, position.coords.longitude);
	var latlng = new google.maps.LatLng(lat, lon);
	if (socket) {
		socket.emit('location', {
			lat: position.coords.latitude,
			lon: position.coords.longitude,
			user_id: user_id,
		});
	} else {
		$('#error_console').text('position before socket');
	}

	if(map) {
		map.panTo(latlng);
		mapMarker.setPosition(latlng);
	} else {
		var myOptions = {
			zoom: 18,
			center: latlng,
			disableDoubleClickZoom: true, 
			disableDefaultUI: true,
			draggable: false,
			scrollwheel: false,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

		mapMarker = new google.maps.Marker({
			position: latlng,
			title: "You are here.",
			icon: './images/players/user.png'
		});
		mapMarker.setMap(map);	
	}
	mapIsReady = true;
}

function geo_error(error) {
	stopWatching();
	$error_console = $('#error_console');
	switch(error.code) {
		case error.TIMEOUT:
			$error_console.text('Geolocation Timeout');
			break;
		case error.POSITION_UNAVAILABLE:
			$error_console.text('Geolocation Position unavailable');
			break;
		case error.PERMISSION_DENIED:
			$error_console.text('Geolocation Permission denied');
			break;
		default:
			$error_console.text('Geolocation returned an unknown error code: ' + error.code);
	}
}

function stopWatching() {
	console.log("Stop Watching");
	if (watchID) geo.clearWatch(watchID);
	watchID = null;
}

function startWatching() {
	watchID = geo.watchPosition(positionUpdate, geo_error, {
		enableHighAccuracy: HIGHACCURACY,
		maximumAge: MAXIMUM_AGE,
		timeout: TIMEOUT
	});
}

function destroy(index) {
	socket.emit('monster-kill', {
		monster_id: index,
		user_id: user_id
	});
}

socket.on('monster-kill', function(data) {
	monster_markers[data.monster_id].setMap(null);
	monster_markers[data.monster_id] = null;
	delete monster_markers[data.monster_id];
	console.log('MONSTER ' + data.monster_id + ' KILLED BY ' + data.user_id);
});

var infoWindow = new google.maps.InfoWindow( { });

socket.on('monster-move', function (monsters) {
	if (!mapIsReady) return;
	console.log("Monster Move Event");
	for (var index in monsters) {
		(function(index) {
			if (typeof monsters[index] === 'undefined' || !monsters[index]) return;
			var monster = monsters[index];
			var myLatlng = new google.maps.LatLng(monster.coords.lat, monster.coords.lon);
			if (typeof monster_markers[index] == 'undefined') {
				monster_markers[index] = new google.maps.Marker({
					position: myLatlng,
					map: map,
					title: monsterTypes[monster.type].name,
					icon: './images/monsters/' + monster.type + '.png'
				});
				google.maps.event.addListener(monster_markers[index], 'click', function() {
					var contentString = '<h3>' +  monster_markers[index].getTitle() + '</h3>';
					contentString += '<a onclick="destroy(' + index + ')" href="javascript:void(0);">Attack!</a>';
					infoWindow.setContent(contentString);
					infoWindow.open(map, monster_markers[index]);
				});
			} else {
				monster_markers[index].setPosition(myLatlng);
			}
		})(index);
	}
});

socket.on('player-move', function(newPlayer) {
	if (newPlayer.user_id == user_id) return; // don't care about myself -- Tom, you should care about yourself...
	console.log("Some player has moved", newPlayer);
	var myLatlng = new google.maps.LatLng(newPlayer.lat, newPlayer.lon);
	if (typeof players[newPlayer.user_id] === 'undefined') {
		console.log("I've never seen this player before.");
		players[newPlayer.user_id] = newPlayer;
		// add marker
		players[newPlayer.user_id].marker = new google.maps.Marker({
		  	position: myLatlng,
		  	map: map,
		  	icon: './images/players/user.png'
		});
	} else {
		players[newPlayer.user_id].lat = newPlayer.lat;
		players[newPlayer.user_id].lon = newPlayer.lon;
		players[newPlayer.user_id].marker.setPosition(myLatlng);
	}
});

function center() {
	map.setCenter(mapMarker.getPosition()); 
}	


