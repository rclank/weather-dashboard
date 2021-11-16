// upon page load
// page checks localstorage for stored searches
// loads these to search history buttons
// maybe loads most recent search by default? this would require pinging api

// upon search click
// ping api with search term
// return data plugged in to appropriate elements

// DOM elements
const searchFormEl =  document.querySelector('#search-form');
const cityInputEl = document.querySelector('#search');

// variables
const apiKey = "b91170236f07db86ffa15047cc1bb3bb";
const usaIsoCode = '840';

// upon search
const formSubmitHandler = function(event) {
    event.preventDefault();

    // get searched city
    let city = cityInputEl.value.trim();

    if (city) {
        getCityWeather(city);
        cityInputEl.value = "";
    } else {
        window.alert("Please enter a city!");
    }
}

searchFormEl.addEventListener("submit", formSubmitHandler);

const getCityWeather = function(city) {
    // i tried to assign to variable originally, but learned this does not work with promises/async functions
    // even if i declared the variable first, seemed like the async took too long
    // let coordinates;
    // const coordinates = geocodeSearch(city);
    geocodeSearch(city);


    console.log(city);
}

const geocodeSearch = async function(searchInput) {
    // try as i might, i could not get the api url to work according to documentation
    // it accepts 2 more parameters, state code and country code, but neither seemed to affect output?
    const geoApiUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + searchInput + "&appid=" + apiKey;

    fetch(geoApiUrl)
        .then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    if (data.length > 0) {
                        // returning does not work due to async nature
                        // return {lat: data[0].lat, lon: data[0].lon};
                        checkWeather(data);
                    } else {
                        alert("City not found");
                    }
                })
            } else {
                alert("Bad api url. Please try again!");
            }
        })
        .catch(function(error) {
            alert("Unable to connect to OpenWeatherMap: " + error);
        })
}

const checkWeather = function(geoData) {
    console.log(geoData);
    const weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${geoData[0].lat}&lon=${geoData[0].lon}&exclude=minutely,hourly,alerts&appid=${apiKey}`;

    fetch(weatherUrl)
        .then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    // call next function
                    buildDashboard(data);
                });
            } else {
                alert("Bad api url. Please try again!");
            }
        }).catch(function(error) {
            alert("Unable to connect to OpenWeatherMap: " + error);
        })
}

const buildDashboard = function(cityWeatherData) {
    console.log('buildDashboard', cityWeatherData);

}