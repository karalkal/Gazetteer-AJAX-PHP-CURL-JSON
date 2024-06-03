// tile layers and init
const Stadia_AlidadeSatellite = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
	maxZoom: 22,
	attribution: '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'jpg'
});


const Jawg_Terrain = L.tileLayer('https://tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
	maxZoom: 22,
	attribution: '<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	accessToken: 'mJZnCYHFpNftBsC6PF64A1V0f7vwRW5xneYEg4rRfMoZimE53hjq2wJUuG1btLQ4'
});


const OpenStreetMap_HOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
	maxZoom: 22,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
});

const OpenRailwayMap = L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
	maxZoom: 22,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://www.OpenRailwayMap.org">OpenRailwayMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});


let map = L.map("map", {
	layers: [Stadia_AlidadeSatellite, OpenStreetMap_HOT]
});


const baseMaps = { 		// last one in list will be displayed by default on initial render
	"Satelite (Stadia)": Stadia_AlidadeSatellite, "Terrain (Jawg Lab)": Jawg_Terrain, "General (OpenStreetMap)": OpenStreetMap_HOT
};

const overlayMaps = {
	"Rail (OpenRailwayMap)": OpenRailwayMap
};

L.control.layers(baseMaps, overlayMaps).addTo(map);


$(document).ready(function () {
	let [countryIso2, countryIso3] = ["GR", "GRC"]		// default country set to Greece, these values are changed as required

	loadCountriesNamesAndCodes();			// Load Counties as <select> options

	/**	Set initial location:
		if user opts in => get latlng from event, send request to get countryCode and display map
		if user refuses, display default country map
	*/
	map.locate({ setView: true, maxZoom: 16 });
	map.once('locationfound', setCountryOfLocation); // gets code AND sets location
	map.on('locationerror', (e) => {
		if (e.code === 1) {
			// alert("Default initial map will be set to Greece\n(because this is where it all started).\n:-)");
			centerMapOnSelectedCountry(countryIso2);
			getCountryData();
		}
		else {
			alert(e.message);
		}
	});

	// Enable selection of country from menu
	$("#countrySelect").on("change", () => {
		[countryIso2, countryIso3] = $("#countrySelect").val().split("|");
		centerMapOnSelectedCountry(countryIso2);
		getCountryData();
	});


	/*
	create marker and circle with default values, 
	if user allows location set it to location values, 
	then when marker is moved set to new values
	var marker = L.marker([0, 0],
		{ draggable: true })
		.addTo(map);
		
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
	*/

	// info buttons
	const infoBtn1 = L.easyButton({
		leafletClasses: true,
		states: [{
			title: 'Government',
			icon: 'fa-solid fa-landmark-flag',
			onClick: async function (btn, map) {
				getCountryData();
				$("#firstModal").modal("show")
			}
		}]
	});

	const infoBtn2 = L.easyButton({
		leafletClasses: true,
		states: [{
			title: 'Financial',
			icon: 'fa-solid fa-money-check-dollar',
			onClick: function (btn, map) { $("#exampleModal").modal("show") }
		}]
	});

	infoBtn1.addTo(map);
	infoBtn2.addTo(map);



	function loadCountriesNamesAndCodes() {
		$.ajax({
			url: "libs/php/getAllCountriesCodes.php",
			type: 'GET',
			dataType: 'json',

			success: function (result) {
				$.each(result.data.allCountriesArr, function (index, value) {
					$('#countrySelect')
						.append($("<option></option>")
							.attr("value", `${value.iso_a2}|${value.iso_a3}`)
							.text(value.name));
				});

			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown);
				alert("Something went wrong")
			}
		});
	}

	function centerMapOnSelectedCountry(countryCodeIso2) {		// get country boundaries, remove prev. polygon and center map
		$.ajax({
			url: "libs/php/getCountryBoundaries.php",
			type: 'GET',
			dataType: 'json',
			data: ({ countryCode: countryCodeIso2 }),

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

	function setCountryOfLocation(e) {
		const { lat, lng } = e.latlng;
		$.ajax({
			url: "libs/php/getCountryIso2CodeByLatLng.php",
			type: 'GET',
			async: false,		// to ensure we can update values of country codes
			dataType: 'json',
			data: {
				lat: lat,
				lng: lng
			},

			success: function (result) {
				countryIso2 = result.data.countryCode;
				// need to get iso3 code too to get country info from 'https://countryinfoapi.com/api/countries/{cca3}
				// TODO: refactor it in a more intelligent way
				$("option").each(function () {
					if (($(this).val().split("|")[0]) === countryIso2) {
						countryIso3 = $(this).val().split("|")[1];
					}
				});

				centerMapOnSelectedCountry(countryIso2);
			},

			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown)
			}
		});
	}

	function getCountryData() {
		$.ajax({
			url: "libs/php/getCountryData.php",
			type: 'GET',
			dataType: 'json',
			data: ({ countryCodeIso3: countryIso3 }),

			success: function (result) {
				renderCountryDataInModal(result.data);
			},

			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown)
			}
		});
	}


	function renderCountryDataInModal(data) {
		console.log(data);
		$("#countryName1").text(data.name);
		$("#countryName2").text(`(${data.altSpellings[data.altSpellings.length - 1]})`);
		$("#countryFlag").html(`<img src="${data.flag}"/>`);
		$("#countryCoatOfArms").html(`<img src="${data.coatOfArms}"/>`);
	}


	// end of $(document).ready(function {
})



