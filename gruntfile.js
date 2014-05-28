module.exports = function ( grunt ) {

	grunt.loadNpmTasks( 'grunt-shell' );
	grunt.initConfig( {

		shell : {
			dox : {
				command : "jsdoc -c jsdoc.conf.json"
			}
		}
	} );

}
