var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
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
