'use strict';

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

// env vars:
require('dotenv').config();

//takes from a .env file and then the terminal environment
const PORT = process.env.PORT || 3000;

// app
const app = express();
app.use(cors());

//Routes
app.get('/location', getLocation)
app.get('/weather', getWeather)

// Handlers

function getLocation(request, response) {
    return searchToLatLong(request.query.data)
    .then(locationData => {
        response.send(locationData);
    })
}

function getWeather(request, response) {
    return searchWeather(request.query.data)
    .then(weatherData => {
    response.send(weatherData);
    })
}

// Constructors
function Location(location){
    this.formatted_query = location.formatted_address;
    this.latitude = location.geometry.location.lat;
    this.longitude = location.geometry.location.lng;
  }

function Weather(weather) {
    this.forecast = weather.summary;
    this.time = new Date(weather.time * 1000).toDateString();
}

// Search for Resource

function searchToLatLong(query) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
    return superagent.get(url)
    .then(geoData => {
        const location = new Location(geoData.body.results[0]);
        return location;
    })
    .catch(err => console.error(err));
}

function searchWeather(query) {
  console.log(query);
    const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${query.latitude},${query.longitude}`;
    return superagent.get(url)
    .then( result => {
        let dayWeather = result.body.daily.data;
        return dayWeather.map( day => {
            let weather = new Weather(day);
            return weather;
        })
    })
}



//Give Error Messages if incorrect

app.get('/*', function(req, res) {
  res.status(404).send ('you are in the wrong place');
});

app.listen(PORT, () => {
  console.log(`app is up on port: ${PORT}`);
});