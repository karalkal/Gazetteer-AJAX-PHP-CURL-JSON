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


$(document).ready(function () {
	loadAllCountriesData();		// Load Counties <select> options


	// get country boundaries
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
						console.log(tuple[0])
						latlngs.push([tuple[1], tuple[0]])
					}
				}
				else if (result.data.geometryType === "MultiPolygon") {
					console.log(result.data.coordinatesArray)
				}
				else {
					throw new Error(`Invalid geometryType ${result.data.geometryType}`)
				}



				console.log(latlngs)
				// polygon is used to determine borders of selected country and then "fill" screen 
				var polygon = L.polygon(latlngs, { color: 'red' }).addTo(map);
				// zoom the map to the polygon
				map.fitBounds(polygon.getBounds());

			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown);
				alert("Something went wrong")
			}
		});

	}
	);

	map = L.map("map", {
		layers: [
			streets,
			satellite
		]
	})
	// .setView([54.5, -4], 6);

	// setView is not required in your application as you will be
	// deploying map.fitBounds() on the country border polygon

	L.control.layers(basemaps).addTo(map);
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
