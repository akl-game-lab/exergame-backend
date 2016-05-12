var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WorkoutSchema = new Schema({
	gameId: Schema.Types.ObjectId,
	userId: Schema.Types.ObjectId,
	workoutDate: { type: Date, default: Date.now },
	totalPoints: Number,
	health: Number,
	stamina: Number,
	magicka: Number
});

module.exports = mongoose.model('Workout', WorkoutSchema);
