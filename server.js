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
app.get('/yelp', getYelp)
app.get('/movies', getMovies)

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

function getYelp(request, response) {
    return searchYelp(request.query.data)
    .then(yelpData => {
    response.send(yelpData);
    })
}

function getMovies(request, response) {
    return searchMovies(request.query.data)
    .then(movieData => {
    reponse.send(movieData);
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

function ResRec(yelp) {
    this.name = yelp.name;
    this.image_url = yelp.image_url;
    this.price = yelp.price;
    this.rating = yelp.rating;
    this.url = yelp.url;
}

function Movies(movies) {
    this.title = movies.title;
    console.log(movies.title);
    this.overview = movies.overview;
    this.average_votes = movies.average_votes;
    this.total_votes = movies.total_votes;
    this.image_url = movies.image_url;
    this.popularity = movies.popularity;
    this.released_on = movies.released_on;
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
    .catch(err => console.error(err));
}

function  searchYelp(query) {
    const url = `https://api.yelp.com/v3/businesses/search?latitude=${query.latitude}&longitude=${query.longitude}`;
    return superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then( result => {
        let recommendations = result.body.businesses;
        return recommendations (restaurant => {
            let resRec = new ResRec(restaurant);
            return resRec;
        })
    })
    .catch(err => console.error(err));
}

function searchMovies(query) {
    const url=`https://api.themoviedb.org/3/movie/76341?api_key=${process.env.MOVIES_API_KEY}&query=${query.short_name}`;
    return superagent.get(url)
    .then(result => {
        let recommendations = result.movies;
        console.log(result.movies);
        return recommendations.map(movies => {
            let movie = new Movies(movies);
            return movie;
        })
    })
    .catch(err => console.error(err));
}
//Give Error Messages if incorrect

app.get('/*', function(req, res) {
  res.status(404).send ('you are in the wrong place');
});

app.listen(PORT, () => {
  console.log(`app is up on port: ${PORT}`);
});