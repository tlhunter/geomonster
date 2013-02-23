var watchID;
var geo;        // geolocation object
var map;        // google map object
var mapMarker;  // google map marker object
// position options
var MAXIMUM_AGE = 100; // miliseconds
var TIMEOUT = 300000;
var HIGHACCURACY = true;

function getGeoLocation() {
	try {
		if( !! navigator.geolocation ) return navigator.geolocation;
		else return undefined;
	} catch(e) {
		return undefined;
	}
}

function show_map(position) {
	var lat = position.coords.latitude;
	var lon = position.coords.longitude;
	var latlng = new google.maps.LatLng(lat, lon);

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
	watchID = geo.watchPosition(show_map, geo_error, {
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

var socket = io.connect();
var markers = [];
var firstTime = true;
socket.on('monster-move', function (monsters) {
 for(var index in monsters) {
	 var monster = monsters[index];
	  var myLatlng = new google.maps.LatLng(monster.coords.lat,monster.coords.lon);
	  if(firstTime) {
		  markers[index] = new google.maps.Marker({
				position: myLatlng,
				map: map,
				icon: './images/monsters/' + monster.type + '.png'
		  });
	  } else {
			markers[index].setPosition(myLatlng);
	  }
 }
 firstTime = false;
});

function center() {
	map.setCenter(mapMarker.getPosition()); 
}	
