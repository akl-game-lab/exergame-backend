var schedule = require('node-schedule');
var User = require('../models/user');
var ExerciseDotCom = require('../models/sources/exercise-dot-com');
const exec = require('child_process').exec;

process.argv.forEach(function(element) {
	if(element === '--force') {
		getUserData();
	}
});

// Run every hour
schedule.scheduleJob({minute: [0, 20, 40]}, function () {
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
	User.findOne({email: email}, function (err, user) {
		console.log('Grabbed data for ' + email); // TODO Remove
		if (err) {
			console.error(err);
		} else {
			// If user has exercise.com credentials, run casper.
			if (user.credentials.exerciseDotCom.username && user.credentials.exerciseDotCom.password) {
				retrieveExerciseData(user.email, user.credentials.exerciseDotCom.username, user.credentials.exerciseDotCom.password, callback);
			} else {
				//temp
				console.log(`User: ${user.email} has no exercise.com credentials`);
			}
		}
	});
}

function retrieveExerciseData(email, username, password, callback) {
	console.log(`casperjs exercise-dot-com.js --uname="${username}" --pword="${password}"`);
	const child = exec(`pwd && casperjs exercise-dot-com.js --uname="${username}" --pword="${password}"`,
	{
		cwd: './misc/casper'
	},
	(error, stdout, stderr) => {
		console.log(`stdout: ${stdout}`);
		console.log(`stderr: ${stderr}`);
		if (error !== null) {
			console.error(`exec error: ${error}`);
		} else {
			var retrievedData = JSON.parse(stdout.substr(stdout.search(/[\{\[]/))); // Find start of json.
			console.log(retrievedData);
			if (retrievedData.hasOwnProperty('error')) {
				console.error(retrievedData['error']);
			}
			else {
				saveData(email, retrievedData, callback);
			}
		}
	});
}

function saveData(email, data) {
	// console.log('data = ');
	// console.log(data);
	for (var i = 0; i < data.length; i++) {
		// console.log('data[' + i + '] =');
		// console.log(data[i]);
		saveWorkout(email, data[i]);
	}
}

function saveWorkout(email, data) {
	ExerciseDotCom.count({workoutId: data.id}, function (err, count) {
		if (err) {
			console.err(err);
		}
		else if (count === 0) {
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
					console.error(err);
				} else {
					console.log('Workout saved.');
				}
			});
		}
	});
}

module.exports = function (email, callback) {
	getUserDataByEmail(email, callback);
};
