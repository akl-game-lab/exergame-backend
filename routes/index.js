'use strict'
const express = require('express');
const router = express.Router();
const verifyTask = require('../misc/sources/exercise-dot-com');
const cryptoJs = require('crypto-js');
const config = require('../config');
const log = require('../misc/logger');
const retrieveExerciseData = require('../misc/sources/exercise-dot-com').retrieveExerciseData;
const User = require('../models/user');
const fs = require('fs');


const isAuthenticated = (req, res, next) => {
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

module.exports = passport => {

    // router.get('/testing', function (req, res) {
		// retrieveExerciseData('testgamelab@gmail.com', 'testgamelab@gmail.com', 'paulralph')
    // });

	/* GET login page. */
	router.get('/', (req, res) => {
		// Display the Login page with any flash message, if any
		log.info('login page requested');
		res.render('index', { message: req.flash('message') });
	});

	/* Handle Login POST */
	router.post('/login', authenticate('login', '/home','/','User attempting to login'));

	/* GET Registration Page */
	router.get('/signup', (req, res) => {
		log.info('Registration page requested');
		res.render('register', { message: req.flash('message') });
	});

	/* Handle Registration POST */
	router.post('/signup', authenticate('signup', '/home', '/signup', 'User attempting to signup'));


	/* GET Home Page */
	router.get('/home', isAuthenticated, (req, res) => {
		log.info('Home page requested');
		User.getRecentWorkouts(req.user.email, recentWorkouts => {
			res.render('home', {
				user: req.user,
				successMessage: req.query.successMessage,
				errorMessage: req.query.errorMessage,
				recentWorkouts: recentWorkouts.data.workouts
			});
		});
	});

	/* Handle Logout */
	router.get('/signout', (req, res) => {
		log.info('User logging out');
		req.logout();
		res.redirect('/');
	});

	/* Account Settings*/
	router.get('/settings', isAuthenticated, (req, res) => {
		log.info('account settings requested');
		res.render('settings', { user: req.user });
	});

	router.get('/mod', (req, res) => {
		log.info('mod page requested');
		res.render('mod');
	});

	router.get('/mod/download', (req, res) => {
		log.info('mod download requested');
		const path = 'public/mod/latest'
		fs.readdir(path, (err, files) => {
			if(err) {
				res.status(500)
			  res.render('error', {
			    message: 'File not found'
			  })
				log.error(err)
			} else {
				res.sendFile(files[0], {root: path});
			}
		});

	});

	router.post('/settings', isAuthenticated, (req, res) => {
		const username = req.body['credentials.exerciseDotCom.username'] || undefined;
		const password = req.body['credentials.exerciseDotCom.password'] || undefined;
		log.info('user attempting to add credentials for exercise.com');

		req.user.credentials = {
			exerciseDotCom: {
				username: username,
				password: cryptoJs.AES.encrypt(password, config.encryptionKey).toString()
			}
		};

		const errorString = 'You need to sign in or sign up before continuing.';

		log.debug('verifying exercise.com account');
		verifyTask.verifyExerciseDotCom(username, password, execReturnVal => {
			if (execReturnVal.indexOf(errorString) > -1) {
				log.info('exercise.com account does not exist');
				res.render('settings', {
					user: req.user,
					errorMessage: 'Exercise.com account does not exist!'
				});
				return;
			}

			req.user.save(err => {
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
