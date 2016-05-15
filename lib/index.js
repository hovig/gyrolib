var gyrolib = require('./gyrolib.js');

exports.modules = function() {
	this.gyro = new gyrolib();
}
