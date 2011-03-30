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
 * @version 1.0.9
 * @license http://www.gnu.org/licenses/lgpl-3.0.txt LGPL
 *
 * Date $LastChangedDate: 2011-03-29 19:47:37 +0200 (Di, 29 Mrz 2011) $
 *
 */


(function() {

	var geolocation = this;

	this.init = function() {

		try {

			// Check for W3C Geolocation API standard support
			if(typeof (navigator.geolocation) != 'undefined') {

				geolocation.type = 'W3C Geolocation API';
				geolocation.api = navigator.geolocation;

			// Check for Google Gears support. gears_init.js must be included!
			} else if(typeof (window.google) != 'undefined' &&  typeof(window.google.gears) != 'undefined') {

				geolocation.type = 'Google Gears';
				geolocation.api = google.gears.factory.create('beta.geolocation');

			// Checks for native Blackberry support
			} else if (typeof(window.blackberry) != 'undefined' && blackberry.location.GPSSupported) {

				geolocation.type = 'Blackberry OS';
				geolocation.api = new BlackberryLocation();

			} else {

				return false;

			}

			window.navigator.geolocation = geolocation.api;
			window.navigator.geolocation['type'] = geolocation.type;

			return true;

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

		if(geolocation.api) {
			geolocation.api.getCurrentPosition(successCallback, errorCallback, options);
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

		if(geolocation.api) {
			geolocation.watchID = geolocation.api.watchPosition(successCallback, errorCallback, options);
		}

		return geolocation.watchID;

	}

	/**
	 * Clears the watchPosition callback specified as first parameter.
	 *
	 * @param integer ID of the watchPosition 
	 * @return void
	 */
	this.clearWatch = function(watchID) {

		if(watchID == NULL) {
			geolocation.api.clearWatch(geolocation.watchID);
		} else {
			geolocation.api.clearWatch(watchID);
		}

	}

	this.init();

})();




/**
 * Geolocation API wrapper for Blackberry devices
 */
function BlackberryLocation() {

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
	 * watchPosition simulation for Blackberry
	 */
	this.watchPosition = function(successCallback, errorCallback, options) {

		interval = (typeof options.maximumAge != 'undefined') ? options.maximumAge : 5000;

		watchID = window.setInterval(bb.getCurrentPosition, interval, successCallback, errorCallback, options);
		return watchID;		

	}

	this.clearWatch = function(watchID) {
		window.clearInterval(watchID);
	}

}
