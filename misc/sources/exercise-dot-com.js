var ExerciseDotCom = require('../../models/sources/exercise-dot-com');
const exec = require('child_process').exec;

module.exports = {
	verifyExerciseDotCom: function (username, password, callback) {
		console.log(`casperjs verify-exercise-dot-com.js --uname="${username}" --pword="${password}"`);
		const child = exec(`pwd && casperjs exercise-dot-com.js --uname="${username}" --pword="${password}"`,
		{
			cwd: './misc/casper'
		},
		(error, stdout, stderr) => {
			console.log(`stdout: ${stdout}`);
			console.log(`stderr: ${stderr}`);
			console.log(`error: ${error}`);
			callback(stdout);
		});
	},

	retrieveExerciseData: function (email, username, password, callback) {
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
				console.log('Retrieved exercise data, saving...');
				console.log(retrievedData);
				if (retrievedData.hasOwnProperty('error')) {
					console.error(retrievedData.error);
				} else {
					saveData(email, retrievedData, callback);
				}
			}
		});
	}
};

function saveData(email, data) {
	for (var i = 0; i < data.length; i++) {
		saveWorkout(email, data[i]);
	}
}

function saveWorkout(email, data) {
	ExerciseDotCom.count({ workoutId: data.id }, function (err, count) {
		if (err) {
			console.error(err);
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
					console.error(err);
				} else {
					console.log('Workout saved');
				}
			});
		}
	});
}
