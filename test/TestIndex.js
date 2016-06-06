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
		server();

		// In our tests we use the test db
		// mongoose.connect(db.testUrl);
		done();
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
			}

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

		// it('should correctly update an existing account', function(done){
		// 	var body = {
		// 		firstName: 'JP',
		// 		lastName: 'Berd'
		// 	};
		// 	request(url)
		// 	.put('/api/profiles/vgheri')
		// 	.send(body)
		// 	.expect('Content-Type', /json/)
		// 	.expect(200) //Status code
		// 	.end(function(err,res) {
		// 		if (err) {
		// 			throw err;
		// 		}
		// 		// Should.js fluent syntax applied
		// 		res.body.should.have.property('_id');
		// 		res.body.firstName.should.equal('JP');
		// 		res.body.lastName.should.equal('Berd');
		// 		res.body.creationDate.should.not.equal(null);
		// 		done();
		// 	});
		// });
	});
});
