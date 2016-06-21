var winston = require('winston');

winston.loggers.add('my-logger', {
	file: {
		filename: './logs/file.log',
		json: false
	}
});

var logger = winston.loggers.get('my-logger');

module.exports = logger;
