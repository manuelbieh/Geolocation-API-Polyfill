/**
 * Geolocation API crossbrowser support
 *
 * This library provides a consistent Geolocation interface for miscellaneous 
 * web browsers. It only supports Javascript in a web browser and is not 
 * tested and will probably not work for use in Titanium, PhoneGap, etc. 
 * http://www.w3.org/TR/geolocation-API/
 * 
 * @author Manuel Bieh
 * @url http://www.manuel-bieh.de/
 * @version 0.9
 * @license http://www.gnu.org/licenses/lgpl-3.0.txt LGPL
 *
 * Date $LastChangedDate: 2010-08-29 22:18:07 +0200 (So, 29 Aug 2010) $
 *
 */

var GeolocationWrapper = function() {

	var geo = this;

	this.init = function() {

		try {

			// Check for W3C Geolocation API standard support
			if(typeof (navigator.geolocation) != 'undefined') {

				geo.type = 'W3C Geolocation API';
				geo.api = navigator.geolocation;
				return true;

			// Check for Google Gears support. gears_init.js must be included!
			} else if(typeof (window.google) != 'undefined' &&  typeof(window.google.gears) != 'undefined') {

				geo.type = 'Google Gears';
				geo.api = google.gears.factory.create('beta.geolocation');
				return true;

			// Checks for native Blackberry support
			} else if (typeof(window.blackberry) != 'undefined' && blackberry.location.GPSSupported) {

				geo.type = 'Blackberry OS';
				geo.api = new BlackberryLocation();
				return true;

			} else {

				return false;

			}

		} catch(e) {

			if (typeof(console) != "undefined") {
				console.log(e);
			}

		}

	}

	/**
	 * Gets the current position of the user and executes a callback function
	 *
	 * @param function Callback function which is executed on success
	 * @param function Callback function which is executed on error
	 * @param function Options
	 * @return void
	 */
	this.getCurrentPosition = function(successCallback, errorCallback, options) {

		if(geo.api) {
			geo.api.getCurrentPosition(successCallback, errorCallback, options);
		}

	}

	/**
	 * Calls a callback function every time the user's position changes
	 *
	 * @param function Callback function which is executed on success
	 * @param function Callback function which is executed on error
	 * @param function Options
	 * @return integer ID of the watchPosition callback
	 */
	this.watchPosition = function(successCallback, errorCallback, options) {

		if(geo.api) {
			geo.watchID = geo.api.watchPosition(successCallback, errorCallback, options);
		}

		return geo.watchID;

	}

	/**
	 * Clears the watchPosition callback specified as first parameter.
	 *
	 * @param integer ID of the watchPosition 
	 * @return void
	 */
	this.clearWatch = function(watchID) {

		if(watchID == NULL) {
			geo.api.clearWatch(geo.watchID);
		} else {
			geo.api.clearWatch(watchID);
		}

	}

	this.init();

}




/**
 * Geolocation API wrapper for Blackberry devices
 */
var BlackberryLocation = function() {

	bb = this;

	this.getCurrentPosition = function(successCallback, errorCallback, options) {

		// set to autonomous mode
		blackberry.location.setAidMode(2);

		if(blackberry.location.latitude==0 && blackberry.location.longitude==0) {

			errorCallback.call();

		} else {

			//blackberry.location.onLocationUpdate(successCallback);
			blackberry.location.refreshLocation();

			ts = (parseFloat(navigator.appVersion) >= 4.6) ? new Date(blackberry.location.timestamp) : 0;
			successCallback.call(this, {timestamp: ts, coords: {latitude: blackberry.location.latitude, longitude: blackberry.location.longitude}});

		}

	}

	/**
	 * Temporary watchPosition simulation for Blackberry
	 */
	this.watchPosition = function(successCallback, errorCallback, options) {

		interval = (typeof options.maximumAge != 'undefined') ? options.maximumAge : 3000;

		watchID = window.setInterval(bb.getCurrentPosition, interval, successCallback, errorCallback, options);
		return watchID;		

	}

	this.clearWatch = function(watchID) {
		window.clearInterval(watchID);
	}

}
