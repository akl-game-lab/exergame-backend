var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');
var log = require('../misc/logger');
var retrieveExerciseData = require('../misc/tasks');

module.exports = function (passport) {
	passport.use('login', new LocalStrategy({
		passReqToCallback: true
	}, function (req, username, password, done) {
		// check in mongo if a user with username exists or not
		User.findOne({
			email: username
		}, function (err, user) {
			// In case of any error, return using the done method
			if (err) {
				return done(err);
			}

			// Username does not exist, log the error and redirect back
			if (!user) {
				log.warn('User Not Found with email ' + username);
				return done(null, false, req.flash('message', 'User Not found.'));
			}

			// User exists but wrong password, log the error
			if (!isValidPassword(user, password)) {
				log.warn('Invalid Password');
				return done(null, false, req.flash('message', 'Invalid Password')); // redirect back to login page
			}

			// User and password both match, return user from done method
			// which will be treated like success

			//looking for any new workouts when the user logs in
			log.info('looking for new exercises')
			if(user.credentials) {
				retrieveExerciseData(user.email);
			}

			log.info('User and password verified');
			return done(null, user);
		});
	}));

	var isValidPassword = function (user, password) {
		return bCrypt.compareSync(password, user.password);
	};
};
