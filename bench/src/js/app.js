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

		v.end({}, function () {

		} );
	} );
} );
