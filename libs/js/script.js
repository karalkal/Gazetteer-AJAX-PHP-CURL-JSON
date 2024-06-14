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

	infoBtn1.addTo(map);
	infoBtn2.addTo(map);
	infoBtn3.addTo(map);
	infoBtn4.addTo(map);

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
				timeFrame: "2020:2024"
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
				timeFrame: "2020:2024"
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
				timeFrame: "1991:2024"			// for education since 1991, as less data is available
			}),

			success: function (result) {
				renderCountryDataInModal(result.data, "education");
			},

			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown)
			}
		});
	}


	function renderCountryDataInModal(data, dataType) {
		if (dataType === "essential") {
			$(".modal-body").html(`
				<div class="divNames">
					<h3 id="countryName1">${data.name}</h3>
					<h4 id="countryName2">(${data.altSpellings[data.altSpellings.length - 1]})</h4>
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
					<div class="divCountryInfo">
						<p>Area:</p>
						<p class="countryData"><span>${Intl.NumberFormat('de-DE').format(data.area)} km&#178;</span></p>
					</div>
					<div class="divCountryInfo">
						<p>Population:</p>
						<p class="countryData"><span>${Intl.NumberFormat('de-DE').format(data.population)}</span></p>
					</div>
				</div>

				<div class="divTwoCols">
					<div class="divCountryInfo">
						<p>Capital:</p>
						<p class="countryData"><span>${data.capital}</span></p>
					</div>
					<div class="divCountryInfo">
						<p>TLD:</p>
						<p class="countryData"><span>${data.tld}</p>
					</div>
				</div>
				`)
		}

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
						value: reading.value
					};
				};
			}
			// console.log("mostRecentData:\n", mostRecentData);

			$(".modal-body").html(`
				<div class="divNames">
					<h4 id="countryName2">${mostRecentData.countryName || "Country not in DB"} (${mostRecentData.countryId || "N.A."})</h4>
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
				`)
		}

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
				// "SE.ENR.PRSC.FM.ZS": { value: "N.A.", year: "no recent data is available" },	// "School enrollment, primary and secondary (gross), gender parity index (GPI)"
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
						value: reading.value
					};
				};
			}
			$(".modal-body").html(`
				<div class="divNames">
					<h4 id="countryName2">${mostRecentData.countryName || "Country not in DB"} (${mostRecentData.countryId || "N.A."})</h4>
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
				console.log(reading)
				// For each indicator API returns the most recent data as first result
				// Hence if value in mostRecentData is no longer "N.A." we already have record => ignore next readings for this indicator
				// Sometimes value === null, write data only of value is not null. Get year of reading as well
				if (mostRecentData[reading.indicator.id].value === "N.A." && reading.value) {
					mostRecentData[reading.indicator.id] = {
						indicatorName: reading.indicator.value,
						year: reading.date,
						value: reading.value
					};
				};
			}
			$(".modal-body").html(`
				<div class="divNames">
					<h4 id="countryName2">${mostRecentData.countryName || "Country not in DB"} (${mostRecentData.countryId || "N.A."})</h4>
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

	}

	// end of $(document).ready(function {
})



