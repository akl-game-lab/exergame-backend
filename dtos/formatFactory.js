var UnifiedFormat = require('./UnifiedFormat');
var HsmFormat = require('./HsmFormat');

module.exports = function (format) {
	switch (format) {
		case 'hsm':
			return new HsmFormat();
			break;
		case 'unified':
			return new UnifiedFormat();
			break;
		default:
	}
};
