'use strict';
var log = require('../misc/logger');

module.exports = class {
	transform(workouts) {
		log.debug('RecentWorkoutTransformer being used');
		var transformed = [];

		for (var i in workouts) {
			var workoutDate = workouts[i].data.workout_date;
			var workoutsRecord = [];

			for (var j in workouts[i].data.workout_exercises) {
				var exerciseName = workouts[i].data.workout_exercises[j].name;
				var exerciseReps = 0;
				var exerciseSets = 0;
				var exerciseDistance = 0;
				var exerciseDuration = 0;
				var exercisePoints = '';


				if (workouts[i].data.workout_exercises.hasOwnProperty(j)) {
					var exerciseData = workouts[i].data.workout_exercises[j];

					if (exerciseData.hasOwnProperty('total_reps') && exerciseData.total_reps > 0) {
						//Populating variables for individual exercises
						exerciseReps = exerciseData.total_reps;
						exerciseSets = exerciseData.workout_exercise_sets.length;
						exercisePoints = exerciseData.total_points * 1.25 + " health"


					} else if (exerciseData.hasOwnProperty('distance') && typeof parseFloat(exerciseData.distance) === 'number' && parseFloat(exerciseData.distance) > 0) {
						exerciseDistance = exerciseData.distance;
						exerciseSets = exerciseData.workout_exercise_sets.length;
						exercisePoints = exerciseData.total_points + " stamina"
					} else {
						exerciseDuration = exerciseData.total_time;
						exerciseSets = exerciseData.workout_exercise_sets.length;
						exercisePoints = exerciseData.total_points + " magicka"
					}
				}



				workoutsRecord.push({
					exerciseName: exerciseName,
					reps: exerciseReps,
					sets: exerciseSets,
					distance: exerciseDistance,
					duration: exerciseDuration/60,
					points: exercisePoints
				});
			}

			transformed.push({
				workoutDate: new Date(workouts[i].data.workout_date*1000).toString().split(' ').slice(0, 4).join(' '),
				workoutsRecord: workoutsRecord
			});


		}

		log.debug('\'Recent Workouts\' transformed data creation successful');
		return transformed;
	}
};
