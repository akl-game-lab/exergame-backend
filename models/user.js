var mongoose = require('mongoose');
var config = require('../config');
var cryptoJs = require('crypto-js');
var log = require('../misc/logger');
var transformerFactory = require('../transformers/transformerFactory');
var ExerciseDotCom = require('../models/sources/exercise-dot-com');

var userSchema = new mongoose.Schema({
	id: String,
	username: String,
	password: String,
	email: String,
	firstName: String,
	lastName: String,
	lastPlayed: Number,

	credentials: {
		exerciseDotCom: {
			username: String,
			password: String
		}
	}
});

userSchema.virtual('credentials.exerciseDotCom.plainPassword').get(function () {
	log.debug('decoding user info');
	if(this.credentials.exerciseDotCom.password != null) {
		return cryptoJs.AES.decrypt(this.credentials.exerciseDotCom.password, config.encryptionKey).toString(cryptoJs.enc.Utf8);
	} else {
		return '';
	}

});

userSchema.statics.getRecentWorkouts = function(email, callback) {
	var format = 'recent'
	var from = 0;
	var to = Math.abs((Date.now() / 1000));
	var sendData = {
		data: {}
	};

	var transformer = transformerFactory(format);

	this.find({
		email: email
	}, function (err, users) {
		ExerciseDotCom.find({
			userEmail: email,
			dateRetrieved: {
				$gt: new Date(from * 1000),
				$lt: new Date(to * 1000)
			}
		},
		function (err, workouts) {
			log.info('recent workouts found, transforming and sending');
			sendData.data.workouts = transformer.transform(workouts);
			log.info(sendData.data.workouts)
			callback(sendData);
		});
	})
}

module.exports = mongoose.model('User', userSchema);
