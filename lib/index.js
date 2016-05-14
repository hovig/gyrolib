var gyrolib = require('./gyrolib.js').gyrolib;

exports.modules = function() {
	this.gyro = new gyrolib();
}