var schedule = require('node-schedule');
const exec = require('child_process').exec;

// Run every hour
schedule.scheduleJob({minute: [0, 20, 40]}, function () {
	console.log(`casperjs exerciseDotCom.js --uname="${process.env.EXERCISE_DOT_COM_UNAME}" --pword="${process.env.EXERCISE_DOT_COM_PWORD}"`);
	const child = exec(`pwd && casperjs exerciseDotCom.js --uname="${process.env.EXERCISE_DOT_COM_UNAME}" --pword="${process.env.EXERCISE_DOT_COM_PWORD}"`,
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
});
