/**
 * @fileOverview Manages the presence and lifetime of a View in the dom
 * @module view/presence
 * @requires Base
 */

var Base = require( "../base" );
var format = require( "../strings/format" );
var sys = require( "lodash" );
var Signalable = require( "../mixins/signalable" );
/**
 * A utility mixin for making sure a view is mounted correctly and flexibly
 *
 * @exports view/presence
 * @mixin
 */
var Presence = Base.compose( [Base, Signalable], /** @lends view/presence# */{
	declaredClass : "view/Presence",
	constructor   : function ( options ) {

		options = options || {};
		var that = this;

		if ( options.$el ) {
			element = options.$el;
		}
		if ( options.selector ) {
			this.selector = options.selector;
		}
		if ( options.tagName ) {
			this.tagName = options.tagName;
		}
		if ( options.className ) {
			this.className = options.className;
		}
		if ( options.id ) {
			this.id = options.id;
		}
		if ( options.attributes ) {
			this.attributes = options.attributes;
		}
		this._addSignals( {
			/**
			 * When the view has been started
			 * @event view/presence#elChanged
			 */
			elChanged : null
		} );
		/**
		 * Private reference to the primary element
		 * @type {jQuery}
		 */
		var element;
		/**
		 * The jQuery element the view will render to
		 * @name $el
		 * @memberOf view/presence#
		 * @type {jQuery}
		 */
		Object.defineProperty( this, "$el", {
			get : function () {
				if ( sys.isEmpty( element ) && !sys.isEmpty( this.selector ) ) {
					element = $( this.selector );
				} else if ( sys.isEmpty( element ) ) {
					element = that._buildTag();
				}
				return element
			},
			set : function ( val ) {
				if ( !sys.isEmpty( element ) ) {
					that.elChanged.fire( element );
				}
				if ( val instanceof jQuery ) {
					element = val;
				} else {
					element = $( val );
				}
			}
		} );
	},
	/**
	 * Builds the tag to be used
	 * @returns {jQuery}
	 * @private
	 */
	_buildTag     : function () {
		this.tagName = this.tagName || "div";
		var $el = $( format( "<{0}/>", this.tagName ) );
		if ( !sys.isEmpty( this.attributes ) ) {
			$el.attr( this.attributes );
		}
		if ( !sys.isEmpty( this.className ) ) {
			$el.addClass( this.className );
		}
		if ( !sys.isEmpty( this.id ) ) {
			$el.attr( "id", this.id );
		}
		return $el;
	},
	/**
	 * The name of the tag to use if $el isn't supplied by you
	 * @type {string}
	 */
	tagName       : "div",
	/**
	 * The name of the tag to apply to the tag if $el isn't supplied by you
	 * @type {string}
	 */
	className     : "",
	/**
	 * The id to apply to the tag if $el isn't supplied by you
	 * @type {string}
	 */
	id            : "",
	/**
	 * Attributes to apply to the tag if $el isn't supplied by you
	 * @type {object}
	 */
	attributes    : {}

} );

module.exports = Presence;
