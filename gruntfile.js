module.exports = function ( grunt ) {

	grunt.loadNpmTasks( 'grunt-shell' );

	grunt.initConfig( {

		shell : {
			release : {
				command : [
					"git add .",
					'git commit -m "ready for release"',
					"npm version patch",
					"git push",
					"git push --tags",
					"npm publish"
				].join("&&")
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
