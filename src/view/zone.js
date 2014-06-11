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
	declaredClass : "view/zone",
	constructor   : function () {
		this.viewsCollection = collector();
		this.views = this.viewsCollection._heap;

		this._loadViews();
	},

	/**
	 * Add a a view definitions to the zone. If any members of the hash already exist, they will be overwritten.
	 * @param {hash} viewDefs A hash of viewDefs you want to set
	 * @protected
	 */
	_addViewDefs : function ( viewDefs ) {
		viewDefs = viewDefs || {};
		if ( this._viewsDefs ) {viewDefs = sys.extend( {}, sys.result( this, '_viewsDefs' ), viewDefs );}
		this._viewsDefs = viewDefs;
	},

	/**
	 * Loads up the view definitions that were defined and adds them to the collection
	 * @param {object} views The views to load on render
	 * @protected
	 */
	_loadViews : function ( views ) {
		views = sys.extend( {}, sys.result( this, '_viewsDefs' ), views );

		sys.each( views, function ( val, key ) {
			this.loadView( key, val );
		}, this );
	},

	/**
	 * Create an instance of a view and it will be added to the views collection
	 * @param {string} key The name of the view
	 * @param {object|string} val The definition
	 */
	loadView         : function ( key, val ) {
		var instance;
		var opts = sys.isString( val ) ? {selector : this.$el.find( val )} : val || {};

		if ( sys.isFunction( val.Type ) ) {
			opts = sys.omit( val, "Type" );
			instance = new val.Type( opts );
		} else {
			instance = new View( val );
		}

		if ( instance ) {
			this.views[key] = instance;
		}
	},
	/**
	 * Does what it says
	 * @param {object?} params Parameters to pass to the views
	 * @param {function?} callback A callback for when it is done
	 */
	showAllViews     : function ( params, callback ) {
		this.viewsCollection.each( function ( val, key ) {
			val.show( params, callback );
		}, this );
	},
	/**
	 * Does what it says
	 * @param {object?} params Parameters to pass to the views
	 * @param {function?} callback A callback for when it is done
	 */
	renderAllViews   : function ( params, callback ) {
		this.viewsCollection.each( function ( val, key ) {
			val.render( params, callback );
		}, this );
	},
	/**
	 * Does what it says
	 * @param {object?} params Parameters to pass to the views
	 * @param {function?} callback A callback for when it is done
	 */
	startAllViews    : function ( params, callback ) {
		this.viewsCollection.each( function ( val, key ) {
			val.start( params, callback );
		}, this );
	},
	/**
	 * Does what it says
	 * @param {object?} params Parameters to pass to the views
	 * @param {function?} callback A callback for when it is done
	 */
	openAllViews     : function ( params, callback ) {
		this.viewsCollection.each( function ( val, key ) {
			val.open( params, callback );
		}, this );
	},
	/**
	 * Does what it says
	 * @param {object?} params Parameters to pass to the views
	 * @param {function?} callback A callback for when it is done
	 */
	hideAllViews     : function ( params, callback ) {
		this.viewsCollection.each( function ( val, key ) {
			val.hide( params, callback );
		}, this );
	},
	/**
	 * Does what it says
	 * @param {object?} params Parameters to pass to the views
	 * @param {function?} callback A callback for when it is done
	 */
	unrenderAllViews : function ( params, callback ) {
		this.viewsCollection.each( function ( val, key ) {
			val.unrender( params, callback );
		}, this );
	},
	/**
	 * Does what it says
	 * @param {object?} params Parameters to pass to the views
	 * @param {function?} callback A callback for when it is done
	 */
	endAllViews      : function ( params, callback ) {
		this.viewsCollection.each( function ( val, key ) {
			val.end( params, callback );
		}, this );
	},
	/**
	 * Does what it says
	 * @param {object?} params Parameters to pass to the views
	 * @param {function?} callback A callback for when it is done
	 */
	closeAllViews    : function ( params, callback ) {
		this.viewsCollection.each( function ( val, key ) {
			val.close( params, callback );
		}, this );
	},
	/**
	 * Renders the zone and optionally renders all child views
	 * @param {object?} params Anything you want to pass to the operation
	 * @param {function(err)} callback When done
	 */
	render           : Base.super( function ( sup ) {

		return function ( params, callback ) {
			sup.call( this, params, callback )
			if ( params && params._allViews ) {
				this.renderAllViews( params, callback );
			}
		}
	} ),

	/**
	 * Starts the zone and optionally renders all child views
	 * @param {object?} params Anything you want to pass to the operation
	 * @param {function(err)} callback When done
	 */
	start : Base.super( function ( sup ) {

		return function ( params, callback ) {
			sup.call( this, params, callback );
			if ( params && params._allViews ) {
				this.startAllViews( params, callback );
			}
		}
	} ),

	/**
	 * Opens the zone and optionally renders all child views
	 * @param {object?} params Anything you want to pass to the operation
	 * @param {function(err)} callback When done
	 */
	open : Base.super( function ( sup ) {

		return function ( params, callback ) {
			sup.call( this, params, callback );
			if ( params && params._allViews ) {
				this.openAllViews( params, callback );
			}
		}
	} ),

	/**
	 * Shows the zone and optionally renders all child views
	 * @param {object?} params Anything you want to pass to the operation
	 * @param {function(err)} callback When done
	 */
	show : Base.super( function ( sup ) {

		return function ( params, callback ) {
			sup.call( this, params, callback );
			if ( params && params._allViews ) {
				this.showAllViews( params, callback );
			}
		}
	} ),

	/**
	 * Hides the zone and optionally renders all child views
	 * @param {object?} params Anything you want to pass to the operation
	 * @param {function(err)} callback When done
	 */
	hide : Base.super( function ( sup ) {

		return function ( params, callback ) {
			sup.call( this, params, callback );
			if ( params && params._allViews ) {
				this.hideAllViews( params, callback );
			}
		}
	} ),

	/**
	 * Undrenders the zone and optionally renders all child views
	 * @param {object?} params Anything you want to pass to the operation
	 * @param {function(err)} callback When done
	 */
	unrender : Base.super( function ( sup ) {

		return function ( params, callback ) {
			sup.call( this, params, callback );
			if ( params && params._allViews ) {
				this.startAllViews( params, callback );
			}
		}
	} ),

	/**
	 * Ends the zone and optionally renders all child views
	 * @param {object?} params Anything you want to pass to the operation
	 * @param {function(err)} callback When done
	 */
	end : Base.super( function ( sup ) {

		return function ( params, callback ) {
			sup.call( this, params, callback );
			if ( params && params._allViews ) {
				this.endAllViews( params, callback );
			}
		}
	} ),

	/**
	 * Closes the zone and optionally renders all child views
	 * @param {object?} params Anything you want to pass to the operation
	 * @param {function(err)} callback When done
	 */
	close : Base.super( function ( sup ) {

		return function ( params, callback ) {
			sup.call( this, params, callback );
			if ( params && params._allViews ) {
				this.closeAllViews( params, callback );
			}
		}
	} ),

	mountView : function ( name, view, opts, callback ) {
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
