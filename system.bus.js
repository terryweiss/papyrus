"use strict";
/**
 * @fileOverview The system  message bus. There is not one cohesive bus, there is a single bus on the server
 * and a single bus on the client. They do not communicate as of this writing.
 * It is implemented by PostalJS, see {@see https://github.com/postaljs/postal.js}
 * @module system.bus
 */
var sys = require( "lodash" );
var postal = require( "postal" )( sys );

/**
 * Subscribe creates a subscription for a given channel/topic. See
 * {@see https://github.com/postaljs/postal.js/wiki/postal.subscribe}
 * @function
 */
exports.subscribe = postal.subscribe;
/**
 * Publish publishes a message.
 * See {@see https://github.com/postaljs/postal.js/wiki/postal.publish}.
 * @function
 */
exports.publish = postal.publish;
exports.linkChannels = postal.linkChannels;
exports.channel = postal.channel;
