let countries;
let currentUser;

fetch(
    "https://raw.githubusercontent.com/iancoleman/cia_world_factbook_api/master/data/factbook.json"
)
    .then(resp => resp.json())
    .then(function (json) {
        countries = json;
        console.log(json)
        loadNextQuestion(countries)
    })

function loadNextQuestion(countries) {
    let randomCountry = getRandomCountry(countries)
    while (validQuestion(randomCountry) == false) {
        randomCountry = getRandomCountry(countries)
    }
    renderQuestion(getCountryFacts(randomCountry), countries)
}

function validQuestion(randomCountry) {
    console.log(randomCountry)
    if (randomCountry[1].data.government.flag_description == undefined ||
        randomCountry[1].data.people == undefined ||
        randomCountry[1].data.people.population == undefined ||
        randomCountry[1].data.people.population.global_rank == undefined ||
        randomCountry[1].data.people.religions == undefined ||
        randomCountry[1].data.people.religions.religion[0].name == undefined ||
        randomCountry[1].data.government == undefined) {
        return false
    }
    else {
        return true
    }
}

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomCountry(json) {
    return Object.entries(json.countries)[getRandomInteger(1, 258)]
}

function getCountryFacts(country) {

    let borderCountriesArray = []
    // debugger
    if (country[1].data.geography.land_boundaries.border_countries == undefined) {
        borderCountriesArray.push("no other countries.")
    }
    else {
        country[1].data.geography.land_boundaries.border_countries.forEach(country => {
            borderCountriesArray.push(country.country)
        })
    }
    return {
        countryName: country[1].data.name,
        countryComparativeSize: country[1].data.geography.area.comparative,
        flagDescription: country[1].data.government.flag_description.description.split(";")[0],
        mostPopularReligion: country[1].data.people.religions.religion[0].name,
        populationRank: country[1].data.people.population.global_rank,
        countryLandBoundaries: borderCountriesArray,
        nationalAnthem: country[1].data.government.national_anthem.audio_url
    }
}

function renderQuestion(countryFacts, json) {
    let pageContainer = document.querySelector(".pageContainer")
    pageContainer.innerHTML = ""
    let buttonArray = []
    buttonArray.push(`<button>${countryFacts.countryName}</button>`)
    i = 0
    while (i < 3) {
        let randomCountryName = getRandomCountry(json)[1].data.name
        if (randomCountryName != countryFacts.countryName) {
            buttonArray.push(`<button>${randomCountryName}</button>`)
            i++
        }
    }
    buttonArray = shuffle(buttonArray)
    pageContainer.insertAdjacentHTML("beforeend",
        `<div class='questionContainer'><h1> What Country am I ?</h1 >
        <ul>
            <li>I am ${countryFacts.countryComparativeSize}</li>
            <li>My Flag has ${countryFacts.flagDescription}</li>
            <li>My country's most popular religion is ${countryFacts.mostPopularReligion}</li>
            <li>The population rank of this country is #${countryFacts.populationRank}</li>
            <li>My country borders the following: ${countryFacts.countryLandBoundaries.join(", ")}</li>
        </ul>
        ${buttonArray.join(' ')}</div>`)
    giveAnswer(countryFacts)
}

function giveAnswer(countryFacts) {
    let questionContainer = document.querySelector(".questionContainer")
    questionContainer.addEventListener("click", function (event) {
        if (event.target.tagName == 'BUTTON') {
            if (countryFacts.countryName == event.target.innerText) {
                alert("You right")
            }
            else {
                alert("You wrong")
            }
            loadNextQuestion(countries)
        }
    })
}

function login(button) {
    let username = prompt("Please enter your unique username ;-)")
    console.log(username)
    fetch("http://localhost:3000/users")
        .then(res => res.json())
        .then(users => {
            users.forEach(user => {
                if (user.name == username) {
                    addLoginInformation(user)
                }
            })
        })
}

function addLoginInformation(user) {
    currentUser = user;
    let usernameContainer = document.getElementById("user-id")
    let pointsContainer = document.getElementById("points-id")
    usernameContainer.innerHTML = `username: ${user.name}`
    pointsContainer.innerHTML = `points: ${user.total_points}`
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