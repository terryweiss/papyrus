"use strict";
/**
 * @fileOverview Tools to integrate and compose objects
 * @module utils/construct
 */
var sys = require( "lodash" );
var dcl = require( "dcl" );
/**
 * Mixes one thing into another
 * @param {function|object} Source The thing to mixin into the `target`. This can
 * be an object or a class. If a class, `Source` is added to `target`'s prototype.
 * @param target
 * @returns {*}
 */
exports.mix = function ( Source, target ) {
//	if ( sys.isFunction( target ) ) {
//		return dcl( [target, Source], {} );
//	} else {
//		var instance
//		instance = new Source();
//		return sys.extend( target, instance );
//	}
};

exports.safeMix = function ( C, obj ) {
	if ( sys.isFunction( obj ) ) {
		return dcl( [obj, C], {} );
	} else {
		var instance = new C();
		return sys.defaults( obj, instance );
	}
};

exports.extend = function ( roots, def ) {
	return dcl( roots, def );
};

exports.use = function ( C, exp ) {
	exp.mix = sys.partial( exports.mix, C );
	exp.safeMix = sys.partial( exports.safeMix, C );
	exp.extend = function ( roots, def ) {
		if ( arguments.length === 1 ) {
			return exports.extend( C, def );
		} else {
			if ( sys.isArray( roots ) ) {
				roots.push( C );
			} else {
				roots = [roots, C];
			}
			return exports.extend( roots, def );
		}
	};
};
