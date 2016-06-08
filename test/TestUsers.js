var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var http = require('http');
var bCrypt = require('bcrypt-nodejs');
var parseString = require('xml2js').parseString;

var server = require('../index');
var db = require('../db');
var User = require('../models/user');

describe('/users', function() {
	var url = 'http://localhost:3000';

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
				var dummyUser = new User({
					username: 'example%40example.com',
					password: 'f$1-ien-J9J-0Pb',
					email: 'example%40example.com',
					firstName: 'Test',
					lastName: 'User',
					credentials: {}
				})
				done();
			});
		});
	});

	after(function (done) {
		User.remove({firstName: 'Test'}, function () {
			done();
		});
	});

	describe('/{id}/workouts/{from}/{to}', function() {
		it('should return a 404 error if the user does not exist', function(done) {
			// Make the request
			request(url)
			.get('/users/fakeuser/workouts/0/9999999999999')
			// end handles the response
			.end(function(err, res) {
				assert.ifError(err);

				assert.equal(res.status, 404, 'request returned an error');

				parseString(res.text, function (err, data) {
					assert.deepEqual(data.data, {
						errorCode: ['404'],
						errorMessage: ['User not found']
					});
					done();
				});
			});
		});

		// it('should create a new user when a post is made', function (done) {
		// 	var data = {
		// 		username: 'TestUser',
		// 		password: 'TestPassword',
		// 		email: 'test@example.com',
		// 		firstName: 'Test',
		// 		lastName: 'User'
		// 	}
		//
		// 	request(url)
		// 	.post('/signup')
		// 	.send(data)
		// 	.end(function (err, res) {
		// 		assert.ifError(err);
		//
		// 		assert.equal(res.status, 302, 'request returned an error');
		// 		assert.equal(res.text, 'Found. Redirecting to /home');
		//
		// 		// Check user was created
		// 		User.find({firstName: 'Test'}, function (err, results) {
		// 			assert.ifError(err);
		//
		// 			assert.equal(results.length, 1);
		//
		// 			assert.equal(results[0].username, 'TestUser');
		// 			assert.ok(bCrypt.compareSync('TestPassword', results[0].password));
		// 			assert.equal(results[0].email, 'test@example.com');
		// 			assert.equal(results[0].firstName, 'Test');
		// 			assert.equal(results[0].lastName, 'User');
		//
		// 			done();
		// 		});
		// 	});
		// });

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
