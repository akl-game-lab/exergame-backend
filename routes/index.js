var express = require('express');
var router = express.Router();
var verifyTask = require('../misc/verify-task');

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

module.exports = function(passport){

	/* GET login page. */
	router.get('/', function(req, res) {
		// Display the Login page with any flash message, if any
		res.render('index', { message: req.flash('message') });
	});

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash : true
	}));

	/* GET Registration Page */
	router.get('/signup', function(req, res){
		res.render('register',{message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash : true
	}));

	/* GET Home Page */
	router.get('/home', isAuthenticated, function(req, res){
		res.render('home', { user: req.user });
	});

	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout()
		res.redirect('/');
	});

	/* Account Settings*/
	router.get('/settings', isAuthenticated, function(req, res){
		res.render('settings', { user: req.user });
	});

	router.post('/settings', isAuthenticated, function (req, res) {
		var username = req.body['credentials.exerciseDotCom.username'] || undefined;
		var password = req.body['credentials.exerciseDotCom.password'] || undefined;

		req.user.credentials = {
			exerciseDotCom: {
				username: username,
				password: password
			}
		};

		var errorString = 'You need to sign in or sign up before continuing.';

		verifyTask.verifyExerciseDotCom(username, password, function (execReturnVal) {
			if(execReturnVal.indexOf(errorString) > -1) {
					console.log("Exercise.com account does not exist");
					res.render('settings', {
						user: req.user,
						message: "Exercise.com account does not exist"
					});
					return;
			}
			req.user.save(function (err) {
				if (err) {
					//@TODO: better way to tell users about errors.
					console.error(err);
				}
				console.log("Exercise.com account verfied");
				res.redirect('/home');
			});
		});
		// req.user.credentials.exerciseDotCom.username = req.body.credentials.exerciseDotCom.username || undefined;
		// req.user.credentials.exerciseDotCom.password = req.body.credentials.exerciseDotCom.password || undefined;
	});

	return router;
}
