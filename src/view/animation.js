"use strict";
/**
 * Simplifies and standardizes jQuery and CSS3 animations on your views or view members
 * @module view/animation
 */

var Base = require( "../base" );
var Signalable = require( "../mixins/Signalable" );

/**
 * Manages simple CSS and jQuery animations for a given element
 * @constructor
 */
var AnimationManager = Base.compose( [Base, Signalable], /** @lends module:view/animation.AnimationManager# */{
	declaredClass : "view/AnimationManager",
	constructor        : function ( $el ) {
		this.$el = this.$el || $el;
		this._addSignals( {
			/**
			 * When the animation has been started
			 * @event module:view/animation.AnimationManager#animationStarted
			 */
			animationStarted : null,
			/**
			 * When the animation has ended
			 * @event module:view/animation.AnimationManager#animationEnded
			 */
			animationEnded   : null
		} );
	},
	/**
	 * Can be "jquery", "css"
	 * @type {string}
	 */
	type               : "jquery",
	/**
	 * The role can be "animate", "show", "hide", "effect". This only matters for jQuery UI animations
	 */
	applyAnimationWith : "show",
	/**
	 *  The name of the animation
	 *  @type {string}
	 */
	animationName      : "fadeIn",
	/**
	 * Default animation duration
	 * @type {number|string}
	 */
	animationDuration  : 500,
	/**
	 * Any options you want to pass to the animation (jQuery only)
	 * @type {object}
	 */
	animationOptions   : {},
	/**
	 * Animate!
	 *
	 * @param {jQuery=} $el The element to animate
	 * @param {string=} effect The effect to run
	 * @param {object=} options Any options you want to pass
	 * @param {function=} callback When done
	 *
	 * @signature instance.animate();
	 * @signature instance.animate(callback);
	 * @signature instance.animate($el, callback);
	 * @signature instance.animate($el, effect, callback);
	 * @signature instance.animate($el, options, callback);
	 * @signature instance.animate($el, effect, options, callback);
	 */
	animate            : function ( $el, effect, options, callback ) {
		var that = this;
		if ( sys.isFunction( $el ) ) {
			callback = $el;
			options = null;
			effect = null;
			$el = null;
		}
		if ( sys.isFunction( effect ) ) {
			callback = effect;
			options = null;
			effect = null;
		}
		if ( sys.isFunction( options ) ) {
			callback = options;
			options = sys.isObject( effect ) ? effect : null;
		}

		options = options || this.animationOptions;
		options.effect = options.effect || effect || this.animationName;
		callback = callback || sys.identity;
		$el = $el instanceof jQuery ? $el : this.$el;
		options.duration = options.duration || this.animationDuration;

		if ( !$el || !($el instanceof jQuery) ) {
			throw new TypeError( "animate requires this.$el or $el" )
		}

		var passedStart = options.start;
		options.start = function () {
			that.animationStarted();
			if ( sys.isFunction( passedStart ) ) {
				passedStart();
			}
		};

		options.always = function () {
			that.animationEnded();
			callback();
		};

		if ( this.type === "jquery" ) {
			if ( sys.indexOf( _nativeMethods, this.animationName.toLowerCase() ) > -1 ) {
				$el[this.animationName.toLowerCase()]( options );
			} else {
				$el[this.applyAnimationWith]( options );
			}
		} else if ( this.type === "css" ) {
			$el.one( 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
				$el.removeClass( options.effect );
				options.always();
			} );
			$el.one( 'webkitAnimationStart mozAnimationStart MSAnimationStart oanimationstart animationstart', options.start );
			$el.addClass( options.effect );
		} else {
			throw new TypeError( "animation type can only be 'jquery' or 'css'" );
		}
	}

} );
/**
 * The methods we call directly
 * @type {array.<string>}
 * @private
 */
var _nativeMethods = ["fadeIn", "fadeOut", "slideUp", "slideDown", "fadeTo"]

module.exports = AnimationManager;
