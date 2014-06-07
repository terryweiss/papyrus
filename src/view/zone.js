"use strict";

var Base = require( "../base" );
var Signalable = require( "../mixins/signalable" );
var View = require( "./index" );
var sys = require( "lodash" );
var collector = require( "../document/collector" ).object;
var async = require( "async" );
/**
 * A zone is a special kind of view that contains other views
 * @constructor
 * @exports view/zone
 */
var Zone = Base.compose( [Base, View], /** @lends view/zone# */{
	constructor   : function () {
		this.viewsCollection = collector();
		this.views = this.viewsCollection._heap;
	},
	/**
	 * Add a a view definitions to the zone. If any members of the hash already exist, they will be overwritten.
	 * @param {hash} viewDefs A hash of viewDefs you want to set
	 * @protected
	 */
	_addViewDefss : function ( viewDefs ) {
		viewDefs = viewDefs || {};
		if ( this._viewsDefs ) {viewDefs = sys.extend( {}, sys.result( this, '_viewsDefs' ), viewDefs );}
		this._viewsDefs = viewDefs;
	},
	/**
	 * Loads up the view definitions that were defined and mounts them
	 * @param {object} views The views to load on render
	 * @protected
	 */
	_loadViews    : function ( views ) {
		if ( this.views ) {views = sys.extend( {}, sys.result( this, '_viewsDefs' ), views );}

		sys.each( views, function ( val, key ) {
			var instance;
			var opts = sys( isString( val ) ) ? {selector : val} : val || {};
			if ( sys.isFunction( val.Type ) ) {
				opts = sys.omit( val, "Type" );
				instance = new val.Type( opts );
			} else {
				instance = new View( val );
			}
			if ( instance ) {
				this.views[key] = instance;
			}
		}, this );
	},
	mountView     : function ( name, view, opts, callback ) {
		var mountIn = null;
		if ( sys.isString( opts ) ) {
			opts = sys( isString( opts ) ) ? {selector : opts} : opts || {empty : true, placement : "append"};
		}
		async.series( [
			function ( done ) {
				if ( this.views[name] && this.views[name] instanceof View ) {
					this.views[name].end( done );
				} else {
					done();
				}
			},
			function ( done ) {
				if ( opts.selector ) {
					if ( opts.global === true ) {
						mountIn = $( opts.selector );
					} else {
						mountIn = this.$el.find( opts.selector );
					}
				} else if ( opts.mountIn && opts.mountIn instanceof jQuery ) {
					mountIn = opts.mountIn;
				} else {
					mountIn = this.$el;
				}
				done();
			},
			function ( done ) {
				if ( mountIn ) {
					if ( opts.empty === true ) {
						mountIn.empty();
					}
					if ( opts.placement === "append" ) {
						mountIn.append( view.$el );
					} else {
						mountIn.prepend( view.$el );
					}
				}
				done();
			}
		], callback );
	}
} );

module.exports = Zone;
