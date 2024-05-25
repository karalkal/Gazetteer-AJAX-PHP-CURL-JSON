// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

var map;

// tile layers

var streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
	attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
}
);

var satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
	attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
}
);

var basemaps = {
	"Streets": streets,
	"Satellite": satellite
};

// buttons
var infoBtn = L.easyButton("fa-info", function (btn, map) {
	$("#exampleModal").modal("show");
});

// ---------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------

// initialize and add controls once DOM is ready

$(document).ready(function () {

	map = L.map("map", {
		layers: [
			streets,
			satellite
		]
	}).setView([54.5, -4], 6);

	// setView is not required in your application as you will be
	// deploying map.fitBounds() on the country border polygon

	var layerControl = L.control.layers(basemaps).addTo(map);

	// current location
	map.locate({ setView: true, maxZoom: 16 });

	function onLocationFound(e) {
		var radius = e.accuracy;
		console.log(e)

		L.marker(e.latlng).addTo(map)
			.bindPopup("You are within " + radius + " meters from this point").openPopup();

		L.circle(e.latlng, radius).addTo(map);
	}

	
	function onLocationError(e) {
		alert(e.message);
	}
	
	map.on('locationfound', onLocationFound);
	map.on('locationerror', onLocationError);




	infoBtn.addTo(map);

})
