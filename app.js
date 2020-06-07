const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
const request = require('request');
const _ = require("lodash");

// set database
let db = config.database;
db = (process.env.NODE_ENV === 'test') ? config.testdatabase : config.database;

// connect to database
mongoose.connect(db);

// on connection
mongoose.connection.on('connected', () => {
    console.log('connected to database ' + db);
});

// on error
mongoose.connection.on('error', (err) => {
    console.log('database error ' + err);
});

var Schema = mongoose.Schema;

const app = express();

const logs = require('./routes/log');

// Port number
const port = process.env.PORT || 3000;

// CORS middleware
app.use(cors());

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware
app.use(bodyParser.json());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.use('/logs', logs);

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

const apiKey = 'bc5a25a6f18ee8b5a3809325e9c09594';
var logSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        required: true
    }
});
//schema para mongoose
var Logs = mongoose.model('Logs', logSchema);
app.get('/', function(req, res, next) {
    Logs.find({}, function(err, results) {
        var findLimits = results.sort(compare).slice(0, 5)
        var aux = _.countBy(results, 'name')
        var t = Object.keys(aux).sort(function(a, b) { return aux[b] - aux[a] }).slice(0, 5)
        console.log(t)

        var findHistorys = t.map((str, index) => ({ name: str }));
        res.render('index', { findLimits: findLimits, findHistorys: findHistorys, weather: null, error: null });
    });
})

function compare(a, b) {
    var dateA = new Date(a.created_at).getTime();
    var dateB = new Date(b.created_at).getTime();
    return dateA < dateB ? 1 : -1;
}


app.post('/', function(req, res) {
    let city = req.body.city;
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`

    request(url, function(err, response, body) {
        if (err) {

            Logs.find({}, function(err, results) {
                var findLimits = []
                var findHistorys = []
                if (results != null) {
                    var findLimits = results.sort(compare).slice(0, 5)
                    var aux = _.countBy(results, 'name')
                    var t = Object.keys(aux).sort(function(a, b) { return aux[b] - aux[a] }).slice(0, 5)
                    console.log(t)

                    var findHistorys = t.map((str, index) => ({ name: str }));
                }
                res.render('index', { findLimits: findLimits, findHistorys: findHistorys, weather: null, error: 'Error, please try again' });
            });

        } else {

            let weather = JSON.parse(body)
            weather.created_at = new Date;
            if (weather.main == undefined) {

                Logs.find({}, function(err, results) {
                    var findLimits = []
                    var findHistorys = []
                    if (results != null) {
                        var findLimits = results.sort(compare).slice(0, 5)
                        var aux = _.countBy(results, 'name')
                        var t = Object.keys(aux).sort(function(a, b) { return aux[b] - aux[a] }).slice(0, 5)
                        console.log(t)

                        var findHistorys = t.map((str, index) => ({ name: str }));
                    }
                    res.render('index', { findLimits: findLimits, findHistorys: findHistorys, weather: null, error: 'Error, please try again' });
                });

            } else {
                Logs.find({}, function(err, results) {
                    var findLimits = results.sort(compare).slice(0, 5)
                    var aux = _.countBy(results, 'name')
                    var t = Object.keys(aux).sort(function(a, b) { return aux[b] - aux[a] }).slice(0, 5)
                    console.log(t)

                    var findHistorys = t.map((str, index) => ({ name: str }));
                    res.render('index', { findLimits: findLimits, findHistorys: findHistorys, weather: weather, error: null });
                });
                var myData = new Logs(weather);
                myData.save();
            }
        }
    });
})

app.listen(3000, function() {})