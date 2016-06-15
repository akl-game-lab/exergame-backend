var UnifiedTransformer = require('./UnifiedTransformer');
var HsmTransformer = require('./HsmTransformer');

module.exports = function (format) {
	switch (format) {
		case 'hsm':
			return new HsmTransformer();
		case 'unified':
			return new UnifiedTransformer();
		default:
	}
};
