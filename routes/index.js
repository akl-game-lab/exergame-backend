var express = require('express');
var router = express.Router();
var verifyTask = require('../misc/sources/exercise-dot-com');
var cryptoJs = require('crypto-js');
var config = require('../config');
var log = require('../misc/logger');

var isAuthenticated = function (req, res, next) {
	log.info('User authentication');
	// if user is authenticated in the session, call the next() to call the next request handler
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated()) {
		log.debug('user is authenticated');
		return next();
	}

	// if the user is not authenticated then redirect him to the login page
	log.warn('user not authenticated, redirecting to home');
	res.redirect('/');
};

module.exports = function (passport) {

	/* GET login page. */
	router.get('/', function (req, res) {
		// Display the Login page with any flash message, if any
		log.info('login page requested');
		res.render('index', { message: req.flash('message') });
	});

	/* Handle Login POST */
	router.post('/login', authenticate('login', '/home','/','User attempting to login'));

	/* GET Registration Page */
	router.get('/signup', function (req, res) {
		log.info('Registration page requested');
		res.render('register', { message: req.flash('message') });
	});

	/* Handle Registration POST */
	router.post('/signup', authenticate('signup', '/home', '/signup', 'User attempting to signup'));


	/* GET Home Page */
	router.get('/home', isAuthenticated, function (req, res) {
		log.info('Home page requested');
		res.render('home', {
			user: req.user,
			successMessage: req.query.successMessage,
			errorMessage: req.query.errorMessage
		});
	});

	/* Handle Logout */
	router.get('/signout', function (req, res) {
		log.info('User logging out');
		req.logout();
		res.redirect('/');
	});

	/* Account Settings*/
	router.get('/settings', isAuthenticated, function (req, res) {
		log.info('account settings requested');
		res.render('settings', { user: req.user });
	});

	router.get('/mod', function (req, res) {
		log.info('mod page requested');
		res.render('mod');
	});

	router.get('/mod/download', function (req, res) {
		log.info('mod download requested');
		res.redirect('http://skyrim-exergaming-mod.s3-website-ap-southeast-2.amazonaws.com');
	});

	router.post('/settings', isAuthenticated, function (req, res) {
		var username = req.body['credentials.exerciseDotCom.username'] || undefined;
		var password = req.body['credentials.exerciseDotCom.password'] || undefined;
		log.info('user attempting to add credentials for exercise.com');

		req.user.credentials = {
			exerciseDotCom: {
				username: username,
				password: cryptoJs.AES.encrypt(password, config.encryptionKey).toString()
			}
		};

		var errorString = 'You need to sign in or sign up before continuing.';

		log.debug('verifying exercise.com account');
		verifyTask.verifyExerciseDotCom(username, password, function (execReturnVal) {
			if (execReturnVal.indexOf(errorString) > -1) {
				log.info('exercise.com account does not exist');
				res.render('settings', {
					user: req.user,
					errorMessage: 'Exercise.com account does not exist!'
				});
				return;
			}

			req.user.save(function (err) {
				if (err) {
					//@TODO: better way to tell users about errors.
					log.error(err);
				}

				log.info('exercise.com account verified, redirecting to home');
				res.redirect('/home?successMessage=Account registration successful!');
			});
		});
	});

	function authenticate(current, success, failure, logMessage) {
		log.info(logMessage);

		return passport.authenticate(current, {
			successRedirect: success,
			failureRedirect: failure,
			failureFlash: true
		});
	}

	return router;
};
