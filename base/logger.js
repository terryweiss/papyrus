"use strict";
/**
 * @fileOverview The logging system for papyrus is based on [http://pimterry.github.io/loglevel/](loglevel) and slightly decorated
 * @module base/logger
 * @requires dcl
 * @requires loglevel
 * @requires base/chains
 */

var dcl = require( "dcl" );
var chains = require( "./chains" );
var log = require( 'loglevel' );

/**
 * A simple logger that can be shared betwixt browser and server.
 * @constructor
 */
var Logger = dcl( [chains], /** @lends  module:base/logger.Logger */{
	declaredClass : "base/Logger",
	log           : {
		/**
		 * Turn off all logging. If you log something, it will not error, but will not do anything either
		 * and the cycles are minimal.
		 */
		silent : function () {
			log.disableAll();
		},
		/**
		 * Turns on all logging levels
		 */
		all    : function () {
			log.enableAll();
		},
		/**
		 * Sets the logging level to one of `trace`, `debug`, `info`, `warn`, `error`.
		 * @param {string} lvl The level to set it to. Can be  one of `trace`, `debug`, `info`, `warn`, `error`.
		 */
		level  : function ( lvl ) {
			if ( lvl.toLowerCase() === "none" ) {
				log.disableAll();
			} else {
				log.setLevel( lvl );
			}
		},
		/**
		 * Log a `trace` call
		 * @method
		 * @param {string} The value to log
		 */
		trace  : log.trace,
		/**
		 * Log a `debug` call
		 * @method
		 * @param {string} The value to log
		 */
		debug  : log.debug,
		/**
		 * Log a `info` call
		 * @method
		 * @param {string} The value to log
		 */
		info   : log.info,
		/**
		 * Log a `warn` call
		 * @method
		 * @param {string} The value to log
		 */
		warn   : log.warn,
		/**
		 * Log a `error` call
		 * @method
		 * @param {string} The value to log
		 */
		error  : log.error
	}
} );

modile.exports = Logger;
