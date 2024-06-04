function renderCountryDataInModal(data) {
    console.log(data);
    $("#countryName1").text(data.name);
    $("#countryName2").text(`(${data.altSpellings[data.altSpellings.length - 1]})`);
    $("#countryFlag").html(`<img src="${data.flag}"/>`);
    $("#countryCoatOfArms").html(`<img src="${data.coatOfArms}"/>`);
    $("#countryArea").html(`<span>${Intl.NumberFormat('de-DE').format(data.area)} km&#178;</span>`);
    $("#countryPopulation").html(`<span>${Intl.NumberFormat('de-DE').format(data.population)}`);
    $("#countryCapital").html(`<span>${data.capital}</span>`);
    $("#countryTLD").html(`<span>${data.tld}</span>`);
}