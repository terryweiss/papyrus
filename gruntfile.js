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
				src  : "./src/view/index.js",
				dest : "./bench/app.js"

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
