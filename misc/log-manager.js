var schedule = require('node-schedule');
var fs = require('fs');
var zlib = require('zlib');
var path = require('path');
var _ = require('underscore');
var logger = require('./logger');

var gzip = zlib.createGzip();
var logDirectory = 'logs';
var archiveDirectory = 'logs/log-archive';

if (!fs.existsSync(logDirectory)){
	fs.mkdirSync(logDirectory);
}

if (!fs.existsSync(archiveDirectory)) {
	fs.mkdirSync(archiveDirectory);
}

function archiveOldestLogFile() {
	var files = fs.readdirSync(logDirectory);

	if(files.length <= 1) {
		return;
	}

	var oldestLogFile = _.min(files, function (f) {
		var fullpath = path.join(logDirectory, f);
		//function will ignore directories
		if(fs.lstatSync(fullpath).isDirectory()) {
			return;
		}
		return fs.statSync(fullpath).ctime;
	});

	// log-archive + a weeks worth of log files
	if(files.length > 8) {

		var inp = fs.createReadStream(path.join(logDirectory, oldestLogFile));
		var out = fs.createWriteStream(path.join(archiveDirectory, oldestLogFile) + '.gz');
		inp.pipe(gzip).pipe(out);

		fs.unlinkSync(path.join(logDirectory,oldestLogFile));
	} else {
		return;
	}
}

schedule.scheduleJob({hour: 17, minute: 30}, function () {
	logger.info('log clean-up performed');
	archiveOldestLogFile();
});
