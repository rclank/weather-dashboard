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
const weatherDashboardEl = document.querySelector('#dashboard');

// variables
const apiKey = "b91170236f07db86ffa15047cc1bb3bb";
const usaIsoCode = '840';
let city;
let today;

// upon search
const formSubmitHandler = function(event) {
    event.preventDefault();

    // get searched city
    city = cityInputEl.value.trim();

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
    const weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${geoData[0].lat}&lon=${geoData[0].lon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`;

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
    clearWeatherElements();

    console.log('city weather', cityWeatherData);
    buildWeatherToday(cityWeatherData);

    buildForecast(cityWeatherData);
}

const buildWeatherToday = function(cityWeatherData) {
    const weatherToday = cityWeatherData.current;
    today = new Date();
    console.log('weather today', weatherToday);
    console.log(city);

    // create parent div
    const weatherTodayCardEl = document.createElement('div');
    weatherTodayCardEl.setAttribute('id', 'weather-today');

    // create header
    const headerEl = document.createElement('h2');
    headerEl.textContent = `${city} (${dateBuilder(today)})`;
    // create img element for weather icon
    const iconEl = document.createElement('img');
    iconEl.setAttribute('src', getWeatherIcon(weatherToday));
    // append icon to header
    headerEl.appendChild(iconEl);
    // append header to weather today
    weatherTodayCardEl.appendChild(headerEl);

    displayWeatherData(weatherTodayCardEl, weatherToday);

    // append to weather dashboard
    weatherDashboardEl.appendChild(weatherTodayCardEl);
}

const buildForecast = function(cityWeatherData) {
    const forecastLength = 5;

    // create header
    const forecastHeaderEl = document.createElement('h3');
    forecastHeaderEl.textContent = '5-Day Forecast:';

    // create forecast container
    const forecastEl = document.createElement('div');
    forecastEl.setAttribute('id', 'forecast');
    forecastEl.classList.add('d-flex', 'flex-wrap', 'justify-content-between');

    // loop for forecast cards
    buildDailyForecast(forecastEl, cityWeatherData, forecastLength);

    // append header to dashboard container
    weatherDashboardEl.appendChild(forecastHeaderEl);
    // append forecast container
    weatherDashboardEl.appendChild(forecastEl);
}

// to be called at the start of new weather data being processed
const clearWeatherElements = function() {
    weatherDashboardEl.innerHTML = "";
}

const dateBuilder = function(date, daysPlus = 0) {
    // not sure why setting targetDate has to be this way, but setting to just '= date' updates the global today for some reason?
    const targetDate = new Date(date);
    targetDate.setDate(targetDate.getDate() + daysPlus);

    const stringDate = targetDate.getMonth() + "/" + targetDate.getDate() + "/" + targetDate.getFullYear();
    return stringDate;
}

const getWeatherIcon = function(cityWeatherData) {
    const weatherIcon = cityWeatherData.weather[0].icon;
    return "http://openweathermap.org/img/wn/" + weatherIcon + "@2x.png";
}

const buildDailyForecast = function(parentEl = forecastEl, cityWeatherData, forecastLength = 5) {
    const dailyWeatherData = cityWeatherData.daily;

    for (let i = 0; i < forecastLength; i++) {
        const currentForecastCardEl = buildForecastCard(dailyWeatherData[i], i);
        parentEl.appendChild(currentForecastCardEl);
    }
}

const displayWeatherData = function(displayEl, cityWeatherData) {
    // create temp p
    const tempEl = document.createElement('p');
    let tempData = cityWeatherData.temp;
    if (typeof tempData === 'object') {
        tempData = cityWeatherData.temp.day;
    }
    tempEl.textContent = 'Temp: ' + tempData + '°F';

    // create wind p
    const windEl = document.createElement('p');
    windEl.textContent = 'Wind: ' + cityWeatherData.wind_speed + ' MPH';

    // create humidity p
    const humidityEl = document.createElement('p');
    humidityEl.textContent = 'Humidity: ' + cityWeatherData.humidity + '%';

    // append above elements
    displayEl.append(tempEl, windEl, humidityEl);

    // conditional for today vs forecast
    if (displayEl.getAttribute('id') === 'weather-today') {
        const uviEl = document.createElement('p');
        uviEl.textContent = 'UV Index: ' + cityWeatherData.uvi;
        displayEl.appendChild(uviEl);
    } else {
        const iconEl = document.createElement('img');
        iconEl.setAttribute('src', getWeatherIcon(cityWeatherData));
        // append as first child
        displayEl.insertBefore(iconEl, tempEl);
    }
}

const buildForecastCard = function(cityWeatherData, daysPlus = 0) {
    const forecastCardEl = document.createElement('div');
    forecastCardEl.classList.add('forecast-card');

    // create and append card date headers
    const headerDateEl = document.createElement('h4');
    headerDateEl.textContent = dateBuilder(today, daysPlus);
    forecastCardEl.appendChild(headerDateEl);

    // get weather data
    displayWeatherData(forecastCardEl, cityWeatherData);

    return forecastCardEl;
}

// call getCityWeather on most recent city, or feed city if none
// this will be to initialize page