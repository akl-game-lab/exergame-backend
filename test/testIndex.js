var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var http = require('http');
var bCrypt = require('bcrypt-nodejs');

var server = require('../index');
var db = require('../db');
var User = require('../models/user');

describe('Index', function() {
	var url = 'http://localhost:3000';
	// within before() you can run all the operations that are needed to setup your tests. In this case
	// I want to create a connection with the database, and when I'm done, I call done().
	before(function(done) {
		// In our tests we use the test db
		mongoose.connection.close(function (err) {
			if (err) {
				console.error(err);
			}
			mongoose.connect(db.testUrl, function (err) {
				if (err) {
					console.error(err);
				}
				done();
			});
		});
	});

	after(function (done) {
		User.remove({firstName: 'Test'}, function () {
			done();
		});
	});

	// use describe to give a title to your test suite, in this case the tile is "Account"
	// and then specify a function in which we are going to declare all the tests
	// we want to run. Each test starts with the function it() and as a first argument
	// we have to provide a meaningful title for it, whereas as the second argument we
	// specify a function that takes a single parameter, "done", that we will use
	// to specify when our test is completed, and that's what makes easy
	// to perform async test!
	describe('/signup', function() {
		it('should return the register page', function(done) {
			// Make the request
			request(url)
			.get('/signup')
			// end handles the response
			.end(function(err, res) {
				assert.ifError(err);

				assert.equal(res.status, 200, 'request returned an error');

				done();
			});
		});

		it('should create a new user when a post is made', function (done) {
			var data = {
				username: 'TestUser',
				password: 'TestPassword',
				email: 'test@example.com',
				firstName: 'Test',
				lastName: 'User'
			};

			request(url)
			.post('/signup')
			.send(data)
			.end(function (err, res) {
				assert.ifError(err);

				assert.equal(res.status, 302, 'request returned an error');
				assert.equal(res.text, 'Found. Redirecting to /home');

				// Check user was created
				User.find({firstName: 'Test'}, function (err, results) {
					assert.ifError(err);

					assert.equal(results.length, 1);

					assert.equal(results[0].username, 'TestUser');
					assert.ok(bCrypt.compareSync('TestPassword', results[0].password));
					assert.equal(results[0].email, 'test@example.com');
					assert.equal(results[0].firstName, 'Test');
					assert.equal(results[0].lastName, 'User');

					done();
				});
			});
		});

		it('should fail when given a user that already exists', function (done) {
			var data = {
				username: 'TestUser',
				password: 'TestPassword',
				email: 'test@example.com',
				firstName: 'Test2',
				lastName: 'User'
			};

			request(url)
			.post('/signup')
			.send(data)
			.end(function (err, res) {
				assert.ifError(err);

				assert.equal(res.status, 302, 'request returned an error');
				assert.equal(res.text, 'Found. Redirecting to /signup');

				// Check no user was created
				User.find({firstName: 'Test2'}, function (err, results) {
					assert.ifError(err);

					assert.equal(results.length, 0);
					done();
				});
			});
		});

		it('should fail when given invalid data', function (done) {
			var data = {
				password: 'TestPassword',
				email: 'test3@example.com',
				firstName: 'Test3',
				lastName: 'User'
			};

			request(url)
			.post('/signup')
			.send(data)
			.end(function (err, res) {
				assert.ifError(err);

				assert.equal(res.status, 302, 'request returned an error');
				assert.equal(res.text, 'Found. Redirecting to /signup');

				// Check no user was created
				User.find({firstName: 'Test3'}, function (err, results) {
					assert.ifError(err);

					assert.equal(results.length, 0);
					done();
				});
			});
		});

		it('should unsuccessfully log in due to incorrect password', function(done)	{
			var loginData = {
				password: 'badPassword',
				username: 'TestUser'
			};

			request(url)
			.post('/login')
			.send(loginData)
			.end(function (err, res) {
				assert.ifError(err);
				//failed login redirects to /
				assert.equal(res.text, 'Found. Redirecting to /');
				done();
			});
		});

		it('should unsuccessfully log in due to invalid username', function(done)	{
			var loginData = {
				password: 'TestPassword',
				username: 'badUser'
			};

			request(url)
			.post('/login')
			.send(loginData)
			.end(function (err, res) {
				assert.ifError(err);
				//failed login redirects to /
				assert.equal(res.text, 'Found. Redirecting to /');
				done();
			});
		});

		it('should successfully log in and redirect to home', function(done)	{

			var loginData = {
				password: 'TestPassword',
				username: 'test@example.com'
			};

			request(url)
			.post('/login')
			.send(loginData)
			.end(function (err, res) {
				assert.ifError(err);
				//successful login redirects to home
				assert.equal(res.text, 'Found. Redirecting to /home');
				done();
			});
		});

		it('should successfully log out', function (done)	{
			var loginData = {
				password: 'TestPassword',
				username: 'test@example.com'
			};

			request(url)
			.post('/login')
			.send(loginData)
			.end(function (err, res) {
				assert.ifError(err);
				//successful login redirects to home
				assert.equal(res.text, 'Found. Redirecting to /home');

				request(url)
				.get('/signout')
				.end(function (err, res) {
					assert.ifError(err);

					assert.equal(res.text, 'Found. Redirecting to /');
					done();
				});
			});
		});

		it('should unsuccessfully navigate to home if user not logged in', function (done) {
			request(url)
			.get('/signout')
			.end(function (err, res) {

				request(url)
				.get('/home')
				.end(function (err, res) {
				  assert.equal(res.text, 'Found. Redirecting to /');
					done();
				});
			});
		});
	});
});
