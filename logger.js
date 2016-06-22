var winston = require('winston');
var _ = require('underscore');

var currentDate = new Date().toISOString().replace(/T.+/, '');
var options = {
	day: '2-digit',
	month: '2-digit',
	year: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit'
};

function formatter(args) {
	var dateTimeComponents = new Date().toLocaleTimeString('en-us', options).split(',');
	var logMessage = dateTimeComponents[0] + dateTimeComponents[1] + ' - ' + args.level + ': ' + args.message;
	return logMessage;
}

var logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)(),
		new (winston.transports.File)({
			filename: './logs/' + currentDate + '.log',
			json: false,
			formatter: formatter
		})
	]
});

/**
	log levels in order of priority (high to low) are: error, warn, info, verbose, debug and silly.
	specifying a log level will exclude the levels of lower priority being logged. default log level
	is info.
**/
var logLevels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];

for (var i = 0; i < process.argv.length; i++) {
	if(process.argv[i] === '--log-level') {
		if(_.contains(logLevels,process.argv[i+1])){
			logger.transports.console.level = process.argv[i+1];
		} else {
			logger.warn('invalid log level specified, defaulting to "info"');
		}
	}
}

module.exports = logger;
