let countries;
let currentUser;
let forbiddeanZones = ["Saint Helena, Ascension, And Tristan Da Cunha", "British Indian Ocean Territory", "European Union", "Southern Ocean"]
let colorArray = ["red", "orange", "yellow", "olive", "green", "teal", "blue", "violet", "purple", "pink"]

document.addEventListener("DOMContentLoaded", function (e) {
    let allButtons = document.querySelectorAll("button")
    allButtons.forEach(button => {
        buttonShuffle(button)
    })
})

function buttonShuffle(button) {
    const shuffled = shuffle(colorArray)
    button.className = `ui inverted ${shuffled[0]} button`
}

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
        randomCountry[1].data.government == undefined ||
        randomCountry[1].data.geography == undefined) {
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
    if (country[1].data.geography.land_boundaries.border_countries == undefined) {
        borderCountriesArray.push("no other countries.")
    }
    else {
        country[1].data.geography.land_boundaries.border_countries.forEach(country => {
            borderCountriesArray.push(country.country)
        })
    }
    let nationalAnthem;
    if (country[1].data.government.national_anthem.audio_url == undefined) {
        nationalAnthem = "none available"
    }
    else {
        nationalAnthem = `<audio controls src="${country[1].data.government.national_anthem.audio_url}"></audio>`
    }
    return {
        countryName: country[1].data.name,
        countryComparativeSize: country[1].data.geography.area.comparative,
        flagDescription: country[1].data.government.flag_description.description.split(";")[0],
        mostPopularReligion: country[1].data.people.religions.religion[0].name,
        populationRank: country[1].data.people.population.global_rank,
        countryLandBoundaries: borderCountriesArray,
        nationalAnthem: nationalAnthem,
        latitude: country[1].data.geography.geographic_coordinates.latitude.hemisphere,
        longitude: country[1].data.geography.geographic_coordinates.longitude.hemisphere
    }
}

function renderQuestion(countryFacts, json) {
    let pageContainer = document.querySelector(".pageContainer")
    pageContainer.innerHTML = ""
    let buttonArray = []
    buttonArray.push(`<button data-type="answer-button">${countryFacts.countryName}</button>`)
    i = 0
    console.log(`${countryFacts.latitude + " " + countryFacts.longitude}`)
    while (i < 3) {
        let randomCountry = getRandomCountry(json)[1].data
        if (buttonArray.includes(`<button data-type="answer-button">${randomCountry.name}</button>`) == false && !forbiddeanZones.includes(randomCountry.name) && randomCountry.geography.geographic_coordinates.latitude.hemisphere == countryFacts.latitude && randomCountry.geography.geographic_coordinates.longitude.hemisphere == countryFacts.longitude) {
            console.log(`${randomCountry.geography.geographic_coordinates.latitude.hemisphere + " " + randomCountry.geography.geographic_coordinates.longitude.hemisphere}`)
            buttonArray.push(`<button data-type="answer-button">${randomCountry.name}</button>`)
            i++
        }
    }
    buttonArray = shuffle(buttonArray)
    pageContainer.insertAdjacentHTML("beforeend",
        `<div class='questionContainer'>
        <h1> What Country am I ?</h1>
        <center>${ buttonArray.join(' ')}</center>
        <ul id="question-info">
            <p><button data-type="answer-button" disabled>I am ${countryFacts.countryComparativeSize}</button></p>
            <p><button data-type="answer-button" disabled>My Flag has ${countryFacts.flagDescription}</button></p>
            <p><button data-type="answer-button" disabled>My country's most popular religion is ${countryFacts.mostPopularReligion}</button></p>
            <p><button data-type="answer-button" disabled>The population rank of this country is #${countryFacts.populationRank}</button></p>
            <p><button data-type="answer-button" disabled>My country borders the following: ${countryFacts.countryLandBoundaries.join(", ")}</button></p>
            <p><button data-type="answer-button" disabled>My national anthem: </button><br>${countryFacts.nationalAnthem}</p>
        </ul></div>`)
    let answerButtons = document.querySelectorAll("button[data-type='answer-button']")
    answerButtons.forEach(button => {
        buttonShuffle(button)
    })
    giveAnswer(countryFacts)
}

function giveAnswer(countryFacts) {
    let questionContainer = document.querySelector(".questionContainer")
    questionContainer.addEventListener("click", function (event) {
        if (event.target.tagName == 'BUTTON') {
            if (countryFacts.countryName == event.target.innerText) {
                alert("You right")
                addPoints(currentUser)
            }
            else {
                alert("You wrong")
            }
            loadNextQuestion(countries)
        }
    })
}

function loginLogout(button) {
    if (currentUser == undefined) {
        let username = prompt("Please enter your unique username ;-)")
        fetch("https://fathomless-spire-66985.herokuapp.com/users")
            .then(res => res.json())
            .then(users => {
                users.forEach(user => {
                    if (user.name == username) {
                        addLoginInformation(user)
                    }
                })
            })
        button.innerText = "Log out"
    }
    else {
        logoutUser()
        button.innerText = "Log in"
    }
}

function logoutUser() {
    currentUser = undefined
    let usernameContainer = document.getElementById("user-id")
    let pointsContainer = document.getElementById("points-id")
    usernameContainer.innerHTML = `Username: `
    pointsContainer.innerHTML = `points: `
}

function addLoginInformation(user) {
    currentUser = user;
    let usernameContainer = document.getElementById("user-id")
    let pointsContainer = document.getElementById("points-id")
    usernameContainer.innerHTML = `Username: ${user.name}`
    pointsContainer.innerHTML = `points: ${user.total_points}`
}

function signup(button) {
    let username = prompt("Please enter a unique username ;-)")

    fetch("https://fathomless-spire-66985.herokuapp.com/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({ name: username, total_points: 0 })
    })
        .then(res => res.json())
        .then(user => {
            addLoginInformation(user)
        })
}

function addPoints(user) {
    let currentPoints = user.total_points + 10;
    fetch(`https://fathomless-spire-66985.herokuapp.com/users/${user.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({ total_points: currentPoints })
    })
        .then(res => res.json())
        .then(user => {
            addLoginInformation(user)
        })
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