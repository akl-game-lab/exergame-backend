'use strict';
var log = require('../misc/logger');

module.exports = class {
	transform(workouts) {
		log.debug('HSM transformer being used');
		var transformed = [];

		for (var i in workouts) {
			// Skyrim attributes, this will be generalised in the future so it can apply to more than one game.
			var health = 0;
			var stamina = 0;
			var magicka = 0;

			for (var j in workouts[i].data.workout_exercises) {
				if (workouts[i].data.workout_exercises.hasOwnProperty(j)) {
					var exerciseData = workouts[i].data.workout_exercises[j];
					if (exerciseData.hasOwnProperty('total_reps') && exerciseData.total_reps > 0) {
						// Exercise has reps, add points to health.
						health += exerciseData.total_points;
					} else if (exerciseData.hasOwnProperty('distance') && typeof parseFloat(exerciseData.distance) === 'number' && parseFloat(exerciseData.distance) > 0) {
						// Exercise has distance, add points to stamina
						stamina += exerciseData.total_points;
					} else {
						// Otherwise, add points to magicka
						magicka += exerciseData.total_points;
					}
				}
			}

			// Build object
			transformed.push({
				syncDate: Math.floor((new Date(Date.now())).valueOf() / 1000), // seconds
				workoutDate: workouts[i].data.workout_date, //seconds
				health: health,
				stamina: stamina,
				magicka: magicka
			});

			workouts[i].used = true;
			workouts[i].save();
		}

		log.debug('HSM transformed data creation successful');
		return transformed;
	}
};
