// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

var map;

// tile layers

var streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
	attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
});

var satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
	attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
});

var basemaps = {
	"Streets": streets,
	"Satellite": satellite
};

// ---------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------

// initialize and add controls once DOM is ready

$(document).ready(function () {
	// Load Counties <select> options
	$.ajax({
		url: "libs/php/getAllCountriesData.php",
		type: 'GET',
		dataType: 'json',

		success: function (result) {
			$.each(result.data, function (index, value) {
				console.log(index, value)
				$('#countrySelect')
					.append($("<option></option>")
						.attr("value", value.iso_a2)
						.text(value.name));
			});

		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(error);
			alert("Something went wrong")
		}
	});

	map = L.map("map", {
		layers: [
			streets,
			satellite
		]
	}).setView([54.5, -4], 6);

	// setView is not required in your application as you will be
	// deploying map.fitBounds() on the country border polygon

	var layerControl = L.control.layers(basemaps).addTo(map);
	/*
	create marker and circle with default values, 
	if user allows location set it to location values, 
	then when marker is moved set to new values
	*/
	var marker = L.marker([0, 0],
		{ draggable: true })
		.addTo(map);

	// initial location
	map.locate({ setView: true, maxZoom: 16 });
	map.once('locationfound', (e) => displayMap(e.latlng));
	map.on('locationerror', onLocationError);

	// on click map
	map.on('click', (e) => displayMap(e.latlng));
	// on drag marker
	marker.on('dragend', (e) => displayMap(e.target.getLatLng()));



	function displayMap(latlng) {
		marker.setLatLng(latlng)
			.bindPopup(`lat: ${latlng.lat}, <br>lng: ${latlng.lng}`).openPopup();
		map.panTo([latlng.lat, latlng.lng])
	}


	function onLocationError(e) {
		console.log(e);
		if (e.code === 1) {

		}
		alert(e.message);
	}

	// info buttons
	var infoBtn = L.easyButton("fa-info", function (btn, map) {
		$("#exampleModal").modal("show");
	});
	infoBtn.addTo(map);

})
