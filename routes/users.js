var express = require('express');
var router = express.Router();
var Workout = require('../models/workout');
var ExerciseDotCom = require('../models/sources/exercise-dot-com');
var User = require('../models/user');
var getByEmail = require('../misc/tasks');
var HsmFormat = require('../dtos/HsmFormat');
var ObjectId = require('mongoose').Types.ObjectId;

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
	function (username, password, done) {
		User.findOne({ username: username }, function (err, user) {
			if (err) { return done(err); }

			if (!user) {
				return done(null, false, { message: 'Incorrect username.' });
			}

			if (!user.validPassword(password)) {
				return done(null, false, { message: 'Incorrect password.' });
			}

			return done(null, user);
		});
	}
));

passport.serializeUser(function (user, done) {
	done(null, user._id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

/* GET users listing. */
router.get('/', function (req, res, next) {
	res.send('respond with a resource');
});

router.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}));

router.get('/:id/forceUpdate', function (req, res, next) {
	var userId = decodeURIComponent(req.params.id);

	getByEmail(userId);
	res.send(builder.create('data').ele({ started: true }).end({ pretty: true }));
});

router.get('/:id/workouts/:from/:to', function (req, res, next) {
	var userId = decodeURIComponent(req.params.id);
	var from = parseInt(req.params.from); // In seconds for Skyrim
	var to = parseInt(req.params.to); // In seconds for Skyrim
	var sendData = {
		data: {}
	};

	if(Number.isInteger(from) && Number.isInteger(to) && from >= 0 && to >= 0 && from < to) {
		User.find({
			email: userId
		}, function (err, users) {
			if (users.length === 0) {
				sendData.data = {
					errorCode: '404',
					errorMessage: 'User not found'
				};
				res.status(404).send(sendData);
			} else {
				ExerciseDotCom.find({
					userEmail: userId,
					dateRetrieved: {
						$gt: new Date(from * 1000),
						$lt: new Date(to * 1000)
					}
				},
				function (err, workouts) {
					if (err) {
						res.send(err);
						return;
					}

					sendData.data.workouts = new HsmFormat().transform(workouts);

					// Return data.
					res.send(sendData);
				});
			}
		});
	} else {
		sendData.data = {
			errorCode: '400',
			errorMessage: 'Invalid date(s)'
		};
		res.status(400).send(sendData);
	}


});

module.exports = router;
