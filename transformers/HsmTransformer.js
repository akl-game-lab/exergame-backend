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
			var workoutDate = workouts[i].data.workout_date;
			var workoutsRecord = [];

			for (var j in workouts[i].data.workout_exercises) {
				var exerciseName = workouts[i].data.workout_exercises[j].name;
				var exerciseReps = 0;
				var exerciseSets = 0;
				var exerciseDistance = 0;
				var exerciseDuration = 0;
				var exerciseHealth = 0;
				var exerciseMagicka = 0;
				var exerciseStamina = 0;


				if (workouts[i].data.workout_exercises.hasOwnProperty(j)) {
					var exerciseData = workouts[i].data.workout_exercises[j];

					if (exerciseData.hasOwnProperty('total_reps') && exerciseData.total_reps > 0) {
						//Populating variables for individual exercises
						exerciseReps = exerciseData.total_reps;
						exerciseSets = exerciseData.workout_exercise_sets.length;
						exerciseHealth = exerciseData.total_points;

						// Accumulate total workout points
						health += exerciseData.total_points;


					} else if (exerciseData.hasOwnProperty('distance') && typeof parseFloat(exerciseData.distance) === 'number' && parseFloat(exerciseData.distance) > 0) {
						exerciseDistance = exerciseData.distance;
						exerciseSets = exerciseData.workout_exercise_sets.length;
						exerciseStamina = exerciseData.total_points;

						stamina += exerciseData.total_points;

					} else {
						exerciseDuration = exerciseData.total_time;
						exerciseSets = exerciseData.workout_exercise_sets.length;
						exerciseMagicka = exerciseData.total_points;

						magicka += exerciseData.total_points;
					}
				}



				workoutsRecord.push({
					exerciseName: exerciseName,
					reps: exerciseReps,
					sets: exerciseSets,
					distance: exerciseDistance,
					duration: exerciseDuration,
					health: exerciseHealth,
					stamina: exerciseStamina,
					magicka: exerciseMagicka
				});
			}

			transformed.push({
				syncDate: Math.floor((new Date(Date.now())).valueOf() / 1000), // seconds
				workoutDate: workouts[i].data.workout_date, //seconds
				health: health,
				stamina: stamina,
				magicka: magicka,
				workoutsRecord: workoutsRecord
			});

			workouts[i].used = true;
			workouts[i].save();
		}

		log.debug('HSM transformed data creation successful');
		return transformed;
	}
};
