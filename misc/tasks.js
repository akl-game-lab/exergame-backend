var schedule = require('node-schedule');
var User = require('../models/user');
var retrieveExerciseData = require('./sources/exercise-dot-com').retrieveExerciseData;
var log = require('./logger');

process.argv.forEach(function (element) {
	if (element === '--force') {
		getUserData();
	}
});

// Run every hour
//schedule.scheduleJob({ minute: [0, 20, 40] }, function () {
schedule.scheduleJob({ minute: [0, 10, 20, 30, 40, 50] }, function () {//Incresed frequency for debugging
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
	function (err, users) { //Loops through all the users that have played in the last week, calling retrieveExerciseData()
		if (err) {
			log.error(err);
		} else {
			for (var i = 0; i < users.length; i++) {
				// If user has exercise.com credentials, retrieve data from exercise.com
				if (users[i].credentials.exerciseDotCom.username && users[i].credentials.exerciseDotCom.plainPassword) {
					log.debug('User found with credentials, retrieving exercise data for: '+users[i].credentials.exerciseDotCom.username+' with email: '+users[i].email);
					retrieveExerciseData(users[i].email, users[i].credentials.exerciseDotCom.username, users[i].credentials.exerciseDotCom.plainPassword);
				} else {
					//temp
					log.warn(`User: ${users[i].email} has no exercise.com credentials`);
				}
			}
		}
	});
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
			for (var i = 0; i < users.length; i++) {
				// If user has exercise.com credentials, run casper.
				if (users[i].credentials.exerciseDotCom.username && users[i].credentials.exerciseDotCom.plainPassword) {
					log.debug('User found with credentials, retrieving exercise data. All User fetch');
					retrieveExerciseData(users[i].email, users[i].credentials.exerciseDotCom.username, users[i].credentials.exerciseDotCom.plainPassword);
				} else {
					//temp
					log.warn(`User: ${users[i].email} has no exercise.com credentials`);
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
