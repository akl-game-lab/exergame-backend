var login = require('./login');
var signup = require('./signup');
var User = require('../models/user');
var log = require('../misc/logger');

module.exports = function (passport) {
	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
	passport.serializeUser(function (user, done) {
		log.debug('serializing user: ');
		log.debug(user);
		done(null, user._id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			log.debug('deserializing user:', user);
			done(err, user);
		});
	});

	// Setting up Passport Strategies for Login and SignUp/Registration
	log.info('Setting up Passport Strategies for Login and SignUp/Registration');
	login(passport);
	signup(passport);
};
