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
schedule.scheduleJob({ minute: [0, 20, 40] }, function () {
	log.info('Updating User data');
	getUserData();
});

function getUserData() {
	log.info('Attempting to find user data');
	User.find({
		lastPlayed: {
			'$gt': Date.now() - 1000 * 60 * 60 * 24 * 7 // Has played in the last week.
		}
	},
	function (err, users) {
		if (err) {
			log.error(err);
		} else {
			for (var i = 0; i < users.length; i++) {
				// If user has exercise.com credentials, run casper.
				if (users[i].credentials.exerciseDotCom.username && users[i].credentials.exerciseDotCom.plainPassword) {
					log.debug('User found with credentials, retrieving exercise data');
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
