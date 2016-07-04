var UnifiedTransformer = require('./UnifiedTransformer');
var HsmTransformer = require('./HsmTransformer');
var RawTransformer = require('./RawTransformer');
var log = require('../misc/logger');

module.exports = function (format) {
	log.debug('transformer factory being used');
	switch (format) {
		case 'hsm':
			return new HsmTransformer();
		case 'unified':
			return new UnifiedTransformer();
		case 'raw':
			return new RawTransformer();
		default:
	}
};
