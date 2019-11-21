var schedule = require('node-schedule');
var User = require('../models/user');
var retrieveExerciseData = require('./sources/exercise-dot-com').retrieveExerciseData;
var log = require('./logger');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var request = require('request-promise');
var cheerio = require('cheerio');
var ExerciseDotCom = require('../models/sources/exercise-dot-com');


process.argv.forEach(function (element) {
	if (element === '--force') {
		getUserData();
	}
});

// Run every hour
schedule.scheduleJob({ minute: [0, 20,40] }, function () {
	log.info('Updating User data');
	getUserData();
});

//Run Weekly at 10.30am on a Friday ([minute] [hour] [day of month] [month] [day of week] )
schedule.scheduleJob('30 10 * * 5', function () {
	log.info('Updating User data');
	getAllUserData();
});

function getUserData() {
	log.info('Attempting to find user data');
	User.find({
		lastPlayed: {
			'$gt': Date.now() - 1000 * 60 * 60 * 24 * 7 // Has played in the last week.
		}
	},
	async(function (err, users) {
		if (err) {
			log.error(err);
		} else {
			for (userid of users){
				console.log(JSON.stringify(userid));
				// If user has exercise.com credentials, run casper.
				if (userid.credentials.exerciseDotCom.username && userid.credentials.exerciseDotCom.plainPassword) {
					var email = userid.email;
					var username = userid.credentials.exerciseDotCom.username;
					var password = userid.credentials.exerciseDotCom.plainPassword;
					log.debug('User found with credentials, retrieving exercise data');
					var j = request.jar();
					request = request.defaults({jar: j});
					try{
						var response = await(request.get({url:"https://www.exercise.com/users/sign_in",simple:false, resolveWithFullResponse: true}));
						if (response.statusCode == 200) {
							log.info("https://www.exercise.com/users/sign_in, successfully loaded, retrieving authenticity token.");
							// Parse the returned HTML to find the authenticity token and return that value.
							$ = cheerio.load(response.body);
							log.debug($("input[name='authenticity_token']").attr('value'));
							// Send Post request to the page.
							response =  await(request.post({url:'https://www.exercise.com/users/sign_in', formData: {
								"utf8": "?",
								"authenticity_token": $("input[name='authenticity_token']").attr('value'),
								"user[email]": username,
								"user[password]": password,
								"user[remember_me]" : 0,
								"commit": "Log In"
							},simple: false, resolveWithFullResponse: true}));
							if(response.statusCode == 200 || 302){
								$ = cheerio.load(response.body);
								if ($("a").attr('href') == "https://www.exercise.com/dashboard") {
									log.info("User: " + username + ", successfully authenticated on exercise.com");
									// Retrieve user workouts.
									response = await(request.get({url: "https://www.exercise.com/api/v2/workouts?all_fields=true", header: response.headers, simple:false, resolveWithFullResponse: true }));
									log.debug(response.statusCode);
									if (response.statusCode == 200 || 304) {
										// Parse the JSON into the object.
										log.debug(response.body);
										var retrievedData = JSON.parse(response.body);
										if (retrievedData.hasOwnProperty('error')) {
											log.error(retrievedData.error);
										} else {
											log.info('Data successfully retrieved');
											// Store the information.
											saveData(email, retrievedData);
										}
									} else if (response.statusCode == 401) {
										log.error("Unable to get workouts. Error 401, Unauthorized Access.");
									}
								} else {
									log.error("Unable to authenticate user: 2" + username);
								}
							} else {
								log.error("Unable to authenticate user: 1" + username);
							}
						} else {
							log.error("Error connecting to exercise.com: "+response.statusCode);
						}
					}catch(err){
						log.debug(err);
					}
				} else {
					//temp
					log.warn(`User: ${user_name.email} has no exercise.com credentials`);
				}
			}
		}
	}));
}

