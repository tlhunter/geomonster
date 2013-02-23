var watchID;
var geo;        // geolocation object
var map;        // google map object
var mapMarker;  // google map marker object
// position options
var MAXIMUM_AGE = 100; // miliseconds
var TIMEOUT = 300000;
var HIGHACCURACY = true;

var user_id = sessionStorage.getItem("user_id");
if (!user_id) {
	user_id = Math.floor(Math.random() * 900000 + 100000) + ''; // Random 6 digit number
	sessionStorage.setItem("user_id", user_id);
}

console.log("My user_id is " + user_id);

var socket = io.connect();
var monster_markers = [];
var players = {};

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
	console.log("My position has changed to", position.coords.latitude, position.coords.longitude);
	var latlng = new google.maps.LatLng(lat, lon);
	if (socket) {
		socket.emit('location', {
			lat: position.coords.latitude,
			lon: position.coords.longitude,
			user_id: user_id,
		});
	}

	if(map) {
		map.panTo(latlng);
		mapMarker.setPosition(latlng);
	} else {
		var myOptions = {
			zoom: 20,
			center: latlng,
				  //disableDoubleClickZoom: true, 
				  disableDefaultUI: true,
				  //draggable: false,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
		map.setTilt(0); // turns off the annoying default 45-deg view

		mapMarker = new google.maps.Marker({
			position: latlng,
			title:"You are here.",
				  icon: './images/players/user.png'
		});
		mapMarker.setMap(map);
	}
}

function geo_error(error) {
	stopWatching();
	switch(error.code) {
		case error.TIMEOUT:
			alert('Geolocation Timeout');
			break;
		case error.POSITION_UNAVAILABLE:
			alert('Geolocation Position unavailable');
			break;
		case error.PERMISSION_DENIED:
			alert('Geolocation Permission denied');
			break;
		default:
			alert('Geolocation returned an unknown error code: ' + error.code);
	}
}

function stopWatching() {
	if(watchID) geo.clearWatch(watchID);
	watchID = null;
}

function startWatching() {
	watchID = geo.watchPosition(positionUpdate, geo_error, {
		enableHighAccuracy: HIGHACCURACY,
		maximumAge: MAXIMUM_AGE,
		timeout: TIMEOUT
	});
}

window.onload = function() {
	if((geo = getGeoLocation())) {
		startWatching();
	} else {
		alert('Geolocation not supported.')
	}
}

var firstTime = true;
socket.on('monster-move', function (monsters) {
	console.log("Got a monster-move event from the server");
 for(var index in monsters) {
	 var monster = monsters[index];
	  var myLatlng = new google.maps.LatLng(monster.coords.lat,monster.coords.lon);
	  if(firstTime) {
		  monster_markers[index] = new google.maps.Marker({
				position: myLatlng,
				map: map,
				icon: './images/monsters/' + monster.type + '.png'
		  });
	  } else {
			monster_markers[index].setPosition(myLatlng);
	  }
 }
 firstTime = false;
});

socket.on('player-move', function(data) {
	if (data.user_id == user_id) return; // don't care about myself
	console.log("Some player has moved", data);
	var myLatlng = new google.maps.LatLng(data.lat, data.lon);
	if (typeof players[data.user_id] === 'undefined') {
		console.log("I've never seen this player before.");
		players[data.user_id] = data;
		// add marker
		players[data.user_id].marker = new google.maps.Marker({
		  	position: myLatlng,
		  	map: map,
		  	icon: './images/players/user.png'
		});
	} else {
		console.log("I've seen this player before.");
		players[data.user_id].lat = data.lat;
		players[data.user_id].lon = data.lon;
		players[data.user_id].marker.setPosition(myLatlng);
	}
});

function center() {
	map.setCenter(mapMarker.getPosition()); 
}	
