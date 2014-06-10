module.exports = function ( grunt ) {

	grunt.loadNpmTasks( 'grunt-shell' );
	grunt.loadNpmTasks( 'grunt-browserify' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );

	grunt.initConfig( {

		shell : {
			dox : {
				command : "jsdoc -c jsdoc.conf.json"
			}
		},

		browserify : {
			client : {
				src  : "./src/**/*.js",
				dest : "./bench/site/js/app.js"

			}
		},
		watch      : {
			scripts : {
				files : ['./src/**/*.js'],
				tasks : ['browserify'/*, "shell"*/]
			}
		}
	} );

	grunt.registerTask( "brow", ["browserify"] );

}
