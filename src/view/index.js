"use strict";
/**
 * @fileOverview The basis for all views in the system
 * @module view
 * @requires base
 * @requires async
 */

var Base = require( "../base" );
var Signalable = require( "../mixins/signalable" );
var async = require( "async" );
var sys = require( "lodash" );
/**
 * A view is the most basic mode of displaying things on a web document
 * @exports View
 * @constructor
 * @memberOf module:view
 */
var View = Base.compose( [Base, Signalable], /** @lends module:view.View# */{
	/**
	 * The template that will be rendered, if supplied
	 *
	 * @type {string|function}
	 */
	template    : null,
	constructor : function () {
		var that = this;
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
		 */
		Object.defineProperty( this, "viewState", {
			get : function () {
				return viewStates.fromValue( state );
			},
			set : function ( val ) {

				setLevel( val, function ( err ) {
					if ( !err ) {
						state = val;
					}
				} );
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
		 * @param {function(err)} callback When done
		 */
		function setLevel( requestedLevel, callback ) {
			callback = callback || function () {};
			var newLevel = viewStates.resolve( requestedLevel );

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
					if ( next && next.upOp ) {
						state = next.val;
						that[next.upOp]( done );
					} else {
						done();
					}
				} else {
					next = viewStates.nextDown( state );
					if ( next && next.downOp ) {
						var nextState = viewStates.fromName( next.nextStateDown );
						that[next.downOp]( function () {
							state = nextState.val;
							done();
						} );
					} else {
						done();
					}
				}

			}, callback );

		};
	},
	/**
	 * Start the view
	 */
	start       : function ( callback ) {
		this.beforeViewStarted.fire( function () {
			console.debug( "beforeStartedView fired" );
		} );

		this.viewStarted.fire( function () {
			console.debug( "started fired" );
		} );
		callback();
	},
	/**
	 * Open the view
	 */
	open        : function ( callback ) {
		this.beforeViewOpened.fire();
		this.viewOpened.fire();
		callback();
	},
	/**
	 * Render the view
	 */
	render      : function ( callback ) {
		this.beforeViewRendered.fire();
		this.viewRendered.fire();
		callback();
	},
	/**
	 * Show the view
	 */
	show        : function ( callback ) {
		this.beforeViewShown.fire();
		this.viewShown.fire();
		callback();
	},
	/**
	 * Hide the view
	 */
	hide        : function ( callback ) {
		this.beforeViewHidden.fire();
		this.viewHidden.fire();
		callback();
	},
	/**
	 * Unrender the view
	 */
	unrender    : function ( callback ) {
		this.beforeViewUnrendered.fire();
		this.viewUnrendered.fire();
		callback();
	},
	/**
	 * Close the view
	 */
	close       : function ( callback ) {
		this.beforeViewClosed.fire();
		this.viewClosed.fire();
		callback();
	},
	/**
	 * Close the view
	 */
	end         : function ( callback ) {
		this.beforeViewEnded.fire();
		this.viewEnded.fire();
		callback();
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
		var nextDown;
		var toAnalyze = viewStates.resolve( state );
//		if ( toAnalyze.name === "shown" ) {
//			nextDown = toAnalyze;
//		} else {
//			nextDown = viewStates.resolve( toAnalyze.nextStateDown );
//		}

		if ( toAnalyze ) {
			nextDown = sys.find( viewStates.sortedDesc, function ( val ) {
				return val.val <= toAnalyze.val;
			} );
		}

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
	"dormant"  : {val : 0, nextStateUp : "started", nextStateDown : null, upOp : null, downOp : null, name : "dormant"},
	/**
	 * The view is started, it has all it needs to render and display
	 */
	"started"  : {val : 10, nextStateUp : "opened", nextStateDown : "dormant", upOp : "start", downOp : "end", name : "started"},
	/**
	 * Ready to render
	 */
	"opened"   : {val : 20, nextStateUp : "rendered", nextStateDown : "started", upOp : "open", downOp : "close", name : "opened"},
	/**
	 * Ready to show
	 */
	"rendered" : {val : 30, nextStateUp : "shown", nextStateDown : "opened", upOp : "render", downOp : "unrender", name : "rendered" },
	/**
	 * Displayed
	 */
	"shown"    : {val : 40, nextStateUp : "interactive", nextStateDown : "rendered", upOp : "show", downOp : "hide", name : "shown"}
};
