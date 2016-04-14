var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ExerciseDotComSchema = new Schema({
  workoutId: Number,
  data: Schema.Types.Mixed,
  dateRetrieved: Date,
  gamesUsed: [Schema.Types.ObjectId],
  userId: Schema.Types.ObjectId
});

module.exports = mongoose.model('ExerciseDotComExercises', ExerciseDotComSchema);
