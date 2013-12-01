"use strict";
var sys = require( "lodash" );
var dcl = require( "dcl" );

exports.mix = function ( C, obj ) {
	if ( sys.isFunction( obj ) ) {
		return dcl( [obj, C], {} );
	} else {
		var instance = new C();
		return sys.extend( obj, instance );
	}
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
