let countries
let currentUser
let topThreeUsers
let allUsers
let forbiddeanZones = [
  "Saint Helena, Ascension, And Tristan Da Cunha",
  "British Indian Ocean Territory",
  "European Union",
  "Southern Ocean"
]
let colorArray = [
  "red",
  "orange",
  "yellow",
  "olive",
  "green",
  "teal",
  "blue",
  "violet",
  "purple",
  "pink"
]

document.addEventListener("DOMContentLoaded", function(e) {
  let allButtons = document.querySelectorAll("button")
  allButtons.forEach(button => {
    buttonShuffle(button)
  })
  alert("You must login to see a question")
})

function fetchCountries() {
  fetch(
    "https://raw.githubusercontent.com/iancoleman/cia_world_factbook_api/master/data/factbook.json"
  )
    .then(resp => resp.json())
    .then(function(json) {
      countries = json
      loadNextQuestion(countries)
    })
}

function buttonShuffle(button) {
  const shuffled = shuffle(colorArray)
  button.className = `ui inverted ${shuffled[0]} button`
}

function factButtonShuffle(p) {
  const shuffled = shuffle(colorArray)
  p.className = `ui ${shuffled[0]} basic button`
}

function loadNextQuestion(countries) {
  grabTopThreeUsers()
  let randomCountry = getRandomCountry(countries)
  while (validQuestion(randomCountry) == false) {
    randomCountry = getRandomCountry(countries)
  }
  renderQuestion(getCountryFacts(randomCountry), countries)
}

