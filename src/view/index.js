"use strict";
/**
 * @fileOverview The basis for all views in the system
 * @module view
 * @requires base
 * @requires async
 */

var Base = require( "../base" );
var Signalable = require( "../mixins/signalable" );
var Presence = require( "./presence" );
var async = require( "async" );
var sys = require( "lodash" );
/**
 * A view is the most basic mode of displaying things on a web document
 * @exports View
 * @constructor
 * @memberOf module:view
 */
var View = Base.compose( [Base, Presence, Signalable], /** @lends module:view.View# */{
	declaredClass : "view",
	/**
	 * The template that will be rendered, if supplied
	 *
	 * @type {function}
	 */
	template      : null,
	constructor   : function () {

		var that = this;
		this.options = this.options || {};
		this._viewCallState = {
			start : false,
			open  : false,
			close : false,
			end   : false
		};
		this._resetViewCallState = function () {
			this._viewCallState.start = this._viewCallState.open = this._viewCallState.close = this._viewCallState.end = false;
		};
		this._addSignals( {
			/**
			 * When the view has been started
			 * @event module:view.View#viewStarted
			 */
			viewStarted          : null,
			/**
			 * Just before we start the view
			 * @event module:view.View#beforeViewStarted
			 */
			beforeViewStarted    : null,
			/**
			 * When the view has been ended
			 * @event module:view.View#viewEnded
			 */
			viewEnded            : null,
			/**
			 * Just before we end the view
			 * @event module:view.View#beforeViewEnded
			 */
			beforeViewEnded      : null,
			/**
			 * When the view has been rendered
			 * @event module:view.View#viewRendered
			 */
			viewRendered         : null,
			/**
			 * Just before we render the view
			 * @event module:view.View#beforeViewRendered
			 */
			beforeViewRendered   : null,
			/**
			 * When the view has been opened
			 * @event module:view.View#viewOpened
			 */
			viewOpened           : null,
			/**
			 * Just before we open the view
			 * @event module:view.View#beforeViewOpened
			 */
			beforeViewOpened     : null,
			/**
			 * When the view has been closeed
			 * @event module:view.View#viewClosed
			 */
			viewClosed           : null,
			/**
			 * Just before we close the view
			 * @event module:view.View#beforeViewClosed
			 */
			beforeViewClosed     : null,
			/**
			 * When the view has been shown
			 * @event module:view.View#viewShown
			 */
			viewShown            : null,
			/**
			 * Just before we show the view
			 * @event module:view.View#beforeViewShown
			 */
			beforeViewShown      : null,
			/**
			 * When the view has been hidden
			 * @event module:view.View#viewHidden
			 */
			viewHidden           : null,
			/**
			 * Just before we hide the view
			 * @event module:view.View#beforeViewHidden
			 */
			beforeViewHidden     : null,
			/**
			 * When the view has been unrendered
			 * @event module:view.View#viewUnrendered
			 */
			viewUnrendered       : null,
			/**
			 * Just before we unrender the view
			 * @event module:view.View#beforeViewUnrendered
			 */
			beforeViewUnrendered : null
		} );

		/**
		 * The current state of the view. This value is protected by `viewState`
		 * @type {number}
		 * @private
		 */
		var state = 0;

		/**
		 * The current state of the view. You can set a new state by assigning to this or calling one of the state methods
		 * @type {number}
		 * @name viewState
		 * @memberOf module:view.View#
		 * @readOnly
		 */
		Object.defineProperty( this, "viewState", {
			get : function () {
				return viewStates.fromValue( state );
			}
		} );

		/**
		 * The current view state name
		 * @type {number}
		 * @name viewStateName
		 * @memberOf module:view.View#
		 * @readOnly
		 */
		Object.defineProperty( this, "viewStateName", {
			get : function () {
				var s = viewStates.fromValue( state );
				if ( s ) {
					return s.name;
				} else {
					return null;
				}
			}
		} );

		/**
		 * Set level will change the state to one of the `viewState`s and call each intervening step
		 * @param {number|viewState|string} requestedLevel The level to set it to, see {@link viewStates} for possible value
		 * @param {object=} params A hash of parameters to pass to the operation
		 * @param {function(err)} callback When done
		 * @private
		 */
		this._setLevel = function ( requestedLevel, params, callback ) {

			if ( sys.isFunction( params ) ) {
				callback = params;
				params = null;
			}
			params = params || {};
			callback = callback || function () {};

			var newLevel = requestedLevel;

			if ( newLevel ) {
				newLevel = newLevel.val;
			} else if ( !sys.isNumber( newLevel ) ) {
				callback( new TypeError( "newLevel must be a number or viewState record" ) );
			}

			var dir;
			if ( newLevel > state ) {
				dir = "up"
			} else if ( newLevel < state ) {
				dir = "down";
			} else {
				return callback();
			}

			async.whilst( function () {
				return newLevel !== state;
			}, function ( done ) {
				var next;
				if ( dir === "up" ) {
					next = viewStates.nextUp( state );
					state = next.val;

					if ( next && next.upOp ) {
						that[next.upOp]( params, done );
					} else {
						done();
					}
				} else {
					next = viewStates.nextDown( state );
					state = next.val;

					if ( next && next.downOp ) {

						that[next.downOp]( params, done );
					} else {
						done();
					}
				}

			}, callback );

		}
	},

	/**
	 * Render the template to `$el`
	 * @param {object?} params Anything you want to pass to the operation
	 * @param {function(err)} callback When done
	 */
	render : function ( params, callback ) {
		this._resetViewCallState();
		this._setLevel( viewStates.rendered, params, callback );
	},

	/**
	 * Starts the view, which is just to bootstrap stuff
	 * @param {object?} params Anything you want to pass to the operation
	 * @param {function(err)} callback When done
	 */
	start : function ( params, callback ) {
		this._resetViewCallState();
		this._viewCallState.start = true;
		this._setLevel( viewStates.started, params, callback );
	},

	/**
	 * Opens the view, which is the step before rendering, grab your data and format it for the template
	 * @param {object?} params Anything you want to pass to the operation
	 * @param {function(err)} callback When done
	 */
	open : function ( params, callback ) {
		this._resetViewCallState();
		this._viewCallState.open = true;
		this._setLevel( viewStates.opened, params, callback );
	},

	/**
	 * Shows a view. If called by a zone, it means this will be mounted somewhere. Otherwise it just calls `show` on `$el` with
	 * any animations you may have set for this view
	 * @param {object?} params Anything you want to pass to the operation
	 * @param {function(err)} callback When done
	 */
	show : function ( params, callback ) {
		this._resetViewCallState();
		this._setLevel( viewStates.interactive, params, callback );
	},

	/**
	 * Hides a view. If called by a zone, it means this will be unmounted. Otherwise it just calls `hide` on `$el` with
	 * any animations you may have set for this view
	 * @param {object?} params Anything you want to pass to the operation
	 * @param {function(err)} callback When done
	 */
	hide : function ( params, callback ) {
		this._resetViewCallState();
		this._setLevel( viewStates.rendered, params, callback );
	},

	/**
	 * Remove the template from `$el`
	 * @param {object?} params Anything you want to pass to the operation
	 * @param {function(err)} callback When done
	 */
	unrender : function ( params, callback ) {
		this._resetViewCallState();
		this._setLevel( viewStates.opened, params, callback );
	},
	/**
	 * End
	 * @param {object?} params Anything you want to pass to the operation
	 * @param {function(err)} callback When done
	 */
	end      : function ( params, callback ) {
		this._resetViewCallState();
		this._viewCallState.end= true;
		this._setLevel( viewStates.dormant, params, callback );
	},

	/**
	 * Close
	 * @param {object?} params Anything you want to pass to the operation
	 * @param {function(err)} callback When done
	 */
	close : function ( params, callback ) {
		this._resetViewCallState();
		this._viewCallState.close = true;
		this._setLevel( viewStates.started, params, callback );
	},

	/**
	 * Start the view
	 */
	_doStart : function ( params, callback ) {
		if ( sys.isFunction( params ) ) {
			callback = params;
			params = null;
		}
		if ( !sys.isFunction( callback ) ) {
			callback = sys.identity;
		}
		               var that = this;
		async.series( [
			sys.partial( this.beforeViewStarted.fire, params ),
			sys.partial( this.viewStarted.fire, params ) ,
			function ( done ) {
				if ( that._viewCallState.start === false ) {
					Base.prototype.start.call( that, params );
					that._viewCallState.start = true;
				}
				done();
			}
		], callback );
	},

	/**
	 * Open the view
	 */
	_doOpen : function ( params, callback ) {
		if ( sys.isFunction( params ) ) {
			callback = params;
			params = null;
		}
		if ( !sys.isFunction( callback ) ) {
			callback = sys.identity;
		}
		var that = this;
		async.series( [
			sys.partial( this.beforeViewOpened.fire, params ),
			sys.partial( this.viewOpened.fire, params ),
			function ( done ) {
				if ( that._viewCallState.open === false ) {
					Base.prototype.open.call( that, params );
					that._viewCallState.open = true;
				}
				done();
			}
		], callback );
	},

	/**
	 * Render the view
	 * @protected
	 */
	_doRender   : function ( params, callback ) {
		if ( !sys.isFunction( this.template ) ) {
			throw new TypeError( "render requires a template method" );
		}

		if ( sys.isFunction( params ) ) {
			callback = params;
			params = null;
		}
		if ( !sys.isFunction( callback ) ) {
			callback = sys.identity;
		}
		var that = this;

		async.series( [
			sys.partial( this.beforeViewRendered.fire, params ),
			function ( done ) {
				params = params || {};
				params._options = that.options;
				params._view = sys.isFunction( that.toJSON ) ? that.toJSON() : that;
				that.$el.html( that.template( params ) );
				done();
			},
			sys.partial( this.viewRendered.fire, params )
		], callback );
	},
	/**
	 * Show the view
	 */
	_doShow     : function ( params, callback ) {
		if ( sys.isFunction( params ) ) {
			callback = params;
			params = null;
		}
		if ( !sys.isFunction( callback ) ) {
			callback = sys.identity;
		}
		var that = this;

		async.series( [
			sys.partial( that.beforeViewShown.fire, params ),
			function ( done ) {
				if ( !sys.isEmpty( that.showAnimation ) ) {
					that.showAnimation.animate( this.$el, params, done );
				} else {
					that.$el.show();
					done();
				}
			},
			sys.partial( that.viewShown.fire, params )
		], callback );

	},
	/**
	 * Hide the view
	 */
	_doHide     : function ( params, callback ) {
		if ( sys.isFunction( params ) ) {
			callback = params;
			params = null;
		}
		if ( !sys.isFunction( callback ) ) {
			callback = sys.identity;
		}
		var that = this;

		async.series( [
			sys.partial( this.beforeViewHidden.fire, params ),
			function ( done ) {
				if ( !sys.isEmpty( that.hideAnimation ) ) {
					that.hideAnimation.animate( this.$el, params, done );
				} else {
					that.$el.hide();
					done();
				}
			},
			sys.partial( this.viewHidden.fire, params )
		], callback );

	},
	/**
	 * Unrender the view
	 */
	_doUnrender : function ( params, callback ) {
		if ( !sys.isFunction( this.template ) ) {
			throw new TypeError( "render requires a template method" );
		}

		if ( sys.isFunction( params ) ) {
			callback = params;
			params = null;
		}
		if ( !sys.isFunction( callback ) ) {
			callback = sys.identity;
		}
		var that = this;

		async.series( [
			sys.partial( that.beforeViewUnrendered.fire, params ),
			function ( done ) {
				that.$el.empty();
				done();
			},
			sys.partial( that.viewUnrendered.fire, params )
		], callback );

	},
	/**
	 * Close the view
	 */
	_doClose    : function ( params, callback ) {
		if ( sys.isFunction( params ) ) {
			callback = params;
			params = null;
		}
		if ( !sys.isFunction( callback ) ) {
			callback = sys.identity;
		}
		var that = this;
		async.series( [
			sys.partial( this.beforeViewClosed.fire, params ),
			sys.partial( this.viewClosed.fire, params ) ,
			function ( done ) {
				if ( that._viewCallState.close === false ) {
					Base.prototype.close.call( that, params );
					that._viewCallState.close = true;
				}
				done();
			}
		], callback );
	},
	/**
	 * End the view
	 */
	_doEnd      : function ( params, callback ) {
		if ( sys.isFunction( params ) ) {
			callback = params;
			params = null;
		}
		if ( !sys.isFunction( callback ) ) {
			callback = sys.identity;
		}
		var that = this;
		async.series( [
			sys.partial( this.beforeViewEnded.fire, params ),
			sys.partial( this.viewEnded.fire, params ),
			function ( done ) {
				if ( that._viewCallState.end === false ) {
					Base.prototype.end.call( that, params );
					that._viewCallState.end = true;
				}
				done();
			}
		], callback );
	}
} );
/**
 * The states a view can occupy. This is used to determine what state we need to be in order to accomplish what is being asked.
 * @readonly
 * @enum {number}
 */
