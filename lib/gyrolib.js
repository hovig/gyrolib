/*******************************************************************************
 * Author: Hovig Ohannessian - Initial implementation
 *******************************************************************************/
(function(window) {
	'use strict'
	
	var Gyroscope = {};
	var x = 0, y = 0;
	var alpha = 0, beta = 0, gamma = 0;
	var upperLeftCoordsX = 0, upperLeftCoordsY = 0;
	var lowerRightCoordsX = 0, lowerRightCoordsY = 0;
	var coefX = 0, coefY = 0;
	var lpfilterX = new LowPassFilter();
	var lpfilterY = new LowPassFilter();	
	var gyroMath = new GyroMath();
	var socket = io();
	
	function defineGyro() {
		// Read Gyroscope sensor data
		Gyroscope.read = function() {
			var coords = {alpha: 0, beta: 0, gamma: 0};
			if(window.DeviceOrientationEvent) {
				window.addEventListener("deviceorientation", function () {
				coords = { alpha: event.alpha, beta: event.beta, gamma: event.gamma }
				socket.emit('coords', JSON.stringify(coords));
				gyroObjects(event.alpha, event.beta, event.gamma)
				}, true);
			}
		};

		// Display converted Gyroscope coordinates
		Gyroscope.execute = function(imgName) {
			setInterval(function() { 
				var img = document.getElementById(imgName);
				var delay = 10;
				x = lpfilterX.process(Math.abs(lowerRightValues.lowerRightCoordsX - alpha)*coefValues.coefX);
				y = lpfilterY.process(Math.abs(lowerRightValues.lowerRightCoordsY - beta)*coefValues.coefY);
			
				if(coefValues.coefX > 0){  		
					img.style.left = x + "px";
					img.style.top = y + "px";
					convertedGyro(x, y);
				}
			}, delay);			
		};	

		// Main socket.on needed to start
		Gyroscope.socketOn = function() {
			socket.on('Coords', function(msg){
				msg = JSON.parse(msg);
				alpha = gyroMath.check(msg.alpha);
				beta = msg.beta;
			});
			socket.on('CaliberateUpperLeft', function(msg){
				msg = JSON.parse(msg);
				upperLeftCoordsX = msg.alpha;
				upperLeftCoordsY = msg.beta;
				upperLeftCoords(upperLeftCoordsX, upperLeftCoordsY)
			});
			socket.on('CaliberateLowerRight', function(msg){
				msg = JSON.parse(msg);
				lowerRightCoordsX = msg.alpha;
				lowerRightCoordsY = msg.beta;
				lowerRightCoords(lowerRightCoordsX, lowerRightCoordsY);				
			});
		};
		
		Gyroscope.ajax = function(url, method) {
			$.ajax({
				url: url,
				method: method
			});
		};
		
		Gyroscope.innerHTML = function(name, value) {
			document.getElementById(name).innerHTML = value;
		};
		
		Gyroscope.source = function(name, value) {
			document.getElementById(name).src = value;
		};
		return Gyroscope;
	}
		
	if(typeof(Gyroscope) === 'undefined') {
		window.Gyroscope = defineGyro();
	}
})(window);

// Gyroscope values sent from mobile phone
function gyroObjects(alpha, beta, gamma) {
	var gyroValues = {};
	gyroValues['alpha'] = alpha;
	gyroValues['beta'] = beta;
	gyroValues['gamma'] = gamma;
	return gyroValues;
}

// Gyroscope coordinates on browser
function convertedGyro(x, y) {
	var gyroBrowser = {};
	gyroBrowser['x'] = x;
	gyroBrowser['y'] = y;
	return gyroBrowser;
}

// Coeffiecient calculated and stored
function coefficientValues(coefX, coefY) {
	var coefValues = {};
	// "reset" the lowerRightCoordsX if > than upperLeftCoordsX on the trigonometric circle(substracting 360°)
	if(lowerRightValues.lowerRightCoordsX > upperLeftValues.upperLeftCoordsX) gyroMath.revert(true);
	lowerRightValues.lowerRightCoordsX = gyroMath.check(lowerRightValues.lowerRightCoordsX);			
	coefX = document.documentElement.clientWidth/Math.abs(lowerRightValues.lowerRightCoordsX - upperLeftValues.upperLeftCoordsX);
	coefY = document.documentElement.clientHeight/Math.abs(lowerRightValues.lowerRightCoordsY - upperLeftValues.upperLeftCoordsY);
	coefValues['coefX'] = coefX;
	coefValues['coefY'] = coefY;
	return coefValues;
}

// Upper left coords values for calibration
function upperLeftCoords(upperLeftCoordsX, upperLeftCoordsY) {
	var upperLeftValues = {};
	upperLeftValues['upperLeftCoordsX'] = upperLeftCoordsX;
	upperLeftValues['upperLeftCoordsY'] = upperLeftCoordsY;
	return upperLeftValues;
}

// Lower right coords values for calibration
function lowerRightCoords(lowerRightCoordsX, lowerRightCoordsY) {
	var lowerRightValues = {};
	lowerRightValues['lowerRightCoordsX'] = lowerRightCoordsX;
	lowerRightValues['lowerRightCoordsY'] = lowerRightCoordsY;
	return lowerRightValues;
}

// Low pass filter to reduce the noise in gyro for better positioning
function LowPassFilter() {
    this.a = 0.8;
    this.b = 1.2 - this.a;
    this.g = 0; 
}

LowPassFilter.prototype.process = function (input) {
    this.g = (input * this.b);
    return this.g;
}

// Re-calculate alpha for degree-to-pixel conversion
function GyroMath(revert) {
    this.x = false;
}
	
GyroMath.prototype.check = function(value) {
	if(this.revert && value > upperLeftCoordsX) {
		//trigonometric circle position + upper left x coordinate
		return Math.abs(360 - value) + upperLeftCoordsX; 
	}
	return value;
}
	
GyroMath.prototype.revert = function(value) {
	this.x = value;
}

// Mouse event coordinates on browser
function showMouseEventCoords(event) {
	var mouseX = event.clientX;
	var mouseY = event.clientY;
	document.getElementById("mouseX").innerHTML = mouseX;
	document.getElementById("mouseY").innerHTML = mouseY;
}
