//   ----    TILE LAYERS and INIT    ----    //
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

//   ----    MOVEABLE MARKER    ----    //
// if user allows location set it to capital, otherwise will be moved to Athens
// then when marker is moved set to new values
const marker = L.marker([0, 0], { draggable: true }).addTo(map);
// move marker on click on map
map.on('click', (e) => moveMarker(e.latlng));
// move marker when dragged
marker.on('dragend', (e) => moveMarker(e.target.getLatLng()));

function moveMarker(latlng) {
	console.log(latlng)
	marker
		.setLatLng(latlng)
		.bindPopup(`lat: ${latlng.lat}, <br>lng: ${latlng.lng}`).openPopup();
	map.panTo([latlng.lat, latlng.lng])
}


$(document).ready(function () {
	let [countryIso2, countryIso3] = ["GR", "GRC"]				// default country set to Greece, these values are changed as required
	let capitalLatLng = { lat: 37.983810, lng: 23.727539 }		// will place marker on capital, default Athens

	loadCountriesNamesAndCodes();			// Load Counties as <select> options

	/**	Set initial location:
		if user opts in => get latlng from event, send request to get countryCode and display map
		if user refuses, display default country map
	*/
	map.locate({ setView: true, maxZoom: 16 });
	map.once('locationfound', setCountryOfLocation); // gets code AND sets location
	map.on('locationerror', (e) => {
		if (e.code === 1) {
			alert("By default map will be set to Greece/Athens\nas this is where IT all started.\n:-)");
			centerMapOnSelectedCountry(countryIso2);
			moveMarker(capitalLatLng);
		}
		else {
			console.log(e);
			alert(e.message);
		}
	});

	// Enable selection of country from menu
	$("#countrySelect").on("change", () => {
		[countryIso2, countryIso3] = $("#countrySelect").val().split("|");
		centerMapOnSelectedCountry(countryIso2);
		setMarkerOnCapitalCoordinates(countryIso2);
	});

	//   ----    INFO BUTTONS    ----    //
	const infoBtn1 = L.easyButton({
		leafletClasses: true,
		states: [{
			title: 'Government',
			icon: 'fa-solid fa-landmark-flag',
			onClick: async function (btn, map) {
				getEssentials();
				$("#genericModal").modal("show")
			}
		}]
	});

	const infoBtn2 = L.easyButton({
		leafletClasses: true,
		states: [{
			title: 'Economy',
			icon: 'fa-solid fa-money-check-dollar',
			onClick: async function (btn, map) {
				getEconomy();
				$("#genericModal").modal("show")
			}
		}]
	});

	const infoBtn3 = L.easyButton({
		leafletClasses: true,
		states: [{
			title: 'Population',
			icon: 'fa-solid fa-people-group',
			onClick: async function (btn, map) {
				getPopulation();
				$("#genericModal").modal("show")
			}
		}]
	});

	const infoBtn4 = L.easyButton({
		leafletClasses: true,
		states: [{
			title: 'Education',
			icon: 'fa-solid fa-person-chalkboard',
			onClick: async function (btn, map) {
				getEducation();
				$("#genericModal").modal("show")
			}
		}]
	});

	const infoBtn5 = L.easyButton({
		leafletClasses: true,
		states: [{
			title: 'Currency',
			icon: 'fa-solid fa-money-bill-transfer',
			onClick: async function (btn, map) {
				getExchangeRates();
				$("#genericModal").modal("show")
			}
		}]
	});

	const infoBtn6 = L.easyButton({
		leafletClasses: true,
		states: [{
			title: 'Weather in capital',
			icon: 'fa-solid fa-temperature-three-quarters',
			onClick: async function (btn, map) {
				getExchangeRates();
				$("#genericModal").modal("show")
			}
		}]
	});

	infoBtn1.addTo(map);
	infoBtn2.addTo(map);
	infoBtn3.addTo(map);
	infoBtn4.addTo(map);
	infoBtn5.addTo(map);
	infoBtn6.addTo(map);

	$(".btnClose").on('click', function () {
		$("#genericModal").modal("hide")
	});


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
				let polygon = L.polygon(latlngs, { color: 'orange' }).addTo(map);
				// zoom the map to the polygon, leave it on for some time
				map.fitBounds(polygon.getBounds());
				setTimeout(() => polygon.removeFrom(map), 8000)
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

	function setMarkerOnCapitalCoordinates(countryCodeIso2) {
		$.ajax({
			url: "libs/php/getCapitalLatLngByCountryIso2Code.php",
			type: 'GET',
			async: false,
			dataType: 'json',
			data: { countryCodeIso2 },

			success: function (result) {
				const capitalCoordinatesArr = result.data.capitalLatLng
				const capitalCoordinatesObj = { lat: capitalCoordinatesArr[0], lng: capitalCoordinatesArr[1] }
				moveMarker(capitalCoordinatesObj);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown)
			}
		});
	}

	function getEssentials() {
		$.ajax({
			url: "libs/php/getEssentialCountryData.php",
			type: 'GET',
			dataType: 'json',
			data: ({ countryCodeIso3: countryIso3 }),

			success: function (result) {
				renderCountryDataInModal(result.data, "essential");
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown)
			}
		});
	}

	function getEconomy() {
		$.ajax({
			url: "libs/php/getEconomyData.php",
			type: 'GET',
			dataType: 'json',
			data: ({
				countryCodeIso3: countryIso3,
				timeFrame: "2006:2024"
			}),

			success: function (result) {
				renderCountryDataInModal(result.data, "economy");
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown)
			}
		});
	}

	function getPopulation() {
		$.ajax({
			url: "libs/php/getPopulationData.php",
			type: 'GET',
			dataType: 'json',
			data: ({
				countryCodeIso3: countryIso3,
				timeFrame: "2006:2024"
			}),

			success: function (result) {
				renderCountryDataInModal(result.data, "population");
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown)
			}
		});
	}

	function getEducation() {
		$.ajax({
			url: "libs/php/getEducationData.php",
			type: 'GET',
			dataType: 'json',
			data: ({
				countryCodeIso3: countryIso3,
				timeFrame: "1991:2024"			// get education since 1991, as less data is available
			}),

			success: function (result) {
				renderCountryDataInModal(result.data, "education");
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown)
			}
		});
	}

	function getExchangeRates() {
		$.ajax({
			url: "libs/php/getExchangeRatesData.php",
			type: 'GET',
			dataType: 'json',
			data: ({
				countryCodeIso2: countryIso2,
			}),

			success: function (result) {
				renderCountryDataInModal(result.data, "money");
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown)
			}
		});
	}

	function renderCountryDataInModal(data, dataType) {
		//    ****    GOVERNMENT    ****    //
		if (dataType === "essential") {
			$(".modal-body").html(`
				<div class="divNames">
					<h3>${data.name}</h3>
					<h4>(${data.altSpellings[data.altSpellings.length - 1]})</h4>
				</div>

				<div class="divTwoCols">
					<div class="divFlagAndCoA">
						<p>Flag:</p>
						<div id="countryFlag"><img src="${data.flag}"></div>
					</div>
					<div class="divFlagAndCoA">
						<p>Coat of Arms:</p>
						<div id="countryCoatOfArms"><img src="${data.coatOfArms}"></div>
					</div>
				</div>

				<div class="divTwoCols">
					<div>
						<p>Area:</p>
						<p class="countryData"><span>${Intl.NumberFormat('de-DE').format(data.area)} km&#178;</span></p>
					</div>
					<div>
						<p>Population:</p>
						<p class="countryData"><span>${Intl.NumberFormat('de-DE').format(data.population)}</span></p>
					</div>
				</div>

				<div class="divTwoCols">
					<div>
						<p>Capital:</p>
						<p class="countryData"><span>${data.capital}</span></p>
					</div>
					<div>
						<p>TLD:</p>
						<p class="countryData"><span>${data.tld}</p>
					</div>
				</div>
			`)
		}
		//    ****    ECONOMY    ****    //
		else if (dataType === "economy") {
			// console.log("Actual Data:\n", data[1]);
			const actualData = data[1] || [];		// avoid error for countries with no data, i.e. North Cyprus
			let mostRecentData = {		// default values for required indicators
				"BN.CAB.XOKA.CD": { value: "N.A.", year: "no recent data is available" },
				"BM.GSR.GNFS.CD": { value: "N.A.", year: "no recent data is available" },
				"BX.GSR.GNFS.CD": { value: "N.A.", year: "no recent data is available" },
				"NY.GDP.MKTP.KD.ZG": { value: "N.A.", year: "no recent data is available" },
				"NY.GDP.MKTP.CD": { value: "N.A.", year: "no recent data is available" },
				"NY.GDP.PCAP.KD.ZG": { value: "N.A.", year: "no recent data is available" },
				"SI.POV.NAHC": { value: "N.A.", year: "no recent data is available" },			//Population below national poverty line (%)
				"SI.POV.GINI": { value: "N.A.", year: "no recent data is available" },			//Gini
			};
			for (let reading of actualData) {
				mostRecentData.countryId = reading.country.id;
				mostRecentData.countryName = reading.country.value;
				// For each indicator API returns the most recent data as first result
				// Hence if value in mostRecentData is no longer "N.A." we already have record => ignore next readings for this indicator
				// Sometimes value === null, write data only of value is not null. Get year of reading as well
				if (mostRecentData[reading.indicator.id].value === "N.A." && reading.value) {
					mostRecentData[reading.indicator.id] = {
						indicatorName: reading.indicator.value,
						year: reading.date,
						value: Number(reading.value).toFixed(2)
					};
				};
			}
			// console.log("mostRecentData:\n", mostRecentData);

			$(".modal-body").html(`
				<div class="divNames">
					<h5>${mostRecentData.countryName || "Country not in DB"} - Economy</h5>
				</div>

				<div class="divOneCol">
					<p>GDP (current US$):</p>
					<p class="countryData">
					${Intl.NumberFormat('de-DE').format(mostRecentData["NY.GDP.MKTP.CD"].value)} 
					<span class="dataYear">(${mostRecentData["NY.GDP.MKTP.CD"].year})</span>
					</p>
				</div>
				<div class="divOneCol">
					<p>GDP growth (annual %):</p>
					<p class="countryData">
					${Number(mostRecentData["NY.GDP.MKTP.KD.ZG"].value)} 
					<span class="dataYear">(${mostRecentData["NY.GDP.MKTP.KD.ZG"].year})</span>
					</p>
				</div>
				<div class="divOneCol">
					<p>GDP per capita growth (annual %):</p>
					<p class="countryData">
					${Number(mostRecentData["NY.GDP.PCAP.KD.ZG"].value)} 
					<span class="dataYear">(${mostRecentData["NY.GDP.PCAP.KD.ZG"].year})</span>
					</p>
				</div>
				<div class="divOneCol">
					<p>Imports of goods and services (BoP, current US$):</p>
					<p class="countryData">
					${Intl.NumberFormat('de-DE').format(mostRecentData["BM.GSR.GNFS.CD"].value)} 
					<span class="dataYear">(${mostRecentData["BM.GSR.GNFS.CD"].year})</span>
					</p>
				</div>
				<div class="divOneCol">
					<p>Exports of goods and services (BoP, current US$):</p>
					<p class="countryData">
					${Intl.NumberFormat('de-DE').format(mostRecentData["BX.GSR.GNFS.CD"].value)} 
					<span class="dataYear">(${mostRecentData["BX.GSR.GNFS.CD"].year})</span>
					</p>
				</div>
				<div class="divOneCol">
					<p>Current account balance (BoP, current US$):</p>
					<p class="countryData">
					${Intl.NumberFormat('de-DE').format(mostRecentData["BN.CAB.XOKA.CD"].value)} 
					<span class="dataYear">(${mostRecentData["BN.CAB.XOKA.CD"].year})</span>
					</p>
				</div>
				<div class="divOneCol">
					<p>Population below national poverty line (%):</p>
					<p class="countryData">
					${Number(mostRecentData["SI.POV.NAHC"].value)} 
					<span class="dataYear">(${mostRecentData["SI.POV.NAHC"].year})</span>
					</p>
				</div>
				<div class="divOneCol">
					<p>Gini index:</p>
					<p class="countryData">
					${Number(mostRecentData["SI.POV.GINI"].value)} 
					<span class="dataYear">(${mostRecentData["SI.POV.GINI"].year})</span>
					</p>
				</div>				
				`)
		}
		//    ****    DEMOGRAPHICS    ****    //
		else if (dataType === "population") {
			// console.log("Actual Data:\n", data[1]);
			const actualData = data[1] || [];		// avoid error for countries with no data, i.e. North Cyprus
			let mostRecentData = {		// default values for required indicators
				"SP.DYN.LE00.MA.IN": { value: "N.A.", year: "no recent data is available" },	// "Life expectancy at birth, male (years)"
				"SP.DYN.LE00.FE.IN": { value: "N.A.", year: "no recent data is available" },	// "Life expectancy at birth, female (years)"
				"EN.POP.DNST": { value: "N.A.", year: "no recent data is available" },			// "Population density (people per sq. km of land area)"
				"SP.POP.GROW": { value: "N.A.", year: "no recent data is available" },			// "Population growth (annual %)"
				"SP.URB.TOTL.IN.ZS": { value: "N.A.", year: "no recent data is available" },	// "Urban population (% of total population)"
				"SP.RUR.TOTL.ZS": { value: "N.A.", year: "no recent data is available" },		// "Rural population (% of total population)"
				"SP.POP.TOTL": { value: "N.A.", year: "no recent data is available" },			// "Population, total"
				"AG.LND.TOTL.K2": { value: "N.A.", year: "no recent data is available" },		// "Land area (sq. km)"
			};
			for (let reading of actualData) {
				mostRecentData.countryId = reading.country.id;
				mostRecentData.countryName = reading.country.value;
				// For each indicator API returns the most recent data as first result
				// Hence if value in mostRecentData is no longer "N.A." we already have record => ignore next readings for this indicator
				// Sometimes value === null, write data only of value is not null. Get year of reading as well
				if (mostRecentData[reading.indicator.id].value === "N.A." && reading.value) {
					mostRecentData[reading.indicator.id] = {
						indicatorName: reading.indicator.value,
						year: reading.date,
						value: Number(reading.value).toFixed(2)
					};
				};
			}
			$(".modal-body").html(`
				<div class="divNames">
					<h5>${mostRecentData.countryName || "Country not in DB"} - Demographics</h5>
				</div>

				<div class="divOneCol">
					<p>Population, total:</p>
					<p class="countryData">
					${Intl.NumberFormat('de-DE').format(mostRecentData["SP.POP.TOTL"].value)} 
					<span class="dataYear">(${mostRecentData["SP.POP.TOTL"].year})</span>
					</p>
				</div>
				<div class="divOneCol">
					<p>Land area (sq. km):</p>
					<p class="countryData">
					${Intl.NumberFormat('de-DE').format(mostRecentData["AG.LND.TOTL.K2"].value)} 
					<span class="dataYear">(${mostRecentData["AG.LND.TOTL.K2"].year})</span>
					</p>
				</div>
				<div class="divOneCol">
					<p>Population density (people/sq.km):</p>
					<p class="countryData">
					${Number(mostRecentData["EN.POP.DNST"].value)} 
					<span class="dataYear">(${mostRecentData["EN.POP.DNST"].year})</span>
					</p>
				</div>
				<div class="divOneCol">
					<p>Population growth (annual %):</p>
					<p class="countryData">
					${Number(mostRecentData["SP.POP.GROW"].value)} 
					<span class="dataYear">(${mostRecentData["SP.POP.GROW"].year})</span>
					</p>
				</div>
				<div class="divOneCol">
					<p>Urban population (%):</p>
					<p class="countryData">
					${Number(mostRecentData["SP.URB.TOTL.IN.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["SP.URB.TOTL.IN.ZS"].year})</span>
					</p>
				</div>
				<div class="divOneCol">
					<p>Rural population (%):</p>
					<p class="countryData">
					${Number(mostRecentData["SP.RUR.TOTL.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["SP.RUR.TOTL.ZS"].year})</span>
					</p>
				</div>
				<div class="divOneCol">
					<p>Life expectancy, male (years):</p>
					<p class="countryData">
					${Number(mostRecentData["SP.DYN.LE00.MA.IN"].value)} 
					<span class="dataYear">(${mostRecentData["SP.DYN.LE00.MA.IN"].year})</span>
					</p>
				</div>	
				<div class="divOneCol">
					<p>Life expectancy, female (years):</p>
					<p class="countryData">
					${Number(mostRecentData["SP.DYN.LE00.FE.IN"].value)} 
					<span class="dataYear">(${mostRecentData["SP.DYN.LE00.FE.IN"].year})</span>
					</p>
				</div>				
				`)
		}
		//    ****    EDUCATION    ****    //
		else if (dataType === "education") {
			console.log("Actual Data:\n", data[1]);
			const actualData = data[1] || [];		// avoid error for countries with no data, i.e. North Cyprus
			let mostRecentData = {		// default values for required indicators
				"SE.XPD.TOTL.GD.ZS": { value: "N.A.", year: "no recent data is available" },	// "Government expenditure on education, total (% of GDP)"
				"SE.PRM.ENRL.TC.ZS": { value: "N.A.", year: "no recent data is available" },	// "Pupil-teacher ratio, primary"
				"SE.PRM.NENR": { value: "N.A.", year: "no recent data is available" },			// "School enrollment, primary (% net)"
				"SE.SEC.NENR": { value: "N.A.", year: "no recent data is available" },			// "School enrollment, secondary (% net)"
				"SL.UEM.TOTL.FE.ZS": { value: "N.A.", year: "no recent data is available" },	// "Unemployment, female (% of female labor force) (modeled ILO estimate)"
				"SL.UEM.TOTL.MA.ZS": { value: "N.A.", year: "no recent data is available" },	// "Unemployment, male (% of male labor force) (modeled ILO estimate)"
				"SL.TLF.0714.ZS": { value: "N.A.", year: "no recent data is available" },		// "Children in employment, total (% of children ages 7-14)"
				"EN.POP.SLUM.UR.ZS": { value: "N.A.", year: "no recent data is available" },	// "Population living in slums (% of urban population)"
			};
			for (let reading of actualData) {
				mostRecentData.countryId = reading.country.id;
				mostRecentData.countryName = reading.country.value;
				// For each indicator API returns the most recent data as first result
				// Hence if value in mostRecentData is no longer "N.A." we already have record => ignore next readings for this indicator
				// Sometimes value === null, write data only of value is not null. Get year of reading as well
				if (mostRecentData[reading.indicator.id].value === "N.A." && reading.value) {
					mostRecentData[reading.indicator.id] = {
						indicatorName: reading.indicator.value,
						year: reading.date,
						value: Number(reading.value).toFixed(2)
					};
				};
			}
			$(".modal-body").html(`
				<div class="divNames">
					<h5>${mostRecentData.countryName || "Country not in DB"} - Education</h5>
				</div>

				<div class="divOneCol">
					<p>Government expenditure on education, total (% of GDP):</p>
					<p class="countryData">
					${Number(mostRecentData["SE.XPD.TOTL.GD.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["SE.XPD.TOTL.GD.ZS"].year})</span>
					</p>
				</div>
				<div class="divOneCol">
					<p>Pupil-teacher ratio, primary:</p>
					<p class="countryData">
					${Number(mostRecentData["SE.PRM.ENRL.TC.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["SE.PRM.ENRL.TC.ZS"].year})</span>
					</p>
				</div>
				<div class="divOneCol">
					<p>School enrollment, primary (% net):</p>
					<p class="countryData">
					${Number(mostRecentData["SE.PRM.NENR"].value)} 
					<span class="dataYear">(${mostRecentData["SE.PRM.NENR"].year})</span>
					</p>
				</div>
				<div class="divOneCol">
					<p>School enrollment, secondary (% net):</p>
					<p class="countryData">
					${Number(mostRecentData["SE.SEC.NENR"].value)} 
					<span class="dataYear">(${mostRecentData["SE.SEC.NENR"].year})</span>
					</p>
				</div>
				<div class="divOneCol">
					<p>Unemployment, female (%):</p>
					<p class="countryData">
					${Number(mostRecentData["SL.UEM.TOTL.FE.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["SL.UEM.TOTL.FE.ZS"].year})</span>
					</p>
				</div>
				<div class="divOneCol">
					<p>Unemployment, male (%):</p>
					<p class="countryData">
					${Number(mostRecentData["SL.UEM.TOTL.MA.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["SL.UEM.TOTL.MA.ZS"].year})</span>
					</p>
				</div>
				<div class="divOneCol">
					<p>Children in employment, (% of age 7-14):</p>
					<p class="countryData">
					${Number(mostRecentData["SL.TLF.0714.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["SL.TLF.0714.ZS"].year})</span>
					</p>
				</div>	
				<div class="divOneCol">
					<p>Population in slums (%):</p>
					<p class="countryData">
					${Number(mostRecentData["EN.POP.SLUM.UR.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["EN.POP.SLUM.UR.ZS"].year})</span>
					</p>
				</div>				
				`)
		}
		//    ****    MONEY EXCHANGE    ****    //
		else if (dataType === "money") {
			// console.log(data);
			// console.log(Object.keys(currencyData.primaryCurrency));
			// console.log(Object.values(currencyData.primaryCurrency));
			const currencyArr = Object.values(data.primaryCurrency);

			$(".modal-body").html(`
				<div class="divNames">
					<h5>${data.countryName || "Country not in DB"} - Money</h5>
					<h4>${currencyArr[0].name} (${currencyArr[0].symbol})</h4>
				</div>
				<div class="divOneCol">
					<h6>exchange rates as of UTC time</h6>
					<h6>${data.exchangeRates.time_last_update_utc}</h6>
				</div>
				<div class="divTwoColsSplit">
					<div class="divExchangeRateLeft">
						<p>Euro (€):</p>
						<p class="countryData"><span>${data.exchangeRates.conversion_rates.EUR}</span></p>
					</div>
					<div class="divExchangeRateRight">
						<p>US Dollar (US$): </p>
						<p class="countryData"><span>${data.exchangeRates.conversion_rates.USD}</span></p>
					</div>
				</div>
				<div class="divTwoColsSplit">
					<div class="divExchangeRateLeft">
						<p>Japanese yen (¥ / 円):</p>
						<p class="countryData"><span>${data.exchangeRates.conversion_rates.JPY}</span></p>
					</div>
					<div class="divExchangeRateRight">
						<p>British pound (£):</p>
						<p class="countryData"><span>${data.exchangeRates.conversion_rates.GBP}</span></p>
					</div>
				</div>
				<div class="divTwoColsSplit">
					<div class="divExchangeRateLeft">
						<p>Swiss franc (CHF):</p>
						<p class="countryData"><span>${data.exchangeRates.conversion_rates.CHF}</span></p>
					</div>
					<div class="divExchangeRateRight">					
						<p>Renminbi (¥ / 元):</p>
						<p class="countryData"><span>${data.exchangeRates.conversion_rates.CNY}</span></p>
					</div>
				</div>
				<div class="divTwoColsSplit">
					<div class="divExchangeRateLeft">
						<p>Australian dollar (A$):</p>
						<p class="countryData"><span>${data.exchangeRates.conversion_rates.AUD}</span></p>
					</div>					
					<div class="divExchangeRateRight">
						<p>Canadian dollar (C$):</p>
						<p class="countryData"><span>${data.exchangeRates.conversion_rates.CAD}</span></p>
					</div>
				</div>
				<div class="divTwoColsSplit">
					<div class="divExchangeRateLeft">
						<p>Swedish krona (kr):</p>
						<p class="countryData"><span>${data.exchangeRates.conversion_rates.SEK}</span></p>
					</div>
					<div class="divExchangeRateRight">
						<p>Norwegian krona (kr):</p>
						<p class="countryData"><span>${data.exchangeRates.conversion_rates.NOK}</span></p>
					</div>
				</div>
				<div class="divTwoColsSplit">
					<div class="divExchangeRateLeft">
						<p>Danish krona (kr):</p>
						<p class="countryData"><span>${data.exchangeRates.conversion_rates.DKK}</span></p>
					</div>
					<div class="divExchangeRateRight">
						<p>Polish złoty (zł):</p>
						<p class="countryData"><span>${data.exchangeRates.conversion_rates.PLN}</span></p>
					</div>
				</div>
				<div class="divTwoColsSplit">
					<div class="divExchangeRateLeft">
						<p>Czech koruna (Kč):</p>
						<p class="countryData"><span>${data.exchangeRates.conversion_rates.CZK}</span></p>
					</div>					
					<div class="divExchangeRateRight">
						<p>Romanian leu (L):</p>
						<p class="countryData"><span>${data.exchangeRates.conversion_rates.RON}</span></p>
					</div>
				</div>
				<div class="divTwoColsSplit">
					<div class="divExchangeRateLeft">
						<p>Hungarian forint (Ft):</p>
						<p class="countryData"><span>${data.exchangeRates.conversion_rates.HUF}</span></p>
					</div>					
					<div class="divExchangeRateRight">
						<p>Bulgarian lev (лв):</p>
						<p class="countryData"><span>${data.exchangeRates.conversion_rates.BGN}</span></p>
					</div>
				</div>				
				`)
		}

	}

	// end of $(document).ready(function {
})



