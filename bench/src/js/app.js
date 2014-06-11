"use strict";

var View = require( "../../../src/view" );
var logger = require( "../../../src/utils/logger" );
var v = new View( {$el : $( "#home" )} );

var ejs = require( "ejs" );
var t = ejs.compile( '<div>Hi Terry!<button class="pressme">Press me!</button></div>' );

v.template = t;

logger.all();

v.show( {}, function () {

	$( ".pressme" ).click( function () {

		v.end( {}, function () {

		} );
	} );
} );

var Zone = require( "../../../src/view/zone" );
var Base = require( "../../../src/base" );

var Z = Base.compose( [Zone], {
	constructor : function () {
		this.$el = $( "zone-test" );
	},
	_viewsDefs  : {
		one : {selector : ".zone1", template : t}
	}

} );

var z = new Z();
z.show( {_allViews : true} );