var viewStates = {
	/**
	 * Get a viewState from a name
	 * @param {string} name The name to lookup
	 * @return {viewStates?}
	 */
	fromName  : function ( name ) {
		return viewStates[name];
	},
	/**
	 * Get a view state from a value
	 * @param {number} val The value to look for
	 * @return {viewStates?}
	 */
	fromValue : function ( val ) {
		return sys.find( viewStates, function ( item ) {
			return item.val === val;
		} );
	},
	/**
	 * Gets the next state up from the one provided
	 * @param {val|viewState}
	 * @return {viewStates?}
	 */
	nextUp    : function ( state ) {

		var toAnalyze = viewStates.resolve( state );
		var nextUp = viewStates.resolve( toAnalyze.nextStateUp );

		return nextUp;
	},
	/**
	 * Gets the next state down from the one provided
	 * @param {val|viewState}
	 * @return {viewStates?}
	 */
	nextDown  : function ( state ) {
		var toAnalyze = viewStates.resolve( state );
		var nextDown = viewStates.resolve( toAnalyze.nextStateDown );

		return nextDown;

	},
	/**
	 * Resolves a value or name or viewState and returns the viewState
	 * @param {string|number|viewState} res The value to resolve
	 * @return {viewStates?}
	 */
	resolve   : function ( res ) {
		if ( sys.isObject( res ) ) {
			return res;
		} else if ( sys.isString( res ) ) {
			return viewStates.fromName( res );
		} else {
			return viewStates.fromValue( res );
		}
	},

	/**
	 * Nothing is happening, no visual or hidden components are available
	 */
	"dormant"     : {val : 0, nextStateUp : "started", nextStateDown : null, upOp : null, downOp : null, name : "dormant"},
	/**
	 * The view is started, it has all it needs to render and display
	 */
	"started"     : {val : 10, nextStateUp : "opened", nextStateDown : "dormant", upOp : "_doStart", downOp : "_doEnd", name : "started"},
	/**
	 * Ready to render
	 */
	"opened"      : {val : 20, nextStateUp : "rendered", nextStateDown : "started", upOp : "_doOpen", downOp : "_doClose", name : "opened"},
	/**
	 * Ready to show
	 */
	"rendered"    : {val : 30, nextStateUp : "shown", nextStateDown : "opened", upOp : "_doRender", downOp : "_doUnrender", name : "rendered" },
	/**
	 * Displayed
	 */
	"shown"       : {val : 40, nextStateUp : "interactive", nextStateDown : "rendered", upOp : "_doShow", downOp : "_doHide", name : "shown"},
	/**
	 * Whole hog
	 */
	"interactive" : {val : 50, nextStateUp : null, nextStateDown : "shown", upOp : null, downOp : null, name : "intertactive"}
};

module.exports = View;
