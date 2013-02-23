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
var markers = [];

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
var infoWindow = new google.maps.InfoWindow(
{
}
);
socket.on('monster-move', function (monsters) {
	console.log("Got a monster-move event from the server");
 for(var index in monsters) {
	 var monster = monsters[index];
	  var myLatlng = new google.maps.LatLng(monster.coords.lat,monster.coords.lon);
	  if(firstTime) {
		  markers[index] = new google.maps.Marker({
				position: myLatlng,
				map: map,
				title: 'Billy',
				icon: './images/monsters/' + monster.type + '.png'
		  });
		  (function(index){
			  google.maps.event.addListener(markers[index], 'click', function(asdf) {
				infoWindow.setContent(markers[index].getTitle());
				infoWindow.open(map, markers[index]);
			  });
		  })(index)
	  } else {
			markers[index].setPosition(myLatlng);
	  }
 }
 firstTime = false;
});

function center() {
	map.setCenter(mapMarker.getPosition()); 
}	


