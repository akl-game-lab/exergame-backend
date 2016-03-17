var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GameSchema = new Schema({
	gameId: Schema.Types.ObjectId
});

module.exports = mongoose.model('Game', GameSchema);
