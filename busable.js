"use strict";

var dcl = require( "dcl" );
var bus = require( "./system.bus" );
var sys = require( "lodash" );
var collector = require( "ink-collector" );
var lifecycle = require( "./lifecycle" );
var Destroyable = require( "dcl/mixins/Destroyable" );

//noinspection JSUnusedGlobalSymbols,JSHint
var C = exports = dcl( Destroyable, {
	declaredClass : "Busable",
	constructor   : function ( channelName ) {
		var subscriptions = collector.array();

		//noinspection JSUnusedGlobalSymbols
		Object.defineProperty( this, "subscriptions", {
			get : function () {
				return  subscriptions;
			}
		} );

		this.channel = null;
		this.channelName = channelName;
		if ( !sys.isEmpty( this.channelName ) ) {
			this.defineChannel( this.channelName );
		}
	},

	defineChannel : function ( name ) {
		this.channelName = name;
		this.channel = bus.channel( name );
		return this.channel;
	},

	subscribe : function ( channelName, topic, options, callback ) {
		if ( sys.isFunction( topic ) ) {
			callback = topic;
			topic = channelName;
			channelName = null;
			options = null;
		}
		if ( sys.isFunction( options ) ) {
			callback = options;
			options = null;
		}

		var subscription;
		var def = {callback : sys.bind( callback, this ), topic : topic};
		if ( this.channel ) {
			subscription = this.channe.subscribe( def );
		} else {

			if ( channelName ) {
				def.channelName = channelName;
			} else if ( this.channelName ) {
				def.channelName = this.channelName;
			}
			subscription = bus.subscribe( def );
		}

		this.subscription.push( subscription );

		if ( !sys.isEmpty( options ) ) {
			if ( options.defer === true ) {
				subscription.defer();
			}
			if ( options.once === true ) {
				subscription.disposeAfter( 1 );
			}
			if ( sys.isNumber( options.times ) ) {
				subscription.disposeAfter( options.times );
			}
			if ( sys.isNumber( options.debounce ) ) {
				subscription.withDebounce( options.debounce );
			}
			if ( sys.isNumber( options.delay ) ) {
				subscription.withDelay( options.delay );
			}
			if ( sys.isNumber( options.throttle ) ) {
				subscription.withThrottle( options.throttle );
			}
			if ( options.distinct === true ) {
				subscription.distinct();
			}
			if ( options.distinctUntilChanged === true ) {
				subscription.distinctUntilChanged();
			}
			if ( sys.isFunction( options.withConstraint ) ) {
				subscription.withConstraint( options.withConstraint );
			}
			if ( sys.isArray( options.withConstraints ) ) {
				subscription.withConstraints( options.withConstraints );
			}
			if ( sys.isObject( options.withContext ) ) {
				subscription.withContext( options.withContext );
			}
			if ( sys.isObject( options.context ) ) {
				subscription.withContext( options.context );
			}
			if ( sys.isObject( options.thisObj ) ) {
				subscription.withContext( options.thisObj );
			}
		}
		return subscription;
	},

	unsubscribe : function ( channelName, topic ) {
		if ( arguments.length === 1 ) {
			topic = channelName;
			channelName = null;
		}
		var def = {topic : topic};

		if ( channelName ) {
			def.channelName = channelName;
		} else if ( this.channelName ) {
			def.channelName = this.channelName;
		}

		var sub = this.subscriptions.seek( def );
		if ( !sys.isEmpty( sub ) && sys.isFunction( sub.unsubscribe ) ) {
			sub.unsubscribe();
		}
		this.subscriptions.remove( def );
	},

	publish : function ( channelName, topic, payload ) {
		if ( sys.isFunction( topic ) ) {
			payload = topic;
			topic = channelName;
			channelName = null;
		}

		var def = {data : payload, topic : topic};
		if ( this.channel ) {
			this.channe.publish( topic, payload );
		} else {

			if ( channelName ) {
				def.channelName = channelName;
			} else if ( this.channelName ) {
				def.channelName = this.channelName;
			}
			bus.publish( def );
		}
	},

	destroy : function () {
		this.subscriptions.each( function ( sub ) {
			if ( !sys.isEmpty( sub ) && sys.isFunction( sub.unsubscribe ) ) {
				sub.unsubscribe();
			}
		} );
		this.subscriptions.remove();
		this.subscriptions.destroy();
	}
} );

lifecycle.use( C, exports );
