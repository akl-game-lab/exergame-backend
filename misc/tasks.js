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
					retrieveExerciseData(users[i].id, users[i].credentials.exerciseDotCom.username, users[i].credentials.exerciseDotCom.password);
				} else {
					//temp
					console.log(`User: ${users[i].email} has no exercise.com credentials`);
				}
			}
		}
	});
}


function retrieveExerciseData(id, username, password) {
	console.log(`casperjs exercise-dot-com.js --uname="${username}" --pword="${password}"`);
	const child = exec(`pwd && casperjs exercise-dot-com.js --uname="${username}" --pword="${password}"`,
	{
		cwd: './misc/casper'
	},
	(error, stdout, stderr) => {
		console.log(`stdout: ${stdout}`);
		console.log(`stderr: ${stderr}`);
		if (error !== null) {
			console.log(`exec error: ${error}`);
		} else {
			var retrievedData = JSON.parse(stdout.substr(stdout.indexOf('\n') + 1));
			console.log(retrievedData);
			for (var j = 0; j < retrievedData.length; j++) {
				saveData(id, retrievedData[j]);
			}
		}
	});
}

function saveData(id, data) {
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
				userId: id
			});

			newData.save();
		}
	});
}
