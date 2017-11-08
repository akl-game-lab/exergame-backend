'use strict'
const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const http = require('http');
const bCrypt = require('bcrypt-nodejs');

const server = require('../index');
const db = require('../db');
const User = require('../models/user');
const Workout = require('../models/sources/exercise-dot-com');

describe('/users', () => {
	const url = 'http://localhost';

	before(function(done) {
		// In our tests we use the test db
		mongoose.connection.close( err => {
			if (err) {
				console.error(err);
			}
			mongoose.connect(db.testUrl, err => {
				if (err) {
					console.error(err);
				}

				// Populate Database
				const dummyUser = new User({
					username: 'example@example.com',
					password: 'f$1-ien-J9J-0Pb',
					email: 'example@example.com',
					firstName: 'Test',
					lastName: 'User',
					credentials: {}
				});
				dummyUser.save( err => {
					if(err) {
						console.error(err);
					}
					const dummyUser2 = new User({
						username: 'hasdata@example.com',
						password: 'f$1-ien-J9J-0Pb',
						email: 'hasdata@example.com',
						firstName: 'Test',
						lastName: 'User',
						credentials: {}
					});
					dummyUser2.save( err => {
						const workoutData = require('./data/exercise.json');
						workoutData.dateRetrieved = new Date();
						const dummyWorkout = new Workout(workoutData);
						dummyWorkout.save( err => {
							if(err) {
								console.error(err);
							}
							done();
						});
					});
				});
			});
		});
	});

	after(done => {
		User.remove({firstName: 'Test'}, () => {
			Workout.remove({userEmail: 'hasdata@example.com'}, () => {
				done();
			});
		});
	});

	describe('/{id}/workouts/{format}/{from}/{to}', () => {
		it('should return a 404 error if an invalid format is used.', done => {
			// Make the request
			request(url)
			.get('/users/example%40example.com/workouts/ham/0/9999999999999')
			// end handles the response
			.end((err, res) => {
				assert.ifError(err);

				assert.equal(res.status, 404, 'request returned the wrong status');

				const data = JSON.parse(res.text);

				assert.deepEqual(data.data, {
					errorCode: '404',
					errorMessage: 'No such format: ham'
				});
				done();
			});
		});

		it('should return a 404 error if an invalid format is used with an invalid date.', done => {
			// Make the request
			request(url)
			.get('/users/example%40example.com/workouts/ham/2/1')
			// end handles the response
			.end((err, res) => {
				assert.ifError(err);

				assert.equal(res.status, 404, 'request returned the wrong status');

				const data = JSON.parse(res.text);

				assert.deepEqual(data.data, {
					errorCode: '404',
					errorMessage: 'No such format: ham'
				});
				done();
			});
		});

		it('should return a 404 error if the user does not exist and the data format does not exist.', done => {
			// Make the request
			request(url)
			.get('/users/fakeuser/workouts/ham/0/9999999999999')
			// end handles the response
			.end((err, res) => {
				assert.ifError(err);

				assert.equal(res.status, 404, 'request returned the wrong status');

				const data = JSON.parse(res.text);

				assert.deepEqual(data.data, {
					errorCode: '404',
					errorMessage: 'User not found'
				});
				done();
			});
		});
	});

	describe('/{id}/workouts/hsm/{from}/{to}', () => {
		it('should return an empty workouts object if the user exists but has no data.', done => {
			// Make the request
			request(url)
			.get('/users/example%40example.com/workouts/hsm/0/1476488494184')
			// end handles the response
			.end((err, res) => {
				assert.ifError(err);

				assert.equal(res.status, 200, 'request returned an error');

				const data = JSON.parse(res.text);

				assert.deepEqual(data.data, {
					workouts: [],
				});
				done();
			});
		});

		it('should return data as json if the user exists and has data.', done => {
			// Make the request
			request(url)
			.get('/users/hasdata%40example.com/workouts/hsm/0/1500000000000')
			// end handles the response
			.end((err, res) => {
				assert.ifError(err);

				assert.equal(res.status, 200, 'request returned an error');

				const data = JSON.parse(res.text);

				data.data.workouts[0].syncDate = 'Untestable';
				assert.deepEqual(data.data, {
					workouts: [
						{
							health: 0,
							magicka: 0,
							stamina: 1001,
							syncDate: 'Untestable',
							workoutDate: '1463011200',
							workoutsRecord: [
	              {
	                'distance': '4.97',
	                'duration': 0,
	                'exerciseName': 'Running',
	                'health': 0,
	                'magicka': 0,
	                'reps': 0,
	                'sets': 0,
	                'stamina': 1001
	              }
	           	],
						}
					]
				});
				done();
			});
		});

		it('should return 400 if the user exists but from date is invalid', done => {
			// Make the request
			request(url)
			.get('/users/example%40example.com/workouts/hsm/-1/100')
			// end handles the response
			.end((err, res) => {
				assert.ifError(err);

				assert.equal(res.status, 400, 'request returned the wrong status');

				const data = JSON.parse(res.text);

				assert.deepEqual(data.data, {
					errorCode: '400',
					errorMessage: 'Invalid date(s)'
				});
				done();
			});
		});

		it('should return 400 if the user exists but to date is invalid', done => {
			// Make the request
			request(url)
			.get('/users/example%40example.com/workouts/hsm/100/word')
			// end handles the response
			.end((err, res) => {
				assert.ifError(err);

				assert.equal(res.status, 400, 'request returned the wrong status');

				const data = JSON.parse(res.text);

				assert.deepEqual(data.data, {
					errorCode: '400',
					errorMessage: 'Invalid date(s)'
				});
				done();
			});
		});

		it('should return 400 if the user exists but from dates are not in order', done => {
			// Make the request
			request(url)
			.get('/users/example%40example.com/workouts/hsm/100/50')
			// end handles the response
			.end((err, res) => {
				assert.ifError(err);

				assert.equal(res.status, 400, 'request returned the wrong status');

				const data = JSON.parse(res.text);

				assert.deepEqual(data.data, {
					errorCode: '400',
					errorMessage: 'Invalid date(s)'
				});
				done();
			});
		});

		it('should return a 404 error if the user does not exist', done => {
			// Make the request
			request(url)
			.get('/users/fakeuser/workouts/hsm/0/9999999999999')
			// end handles the response
			.end((err, res) => {
				assert.ifError(err);

				assert.equal(res.status, 404, 'request returned the wrong status');

				const data = JSON.parse(res.text);

				assert.deepEqual(data.data, {
					errorCode: '404',
					errorMessage: 'User not found'
				});
				done();
			});
		});

		it('should return raw data for user', done => {
			request(url)
			.get('/users/hasdata%40example.com/workouts/raw/0/1500000000000')
			// end handles the response
			.end((err, res) => {
				assert.ifError(err);

				assert.equal(res.status, 200, 'request returned an error');

				const data = JSON.parse(res.text);
				const rawData = require('./data/raw.json');
				data.data.workouts[0]._id = 'Untestable';
				data.data.workouts[0].dateRetrieved = 'Untestable';
				assert.deepEqual(data.data, rawData);
				done();
			});
		});
	});

	describe('/{id}/workouts/unified/{from}/{to}', () => {
		it('should return an empty workouts object if the user exists but has no data.', done => {
			// Make the request
			request(url)
			.get('/users/example%40example.com/workouts/unified/0/1476488494184')
			// end handles the response
			.end((err, res) => {
				assert.ifError(err);

				assert.equal(res.status, 200, 'request returned an error');

				const data = JSON.parse(res.text);

				assert.deepEqual(data.data, {
					workouts: [],
				});
				done();
			});
		});

		it('should return data as json in the unified format if the user exists and has data.', done => {
			// Make the request
			request(url)
			.get('/users/hasdata%40example.com/workouts/unified/0/1500000000000')
			// end handles the response
			.end((err, res) => {
				assert.ifError(err);

				assert.equal(res.status, 200, 'request returned an error');

				const data = JSON.parse(res.text);

				data.data.workouts[0].syncDate = 'Untestable';
				assert.deepEqual(data.data, {
					workouts: [
						{
							points: 1001,
							syncDate: 'Untestable',
							workoutDate: '1463011200'
						}
					]
				});
				done();
			});
		});

		it('should return 400 if the user exists but from date is invalid', done => {
			// Make the request
			request(url)
			.get('/users/example%40example.com/workouts/unified/-1/100')
			// end handles the response
			.end((err, res) => {
				assert.ifError(err);

				assert.equal(res.status, 400, 'request returned the wrong status');

				const data = JSON.parse(res.text);

				assert.deepEqual(data.data, {
					errorCode: '400',
					errorMessage: 'Invalid date(s)'
				});
				done();
			});
		});

		it('should return 400 if the user exists but to date is invalid', done => {
			// Make the request
			request(url)
			.get('/users/example%40example.com/workouts/unified/100/word')
			// end handles the response
			.end((err, res) => {
				assert.ifError(err);

				assert.equal(res.status, 400, 'request returned the wrong status');

				const data = JSON.parse(res.text);

				assert.deepEqual(data.data, {
					errorCode: '400',
					errorMessage: 'Invalid date(s)'
				});
				done();
			});
		});

		it('should return 400 if the user exists but from dates are not in order', done => {
			// Make the request
			request(url)
			.get('/users/example%40example.com/workouts/unified/100/50')
			// end handles the response
			.end((err, res) => {
				assert.ifError(err);

				assert.equal(res.status, 400, 'request returned the wrong status');

				const data = JSON.parse(res.text);

				assert.deepEqual(data.data, {
					errorCode: '400',
					errorMessage: 'Invalid date(s)'
				});
				done();
			});
		});

		it('should return a 404 error if the user does not exist', done => {
			// Make the request
			request(url)
			.get('/users/fakeuser/workouts/unified/0/9999999999999')
			// end handles the response
			.end((err, res) => {
				assert.ifError(err);

				assert.equal(res.status, 404, 'request returned the wrong status');

				const data = JSON.parse(res.text);

				assert.deepEqual(data.data, {
					errorCode: '404',
					errorMessage: 'User not found'
				});
				done();
			});
		});
	});
});
