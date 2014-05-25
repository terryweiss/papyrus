var dcl = require( "dcl" );
var backbone = require( "backbone" );
var Model = backbone.Model;

var P1 = dcl( Model, {
	constructor : function () {
		console.info( "CP1" );
	},
	initialize  : function () {
		console.info( "P1" );
	}
} );
dcl.chainBefore( P1, "initialize" );

var P2 = dcl( P1, {
	constructor : function () {
		console.info( "CP2" );
	},
	initialize  : function () {
		console.info( "P2" );
	}
} );
dcl.chainBefore( P2, "initialize" );

var p = new P2();
