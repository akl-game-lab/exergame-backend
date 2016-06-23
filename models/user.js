var mongoose = require('mongoose');
var config = require('../config');
var cryptoJs = require('crypto-js');
var log = require('../misc/logger');

var userSchema = new mongoose.Schema({
	id: String,
	username: String,
	password: String,
	email: String,
	firstName: String,
	lastName: String,

	credentials: {
		exerciseDotCom: {
			username: String,
			password: String
		}
	}
});

userSchema.virtual('credentials.exerciseDotCom.plainPassword').get(function () {
	log.debug('decoding user info');
	return cryptoJs.AES.decrypt(this.credentials.exerciseDotCom.password, config.encryptionKey).toString(cryptoJs.enc.Utf8);
});

module.exports = mongoose.model('User', userSchema);
