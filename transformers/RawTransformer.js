'use strict';
var log = require('../misc/logger');

module.exports = class {
	transform(workouts) {
		log.debug('raw transformer being used');
		return workouts;
	}
};
