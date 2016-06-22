var winston = require('winston');

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

process.argv.forEach(function(arg){
	switch(arg) {
	 case '--error':
		 logger.transports.console.level = 'error';
		 break;
	 case '--warn':
		 logger.transports.console.level = 'warn';
		 break;
	 case '--info':
		 logger.transports.console.level = 'info';
		 break;
	 case '--debug':
		 logger.transports.console.level = 'debug';
		 break;
	 default:
 }
});

module.exports = logger;
