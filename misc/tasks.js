var schedule = require('node-schedule');
var User = require('../models/user');
const exec = require('child_process').exec;


findUser();

// Run every hour
schedule.scheduleJob({minute: [0, 30, 40]}, function () {
	findUser();
});

function findUser(){
	User.find(function (err, users) {
		if (err) {
			console.error(err);
		} else {
			for (var i = 0; i < users.length; i++) {
				// If user has exercise.com credentials, run casper.
				if (users[i].credentials.exerciseDotCom.username && users[i].credentials.exerciseDotCom.password) {
					retrieveExerciseData(users[i].credentials.exerciseDotCom.username, users[i].credentials.exerciseDotCom.password);
				} else {
					//temp
					console.log(`User: ${users[i].email} has no exercise.com credentials`);
				}
			}
		}
	});
}


function retrieveExerciseData(username, password) {
	console.log(`casperjs exerciseDotCom.js --uname="${username}" --pword="${password}"`);
	const child = exec(`pwd && casperjs exerciseDotCom.js --uname="${username}" --pword="${password}"`,
	{
		cwd: './misc/casper'
	},
	(error, stdout, stderr) => {
		console.log(`stdout: ${stdout}`);
		console.log(`stderr: ${stderr}`);
		if (error !== null) {
			console.log(`exec error: ${error}`);
		} else {
			// TODO: Deal with Data
		}
	});
}
