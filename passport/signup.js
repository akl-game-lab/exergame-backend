var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');
var log = require('../misc/logger');

module.exports = function (passport) {

	passport.use('signup', new LocalStrategy({
		passReqToCallback: true // allows us to pass back the entire request to the callback
	},
	function (req, username, password, done) {
		var findOrCreateUser = function () {
			// find a user in Mongo with provided username
			User.findOne({'$or': [{ username:  username }, {email: req.param('email')}]}, function (err, user) {
				// In case of any error, return using the done method
				if (err) {
					log.error('Error in SignUp: ' + err);
					return done(err);
				}
				// already exists
				if (user) {
					log.debug('User already exists with username: ' + username + ' or email: ' + req.param('email'));
					return done(null, false, req.flash('message', 'User Already Exists'));
				} else {
					// if there is no user with that email
					// create the user
					var newUser = new User();

					// set the user's local credentials
					newUser.username = username;
					newUser.password = createHash(password);
					newUser.email = req.param('email');
					newUser.firstName = req.param('firstName');
					newUser.lastName = req.param('lastName');

					// save the user
					newUser.save(function (err) {
						if (err) {
							log.error('Error in Saving user: ' + err);
							throw err;
						}

						log.info('User Registration succesful');
						return done(null, newUser);
					});
				}
			});
		};
		// Delay the execution of findOrCreateUser and execute the method
		// in the next tick of the event loop
		process.nextTick(findOrCreateUser);
	}));

	// Generates hash using bCrypt
	var createHash = function (password) {
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	};
};
