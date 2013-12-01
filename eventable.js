"use strict";

var dcl = require( "dcl" );
var Destroyable = require( "dcl/mixins/Destroyable" );
var lifecycle = require( "./lifecycle" );
var events = require( "eventemitter2" );
var sys = require( "lodash" );
var strings = require( "ink-strings" );

var C = dcl( [Destroyable, events.EventEmitter2], {
	destroy     : function () {
		this.removeAllListeners();
	},
	constructor : function () {
		this.trigger = this.emit;
	},
	emit        : dcl.advise( {
		around : function ( sup ) {
			return function ( eventName ) {
				var hasWildcard = false;
				if ( sys.isArray( eventName ) ) {
					if ( eventName.indexOf( "*" ) > -1 || eventName.indexOf( "**" ) > -1 ) {
						hasWildcard = true;
					}
				} else if ( sys.isString( eventName ) ) {
					hasWildcard = eventName.indexOf( "*" ) > -1;
				}
				if ( !hasWildcard ) {
					var triggerName = "on";
					var partArr;
					if ( !sys.isArray( eventName ) ) {
						partArr = eventName.split( this.delimiter );
					} else {
						partArr = eventName;
					}

					sys.each( partArr, function ( part ) {
						triggerName += strings.capitalize( part );
					} );

					if ( sys.isFunction( this[triggerName] ) ) {
						this[triggerName].apply( this, sys.rest( sys.toArray( arguments ) ) );
					}
				}
				sup.apply( this, arguments );
			};
		}
	} )
} );

lifecycle.use( C, exports );
