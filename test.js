
fetch(
    "https://raw.githubusercontent.com/iancoleman/cia_world_factbook_api/master/data/factbook.json"
)
    .then(resp => resp.json())
    .then(function (json) {
        // debugger
        // console.log(Object.entries(json.countries))
        let randomCountry = getRandomCountry(json)
        // console.log(randomCountry)
        // console.log(getCountryFacts(randomCountry))
        renderQuestion(getCountryFacts(randomCountry), json)
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
        countryName: country[1].data.name,
        countryComparativeSize: country[1].data.geography.area.comparative,
        flagDescription: country[1].data.government.flag_description.description.split(";")[0],
        mostPopularReligion: country[1].data.people.religions.religion[0].name,
        religionPercent: country[1].data.people.religions.religion[0].percent,
        populationRank: country[1].data.people.population.global_rank,
        countryLandBoundaries: borderCountriesArray,
        nationalAnthem: country[1].data.government.national_anthem.audio_url
    }
}

function renderQuestion(countryFacts, json) {
    console.log(countryFacts)
    let questionContainer = document.querySelector(".questionCard")
    let buttonArray = []
    buttonArray.push(`<button onclick='questionAnswered(this)'>${countryFacts.countryName}</button>`)
    for (let i = 0; i < 3; i++) {
        let randomCountryName = getRandomCountry(json)[1].data.name
        buttonArray.push(`<button onclick='questionAnswered(this)'>${randomCountryName}</button>`)
    }
    buttonArray = shuffle(buttonArray)
    questionContainer.insertAdjacentHTML("beforeend",
        `<h1> What Country am I ?</h1 >
        <ul>
            <li>I am ${countryFacts.countryComparativeSize}</li>
            <li>My Flag has ${countryFacts.flagDescription}</li>
            <li>${countryFacts.religionPercent}% of my country is ${countryFacts.mostPopularReligion}</li>
            <li>The population rank of this country is #${countryFacts.populationRank}</li>
            <li>My country borders the following: ${countryFacts.countryLandBoundaries.join(", ")}</li>
        </ul>
        ${buttonArray.join(' ')}`)
}

function questionAnswered(button) {
    console.log(button)
}


var shuffle = function (array) {
    var currentIndex = array.length;
    var temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
};