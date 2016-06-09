var schedule = require('node-schedule');
var User = require('../models/user');
var retrieveExerciseData = require('./sources/exercise-dot-com').retrieveExerciseData;

process.argv.forEach(function (element) {
	if (element === '--force') {
		getUserData();
	}
});

// Run every hour
schedule.scheduleJob({ minute: [0, 20, 40] }, function () {
	getUserData();
});

function getUserData() {
	User.find(function (err, users) {
		if (err) {
			console.error(err);
		} else {
			for (var i = 0; i < users.length; i++) {
				// If user has exercise.com credentials, run casper.
				if (users[i].credentials.exerciseDotCom.username && users[i].credentials.exerciseDotCom.password) {
					retrieveExerciseData(users[i].email, users[i].credentials.exerciseDotCom.username, users[i].credentials.exerciseDotCom.password);
				} else {
					//temp
					console.log(`User: ${users[i].email} has no exercise.com credentials`);
				}
			}
		}
	});
}

function getUserDataByEmail(email, callback) {
	User.findOne({ email: email }, function (err, user) {
		console.log('Grabbed data for ' + email); // TODO Remove
		if (err) {
			console.error(err);
		} else {
			// If user has exercise.com credentials, run casper.retrieveExerciseDataretrieveExerciseData
			if (user.credentials.exerciseDotCom.username && user.credentials.exerciseDotCom.password) {
				retrieveExerciseData(user.email, user.credentials.exerciseDotCom.username, user.credentials.exerciseDotCom.password, callback);
			} else {
				//temp
				console.log(`User: ${user.email} has no exercise.com credentials`);
			}
		}
	});
}

module.exports = function (email, callback) {
	getUserDataByEmail(email, callback);
};
