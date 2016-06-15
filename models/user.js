var mongoose = require('mongoose');
var config = require('../config');
var cryptoJs = require('crypto-js');

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
	return cryptoJs.AES.decrypt(this.credentials.exerciseDotCom.password, config.encryptionKey).toString(cryptoJs.enc.Utf8);
});

module.exports = mongoose.model('User', userSchema);