function getAllUserData() {
	log.info('Attempting to find user data for All Users');
	User.find({
		lastPlayed: {
			'$gt': 0 // Has played ever.
		}
	},
	function (err, users) {
		if (err) {
			log.error(err);
		} else {
			log.debug('Running weekly fetch of all user data');
			for (userid of users){
				log.debug(JSON.stringify(userid));
				// If user has exercise.com credentials, run casper.
				if (userid.credentials.exerciseDotCom.username && userid.credentials.exerciseDotCom.plainPassword) {
					var email = userid.email;
					var username = userid.credentials.exerciseDotCom.username;
					var password = userid.credentials.exerciseDotCom.plainPassword;
					log.debug('User found with credentials, retrieving exercise data');
					var j = request.jar();
					request = request.defaults({jar: j});
					try{
						var response = await(request.get({url:"https://www.exercise.com/users/sign_in",simple:false, resolveWithFullResponse: true}));
						if (response.statusCode == 200) {
							log.info("https://www.exercise.com/users/sign_in, successfully loaded, retrieving authenticity token.");
							// Parse the returned HTML to find the authenticity token and return that value.
							$ = cheerio.load(response.body);
							log.debug($("input[name='authenticity_token']").attr('value'));
							// Send Post request to the page.
							response =  await(request.post({url:'https://www.exercise.com/users/sign_in', formData: {
								"utf8": "?",
								"authenticity_token": $("input[name='authenticity_token']").attr('value'),
								"user[email]": username,
								"user[password]": password,
								"user[remember_me]" : 0,
								"commit": "Log In"
							},simple: false, resolveWithFullResponse: true}));
							if(response.statusCode == 200 || 302){
								$ = cheerio.load(response.body);
								if ($("a").attr('href') == "https://www.exercise.com/dashboard") {
									log.info("User: " + username + ", successfully authenticated on exercise.com");
									// Retrieve user workouts.
									response = await(request.get({url: "https://www.exercise.com/api/v2/workouts?all_fields=true", header: response.headers, simple:false, resolveWithFullResponse: true }));
									log.debug(response.statusCode);
									if (response.statusCode == 200 || 304) {
										// Parse the JSON into the object.
										log.debug(response.body);
										var retrievedData = JSON.parse(response.body);
										if (retrievedData.hasOwnProperty('error')) {
											log.error(retrievedData.error);
										} else {
											log.info('Data successfully retrieved');
											// Store the information.
											saveData(email, retrievedData);
										}
									} else if (response.statusCode == 401) {
										log.error("Unable to get workouts. Error 401, Unauthorized Access.");
									}
								} else {
									log.error("Unable to authenticate user: 2" + username);
								}
							} else {
								log.error("Unable to authenticate user: 1" + username);
							}
						} else {
							log.error("Error connecting to exercise.com: "+response.statusCode);
						}
					}catch(err){
						log.debug(err);
					}
				} else {
					//temp
					log.warn(`User: ${user_name.email} has no exercise.com credentials`);
				}
			}
		}
	});
}

function getUserDataByEmail(email, callback) {
	log.info('finding user data using email');
	User.findOne({ email: email }, function (err, user) {
		log.info('Grabbed data for ' + email); // TODO Remove
		if (err) {
			log.error(err);
		} else {
			// If user has exercise.com credentials, run casper.retrieveExerciseDataretrieveExerciseData
			if (user.credentials.exerciseDotCom.username && user.credentials.exerciseDotCom.plainPassword) {
				retrieveExerciseData(user.email, user.credentials.exerciseDotCom.username, user.credentials.exerciseDotCom.plainPassword, callback);
			} else {
				//temp
				log.warn(`User: ${user.email} has no exercise.com credentials`);
			}
		}
	});
}

module.exports = function (email, callback) {
	getUserDataByEmail(email, callback);
};

function saveData(email, data) {
	for (var i = 0; i < data.length; i++) {
		saveWorkout(email, data[i]);
	}
}

function saveWorkout(email, data) {
	ExerciseDotCom.count({ userEmail: email, workoutId: data.id }, function (err, count) {
		if (err) {
			log.error(err);
		} else if (count === 0) {
			// If workout is new, save to DB.
			var newData = new ExerciseDotCom({
				workoutId: data.id,
				data: data,
				dateRetrieved: Date.now(),
				gamesUsed: [],
				userEmail: email
			});

			newData.save(function (err) {
				if (err) {
					log.error(err);
				} else {
					log.info("New workout saved for user: " +  email);
					log.info(JSON.stringify(newData));
				}
			});
		}
	});
}

getUserData();