'use strict'
const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const http = require('http');
const bCrypt = require('bcrypt-nodejs');

const server = require('../index');
const db = require('../db');
const User = require('../models/user');

describe('Index', () => {
	const url = 'http://localhost';
	// within before() you can run all the operations that are needed to setup your tests. In this case
	// I want to create a connection with the database, and when I'm done, I call done().
	before( done => {
		// In our tests we use the test db
		mongoose.connection.close( err => {
			if (err) {
				console.error(err);
			}
			mongoose.connect(db.testUrl, err => {
				if (err) {
					console.error(err);
				}
				done();
			});
		});
	});

	after( done => {
		User.remove({firstName: 'Test'}, () => {
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
	describe('/signup', () => {
		it('should return the register page', done => {
			// Make the request
			request(url)
			.get('/signup')
			// end handles the response
			.end((err, res) => {
				assert.ifError(err);

				assert.equal(res.status, 200, 'request returned an error');

				done();
			});
		});

		it('should create a new user when a post is made', done => {
			const data = {
				username: 'TestUser',
				password: 'TestPassword',
				email: 'test@example.com',
				firstName: 'Test',
				lastName: 'User'
			};

			request(url)
			.post('/signup')
			.send(data)
			.end((err, res) => {
				assert.ifError(err);

				assert.equal(res.status, 302, 'request returned an error');
				assert.equal(res.text, 'Found. Redirecting to /home');

				// Check user was created
				User.find({firstName: 'Test'}, (err, results) => {
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

		it('should fail when given a user that already exists', done => {
			const data = {
				username: 'TestUser',
				password: 'TestPassword',
				email: 'test@example.com',
				firstName: 'Test2',
				lastName: 'User'
			};

			request(url)
			.post('/signup')
			.send(data)
			.end((err, res) => {
				assert.ifError(err);

				assert.equal(res.status, 302, 'request returned an error');
				assert.equal(res.text, 'Found. Redirecting to /signup');

				// Check no user was created
				User.find({firstName: 'Test2'}, (err, results) => {
					assert.ifError(err);

					assert.equal(results.length, 0);
					done();
				});
			});
		});

		it('should fail when given invalid data', done => {
			const data = {
				password: 'TestPassword',
				email: 'test3@example.com',
				firstName: 'Test3',
				lastName: 'User'
			};

			request(url)
			.post('/signup')
			.send(data)
			.end((err, res) => {
				assert.ifError(err);

				assert.equal(res.status, 302, 'request returned an error');
				assert.equal(res.text, 'Found. Redirecting to /signup');

				// Check no user was created
				User.find({firstName: 'Test3'}, (err, results) => {
					assert.ifError(err);

					assert.equal(results.length, 0);
					done();
				});
			});
		});

		it('should unsuccessfully log in due to incorrect password', done =>	{
			const loginData = {
				password: 'badPassword',
				username: 'TestUser'
			};

			request(url)
			.post('/login')
			.send(loginData)
			.end((err, res) => {
				assert.ifError(err);
				//failed login redirects to /
				assert.equal(res.text, 'Found. Redirecting to /');
				done();
			});
		});

		it('should unsuccessfully log in due to invalid username', done =>	{
			const loginData = {
				password: 'TestPassword',
				username: 'badUser'
			};

			request(url)
			.post('/login')
			.send(loginData)
			.end((err, res) => {
				assert.ifError(err);
				//failed login redirects to /
				assert.equal(res.text, 'Found. Redirecting to /');
				done();
			});
		});

		it('should successfully log in and redirect to home', done =>	{

			const loginData = {
				password: 'TestPassword',
				username: 'test@example.com'
			};

			request(url)
			.post('/login')
			.send(loginData)
			.end((err, res) => {
				assert.ifError(err);
				//successful login redirects to home
				assert.equal(res.text, 'Found. Redirecting to /home');
				done();
			});
		});

		it('should successfully log out', done =>	{
			const loginData = {
				password: 'TestPassword',
				username: 'test@example.com'
			};

			request(url)
			.post('/login')
			.send(loginData)
			.end((err, res) => {
				assert.ifError(err);
				//successful login redirects to home
				assert.equal(res.text, 'Found. Redirecting to /home');

				request(url)
				.get('/signout')
				.end((err, res) => {
					assert.ifError(err);

					assert.equal(res.text, 'Found. Redirecting to /');
					done();
				});
			});
		});

		it('should unsuccessfully navigate to home if user not logged in', done => {
			request(url)
			.get('/signout')
			.end((err, res) => {

				request(url)
				.get('/home')
				.end((err, res) => {
				  assert.equal(res.text, 'Found. Redirecting to /');
					done();
				});
			});
		});
	});
});
