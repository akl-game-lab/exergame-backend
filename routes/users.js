var express = require('express');
var router = express.Router();
var Workout = require('../models/workout');
var ExerciseDotCom = require('../models/sources/exercise-dot-com');
var User = require('../models/user');
var getByEmail = require('../misc/tasks');
var transformerFactory = require('../transformers/transformerFactory');
var ObjectId = require('mongoose').Types.ObjectId;
var log = require('../misc/logger');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
	function (username, password, done) {
		User.findOne({ username: username }, function (err, user) {
			if (err) {
				log.error(err);
				return done(err);
			}

			if (!user) {
				log.warn('Incorrect Username');
				return done(null, false, { message: 'Incorrect username.' });
			}

			if (!user.validPassword(password)) {
				log.warn('Incorrect Password');
				return done(null, false, { message: 'Incorrect password.' });
			}

			log.info('login successful');
			return done(null, user);
		});
	}
));

passport.serializeUser(function (user, done) {
	log.info('serializing user');
	done(null, user._id);
});

passport.deserializeUser(function (id, done) {
	log.info('deserializing user');
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

router.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}));

router.get('/:id/forceUpdate', function (req, res, next) {
	var userId = decodeURIComponent(req.params.id);
	log.info('fetching data from exercise service with force update');
	User.find({
		email: userId
	}, function (err, users) {
		if (userId === 'null@gamelab.ac.nz') {
			// For testing purposes
			res.status(503).send(null);
		}
		else if (err || userId === 'database@gamelab.ac.nz') {
			log.error('Force update database error');
			log.error(err);
			res.status(500).send({
				responseCode: '500',
				data: {
					started: 'false',
					errorCode: '500',
					errorMessage: 'Database error'
				}
			});
		}
		else if (users.length === 0 || userId === 'notfound@gamelab.ac.nz') {
			log.info('Force update 404 error.');
			res.status(404).send({
				responseCode: '404',
				data: {
					started: 'false',
					errorCode: '404',
					errorMessage: 'User not found'
				}
			});
		} else {
			getByEmail(userId);
			res.send({
				responseCode: '200',
				data: {
					started: 'true'
				}
			});
		}
	});
});

router.get('/:id/workouts/:format/:from/:to', function (req, res, next) {
	log.info('workouts requested');
	var userId = decodeURIComponent(req.params.id);
	var format = decodeURIComponent(req.params.format);
	var from = parseInt(req.params.from); // In seconds for Skyrim
	var to = parseInt(req.params.to); // In seconds for Skyrim
	var sendData = {
		data: {}
	};

	log.info(`Decoded request: /${userId}/workouts/${format}/${from}/${to}`);

	if (Math.abs(to - (Date.now() / 1000)) > 60) {
		var behind = (Date.now() / 1000) - to;
		log.warn(`to date out from current date. ${behind} seconds behind.`);
	}

	log.debug('transformer class instantiated');
	var transformer = transformerFactory(format);

	User.find({
		email: userId
	}, function (err, users) {
		if (userId === 'null@gamelab.ac.nz') {
			// For testing purposes
			res.status(503).send(null);
		}
		else if (err || userId === 'database@gamelab.ac.nz') {
			log.error('workout request database error');
			log.error(err);
			res.status(500).send({
				responseCode: '500',
				data: {
					errorMessage: err
				}
			});
		}
		else if (users.length === 0 || userId === 'notfound@gamelab.ac.nz') {
			sendData.responseCode = '404';
			sendData.data = {
				errorCode: '404',
				errorMessage: 'User not found'
			};
			log.warn('user not found');
			res.status(404).send(sendData);
		} else if (!transformer) {
			log.warn(`No such format: ${format}`);
			sendData.responseCode = '404';
			sendData.data = {
				errorCode: '404',
				errorMessage: `No such format: ${format}`
			};
			res.status(404).send(sendData);
		} else if(Number.isInteger(from) && Number.isInteger(to) && from >= 0 && to >= 0 && from < to) {
			ExerciseDotCom.find({
				userEmail: userId,
				dateRetrieved: {
					$gt: new Date(from * 1000),
					$lt: new Date(to * 1000)
				}
			},
			function (err, workouts) {
				if (err) {
					log.error('workout request database error');
					log.error(err);
					res.status(500).send({
						responseCode: '500',
						data: {
							errorMessage: err
						}
					});
					return;
				}

				log.info('workouts found, transforming and sending');
				sendData.data.workouts = transformer.transform(workouts);

				log.info(sendData);

				sendData.successful = 'true';
				sendData.responseCode = '200';

				// Return data.
				res.send(sendData);
			});
		} else {
			sendData.responseCode = '400';
			sendData.data = {
				errorCode: '400',
				errorMessage: 'Invalid date(s)'
			};
			log.warn('invalid dates specified for workout fetch');
			log.info(sendData);
			res.status(400).send(sendData);
		}
	});
});

module.exports = router;
