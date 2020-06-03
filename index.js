const request = require('request');
const argv = require('yargs').argv;

let apiKey = 'bc5a25a6f18ee8b5a3809325e9c09594';
let city = argv.c || 'Itajuba';
let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`

request(url, function (err, response, body) {
    if (err) {
        console.log('error:', error);
    } else {
        let weather = JSON.parse(body)
        let message = `It's ${weather.main.temp} degrees in ${weather.name}!`;
        console.log(message);
    }
});