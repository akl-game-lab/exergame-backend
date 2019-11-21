var winston = require('winston');
var _ = require('underscore');
var schedule = require('node-schedule');

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
			formatter: formatter,
			level: 'debug'
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

schedule.scheduleJob({hour: 23, minute: 59, second: 30}, function () {
	var newDate = new Date();
	newDate.setDate(newDate.getDate() + 1);

	logger.info(newDate)
	logger.info('changed logging directory')
	logger.configure({
    transports: [
			new (winston.transports.File)({
				filename: './logs/' + newDate.toISOString().replace(/T.+/, '') + '.log',
				json: false,
				formatter: formatter
			})
    ]
  })

});

module.exports = logger;
