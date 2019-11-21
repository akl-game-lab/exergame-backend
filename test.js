var schedule = require('node-schedule');
var User = require('./models/user');
var retrieveExerciseData = require('./misc/sources/exercise-dot-com').retrieveExerciseData;
var log = require('./misc/logger');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var request = require('request-promise');
var cheerio = require('cheerio');
var ExerciseDotCom = require('./models/sources/exercise-dot-com');

function getUserData() {
	console.log('Attempting to find user data');
	User.find({
		lastPlayed: {
			'$gt': Date.now() - 1000 * 60 * 60 * 24 * 7 // Has played in the last week.
		}
	},
	(function (err, users) {
		console.log("hi");
		if(err){
			console.log(err);
		}
	}));
}

getUserData();