module.exports = function ( grunt ) {


	grunt.loadNpmTasks( 'grunt-browserify' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );

	grunt.initConfig( {


		browserify : {
			client : {
				src  : "./src/**/*.js",
				dest : "./site/js/app.js"

			}
		},
		watch      : {
			scripts : {
				files : ['./src/**/*.js', '../src/**/*.js'],
				tasks : ['browserify'/*, "shell"*/]
			}
		}
	} );

	grunt.registerTask( "brow", ["browserify"] );

}
