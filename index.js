module.exports = function () {
	/**
	* Module dependencies.
	*/

	var app = require('./app');
	var debug = require('debug')('exergaming-backend:server');
	var http = require('http');
	var config = require('./config');
	var log = require('./misc/logger');

	/**
	* Check if the encryption key environement variable is set.
	*/

	if(!config.encryptionKey) {
		log.error('encryptionKey config value not set!');
		log.error('If this is your first time running the system, you may set this to anything.');
		log.error('If your database has already been set up, it will not work without the correct key.');
		process.exit(1);
	}

	/**
	* Get port from environment and store in Express.
	*/

	var port = normalizePort(process.env.PORT || '80');
	app.set('port', port);

	/**
	* Create HTTP server.
	*/

	var server = http.createServer(app);

	/**
	* Listen on provided port, on all network interfaces.
	*/

	server.listen(port);
	server.on('error', onError);
	server.on('listening', onListening);

	/**
	* Normalize a port into a number, string, or false.
	*/

	function normalizePort(val) {
		var port = parseInt(val, 10);

		if (isNaN(port)) {
			// named pipe
			return val;
		}

		if (port >= 0) {
			// port number
			return port;
		}

		return false;
	}

	/**
	* Event listener for HTTP server "error" event.
	*/

	function onError(error) {
		if (error.syscall !== 'listen') {
			throw error;
		}

		var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

		// handle specific listen errors with friendly messages
		switch (error.code) {
			case 'EACCES':
				log.error(bind + ' requires elevated privileges');
				process.exit(1);
				break;
			case 'EADDRINUSE':
				log.error(bind + ' is already in use');
				process.exit(1);
				break;
			default:
				throw error;
		}
	}

	/**
	* Event listener for HTTP server "listening" event.
	*/

	function onListening() {
		var addr = server.address();
		var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
		debug('Listening on ' + bind);
	}
};