function validQuestion(randomCountry) {
  if (
    randomCountry[1].data.government.flag_description == undefined ||
    randomCountry[1].data.people == undefined ||
    randomCountry[1].data.people.population == undefined ||
    randomCountry[1].data.people.population.global_rank == undefined ||
    randomCountry[1].data.people.religions == undefined ||
    randomCountry[1].data.people.religions.religion[0].name == undefined ||
    randomCountry[1].data.government == undefined ||
    randomCountry[1].data.geography == undefined
  ) {
    return false
  } else {
    return true
  }
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomCountry(json) {
  return Object.entries(json.countries)[getRandomInteger(1, 258)]
}

function getCountryFacts(country) {
  let borderCountriesArray = []
  if (country[1].data.geography.land_boundaries.border_countries == undefined) {
    borderCountriesArray.push("no other countries.")
  } else {
    country[1].data.geography.land_boundaries.border_countries.forEach(
      country => {
        borderCountriesArray.push(country.country)
      }
    )
  }
  let nationalAnthem
  if (country[1].data.government.national_anthem.audio_url == undefined) {
    nationalAnthem = "none available"
  } else {
    nationalAnthem = `<audio controls src="${
      country[1].data.government.national_anthem.audio_url
    }"></audio>`
  }
  return {
    countryName: country[1].data.name,
    countryComparativeSize: country[1].data.geography.area.comparative,
    flagDescription: country[1].data.government.flag_description.description.split(
      ";"
    )[0],
    mostPopularReligion: country[1].data.people.religions.religion[0].name,
    populationRank: country[1].data.people.population.global_rank,
    countryLandBoundaries: borderCountriesArray,
    nationalAnthem: nationalAnthem,
    latitude:
      country[1].data.geography.geographic_coordinates.latitude.hemisphere,
    longitude:
      country[1].data.geography.geographic_coordinates.longitude.hemisphere
  }
}

function renderQuestion(countryFacts, json) {
  let pageContainer = document.querySelector(".pageContainer")
  pageContainer.innerHTML = ""
  let buttonArray = []
  buttonArray.push(
    `<button data-type="answer-button">${countryFacts.countryName}</button>`
  )
  i = 0
  while (i < 3) {
    let randomCountry = getRandomCountry(json)[1].data
    if (
      buttonArray.includes(
        `<button data-type="answer-button">${randomCountry.name}</button>`
      ) == false &&
      !forbiddeanZones.includes(randomCountry.name) &&
      randomCountry.geography.geographic_coordinates.latitude.hemisphere ==
        countryFacts.latitude &&
      randomCountry.geography.geographic_coordinates.longitude.hemisphere ==
        countryFacts.longitude
    ) {
      buttonArray.push(
        `<button data-type="answer-button">${randomCountry.name}</button>`
      )
      i++
    }
  }
  buttonArray = shuffle(buttonArray)

  // prettier-ignore
  pageContainer.insertAdjacentHTML("beforeend",
        `<div class='questionContainer'>
        <div class="marquee">
        <div class="marquee1">
        <p style='color: #D6AF36'>First: ${allUsers[0].name} (${allUsers[0].total_points})</p>
        <p style='color: #A7A7AD'>Second: ${allUsers[1].name} (${allUsers[1].total_points})</p>
        <p style='color: #A77044'>Third: ${allUsers[2].name} (${allUsers[2].total_points})</p>
        </div></div>
        <br><p class='facts'>WHAT COUNTRY AM I ?</p><br>
        <center>${ buttonArray.join(' ')}</center>
        <ul id="question-info">
            <p class='facts'><--------use the facts below to help you make a guess--------></p>
            <p class='facts'>I am ${countryFacts.countryComparativeSize}</p>
            <p class='facts'>My Flag has ${countryFacts.flagDescription}</p>
            <p class='facts'>The average religious person in my country is ${countryFacts.mostPopularReligion}</p>
            <p class='facts'>The population rank of this country is #${countryFacts.populationRank}</p>
            <p class='facts'>My country borders the following: ${countryFacts.countryLandBoundaries.join(", ")}</p>
        <p class='facts'>My national anthem: <br><br>${countryFacts.nationalAnthem}</p>
        </ul></div > `)
  let answerButtons = document.querySelectorAll(
    "button[data-type='answer-button']"
  )
  answerButtons.forEach(button => {
    buttonShuffle(button)
  })
  const allPs = document.querySelectorAll("p.facts")
  allPs.forEach(p => {
    factButtonShuffle(p)
  })
  giveAnswer(countryFacts)
}

function giveAnswer(countryFacts) {
  let questionContainer = document.querySelector(".questionContainer")
  questionContainer.addEventListener("click", function(event) {
    if (event.target.tagName == "BUTTON") {
      if (countryFacts.countryName == event.target.innerText) {
        alert("You right")
        addPoints(currentUser)
      } else {
        alert(`"You wrong! The correct answer was ${countryFacts.countryName}"`)
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
        allUsers = users
        currentUser = users.find(user => user.name == username)
        if (currentUser == undefined) {
          alert("Please try login again.")
        } else {
          grabTopThreeUsers()
          addLoginInformation(currentUser)
          button.innerText = "Log out"
          fetchCountries()
        }
      })
  } else {
    logoutUser()
    button.innerText = "Log in"
  }
}

function grabTopThreeUsers() {
  fetch("https://fathomless-spire-66985.herokuapp.com/users")
    .then(res => res.json())
    .then(users => {
      allUsers = users
    })
  topThreeUsers = allUsers.slice(0, 3)
}

function logoutUser() {
  currentUser = undefined
  let usernameContainer = document.getElementById("user-id")
  let pointsContainer = document.getElementById("points-id")
  usernameContainer.innerHTML = `Username: `
  pointsContainer.innerHTML = `points: `
  let questionContainer = document.querySelector(".questionContainer")
  questionContainer.innerHTML = ""
}

function addLoginInformation(user) {
  grabTopThreeUsers()
  currentUser = user
  let usernameContainer = document.getElementById("user-id")
  let pointsContainer = document.getElementById("points-id")
  usernameContainer.innerHTML = `Username: ${user.name}`
  pointsContainer.innerHTML = `points: ${user.total_points}`
}

function signup() {
  let username = prompt("Please enter a unique username ;-)")
  if (username != null && username != undefined) {
    fetch("https://fathomless-spire-66985.herokuapp.com/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ name: username, total_points: 0 })
    })
      .then(res => res.json())
      .then(user => {
        if (user.id == null) {
          alert("username already taken")
        } else {
          addLoginInformation(user)
          let loginButton = document.getElementById("login-btn")
          loginButton.innerText = "Log out"
          fetchCountries()
        }
      })
  }
}

function addPoints(user) {
  let currentPoints = user.total_points + 10
  fetch(`https://fathomless-spire-66985.herokuapp.com/users/${user.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ total_points: currentPoints })
  })
    .then(res => res.json())
    .then(user => {
      addLoginInformation(user)
    })
}

var shuffle = function(array) {
  var currentIndex = array.length
  var temporaryValue, randomIndex
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }
  return array
}
