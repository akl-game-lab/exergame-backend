'use strict';
var log = require('../misc/logger');

module.exports = class {
	transform(workouts) {
		log.info('unified logger being used');
		var transformed = [];

		for (var i in workouts) {
			// Total exercise per workout
			var points = 0;

			for (var j in workouts[i].data.workout_exercises) {
				if (workouts[i].data.workout_exercises.hasOwnProperty(j)) {
					var exerciseData = workouts[i].data.workout_exercises[j];

					points += exerciseData.total_points;
				}
			}

			// Build object
			transformed.push({
				syncDate: Math.floor((new Date(Date.now())).valueOf() / 1000), // seconds
				workoutDate: workouts[i].data.workout_date, //seconds
				points: points,
			});
			workouts[i].used = true;
			workouts[i].save();
		}

		return transformed;
	}
};
