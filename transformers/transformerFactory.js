var UnifiedTransformer = require('./UnifiedTransformer');
var HsmTransformer = require('./HsmTransformer');
var RawTransformer = require('./RawTransformer');

module.exports = function (format) {
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
