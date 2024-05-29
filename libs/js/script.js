// tile layers and init
let satelite = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'jpg'
});

let streets = L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});

let terrain = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain_background/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});

let watercolour = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.{ext}', {
	minZoom: 1,
	maxZoom: 16,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'jpg'
});

let map = L.map("map", {
	layers: [satelite, streets, terrain, watercolour]
});


let basemaps = { 		// last one in list will be displayed by default
	"Satelite": satelite, "Terrain": terrain, "Watercolour": watercolour, "Streets": streets
};

L.control.layers(basemaps).addTo(map);



$(document).ready(function () {
	loadAllCountriesData();			// Load Counties <select> options
	centerMapOnSelectedCountry();	// get country boundaries, remove prev. polygon and center map


	/*
	create marker and circle with default values, 
	if user allows location set it to location values, 
	then when marker is moved set to new values
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
		// console.log(latlng)
		marker.setLatLng(latlng)
			.bindPopup(`lat: ${latlng.lat}, <br>lng: ${latlng.lng}`).openPopup();
		map.panTo([latlng.lat, latlng.lng])
	}
	
	
	function onLocationError(e) {
		console.log(e);
		if (e.code === 1) {
			alert("default initial location will be set to\nLatitude 0, Longitude 0");
			displayMap({ lat: 0, lng: 0 });
		}
		else {
			alert(e.message);
		}
	}
	*/

	// info buttons
	var infoBtn = L.easyButton("fa-info", function (btn, map) {
		$("#exampleModal").modal("show");
	});
	infoBtn.addTo(map);

})


function loadAllCountriesData() {
	$.ajax({
		url: "libs/php/getAllCountriesData.php",
		type: 'GET',
		dataType: 'json',

		success: function (result) {
			$.each(result.data.allCountriesArr, function (index, value) {
				// console.log(index, value)
				$('#countrySelect')
					.append($("<option></option>")
						.attr("value", value.iso_a2)
						.text(value.name));
			});

		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR, textStatus, errorThrown);
			alert("Something went wrong")
		}
	});
}

function centerMapOnSelectedCountry() {
	$("#countrySelect").on("change", () => {
		const countryCode = $("#countrySelect").val();

		$.ajax({
			url: "libs/php/getCountryBoundaries.php",
			type: 'GET',
			dataType: 'json',
			data: ({ countryCode: countryCode }),

			success: function (result) {
				// NB - we need latlng arrays but the STUPID json is providing longitude first, then latitude, hence need to invert them
				let latlngs = []
				if (result.data.geometryType === "Polygon") {
					for (let tuple of result.data.coordinatesArray[0]) {
						latlngs.push([tuple[1], tuple[0]])
					}
				}
				else if (result.data.geometryType === "MultiPolygon") {		// island countries etc.
					for (let nestedArr of result.data.coordinatesArray) {
						let invertedTuple = []
						for (let tuple of nestedArr[0]) {
							invertedTuple.push([tuple[1], tuple[0]]);
						}
						latlngs.push(invertedTuple)
					}
				}
				else {
					throw new Error(`Invalid geometryType ${result.data.geometryType}`)
				}

				// polygon is used to determine borders of selected country and then "fill" screen 
				let polygon = L.polygon(latlngs, { color: 'green' }).addTo(map);
				// zoom the map to the polygon
				map.fitBounds(polygon.getBounds());
				setTimeout(() => polygon.removeFrom(map), 4400)
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown);
				alert("Something went wrong")
			}
		});

	}
	);
}
