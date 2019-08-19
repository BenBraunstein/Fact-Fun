
fetch(
    "https://raw.githubusercontent.com/iancoleman/cia_world_factbook_api/master/data/factbook.json"
)
    .then(resp => resp.json())
    .then(function (json) {
        // debugger
        // console.log(Object.entries(json.countries))
        let randomCountry = getRandomCountry(json)
        // console.log(randomCountry)
        console.log(getCountryFacts(randomCountry))
    })

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomCountry(json) {
    return Object.entries(json.countries)[getRandomInteger(1, 258)]
}

function getCountryFacts(country) {
    let borderCountriesArray = []
    country[1].data.geography.land_boundaries.border_countries.forEach(country => {
        borderCountriesArray.push(country.country)
    })
    return {
        countryName: country[0],
        countryComparativeSize: country[1].data.geography.area.comparative,
        countryLandBoundaries: borderCountriesArray,
        flagDescription: country[1].data.government.flag_description.description.split(";")[0],
        mostPopularReligion: country[1].data.people.religions.religion[0].name,
        religionPercent: country[1].data.people.religions.religion[0].percent,
        populationRank: country[1].data.people.population.global_rank,
        nationalAnthem: country[1].data.government.national_anthem.audio_url
    }
}



