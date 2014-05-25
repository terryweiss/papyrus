"use strict";
var dcl = require( "dcl" );
var sys = require( "lodash" );
var Destroyable = require( "dcl/mixins/Destroyable" );
var Eventable = require( "./eventable" );

var C = dcl( [Eventable, Destroyable], {
	declaredClass : "Bindable",
	bindings      : {},

	constructor : function () {
		this.__bound = null;
	},

	bind : function ( obj ) {
		this.__bound = obj;

		sys.each( obj, function ( val, key ) {
			if ( !sys.isFunction( val ) ) {
				Object.defineProperty( this, key, {
					get          : function () {
						return this.__bound[key];
					},
					set          : function ( val ) {
						var params = {
							property : key,
							newValue : val,
							oldValue : this.__bound[key],
							prevent  : false,
							async    : false,
							callback : exec
						};
						var that = this;

						that.trigger( "change", params );
						that.trigger( "change." + key, params );
						if ( !params.async ) {
							exec( params );
						}

						function exec( params ) {
							if ( !params.prevent ) {
								that.__bound[key] = val;
								delete params.prevent;
								that.trigger( "changed", params );
								that.trigger( "changed." + key, params );
							}
						}
					},
					enumerable   : true,
					writable     : true,
					configurable : true
				} );
			}
		}, this );
	},

	bindToBindable : function ( obj ) {
		if ( obj.declaredClass === "Bindable" ) {
			obj.on( "change", function ( state ) {

			} );
		}
	},

	unbind : function () {
		this.removeAllListeners();

		sys.each( this.__bound, function ( val, key ) {
			if ( !sys.isFunction( val ) ) {
				delete this[key];
			}
		}, this );

		this.__bound = null;
	},

	destroy : function () {
		this.unbind();
	}
} );
