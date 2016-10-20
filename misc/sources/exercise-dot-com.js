var ExerciseDotCom = require('../../models/sources/exercise-dot-com');
var log = require('../../misc/logger');
const exec = require('child_process').exec;

module.exports = {
	verifyExerciseDotCom: function (username, password, callback) {
		log.info(`casperjs verify-exercise-dot-com.js --uname="${username}" --pword="{redacted}"`);
		const child = exec(`pwd && casperjs exercise-dot-com.js --uname="${username}" --pword="${password}"`,
		{
			cwd: './misc/casper'
		},
		(error, stdout, stderr) => {
			if (error) {
				log.error(`exec error ${error}`);
			} else {
				log.info(`Checked exercise.com account of ${username}`)
				log.debug(`stdout: ${stdout}`);
				if (stderr) {
					log.warn(`stderr: ${stderr}`);
				}
			}
			callback(stdout);
		});
	},

	retrieveExerciseData: function (email, username, password, callback) {
		log.info(`casperjs exercise-dot-com.js --uname="${username}" --pword="{redacted}"`);
		const child = exec(`pwd && casperjs exercise-dot-com.js --uname="${username}" --pword="${password}"`,
		{
			cwd: './misc/casper'
		},
		(error, stdout, stderr) => {
			if (error) {
				log.error(`exec error: ${error}`);
			} else {
				log.debug(`stdout: ${stdout}`);
				if (stderr) {
					log.warn(`stderr: ${stderr}`);
				}

				var retrievedData = JSON.parse(stdout.substr(stdout.search(/[\{\[]/))); // Find start of json.
				log.info('Retrieved exercise data, saving...');
				log.debug(retrievedData);
				if (retrievedData.hasOwnProperty('error')) {
					log.error(retrievedData.error);
				} else {
					log.info('Data successfully retrieved');
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
					log.info(`New workout saved for user: ${email}`);
				}
			});
		}
	});
}
