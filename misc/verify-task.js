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
	}
}
