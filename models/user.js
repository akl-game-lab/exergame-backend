var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	userId: Schema.Types.ObjectId,
	userName: String,
	dataSources: [String],
	games: [Schema.Types.ObjectId]
});

module.exports = mongoose.model('User', UserSchema);
