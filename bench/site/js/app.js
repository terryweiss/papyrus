(function e( t, n, r ) {
	function s( o, u ) {
		if ( !n[o] ) {
			if ( !t[o] ) {
				var a = typeof require == "function" && require;
				if ( !u && a )return a( o, !0 );
				if ( i )return i( o, !0 );
				throw new Error( "Cannot find module '" + o + "'" )
			}
			var f = n[o] = {exports : {}};
			t[o][0].call( f.exports, function ( e ) {
				var n = t[o][1][e];
				return s( n ? n : e )
			}, f, f.exports, e, t, n, r )
		}
		return n[o].exports
	}

	var i = typeof require == "function" && require;
	for ( var o = 0; o < r.length; o++ )s( r[o] );
	return s
})( {1                                                                                                                                  : [function ( require, module, exports ) {

}, {}], 2                                                                                                                               : [function ( require, module, exports ) {
	(function ( process ) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
		function normalizeArray( parts, allowAboveRoot ) {
			// if the path tries to go above the root, `up` ends up > 0
			var up = 0;
			for ( var i = parts.length - 1; i >= 0; i-- ) {
				var last = parts[i];
				if ( last === '.' ) {
					parts.splice( i, 1 );
				} else if ( last === '..' ) {
					parts.splice( i, 1 );
					up++;
				} else if ( up ) {
					parts.splice( i, 1 );
					up--;
				}
			}

			// if the path is allowed to go above the root, restore leading ..s
			if ( allowAboveRoot ) {
				for ( ; up--; up ) {
					parts.unshift( '..' );
				}
			}

			return parts;
		}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
		var splitPathRe =
			/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
		var splitPath = function ( filename ) {
			return splitPathRe.exec( filename ).slice( 1 );
		};

// path.resolve([from ...], to)
// posix version
		exports.resolve = function () {
			var resolvedPath = '',
				resolvedAbsolute = false;

			for ( var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i-- ) {
				var path = (i >= 0) ? arguments[i] : process.cwd();

				// Skip empty and invalid entries
				if ( typeof path !== 'string' ) {
					throw new TypeError( 'Arguments to path.resolve must be strings' );
				} else if ( !path ) {
					continue;
				}

				resolvedPath = path + '/' + resolvedPath;
				resolvedAbsolute = path.charAt( 0 ) === '/';
			}

			// At this point the path should be resolved to a full absolute path, but
			// handle relative paths to be safe (might happen when process.cwd() fails)

			// Normalize the path
			resolvedPath = normalizeArray( filter( resolvedPath.split( '/' ), function ( p ) {
				return !!p;
			} ), !resolvedAbsolute ).join( '/' );

			return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
		};

// path.normalize(path)
// posix version
		exports.normalize = function ( path ) {
			var isAbsolute = exports.isAbsolute( path ),
				trailingSlash = substr( path, -1 ) === '/';

			// Normalize the path
			path = normalizeArray( filter( path.split( '/' ), function ( p ) {
				return !!p;
			} ), !isAbsolute ).join( '/' );

			if ( !path && !isAbsolute ) {
				path = '.';
			}
			if ( path && trailingSlash ) {
				path += '/';
			}

			return (isAbsolute ? '/' : '') + path;
		};

// posix version
		exports.isAbsolute = function ( path ) {
			return path.charAt( 0 ) === '/';
		};

// posix version
		exports.join = function () {
			var paths = Array.prototype.slice.call( arguments, 0 );
			return exports.normalize( filter( paths, function ( p, index ) {
				if ( typeof p !== 'string' ) {
					throw new TypeError( 'Arguments to path.join must be strings' );
				}
				return p;
			} ).join( '/' ) );
		};

// path.relative(from, to)
// posix version
		exports.relative = function ( from, to ) {
			from = exports.resolve( from ).substr( 1 );
			to = exports.resolve( to ).substr( 1 );

			function trim( arr ) {
				var start = 0;
				for ( ; start < arr.length; start++ ) {
					if ( arr[start] !== '' ) break;
				}

				var end = arr.length - 1;
				for ( ; end >= 0; end-- ) {
					if ( arr[end] !== '' ) break;
				}

				if ( start > end ) return [];
				return arr.slice( start, end - start + 1 );
			}

			var fromParts = trim( from.split( '/' ) );
			var toParts = trim( to.split( '/' ) );

			var length = Math.min( fromParts.length, toParts.length );
			var samePartsLength = length;
			for ( var i = 0; i < length; i++ ) {
				if ( fromParts[i] !== toParts[i] ) {
					samePartsLength = i;
					break;
				}
			}

			var outputParts = [];
			for ( var i = samePartsLength; i < fromParts.length; i++ ) {
				outputParts.push( '..' );
			}

			outputParts = outputParts.concat( toParts.slice( samePartsLength ) );

			return outputParts.join( '/' );
		};

		exports.sep = '/';
		exports.delimiter = ':';

		exports.dirname = function ( path ) {
			var result = splitPath( path ),
				root = result[0],
				dir = result[1];

			if ( !root && !dir ) {
				// No dirname whatsoever
				return '.';
			}

			if ( dir ) {
				// It has a dirname, strip trailing slash
				dir = dir.substr( 0, dir.length - 1 );
			}

			return root + dir;
		};

		exports.basename = function ( path, ext ) {
			var f = splitPath( path )[2];
			// TODO: make this comparison case-insensitive on windows?
			if ( ext && f.substr( -1 * ext.length ) === ext ) {
				f = f.substr( 0, f.length - ext.length );
			}
			return f;
		};

		exports.extname = function ( path ) {
			return splitPath( path )[3];
		};

		function filter( xs, f ) {
			if ( xs.filter ) return xs.filter( f );
			var res = [];
			for ( var i = 0; i < xs.length; i++ ) {
				if ( f( xs[i], i, xs ) ) res.push( xs[i] );
			}
			return res;
		}

// String.prototype.substr - negative index don't work in IE8
		var substr = 'ab'.substr( -1 ) === 'b'
				? function ( str, start, len ) { return str.substr( start, len ) }
				: function ( str, start, len ) {
				if ( start < 0 ) start = str.length + start;
				return str.substr( start, len );
			}
			;

	}).call( this, require( "Zbi7gb" ) )
}, {"Zbi7gb" : 3}], 3                                                                                                                   : [function ( require, module, exports ) {
// shim for using process in browser

	var process = module.exports = {};

	process.nextTick = (function () {
		var canSetImmediate = typeof window !== 'undefined'
			&& window.setImmediate;
		var canPost = typeof window !== 'undefined'
				&& window.postMessage && window.addEventListener
			;

		if ( canSetImmediate ) {
			return function ( f ) { return window.setImmediate( f ) };
		}

		if ( canPost ) {
			var queue = [];
			window.addEventListener( 'message', function ( ev ) {
				var source = ev.source;
				if ( (source === window || source === null) && ev.data === 'process-tick' ) {
					ev.stopPropagation();
					if ( queue.length > 0 ) {
						var fn = queue.shift();
						fn();
					}
				}
			}, true );

			return function nextTick( fn ) {
				queue.push( fn );
				window.postMessage( 'process-tick', '*' );
			};
		}

		return function nextTick( fn ) {
			setTimeout( fn, 0 );
		};
	})();

	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function ( name ) {
		throw new Error( 'process.binding is not supported' );
	}

// TODO(shtylman)
	process.cwd = function () { return '/' };
	process.chdir = function ( dir ) {
		throw new Error( 'process.chdir is not supported' );
	};

}, {}], 4                                                                                                                               : [function ( require, module, exports ) {

	/*!
 * EJS
 * Copyright(c) 2012 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

	/**
	 * Module dependencies.
	 */

	var utils = require( './utils' )
		, path = require( 'path' )
		, dirname = path.dirname
		, extname = path.extname
		, join = path.join
		, fs = require( 'fs' )
		, read = fs.readFileSync;

	/**
	 * Filters.
	 *
	 * @type Object
	 */

	var filters = exports.filters = require( './filters' );

	/**
	 * Intermediate js cache.
	 *
	 * @type Object
	 */

	var cache = {};

	/**
	 * Clear intermediate js cache.
	 *
	 * @api public
	 */

	exports.clearCache = function () {
		cache = {};
	};

	/**
	 * Translate filtered code into function calls.
	 *
	 * @param {String} js
	 * @return {String}
	 * @api private
	 */

	function filtered( js ) {
		return js.substr( 1 ).split( '|' ).reduce( function ( js, filter ) {
			var parts = filter.split( ':' )
				, name = parts.shift()
				, args = parts.join( ':' ) || '';
			if ( args ) args = ', ' + args;
			return 'filters.' + name + '(' + js + args + ')';
		} );
	};

	/**
	 * Re-throw the given `err` in context to the
	 * `str` of ejs, `filename`, and `lineno`.
	 *
	 * @param {Error} err
	 * @param {String} str
	 * @param {String} filename
	 * @param {String} lineno
	 * @api private
	 */

	function rethrow( err, str, filename, lineno ) {
		var lines = str.split( '\n' )
			, start = Math.max( lineno - 3, 0 )
			, end = Math.min( lines.length, lineno + 3 );

		// Error context
		var context = lines.slice( start, end ).map( function ( line, i ) {
			var curr = i + start + 1;
			return (curr == lineno ? ' >> ' : '    ')
				+ curr
				+ '| '
				+ line;
		} ).join( '\n' );

		// Alter exception message
		err.path = filename;
		err.message = (filename || 'ejs') + ':'
			+ lineno + '\n'
			+ context + '\n\n'
			+ err.message;

		throw err;
	}

	/**
	 * Parse the given `str` of ejs, returning the function body.
	 *
	 * @param {String} str
	 * @return {String}
	 * @api public
	 */

	var parse = exports.parse = function ( str, options ) {
		var options = options || {}
			, open = options.open || exports.open || '<%'
			, close = options.close || exports.close || '%>'
			, filename = options.filename
			, compileDebug = options.compileDebug !== false
			, buf = "";

		buf += 'var buf = [];';
		if ( false !== options._with ) buf += '\nwith (locals || {}) { (function(){ ';
		buf += '\n buf.push(\'';

		var lineno = 1;

		var consumeEOL = false;
		for ( var i = 0, len = str.length; i < len; ++i ) {
			var stri = str[i];
			if ( str.slice( i, open.length + i ) == open ) {
				i += open.length

				var prefix, postfix, line = (compileDebug ? '__stack.lineno=' : '') + lineno;
				switch ( str[i] ) {
					case '=':
						prefix = "', escape((" + line + ', ';
						postfix = ")), '";
						++i;
						break;
					case '-':
						prefix = "', (" + line + ', ';
						postfix = "), '";
						++i;
						break;
					default:
						prefix = "');" + line + ';';
						postfix = "; buf.push('";
				}

				var end = str.indexOf( close, i );

				if ( end < 0 ) {
					throw new Error( 'Could not find matching close tag "' + close + '".' );
				}

				var js = str.substring( i, end )
					, start = i
					, include = null
					, n = 0;

				if ( '-' == js[js.length - 1] ) {
					js = js.substring( 0, js.length - 2 );
					consumeEOL = true;
				}

				if ( 0 == js.trim().indexOf( 'include' ) ) {
					var name = js.trim().slice( 7 ).trim();
					if ( !filename ) throw new Error( 'filename option is required for includes' );
					var path = resolveInclude( name, filename );
					include = read( path, 'utf8' );
					include = exports.parse( include, { filename : path, _with : false, open : open, close : close, compileDebug : compileDebug } );
					buf += "' + (function(){" + include + "})() + '";
					js = '';
				}

				while ( ~(n = js.indexOf( "\n", n )) ) n++, lineno++;
				if ( js.substr( 0, 1 ) == ':' ) js = filtered( js );
				if ( js ) {
					if ( js.lastIndexOf( '//' ) > js.lastIndexOf( '\n' ) ) js += '\n';
					buf += prefix;
					buf += js;
					buf += postfix;
				}
				i += end - start + close.length - 1;

			} else if ( stri == "\\" ) {
				buf += "\\\\";
			} else if ( stri == "'" ) {
				buf += "\\'";
			} else if ( stri == "\r" ) {
				// ignore
			} else if ( stri == "\n" ) {
				if ( consumeEOL ) {
					consumeEOL = false;
				} else {
					buf += "\\n";
					lineno++;
				}
			} else {
				buf += stri;
			}
		}

		if ( false !== options._with ) buf += "'); })();\n} \nreturn buf.join('');";
		else buf += "');\nreturn buf.join('');";
		return buf;
	};

	/**
	 * Compile the given `str` of ejs into a `Function`.
	 *
	 * @param {String} str
	 * @param {Object} options
	 * @return {Function}
	 * @api public
	 */

	var compile = exports.compile = function ( str, options ) {
		options = options || {};
		var escape = options.escape || utils.escape;

		var input = JSON.stringify( str )
			, compileDebug = options.compileDebug !== false
			, client = options.client
			, filename = options.filename
				? JSON.stringify( options.filename )
				: 'undefined';

		if ( compileDebug ) {
			// Adds the fancy stack trace meta info
			str = [
					'var __stack = { lineno: 1, input: ' + input + ', filename: ' + filename + ' };',
				rethrow.toString(),
				'try {',
				exports.parse( str, options ),
				'} catch (err) {',
				'  rethrow(err, __stack.input, __stack.filename, __stack.lineno);',
				'}'
			].join( "\n" );
		} else {
			str = exports.parse( str, options );
		}

		if ( options.debug ) console.log( str );
		if ( client ) str = 'escape = escape || ' + escape.toString() + ';\n' + str;

		try {
			var fn = new Function( 'locals, filters, escape, rethrow', str );
		} catch ( err ) {
			if ( 'SyntaxError' == err.name ) {
				err.message += options.filename
					? ' in ' + filename
					: ' while compiling ejs';
			}
			throw err;
		}

		if ( client ) return fn;

		return function ( locals ) {
			return fn.call( this, locals, filters, escape, rethrow );
		}
	};

	/**
	 * Render the given `str` of ejs.
	 *
	 * Options:
	 *
	 *   - `locals`          Local variables object
	 *   - `cache`           Compiled functions are cached, requires `filename`
	 *   - `filename`        Used by `cache` to key caches
	 *   - `scope`           Function execution context
	 *   - `debug`           Output generated function body
	 *   - `open`            Open tag, defaulting to "<%"
	 *   - `close`           Closing tag, defaulting to "%>"
	 *
	 * @param {String} str
	 * @param {Object} options
	 * @return {String}
	 * @api public
	 */

	exports.render = function ( str, options ) {
		var fn
			, options = options || {};

		if ( options.cache ) {
			if ( options.filename ) {
				fn = cache[options.filename] || (cache[options.filename] = compile( str, options ));
			} else {
				throw new Error( '"cache" option requires "filename".' );
			}
		} else {
			fn = compile( str, options );
		}

		options.__proto__ = options.locals;
		return fn.call( options.scope, options );
	};

	/**
	 * Render an EJS file at the given `path` and callback `fn(err, str)`.
	 *
	 * @param {String} path
	 * @param {Object|Function} options or callback
	 * @param {Function} fn
	 * @api public
	 */

	exports.renderFile = function ( path, options, fn ) {
		var key = path + ':string';

		if ( 'function' == typeof options ) {
			fn = options, options = {};
		}

		options.filename = path;

		var str;
		try {
			str = options.cache
				? cache[key] || (cache[key] = read( path, 'utf8' ))
				: read( path, 'utf8' );
		} catch ( err ) {
			fn( err );
			return;
		}
		fn( null, exports.render( str, options ) );
	};

	/**
	 * Resolve include `name` relative to `filename`.
	 *
	 * @param {String} name
	 * @param {String} filename
	 * @return {String}
	 * @api private
	 */

	function resolveInclude( name, filename ) {
		var path = join( dirname( filename ), name );
		var ext = extname( name );
		if ( !ext ) path += '.ejs';
		return path;
	}

// express support

	exports.__express = exports.renderFile;

	/**
	 * Expose to require().
	 */

	if ( require.extensions ) {
		require.extensions['.ejs'] = function ( module, filename ) {
			filename = filename || module.filename;
			var options = { filename : filename, client : true }
				, template = fs.readFileSync( filename ).toString()
				, fn = compile( template, options );
			module._compile( 'module.exports = ' + fn.toString() + ';', filename );
		};
	} else if ( require.registerExtension ) {
		require.registerExtension( '.ejs', function ( src ) {
			return compile( src, {} );
		} );
	}

}, {"./filters" : 5, "./utils" : 6, "fs" : 1, "path" : 2}], 5                                                                           : [function ( require, module, exports ) {
	/*!
 * EJS - Filters
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

	/**
	 * First element of the target `obj`.
	 */

	exports.first = function ( obj ) {
		return obj[0];
	};

	/**
	 * Last element of the target `obj`.
	 */

	exports.last = function ( obj ) {
		return obj[obj.length - 1];
	};

	/**
	 * Capitalize the first letter of the target `str`.
	 */

	exports.capitalize = function ( str ) {
		str = String( str );
		return str[0].toUpperCase() + str.substr( 1, str.length );
	};

	/**
	 * Downcase the target `str`.
	 */

	exports.downcase = function ( str ) {
		return String( str ).toLowerCase();
	};

	/**
	 * Uppercase the target `str`.
	 */

	exports.upcase = function ( str ) {
		return String( str ).toUpperCase();
	};

	/**
	 * Sort the target `obj`.
	 */

	exports.sort = function ( obj ) {
		return Object.create( obj ).sort();
	};

	/**
	 * Sort the target `obj` by the given `prop` ascending.
	 */

	exports.sort_by = function ( obj, prop ) {
		return Object.create( obj ).sort( function ( a, b ) {
			a = a[prop], b = b[prop];
			if ( a > b ) return 1;
			if ( a < b ) return -1;
			return 0;
		} );
	};

	/**
	 * Size or length of the target `obj`.
	 */

	exports.size = exports.length = function ( obj ) {
		return obj.length;
	};

	/**
	 * Add `a` and `b`.
	 */

	exports.plus = function ( a, b ) {
		return Number( a ) + Number( b );
	};

	/**
	 * Subtract `b` from `a`.
	 */

	exports.minus = function ( a, b ) {
		return Number( a ) - Number( b );
	};

	/**
	 * Multiply `a` by `b`.
	 */

	exports.times = function ( a, b ) {
		return Number( a ) * Number( b );
	};

	/**
	 * Divide `a` by `b`.
	 */

	exports.divided_by = function ( a, b ) {
		return Number( a ) / Number( b );
	};

	/**
	 * Join `obj` with the given `str`.
	 */

	exports.join = function ( obj, str ) {
		return obj.join( str || ', ' );
	};

	/**
	 * Truncate `str` to `len`.
	 */

	exports.truncate = function ( str, len, append ) {
		str = String( str );
		if ( str.length > len ) {
			str = str.slice( 0, len );
			if ( append ) str += append;
		}
		return str;
	};

	/**
	 * Truncate `str` to `n` words.
	 */

	exports.truncate_words = function ( str, n ) {
		var str = String( str )
			, words = str.split( / +/ );
		return words.slice( 0, n ).join( ' ' );
	};

	/**
	 * Replace `pattern` with `substitution` in `str`.
	 */

	exports.replace = function ( str, pattern, substitution ) {
		return String( str ).replace( pattern, substitution || '' );
	};

	/**
	 * Prepend `val` to `obj`.
	 */

	exports.prepend = function ( obj, val ) {
		return Array.isArray( obj )
			? [val].concat( obj )
			: val + obj;
	};

	/**
	 * Append `val` to `obj`.
	 */

	exports.append = function ( obj, val ) {
		return Array.isArray( obj )
			? obj.concat( val )
			: obj + val;
	};

	/**
	 * Map the given `prop`.
	 */

	exports.map = function ( arr, prop ) {
		return arr.map( function ( obj ) {
			return obj[prop];
		} );
	};

	/**
	 * Reverse the given `obj`.
	 */

	exports.reverse = function ( obj ) {
		return Array.isArray( obj )
			? obj.reverse()
			: String( obj ).split( '' ).reverse().join( '' );
	};

	/**
	 * Get `prop` of the given `obj`.
	 */

	exports.get = function ( obj, prop ) {
		return obj[prop];
	};

	/**
	 * Packs the given `obj` into json string
	 */
	exports.json = function ( obj ) {
		return JSON.stringify( obj );
	};

}, {}], 6                                                                                                                               : [function ( require, module, exports ) {

	/*!
 * EJS
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

	/**
	 * Escape the given string of `html`.
	 *
	 * @param {String} html
	 * @return {String}
	 * @api private
	 */

	exports.escape = function ( html ) {
		return String( html )
			.replace( /&/g, '&amp;' )
			.replace( /</g, '&lt;' )
			.replace( />/g, '&gt;' )
			.replace( /'/g, '&#39;' )
			.replace( /"/g, '&quot;' );
	};

}, {}], 7                                                                                                                               : [function ( require, module, exports ) {
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

}, {"../../../src/base" : 15, "../../../src/utils/logger" : 20, "../../../src/view" : 21, "../../../src/view/zone" : 23, "ejs" : 4}], 8 : [function ( require, module, exports ) {
	(function ( process ) {
		/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
		/*jshint onevar: false, indent:4 */
		/*global setImmediate: false, setTimeout: false, console: false */
		(function () {

			var async = {};

			// global on the server, window in the browser
			var root, previous_async;

			root = this;
			if ( root != null ) {
				previous_async = root.async;
			}

			async.noConflict = function () {
				root.async = previous_async;
				return async;
			};

			function only_once( fn ) {
				var called = false;
				return function () {
					if ( called ) throw new Error( "Callback was already called." );
					called = true;
					fn.apply( root, arguments );
				}
			}

			//// cross-browser compatiblity functions ////

			var _toString = Object.prototype.toString;

			var _isArray = Array.isArray || function ( obj ) {
				return _toString.call( obj ) === '[object Array]';
			};

			var _each = function ( arr, iterator ) {
				if ( arr.forEach ) {
					return arr.forEach( iterator );
				}
				for ( var i = 0; i < arr.length; i += 1 ) {
					iterator( arr[i], i, arr );
				}
			};

			var _map = function ( arr, iterator ) {
				if ( arr.map ) {
					return arr.map( iterator );
				}
				var results = [];
				_each( arr, function ( x, i, a ) {
					results.push( iterator( x, i, a ) );
				} );
				return results;
			};

			var _reduce = function ( arr, iterator, memo ) {
				if ( arr.reduce ) {
					return arr.reduce( iterator, memo );
				}
				_each( arr, function ( x, i, a ) {
					memo = iterator( memo, x, i, a );
				} );
				return memo;
			};

			var _keys = function ( obj ) {
				if ( Object.keys ) {
					return Object.keys( obj );
				}
				var keys = [];
				for ( var k in obj ) {
					if ( obj.hasOwnProperty( k ) ) {
						keys.push( k );
					}
				}
				return keys;
			};

			//// exported async module functions ////

			//// nextTick implementation with browser-compatible fallback ////
			if ( typeof process === 'undefined' || !(process.nextTick) ) {
				if ( typeof setImmediate === 'function' ) {
					async.nextTick = function ( fn ) {
						// not a direct alias for IE10 compatibility
						setImmediate( fn );
					};
					async.setImmediate = async.nextTick;
				}
				else {
					async.nextTick = function ( fn ) {
						setTimeout( fn, 0 );
					};
					async.setImmediate = async.nextTick;
				}
			}
			else {
				async.nextTick = process.nextTick;
				if ( typeof setImmediate !== 'undefined' ) {
					async.setImmediate = function ( fn ) {
						// not a direct alias for IE10 compatibility
						setImmediate( fn );
					};
				}
				else {
					async.setImmediate = async.nextTick;
				}
			}

			async.each = function ( arr, iterator, callback ) {
				callback = callback || function () {};
				if ( !arr.length ) {
					return callback();
				}
				var completed = 0;
				_each( arr, function ( x ) {
					iterator( x, only_once( done ) );
				} );
				function done( err ) {
					if ( err ) {
						callback( err );
						callback = function () {};
					}
					else {
						completed += 1;
						if ( completed >= arr.length ) {
							callback();
						}
					}
				}
			};
			async.forEach = async.each;

			async.eachSeries = function ( arr, iterator, callback ) {
				callback = callback || function () {};
				if ( !arr.length ) {
					return callback();
				}
				var completed = 0;
				var iterate = function () {
					iterator( arr[completed], function ( err ) {
						if ( err ) {
							callback( err );
							callback = function () {};
						}
						else {
							completed += 1;
							if ( completed >= arr.length ) {
								callback();
							}
							else {
								iterate();
							}
						}
					} );
				};
				iterate();
			};
			async.forEachSeries = async.eachSeries;

			async.eachLimit = function ( arr, limit, iterator, callback ) {
				var fn = _eachLimit( limit );
				fn.apply( null, [arr, iterator, callback] );
			};
			async.forEachLimit = async.eachLimit;

			var _eachLimit = function ( limit ) {

				return function ( arr, iterator, callback ) {
					callback = callback || function () {};
					if ( !arr.length || limit <= 0 ) {
						return callback();
					}
					var completed = 0;
					var started = 0;
					var running = 0;

					(function replenish() {
						if ( completed >= arr.length ) {
							return callback();
						}

						while ( running < limit && started < arr.length ) {
							started += 1;
							running += 1;
							iterator( arr[started - 1], function ( err ) {
								if ( err ) {
									callback( err );
									callback = function () {};
								}
								else {
									completed += 1;
									running -= 1;
									if ( completed >= arr.length ) {
										callback();
									}
									else {
										replenish();
									}
								}
							} );
						}
					})();
				};
			};

			var doParallel = function ( fn ) {
				return function () {
					var args = Array.prototype.slice.call( arguments );
					return fn.apply( null, [async.each].concat( args ) );
				};
			};
			var doParallelLimit = function ( limit, fn ) {
				return function () {
					var args = Array.prototype.slice.call( arguments );
					return fn.apply( null, [_eachLimit( limit )].concat( args ) );
				};
			};
			var doSeries = function ( fn ) {
				return function () {
					var args = Array.prototype.slice.call( arguments );
					return fn.apply( null, [async.eachSeries].concat( args ) );
				};
			};

			var _asyncMap = function ( eachfn, arr, iterator, callback ) {
				arr = _map( arr, function ( x, i ) {
					return {index : i, value : x};
				} );
				if ( !callback ) {
					eachfn( arr, function ( x, callback ) {
						iterator( x.value, function ( err ) {
							callback( err );
						} );
					} );
				} else {
					var results = [];
					eachfn( arr, function ( x, callback ) {
						iterator( x.value, function ( err, v ) {
							results[x.index] = v;
							callback( err );
						} );
					}, function ( err ) {
						callback( err, results );
					} );
				}
			};
			async.map = doParallel( _asyncMap );
			async.mapSeries = doSeries( _asyncMap );
			async.mapLimit = function ( arr, limit, iterator, callback ) {
				return _mapLimit( limit )( arr, iterator, callback );
			};

			var _mapLimit = function ( limit ) {
				return doParallelLimit( limit, _asyncMap );
			};

			// reduce only has a series version, as doing reduce in parallel won't
			// work in many situations.
			async.reduce = function ( arr, memo, iterator, callback ) {
				async.eachSeries( arr, function ( x, callback ) {
					iterator( memo, x, function ( err, v ) {
						memo = v;
						callback( err );
					} );
				}, function ( err ) {
					callback( err, memo );
				} );
			};
			// inject alias
			async.inject = async.reduce;
			// foldl alias
			async.foldl = async.reduce;

			async.reduceRight = function ( arr, memo, iterator, callback ) {
				var reversed = _map( arr, function ( x ) {
					return x;
				} ).reverse();
				async.reduce( reversed, memo, iterator, callback );
			};
			// foldr alias
			async.foldr = async.reduceRight;

			var _filter = function ( eachfn, arr, iterator, callback ) {
				var results = [];
				arr = _map( arr, function ( x, i ) {
					return {index : i, value : x};
				} );
				eachfn( arr, function ( x, callback ) {
					iterator( x.value, function ( v ) {
						if ( v ) {
							results.push( x );
						}
						callback();
					} );
				}, function ( err ) {
					callback( _map( results.sort( function ( a, b ) {
						return a.index - b.index;
					} ), function ( x ) {
						return x.value;
					} ) );
				} );
			};
			async.filter = doParallel( _filter );
			async.filterSeries = doSeries( _filter );
			// select alias
			async.select = async.filter;
			async.selectSeries = async.filterSeries;

			var _reject = function ( eachfn, arr, iterator, callback ) {
				var results = [];
				arr = _map( arr, function ( x, i ) {
					return {index : i, value : x};
				} );
				eachfn( arr, function ( x, callback ) {
					iterator( x.value, function ( v ) {
						if ( !v ) {
							results.push( x );
						}
						callback();
					} );
				}, function ( err ) {
					callback( _map( results.sort( function ( a, b ) {
						return a.index - b.index;
					} ), function ( x ) {
						return x.value;
					} ) );
				} );
			};
			async.reject = doParallel( _reject );
			async.rejectSeries = doSeries( _reject );

			var _detect = function ( eachfn, arr, iterator, main_callback ) {
				eachfn( arr, function ( x, callback ) {
					iterator( x, function ( result ) {
						if ( result ) {
							main_callback( x );
							main_callback = function () {};
						}
						else {
							callback();
						}
					} );
				}, function ( err ) {
					main_callback();
				} );
			};
			async.detect = doParallel( _detect );
			async.detectSeries = doSeries( _detect );

			async.some = function ( arr, iterator, main_callback ) {
				async.each( arr, function ( x, callback ) {
					iterator( x, function ( v ) {
						if ( v ) {
							main_callback( true );
							main_callback = function () {};
						}
						callback();
					} );
				}, function ( err ) {
					main_callback( false );
				} );
			};
			// any alias
			async.any = async.some;

			async.every = function ( arr, iterator, main_callback ) {
				async.each( arr, function ( x, callback ) {
					iterator( x, function ( v ) {
						if ( !v ) {
							main_callback( false );
							main_callback = function () {};
						}
						callback();
					} );
				}, function ( err ) {
					main_callback( true );
				} );
			};
			// all alias
			async.all = async.every;

			async.sortBy = function ( arr, iterator, callback ) {
				async.map( arr, function ( x, callback ) {
					iterator( x, function ( err, criteria ) {
						if ( err ) {
							callback( err );
						}
						else {
							callback( null, {value : x, criteria : criteria} );
						}
					} );
				}, function ( err, results ) {
					if ( err ) {
						return callback( err );
					}
					else {
						var fn = function ( left, right ) {
							var a = left.criteria, b = right.criteria;
							return a < b ? -1 : a > b ? 1 : 0;
						};
						callback( null, _map( results.sort( fn ), function ( x ) {
							return x.value;
						} ) );
					}
				} );
			};

			async.auto = function ( tasks, callback ) {
				callback = callback || function () {};
				var keys = _keys( tasks );
				var remainingTasks = keys.length
				if ( !remainingTasks ) {
					return callback();
				}

				var results = {};

				var listeners = [];
				var addListener = function ( fn ) {
					listeners.unshift( fn );
				};
				var removeListener = function ( fn ) {
					for ( var i = 0; i < listeners.length; i += 1 ) {
						if ( listeners[i] === fn ) {
							listeners.splice( i, 1 );
							return;
						}
					}
				};
				var taskComplete = function () {
					remainingTasks--
					_each( listeners.slice( 0 ), function ( fn ) {
						fn();
					} );
				};

				addListener( function () {
					if ( !remainingTasks ) {
						var theCallback = callback;
						// prevent final callback from calling itself if it errors
						callback = function () {};

						theCallback( null, results );
					}
				} );

				_each( keys, function ( k ) {
					var task = _isArray( tasks[k] ) ? tasks[k] : [tasks[k]];
					var taskCallback = function ( err ) {
						var args = Array.prototype.slice.call( arguments, 1 );
						if ( args.length <= 1 ) {
							args = args[0];
						}
						if ( err ) {
							var safeResults = {};
							_each( _keys( results ), function ( rkey ) {
								safeResults[rkey] = results[rkey];
							} );
							safeResults[k] = args;
							callback( err, safeResults );
							// stop subsequent errors hitting callback multiple times
							callback = function () {};
						}
						else {
							results[k] = args;
							async.setImmediate( taskComplete );
						}
					};
					var requires = task.slice( 0, Math.abs( task.length - 1 ) ) || [];
					var ready = function () {
						return _reduce( requires, function ( a, x ) {
							return (a && results.hasOwnProperty( x ));
						}, true ) && !results.hasOwnProperty( k );
					};
					if ( ready() ) {
						task[task.length - 1]( taskCallback, results );
					}
					else {
						var listener = function () {
							if ( ready() ) {
								removeListener( listener );
								task[task.length - 1]( taskCallback, results );
							}
						};
						addListener( listener );
					}
				} );
			};

			async.retry = function ( times, task, callback ) {
				var DEFAULT_TIMES = 5;
				var attempts = [];
				// Use defaults if times not passed
				if ( typeof times === 'function' ) {
					callback = task;
					task = times;
					times = DEFAULT_TIMES;
				}
				// Make sure times is a number
				times = parseInt( times, 10 ) || DEFAULT_TIMES;
				var wrappedTask = function ( wrappedCallback, wrappedResults ) {
					var retryAttempt = function ( task, finalAttempt ) {
						return function ( seriesCallback ) {
							task( function ( err, result ) {
								seriesCallback( !err || finalAttempt, {err : err, result : result} );
							}, wrappedResults );
						};
					};
					while ( times ) {
						attempts.push( retryAttempt( task, !(times -= 1) ) );
					}
					async.series( attempts, function ( done, data ) {
						data = data[data.length - 1];
						(wrappedCallback || callback)( data.err, data.result );
					} );
				}
				// If a callback is passed, run this as a controll flow
				return callback ? wrappedTask() : wrappedTask
			};

			async.waterfall = function ( tasks, callback ) {
				callback = callback || function () {};
				if ( !_isArray( tasks ) ) {
					var err = new Error( 'First argument to waterfall must be an array of functions' );
					return callback( err );
				}
				if ( !tasks.length ) {
					return callback();
				}
				var wrapIterator = function ( iterator ) {
					return function ( err ) {
						if ( err ) {
							callback.apply( null, arguments );
							callback = function () {};
						}
						else {
							var args = Array.prototype.slice.call( arguments, 1 );
							var next = iterator.next();
							if ( next ) {
								args.push( wrapIterator( next ) );
							}
							else {
								args.push( callback );
							}
							async.setImmediate( function () {
								iterator.apply( null, args );
							} );
						}
					};
				};
				wrapIterator( async.iterator( tasks ) )();
			};

			var _parallel = function ( eachfn, tasks, callback ) {
				callback = callback || function () {};
				if ( _isArray( tasks ) ) {
					eachfn.map( tasks, function ( fn, callback ) {
						if ( fn ) {
							fn( function ( err ) {
								var args = Array.prototype.slice.call( arguments, 1 );
								if ( args.length <= 1 ) {
									args = args[0];
								}
								callback.call( null, err, args );
							} );
						}
					}, callback );
				}
				else {
					var results = {};
					eachfn.each( _keys( tasks ), function ( k, callback ) {
						tasks[k]( function ( err ) {
							var args = Array.prototype.slice.call( arguments, 1 );
							if ( args.length <= 1 ) {
								args = args[0];
							}
							results[k] = args;
							callback( err );
						} );
					}, function ( err ) {
						callback( err, results );
					} );
				}
			};

			async.parallel = function ( tasks, callback ) {
				_parallel( { map : async.map, each : async.each }, tasks, callback );
			};

			async.parallelLimit = function ( tasks, limit, callback ) {
				_parallel( { map : _mapLimit( limit ), each : _eachLimit( limit ) }, tasks, callback );
			};

			async.series = function ( tasks, callback ) {
				callback = callback || function () {};
				if ( _isArray( tasks ) ) {
					async.mapSeries( tasks, function ( fn, callback ) {
						if ( fn ) {
							fn( function ( err ) {
								var args = Array.prototype.slice.call( arguments, 1 );
								if ( args.length <= 1 ) {
									args = args[0];
								}
								callback.call( null, err, args );
							} );
						}
					}, callback );
				}
				else {
					var results = {};
					async.eachSeries( _keys( tasks ), function ( k, callback ) {
						tasks[k]( function ( err ) {
							var args = Array.prototype.slice.call( arguments, 1 );
							if ( args.length <= 1 ) {
								args = args[0];
							}
							results[k] = args;
							callback( err );
						} );
					}, function ( err ) {
						callback( err, results );
					} );
				}
			};

			async.iterator = function ( tasks ) {
				var makeCallback = function ( index ) {
					var fn = function () {
						if ( tasks.length ) {
							tasks[index].apply( null, arguments );
						}
						return fn.next();
					};
					fn.next = function () {
						return (index < tasks.length - 1) ? makeCallback( index + 1 ) : null;
					};
					return fn;
				};
				return makeCallback( 0 );
			};

			async.apply = function ( fn ) {
				var args = Array.prototype.slice.call( arguments, 1 );
				return function () {
					return fn.apply(
						null, args.concat( Array.prototype.slice.call( arguments ) )
					);
				};
			};

			var _concat = function ( eachfn, arr, fn, callback ) {
				var r = [];
				eachfn( arr, function ( x, cb ) {
					fn( x, function ( err, y ) {
						r = r.concat( y || [] );
						cb( err );
					} );
				}, function ( err ) {
					callback( err, r );
				} );
			};
			async.concat = doParallel( _concat );
			async.concatSeries = doSeries( _concat );

			async.whilst = function ( test, iterator, callback ) {
				if ( test() ) {
					iterator( function ( err ) {
						if ( err ) {
							return callback( err );
						}
						async.whilst( test, iterator, callback );
					} );
				}
				else {
					callback();
				}
			};

			async.doWhilst = function ( iterator, test, callback ) {
				iterator( function ( err ) {
					if ( err ) {
						return callback( err );
					}
					var args = Array.prototype.slice.call( arguments, 1 );
					if ( test.apply( null, args ) ) {
						async.doWhilst( iterator, test, callback );
					}
					else {
						callback();
					}
				} );
			};

			async.until = function ( test, iterator, callback ) {
				if ( !test() ) {
					iterator( function ( err ) {
						if ( err ) {
							return callback( err );
						}
						async.until( test, iterator, callback );
					} );
				}
				else {
					callback();
				}
			};

			async.doUntil = function ( iterator, test, callback ) {
				iterator( function ( err ) {
					if ( err ) {
						return callback( err );
					}
					var args = Array.prototype.slice.call( arguments, 1 );
					if ( !test.apply( null, args ) ) {
						async.doUntil( iterator, test, callback );
					}
					else {
						callback();
					}
				} );
			};

			async.queue = function ( worker, concurrency ) {
				if ( concurrency === undefined ) {
					concurrency = 1;
				}
				function _insert( q, data, pos, callback ) {
					if ( !q.started ) {
						q.started = true;
					}
					if ( !_isArray( data ) ) {
						data = [data];
					}
					if ( data.length == 0 ) {
						// call drain immediately if there are no tasks
						return async.setImmediate( function () {
							if ( q.drain ) {
								q.drain();
							}
						} );
					}
					_each( data, function ( task ) {
						var item = {
							data     : task,
							callback : typeof callback === 'function' ? callback : null
						};

						if ( pos ) {
							q.tasks.unshift( item );
						} else {
							q.tasks.push( item );
						}

						if ( q.saturated && q.tasks.length === q.concurrency ) {
							q.saturated();
						}
						async.setImmediate( q.process );
					} );
				}

				var workers = 0;
				var q = {
					tasks       : [],
					concurrency : concurrency,
					saturated   : null,
					empty       : null,
					drain       : null,
					started     : false,
					paused      : false,
					push        : function ( data, callback ) {
						_insert( q, data, false, callback );
					},
					kill        : function () {
						q.drain = null;
						q.tasks = [];
					},
					unshift     : function ( data, callback ) {
						_insert( q, data, true, callback );
					},
					process     : function () {
						if ( !q.paused && workers < q.concurrency && q.tasks.length ) {
							var task = q.tasks.shift();
							if ( q.empty && q.tasks.length === 0 ) {
								q.empty();
							}
							workers += 1;
							var next = function () {
								workers -= 1;
								if ( task.callback ) {
									task.callback.apply( task, arguments );
								}
								if ( q.drain && q.tasks.length + workers === 0 ) {
									q.drain();
								}
								q.process();
							};
							var cb = only_once( next );
							worker( task.data, cb );
						}
					},
					length      : function () {
						return q.tasks.length;
					},
					running     : function () {
						return workers;
					},
					idle        : function () {
						return q.tasks.length + workers === 0;
					},
					pause       : function () {
						if ( q.paused === true ) { return; }
						q.paused = true;
						q.process();
					},
					resume      : function () {
						if ( q.paused === false ) { return; }
						q.paused = false;
						q.process();
					}
				};
				return q;
			};

			async.priorityQueue = function ( worker, concurrency ) {

				function _compareTasks( a, b ) {
					return a.priority - b.priority;
				};

				function _binarySearch( sequence, item, compare ) {
					var beg = -1,
						end = sequence.length - 1;
					while ( beg < end ) {
						var mid = beg + ((end - beg + 1) >>> 1);
						if ( compare( item, sequence[mid] ) >= 0 ) {
							beg = mid;
						} else {
							end = mid - 1;
						}
					}
					return beg;
				}

				function _insert( q, data, priority, callback ) {
					if ( !q.started ) {
						q.started = true;
					}
					if ( !_isArray( data ) ) {
						data = [data];
					}
					if ( data.length == 0 ) {
						// call drain immediately if there are no tasks
						return async.setImmediate( function () {
							if ( q.drain ) {
								q.drain();
							}
						} );
					}
					_each( data, function ( task ) {
						var item = {
							data     : task,
							priority : priority,
							callback : typeof callback === 'function' ? callback : null
						};

						q.tasks.splice( _binarySearch( q.tasks, item, _compareTasks ) + 1, 0, item );

						if ( q.saturated && q.tasks.length === q.concurrency ) {
							q.saturated();
						}
						async.setImmediate( q.process );
					} );
				}

				// Start with a normal queue
				var q = async.queue( worker, concurrency );

				// Override push to accept second parameter representing priority
				q.push = function ( data, priority, callback ) {
					_insert( q, data, priority, callback );
				};

				// Remove unshift function
				delete q.unshift;

				return q;
			};

			async.cargo = function ( worker, payload ) {
				var working = false,
					tasks = [];

				var cargo = {
					tasks     : tasks,
					payload   : payload,
					saturated : null,
					empty     : null,
					drain     : null,
					drained   : true,
					push      : function ( data, callback ) {
						if ( !_isArray( data ) ) {
							data = [data];
						}
						_each( data, function ( task ) {
							tasks.push( {
								data     : task,
								callback : typeof callback === 'function' ? callback : null
							} );
							cargo.drained = false;
							if ( cargo.saturated && tasks.length === payload ) {
								cargo.saturated();
							}
						} );
						async.setImmediate( cargo.process );
					},
					process   : function process() {
						if ( working ) return;
						if ( tasks.length === 0 ) {
							if ( cargo.drain && !cargo.drained ) cargo.drain();
							cargo.drained = true;
							return;
						}

						var ts = typeof payload === 'number'
							? tasks.splice( 0, payload )
							: tasks.splice( 0, tasks.length );

						var ds = _map( ts, function ( task ) {
							return task.data;
						} );

						if ( cargo.empty ) cargo.empty();
						working = true;
						worker( ds, function () {
							working = false;

							var args = arguments;
							_each( ts, function ( data ) {
								if ( data.callback ) {
									data.callback.apply( null, args );
								}
							} );

							process();
						} );
					},
					length    : function () {
						return tasks.length;
					},
					running   : function () {
						return working;
					}
				};
				return cargo;
			};

			var _console_fn = function ( name ) {
				return function ( fn ) {
					var args = Array.prototype.slice.call( arguments, 1 );
					fn.apply( null, args.concat( [function ( err ) {
						var args = Array.prototype.slice.call( arguments, 1 );
						if ( typeof console !== 'undefined' ) {
							if ( err ) {
								if ( console.error ) {
									console.error( err );
								}
							}
							else if ( console[name] ) {
								_each( args, function ( x ) {
									console[name]( x );
								} );
							}
						}
					}] ) );
				};
			};
			async.log = _console_fn( 'log' );
			async.dir = _console_fn( 'dir' );
			/*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

			async.memoize = function ( fn, hasher ) {
				var memo = {};
				var queues = {};
				hasher = hasher || function ( x ) {
					return x;
				};
				var memoized = function () {
					var args = Array.prototype.slice.call( arguments );
					var callback = args.pop();
					var key = hasher.apply( null, args );
					if ( key in memo ) {
						async.nextTick( function () {
							callback.apply( null, memo[key] );
						} );
					}
					else if ( key in queues ) {
						queues[key].push( callback );
					}
					else {
						queues[key] = [callback];
						fn.apply( null, args.concat( [function () {
							memo[key] = arguments;
							var q = queues[key];
							delete queues[key];
							for ( var i = 0, l = q.length; i < l; i++ ) {
								q[i].apply( null, arguments );
							}
						}] ) );
					}
				};
				memoized.memo = memo;
				memoized.unmemoized = fn;
				return memoized;
			};

			async.unmemoize = function ( fn ) {
				return function () {
					return (fn.unmemoized || fn).apply( null, arguments );
				};
			};

			async.times = function ( count, iterator, callback ) {
				var counter = [];
				for ( var i = 0; i < count; i++ ) {
					counter.push( i );
				}
				return async.map( counter, iterator, callback );
			};

			async.timesSeries = function ( count, iterator, callback ) {
				var counter = [];
				for ( var i = 0; i < count; i++ ) {
					counter.push( i );
				}
				return async.mapSeries( counter, iterator, callback );
			};

			async.seq = function ( /* functions... */ ) {
				var fns = arguments;
				return function () {
					var that = this;
					var args = Array.prototype.slice.call( arguments );
					var callback = args.pop();
					async.reduce( fns, args, function ( newargs, fn, cb ) {
							fn.apply( that, newargs.concat( [function () {
								var err = arguments[0];
								var nextargs = Array.prototype.slice.call( arguments, 1 );
								cb( err, nextargs );
							}] ) )
						},
						function ( err, results ) {
							callback.apply( that, [err].concat( results ) );
						} );
				};
			};

			async.compose = function ( /* functions... */ ) {
				return async.seq.apply( null, Array.prototype.reverse.call( arguments ) );
			};

			var _applyEach = function ( eachfn, fns /*args...*/ ) {
				var go = function () {
					var that = this;
					var args = Array.prototype.slice.call( arguments );
					var callback = args.pop();
					return eachfn( fns, function ( fn, cb ) {
							fn.apply( that, args.concat( [cb] ) );
						},
						callback );
				};
				if ( arguments.length > 2 ) {
					var args = Array.prototype.slice.call( arguments, 2 );
					return go.apply( this, args );
				}
				else {
					return go;
				}
			};
			async.applyEach = doParallel( _applyEach );
			async.applyEachSeries = doSeries( _applyEach );

			async.forever = function ( fn, callback ) {
				function next( err ) {
					if ( err ) {
						if ( callback ) {
							return callback( err );
						}
						throw err;
					}
					fn( next );
				}

				next();
			};

			// Node.js
			if ( typeof module !== 'undefined' && module.exports ) {
				module.exports = async;
			}
			// AMD / RequireJS
			else if ( typeof define !== 'undefined' && define.amd ) {
				define( [], function () {
					return async;
				} );
			}
			// included directly via <script> tag
			else {
				root.async = async;
			}

		}());

	}).call( this, require( "Zbi7gb" ) )
}, {"Zbi7gb" : 3}], 9                                                                                                                   : [function ( require, module, exports ) {
	(function ( factory ) {
		if ( typeof define != "undefined" ) {
			define( ["./mini"], factory );
		} else if ( typeof module != "undefined" ) {
			module.exports = factory( require( "./mini" ) );
		} else {
			dcl = factory( dcl );
		}
	})( function ( dcl ) {
		"use strict";

		function nop() {}

		var Advice = dcl( dcl.Super, {
			//declaredClass: "dcl.Advice",
			constructor : function () {
				this.b = this.f.before;
				this.a = this.f.after;
				this.f = this.f.around;
			}
		} );

		function advise( f ) { return dcl._mk( f, Advice ); }

		function makeAOPStub( b, a, f ) {
			var sb = b || nop,
				sa = a || nop,
				sf = f || nop,
				x = function () {
					var r;
					// running the before chain
					sb.apply( this, arguments );
					// running the around chain
					try {
						r = sf.apply( this, arguments );
					} catch ( e ) {
						r = e;
					}
					// running the after chain
					sa.call( this, arguments, r );
					if ( r instanceof Error ) {
						throw r;
					}
					return r;
				};
			x.advices = {b : b, a : a, f : f};
			return x;
		}

		function chain( id ) {
			return function ( ctor, name ) {
				var m = ctor._m, c;
				if ( m ) {
					c = (+m.w[name] || 0);
					if ( c && c != id ) {
						dcl._e( "set chaining", name, ctor, id, c );
					}
					m.w[name] = id;
				}
			};
		}

		dcl.mix( dcl, {
			// public API
			Advice       : Advice,
			advise       : advise,
			// expose helper methods
			before       : function ( f ) { return dcl.advise( {before : f} ); },
			after        : function ( f ) { return dcl.advise( {after : f} ); },
			around       : dcl.superCall,
			// chains
			chainBefore  : chain( 1 ),
			chainAfter   : chain( 2 ),
			isInstanceOf : function ( o, ctor ) {
				if ( o instanceof ctor ) {
					return true;
				}
				var t = o.constructor._m, i;
				if ( t ) {
					for ( t = t.b, i = t.length - 1; i >= 0; --i ) {
						if ( t[i] === ctor ) {
							return true;
						}
					}
				}
				return false;
			},
			// protected API starts with _ (don't use it!)
			_sb          : /*generic stub*/ function ( id, bases, name, chains ) {
				var f = chains[name] = dcl._ec( bases, name, "f" ),
					b = dcl._ec( bases, name, "b" ).reverse(),
					a = dcl._ec( bases, name, "a" );
				f = id ? dcl._st( f, id == 1 ? function ( f ) { return dcl._sc( f.reverse() ); } : dcl._sc, name ) : dcl._ss( f, name );
				return !b.length && !a.length ? f || function () {} : makeAOPStub( dcl._sc( b ), dcl._sc( a ), f );
			}
		} );

		return dcl;
	} );

}, {"./mini" : 10}], 10                                                                                                                 : [function ( require, module, exports ) {
	(function ( factory ) {
		if ( typeof define != "undefined" ) {
			define( [], factory );
		} else if ( typeof module != "undefined" ) {
			module.exports = factory();
		} else {
			dcl = factory();
		}
	})( function () {
		"use strict";

		var counter = 0, cname = "constructor", pname = "prototype",
			F = function () {}, empty = {}, mix, extractChain,
			stubSuper, stubChain, stubChainSuper, post;

		function dcl( superClass, props ) {
			var bases = [0], proto, base, ctor, meta, connectionMap,
				output, vector, superClasses, i, j = 0, n;

			if ( superClass ) {
				if ( superClass instanceof Array ) {
					// mixins: C3 MRO
					connectionMap = {};
					superClasses = superClass.slice( 0 ).reverse();
					for ( i = superClasses.length - 1; i >= 0; --i ) {
						base = superClasses[i];
						// pre-process a base
						// 1) add a unique id
						base._u = base._u || counter++;
						// 2) build a connection map and the base list
						if ( (proto = base._m) ) {   // intentional assignment
							for ( vector = proto.b, j = vector.length - 1; j > 0; --j ) {
								n = vector[j]._u;
								connectionMap[n] = (connectionMap[n] || 0) + 1;
							}
							superClasses[i] = vector.slice( 0 );
						} else {
							superClasses[i] = [base];
						}
					}
					// build output
					output = {};
					c: while ( superClasses.length ) {
						for ( i = 0; i < superClasses.length; ++i ) {
							vector = superClasses[i];
							base = vector[0];
							n = base._u;
							if ( !connectionMap[n] ) {
								if ( !output[n] ) {
									bases.push( base );
									output[n] = 1;
								}
								vector.shift();
								if ( vector.length ) {
									--connectionMap[vector[0]._u];
								} else {
									superClasses.splice( i, 1 );
								}
								continue c;
							}
						}
						// error
						dcl._e( "cycle", props, superClasses );
					}
					// calculate a base class
					superClass = superClass[0];
					j = bases.length - ((meta = superClass._m) && superClass === bases[bases.length - (j = meta.b.length)] ? j : 1) - 1; // intentional assignments
				} else {
					// 1) add a unique id
					superClass._u = superClass._u || counter++;
					// 2) single inheritance
					bases = bases.concat( (meta = superClass._m) ? meta.b : superClass );   // intentional assignment
				}
			}
			// create a base class
			proto = superClass ? dcl.delegate( superClass[pname] ) : {};
			// the next line assumes that constructor is actually named "constructor", should be changed if desired
			vector = superClass && (meta = superClass._m) ? dcl.delegate( meta.w ) : {constructor : 2};   // intentional assignment

			// create prototype: mix in mixins and props
			for ( ; j > 0; --j ) {
				base = bases[j];
				meta = base._m;
				dcl.mix( proto, meta && meta.h || base[pname] );
				if ( meta ) {
					for ( n in (superClasses = meta.w) ) {    // intentional assignment
						vector[n] = (+vector[n] || 0) | superClasses[n];
					}
				}
			}
			for ( n in props ) {
				if ( isSuper( meta = props[n] ) ) {  // intentional assignment
					vector[n] = +vector[n] || 0;
				} else {
					proto[n] = meta;
				}
			}

			// create stubs with fake constructor
			//
			meta = {b : bases, h : props, w : vector, c : {}};
			// meta information is coded like that:
			// b: an array of super classes (bases) and mixins
			// h: a bag of immediate prototype properties for the constructor
			// w: a bag of chain instructions (before is 1, after is 2)
			// c: a bag of chains (ordered arrays)

			bases[0] = {_m : meta, prototype : proto};
			buildStubs( meta, proto );
			ctor = proto[cname];

			// put in place all decorations and return a constructor
			ctor._m = meta;
			ctor[pname] = proto;
			//proto.constructor = ctor; // uncomment if constructor is not named "constructor"
			bases[0] = ctor;

			// each constructor may have two properties on it:
			// _m: a meta information object as above
			// _u: a unique number, which is used to id the constructor

			return dcl._p( ctor );    // fully prepared constructor
		}

		// decorators

		function Super( f ) { this.f = f; }

		function isSuper( f ) { return f && f.spr instanceof Super; }

		// utilities

		function allKeys( o ) {
			var keys = [];
			for ( var name in o ) {
				keys.push( name );
			}
			return keys;
		}

		(mix = function ( a, b ) {
			for ( var n in b ) {
				a[n] = b[n];
			}
		})( dcl, {
			// piblic API
			mix       : mix,
			delegate  : function ( o ) {
				return Object.create( o );
			},
			allKeys   : allKeys,
			Super     : Super,
			superCall : function superCall( f ) { return dcl._mk( f ); },

			// protected API starts with _ (don't use it!)

			// make a Super marker
			_mk       : function makeSuper( f, S ) {
				var fn = function () {};
				fn.spr = new (S || Super)( f );
				return fn;
			},

			// post-processor for a constructor, can be used to add more functionality
			// or augment its behavior
			_p        : function ( ctor ) { return ctor; },   // identity, used to hang on advices

			// error function, augmented by debug.js
			_e        : function ( msg ) { throw Error( "dcl: " + msg ); },

			// supercall instantiation, augmented by debug.js
			_f        : function ( f, a, n ) {
				var t = f.spr.f( a );
				t.ctr = f.ctr;
				return t;
			},

			// the "buildStubs()" helpers, can be overwritten
			_ec       : extractChain = function ( bases, name, advice ) {
				var i = bases.length - 1, chain = [], base, f, around = advice == "f";
				for ( ; base = bases[i]; --i ) {
					// next line contains 5 intentional assignments
					if ( (f = base._m) ? (f = f.h).hasOwnProperty( name ) && (isSuper( f = f[name] ) ? (around ? f.spr.f : (f = f.spr[advice])) : around) : around && (f = name == cname ? base : base[pname][name]) && f !== empty[name] ) {
						f.ctr = base;
						chain.push( f );
					}
				}
				return chain;
			},
			_sc       : stubChain = function ( chain ) { // this is "after" chain
				var l = chain.length, f;
				return !l ? 0 : l == 1 ?
					(f = chain[0], function () {
						f.apply( this, arguments );
					}) :
					function () {
						for ( var i = 0; i < l; ++i ) {
							chain[i].apply( this, arguments );
						}
					};
			},
			_ss       : stubSuper = function ( chain, name ) {
				var i = 0, f, p = empty[name];
				for ( ; f = chain[i]; ++i ) {
					p = isSuper( f ) ? (chain[i] = dcl._f( f, p, name )) : f;
				}
				return name != cname ? p : function () { p.apply( this, arguments ); };
			},
			_st       : stubChainSuper = function ( chain, stub, name ) {
				var i = 0, f, diff, pi = 0;
				for ( ; f = chain[i]; ++i ) {
					if ( isSuper( f ) ) {
						diff = i - pi;
						diff = chain[i] = dcl._f( f, !diff ? 0 : diff == 1 ? chain[pi] : stub( chain.slice( pi, i ) ), name );
						pi = i;
					}
				}
				diff = i - pi;
				return !diff ? 0 : diff == 1 && name != cname ? chain[pi] : stub( pi ? chain.slice( pi ) : chain );
			},
			_sb       : /*generic stub*/ function ( id, bases, name, chains ) {
				var f = chains[name] = extractChain( bases, name, "f" );
				return (id ? stubChainSuper( f, stubChain, name ) : stubSuper( f, name )) || function () {};
			}
		} );

		function buildStubs( meta, proto ) {
			var weaver = meta.w, bases = meta.b, chains = meta.c;
			for ( var name in weaver ) {
				proto[name] = dcl._sb( weaver[name], bases, name, chains );
			}
		}

		return dcl;
	} );

}, {}], 11                                                                                                                              : [function ( require, module, exports ) {
	/*!
 * js-logger - http://github.com/jonnyreeves/js-logger
 * Jonny Reeves, http://jonnyreeves.co.uk/
 * js-logger may be freely distributed under the MIT license.
 */

	/*jshint sub:true*/
	/*global console:true,define:true, module:true*/
	(function ( global ) {
		"use strict";

		// Top level module for the global, static logger instance.
		var Logger = { };

		// For those that are at home that are keeping score.
		Logger.VERSION = "@VERSION@";

		// Function which handles all incoming log messages.
		var logHandler;

		// Map of ContextualLogger instances by name; used by Logger.get() to return the same named instance.
		var contextualLoggersByNameMap = {};

		// Polyfill for ES5's Function.bind.
		var bind = function ( scope, func ) {
			return function () {
				return func.apply( scope, arguments );
			};
		};

		// Super exciting object merger-matron 9000 adding another 100 bytes to your download.
		var merge = function () {
			var args = arguments, target = args[0], key, i;
			for ( i = 1; i < args.length; i++ ) {
				for ( key in args[i] ) {
					if ( !(key in target) && args[i].hasOwnProperty( key ) ) {
						target[key] = args[i][key];
					}
				}
			}
			return target;
		};

		// Helper to define a logging level object; helps with optimisation.
		var defineLogLevel = function ( value, name ) {
			return { value : value, name : name };
		};

		// Predefined logging levels.
		Logger.DEBUG = defineLogLevel( 1, 'DEBUG' );
		Logger.INFO = defineLogLevel( 2, 'INFO' );
		Logger.WARN = defineLogLevel( 4, 'WARN' );
		Logger.ERROR = defineLogLevel( 8, 'ERROR' );
		Logger.OFF = defineLogLevel( 99, 'OFF' );

		// Inner class which performs the bulk of the work; ContextualLogger instances can be configured independently
		// of each other.
		var ContextualLogger = function ( defaultContext ) {
			this.context = defaultContext;
			this.setLevel( defaultContext.filterLevel );
			this.log = this.info;  // Convenience alias.
		};

		ContextualLogger.prototype = {
			// Changes the current logging level for the logging instance.
			setLevel   : function ( newLevel ) {
				// Ensure the supplied Level object looks valid.
				if ( newLevel && "value" in newLevel ) {
					this.context.filterLevel = newLevel;
				}
			},

			// Is the logger configured to output messages at the supplied level?
			enabledFor : function ( lvl ) {
				var filterLevel = this.context.filterLevel;
				return lvl.value >= filterLevel.value;
			},

			debug : function () {
				this.invoke( Logger.DEBUG, arguments );
			},

			info : function () {
				this.invoke( Logger.INFO, arguments );
			},

			warn : function () {
				this.invoke( Logger.WARN, arguments );
			},

			error  : function () {
				this.invoke( Logger.ERROR, arguments );
			},

			// Invokes the logger callback if it's not being filtered.
			invoke : function ( level, msgArgs ) {
				if ( logHandler && this.enabledFor( level ) ) {
					logHandler( msgArgs, merge( { level : level }, this.context ) );
				}
			}
		};

		// Protected instance which all calls to the to level `Logger` module will be routed through.
		var globalLogger = new ContextualLogger( { filterLevel : Logger.OFF } );

		// Configure the global Logger instance.
		(function () {
			// Shortcut for optimisers.
			var L = Logger;

			L.enabledFor = bind( globalLogger, globalLogger.enabledFor );
			L.debug = bind( globalLogger, globalLogger.debug );
			L.info = bind( globalLogger, globalLogger.info );
			L.warn = bind( globalLogger, globalLogger.warn );
			L.error = bind( globalLogger, globalLogger.error );

			// Don't forget the convenience alias!
			L.log = L.info;
		}());

		// Set the global logging handler.  The supplied function should expect two arguments, the first being an arguments
		// object with the supplied log messages and the second being a context object which contains a hash of stateful
		// parameters which the logging function can consume.
		Logger.setHandler = function ( func ) {
			logHandler = func;
		};

		// Sets the global logging filter level which applies to *all* previously registered, and future Logger instances.
		// (note that named loggers (retrieved via `Logger.get`) can be configured independently if required).
		Logger.setLevel = function ( level ) {
			// Set the globalLogger's level.
			globalLogger.setLevel( level );

			// Apply this level to all registered contextual loggers.
			for ( var key in contextualLoggersByNameMap ) {
				if ( contextualLoggersByNameMap.hasOwnProperty( key ) ) {
					contextualLoggersByNameMap[key].setLevel( level );
				}
			}
		};

		// Retrieve a ContextualLogger instance.  Note that named loggers automatically inherit the global logger's level,
		// default context and log handler.
		Logger.get = function ( name ) {
			// All logger instances are cached so they can be configured ahead of use.
			return contextualLoggersByNameMap[name] ||
				(contextualLoggersByNameMap[name] = new ContextualLogger( merge( { name : name }, globalLogger.context ) ));
		};

		// Configure and example a Default implementation which writes to the `window.console` (if present).
		Logger.useDefaults = function ( defaultLevel ) {
			// Check for the presence of a logger.
			if ( !console ) {
				return;
			}

			Logger.setLevel( defaultLevel || Logger.DEBUG );
			Logger.setHandler( function ( messages, context ) {
				var hdlr = console.log;

				// Prepend the logger's name to the log message for easy identification.
				if ( context.name ) {
					messages[0] = "[" + context.name + "] " + messages[0];
				}

				// Delegate through to custom warn/error loggers if present on the console.
				if ( context.level === Logger.WARN && console.warn ) {
					hdlr = console.warn;
				} else if ( context.level === Logger.ERROR && console.error ) {
					hdlr = console.error;
				} else if ( context.level === Logger.INFO && console.info ) {
					hdlr = console.info;
				}

				// Support for IE8+ (and other, slightly more sane environments)
				Function.prototype.apply.call( hdlr, console, messages );
			} );
		};

		// Export to popular environments boilerplate.
		if ( typeof define === 'function' && define.amd ) {
			define( Logger );
		}
		else if ( typeof module !== 'undefined' && module.exports ) {
			module.exports = Logger;
		}
		else {
			Logger._prevLogger = global.Logger;

			Logger.noConflict = function () {
				global.Logger = Logger._prevLogger;
				return Logger;
			};

			global.Logger = Logger;
		}
	}( this ));
}, {}], 12                                                                                                                              : [function ( require, module, exports ) {
	(function ( global ) {
		/**
		 * @license
		 * Lo-Dash 2.4.0 (Custom Build) <http://lodash.com/>
		 * Build: `lodash modern -o ./dist/lodash.js`
		 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
		 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
		 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
		 * Available under MIT license <http://lodash.com/license>
		 */
		;
		(function () {

			/** Used as a safe reference for `undefined` in pre ES5 environments */
			var undefined;

			/** Used to pool arrays and objects used internally */
			var arrayPool = [],
				objectPool = [];

			/** Used to generate unique IDs */
			var idCounter = 0;

			/** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
			var keyPrefix = +new Date + '';

			/** Used as the size when optimizations are enabled for large arrays */
			var largeArraySize = 75;

			/** Used as the max size of the `arrayPool` and `objectPool` */
			var maxPoolSize = 40;

			/** Used to detect and test whitespace */
			var whitespace = (
				// whitespace
				' \t\x0B\f\xA0\ufeff' +

				// line terminators
				'\n\r\u2028\u2029' +

				// unicode category "Zs" space separators
				'\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
				);

			/** Used to match empty string literals in compiled template source */
			var reEmptyStringLeading = /\b__p \+= '';/g,
				reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
				reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

			/**
			 * Used to match ES6 template delimiters
			 * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-literals-string-literals
			 */
			var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

			/** Used to match regexp flags from their coerced string values */
			var reFlags = /\w*$/;

			/** Used to detected named functions */
			var reFuncName = /^\s*function[ \n\r\t]+\w/;

			/** Used to match "interpolate" template delimiters */
			var reInterpolate = /<%=([\s\S]+?)%>/g;

			/** Used to match leading whitespace and zeros to be removed */
			var reLeadingSpacesAndZeros = RegExp( '^[' + whitespace + ']*0+(?=.$)' );

			/** Used to ensure capturing order of template delimiters */
			var reNoMatch = /($^)/;

			/** Used to detect functions containing a `this` reference */
			var reThis = /\bthis\b/;

			/** Used to match unescaped characters in compiled string literals */
			var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

			/** Used to assign default `context` object properties */
			var contextProps = [
				'Array', 'Boolean', 'Date', 'Function', 'Math', 'Number', 'Object',
				'RegExp', 'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN',
				'parseInt', 'setTimeout'
			];

			/** Used to make template sourceURLs easier to identify */
			var templateCounter = 0;

			/** `Object#toString` result shortcuts */
			var argsClass = '[object Arguments]',
				arrayClass = '[object Array]',
				boolClass = '[object Boolean]',
				dateClass = '[object Date]',
				funcClass = '[object Function]',
				numberClass = '[object Number]',
				objectClass = '[object Object]',
				regexpClass = '[object RegExp]',
				stringClass = '[object String]';

			/** Used to identify object classifications that `_.clone` supports */
			var cloneableClasses = {};
			cloneableClasses[funcClass] = false;
			cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
				cloneableClasses[boolClass] = cloneableClasses[dateClass] =
					cloneableClasses[numberClass] = cloneableClasses[objectClass] =
						cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

			/** Used as an internal `_.debounce` options object */
			var debounceOptions = {
				'leading'  : false,
				'maxWait'  : 0,
				'trailing' : false
			};

			/** Used as the property descriptor for `__bindData__` */
			var descriptor = {
				'configurable' : false,
				'enumerable'   : false,
				'value'        : null,
				'writable'     : false
			};

			/** Used to determine if values are of the language type Object */
			var objectTypes = {
				'boolean'   : false,
				'function'  : true,
				'object'    : true,
				'number'    : false,
				'string'    : false,
				'undefined' : false
			};

			/** Used to escape characters for inclusion in compiled string literals */
			var stringEscapes = {
				'\\'     : '\\',
				"'"      : "'",
				'\n'     : 'n',
				'\r'     : 'r',
				'\t'     : 't',
				'\u2028' : 'u2028',
				'\u2029' : 'u2029'
			};

			/** Used as a reference to the global object */
			var root = (objectTypes[typeof window] && window) || this;

			/** Detect free variable `exports` */
			var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

			/** Detect free variable `module` */
			var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

			/** Detect the popular CommonJS extension `module.exports` */
			var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

			/** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
			var freeGlobal = objectTypes[typeof global] && global;
			if ( freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) ) {
				root = freeGlobal;
			}

			/*--------------------------------------------------------------------------*/

			/**
			 * The base implementation of `_.indexOf` without support for binary searches
			 * or `fromIndex` constraints.
			 *
			 * @private
			 * @param {Array} array The array to search.
			 * @param {*} value The value to search for.
			 * @param {number} [fromIndex=0] The index to search from.
			 * @returns {number} Returns the index of the matched value or `-1`.
			 */
			function baseIndexOf( array, value, fromIndex ) {
				var index = (fromIndex || 0) - 1,
					length = array ? array.length : 0;

				while ( ++index < length ) {
					if ( array[index] === value ) {
						return index;
					}
				}
				return -1;
			}

			/**
			 * An implementation of `_.contains` for cache objects that mimics the return
			 * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
			 *
			 * @private
			 * @param {Object} cache The cache object to inspect.
			 * @param {*} value The value to search for.
			 * @returns {number} Returns `0` if `value` is found, else `-1`.
			 */
			function cacheIndexOf( cache, value ) {
				var type = typeof value;
				cache = cache.cache;

				if ( type == 'boolean' || value == null ) {
					return cache[value] ? 0 : -1;
				}
				if ( type != 'number' && type != 'string' ) {
					type = 'object';
				}
				var key = type == 'number' ? value : keyPrefix + value;
				cache = (cache = cache[type]) && cache[key];

				return type == 'object'
					? (cache && baseIndexOf( cache, value ) > -1 ? 0 : -1)
					: (cache ? 0 : -1);
			}

			/**
			 * Adds a given value to the corresponding cache object.
			 *
			 * @private
			 * @param {*} value The value to add to the cache.
			 */
			function cachePush( value ) {
				var cache = this.cache,
					type = typeof value;

				if ( type == 'boolean' || value == null ) {
					cache[value] = true;
				} else {
					if ( type != 'number' && type != 'string' ) {
						type = 'object';
					}
					var key = type == 'number' ? value : keyPrefix + value,
						typeCache = cache[type] || (cache[type] = {});

					if ( type == 'object' ) {
						(typeCache[key] || (typeCache[key] = [])).push( value );
					} else {
						typeCache[key] = true;
					}
				}
			}

			/**
			 * Used by `_.max` and `_.min` as the default callback when a given
			 * collection is a string value.
			 *
			 * @private
			 * @param {string} value The character to inspect.
			 * @returns {number} Returns the code unit of given character.
			 */
			function charAtCallback( value ) {
				return value.charCodeAt( 0 );
			}

			/**
			 * Used by `sortBy` to compare transformed `collection` elements, stable sorting
			 * them in ascending order.
			 *
			 * @private
			 * @param {Object} a The object to compare to `b`.
			 * @param {Object} b The object to compare to `a`.
			 * @returns {number} Returns the sort order indicator of `1` or `-1`.
			 */
			function compareAscending( a, b ) {
				var ac = a.criteria,
					bc = b.criteria,
					index = -1,
					length = ac.length;

				while ( ++index < length ) {
					var value = ac[index],
						other = bc[index];

					if ( value !== other ) {
						if ( value > other || typeof value == 'undefined' ) {
							return 1;
						}
						if ( value < other || typeof other == 'undefined' ) {
							return -1;
						}
					}
				}
				// Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
				// that causes it, under certain circumstances, to return the same value for
				// `a` and `b`. See https://github.com/jashkenas/underscore/pull/1247
				//
				// This also ensures a stable sort in V8 and other engines.
				// See http://code.google.com/p/v8/issues/detail?id=90
				return a.index - b.index;
			}

			/**
			 * Creates a cache object to optimize linear searches of large arrays.
			 *
			 * @private
			 * @param {Array} [array=[]] The array to search.
			 * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
			 */
			function createCache( array ) {
				var index = -1,
					length = array.length,
					first = array[0],
					mid = array[(length / 2) | 0],
					last = array[length - 1];

				if ( first && typeof first == 'object' &&
					mid && typeof mid == 'object' && last && typeof last == 'object' ) {
					return false;
				}
				var cache = getObject();
				cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

				var result = getObject();
				result.array = array;
				result.cache = cache;
				result.push = cachePush;

				while ( ++index < length ) {
					result.push( array[index] );
				}
				return result;
			}

			/**
			 * Used by `template` to escape characters for inclusion in compiled
			 * string literals.
			 *
			 * @private
			 * @param {string} match The matched character to escape.
			 * @returns {string} Returns the escaped character.
			 */
			function escapeStringChar( match ) {
				return '\\' + stringEscapes[match];
			}

			/**
			 * Gets an array from the array pool or creates a new one if the pool is empty.
			 *
			 * @private
			 * @returns {Array} The array from the pool.
			 */
			function getArray() {
				return arrayPool.pop() || [];
			}

			/**
			 * Gets an object from the object pool or creates a new one if the pool is empty.
			 *
			 * @private
			 * @returns {Object} The object from the pool.
			 */
			function getObject() {
				return objectPool.pop() || {
					'array'     : null,
					'cache'     : null,
					'criteria'  : null,
					'false'     : false,
					'index'     : 0,
					'null'      : false,
					'number'    : null,
					'object'    : null,
					'push'      : null,
					'string'    : null,
					'true'      : false,
					'undefined' : false,
					'value'     : null
				};
			}

			/**
			 * Releases the given array back to the array pool.
			 *
			 * @private
			 * @param {Array} [array] The array to release.
			 */
			function releaseArray( array ) {
				array.length = 0;
				if ( arrayPool.length < maxPoolSize ) {
					arrayPool.push( array );
				}
			}

			/**
			 * Releases the given object back to the object pool.
			 *
			 * @private
			 * @param {Object} [object] The object to release.
			 */
			function releaseObject( object ) {
				var cache = object.cache;
				if ( cache ) {
					releaseObject( cache );
				}
				object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
				if ( objectPool.length < maxPoolSize ) {
					objectPool.push( object );
				}
			}

			/**
			 * Slices the `collection` from the `start` index up to, but not including,
			 * the `end` index.
			 *
			 * Note: This function is used instead of `Array#slice` to support node lists
			 * in IE < 9 and to ensure dense arrays are returned.
			 *
			 * @private
			 * @param {Array|Object|string} collection The collection to slice.
			 * @param {number} start The start index.
			 * @param {number} end The end index.
			 * @returns {Array} Returns the new array.
			 */
			function slice( array, start, end ) {
				start || (start = 0);
				if ( typeof end == 'undefined' ) {
					end = array ? array.length : 0;
				}
				var index = -1,
					length = end - start || 0,
					result = Array( length < 0 ? 0 : length );

				while ( ++index < length ) {
					result[index] = array[start + index];
				}
				return result;
			}

			/*--------------------------------------------------------------------------*/

			/**
			 * Create a new `lodash` function using the given context object.
			 *
			 * @static
			 * @memberOf _
			 * @category Utilities
			 * @param {Object} [context=root] The context object.
			 * @returns {Function} Returns the `lodash` function.
			 */
			function runInContext( context ) {
				// Avoid issues with some ES3 environments that attempt to use values, named
				// after built-in constructors like `Object`, for the creation of literals.
				// ES5 clears this up by stating that literals must use built-in constructors.
				// See http://es5.github.io/#x11.1.5.
				context = context ? _.defaults( root.Object(), context, _.pick( root, contextProps ) ) : root;

				/** Native constructor references */
				var Array = context.Array,
					Boolean = context.Boolean,
					Date = context.Date,
					Function = context.Function,
					Math = context.Math,
					Number = context.Number,
					Object = context.Object,
					RegExp = context.RegExp,
					String = context.String,
					TypeError = context.TypeError;

				/**
				 * Used for `Array` method references.
				 *
				 * Normally `Array.prototype` would suffice, however, using an array literal
				 * avoids issues in Narwhal.
				 */
				var arrayRef = [];

				/** Used for native method references */
				var objectProto = Object.prototype;

				/** Used to restore the original `_` reference in `noConflict` */
				var oldDash = context._;

				/** Used to resolve the internal [[Class]] of values */
				var toString = objectProto.toString;

				/** Used to detect if a method is native */
				var reNative = RegExp( '^' +
						String( toString )
							.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' )
							.replace( /toString| for [^\]]+/g, '.*?' ) + '$'
				);

				/** Native method shortcuts */
				var ceil = Math.ceil,
					clearTimeout = context.clearTimeout,
					floor = Math.floor,
					fnToString = Function.prototype.toString,
					getPrototypeOf = reNative.test( getPrototypeOf = Object.getPrototypeOf ) && getPrototypeOf,
					hasOwnProperty = objectProto.hasOwnProperty,
					push = arrayRef.push,
					setTimeout = context.setTimeout,
					splice = arrayRef.splice;

				/** Used to set meta data on functions */
				var defineProperty = (function () {
					// IE 8 only accepts DOM elements
					try {
						var o = {},
							func = reNative.test( func = Object.defineProperty ) && func,
							result = func( o, o, o ) && func;
					} catch ( e ) { }
					return result;
				}());

				/* Native method shortcuts for methods with the same name as other `lodash` methods */
				var nativeCreate = reNative.test( nativeCreate = Object.create ) && nativeCreate,
					nativeIsArray = reNative.test( nativeIsArray = Array.isArray ) && nativeIsArray,
					nativeIsFinite = context.isFinite,
					nativeIsNaN = context.isNaN,
					nativeKeys = reNative.test( nativeKeys = Object.keys ) && nativeKeys,
					nativeMax = Math.max,
					nativeMin = Math.min,
					nativeParseInt = context.parseInt,
					nativeRandom = Math.random;

				/** Used to lookup a built-in constructor by [[Class]] */
				var ctorByClass = {};
				ctorByClass[arrayClass] = Array;
				ctorByClass[boolClass] = Boolean;
				ctorByClass[dateClass] = Date;
				ctorByClass[funcClass] = Function;
				ctorByClass[objectClass] = Object;
				ctorByClass[numberClass] = Number;
				ctorByClass[regexpClass] = RegExp;
				ctorByClass[stringClass] = String;

				/*--------------------------------------------------------------------------*/

				/**
				 * Creates a `lodash` object which wraps the given value to enable intuitive
				 * method chaining.
				 *
				 * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
				 * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
				 * and `unshift`
				 *
				 * Chaining is supported in custom builds as long as the `value` method is
				 * implicitly or explicitly included in the build.
				 *
				 * The chainable wrapper functions are:
				 * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
				 * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
				 * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
				 * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
				 * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
				 * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
				 * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
				 * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
				 * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
				 * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
				 * and `zip`
				 *
				 * The non-chainable wrapper functions are:
				 * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
				 * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
				 * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
				 * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
				 * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
				 * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
				 * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
				 * `template`, `unescape`, `uniqueId`, and `value`
				 *
				 * The wrapper functions `first` and `last` return wrapped values when `n` is
				 * provided, otherwise they return unwrapped values.
				 *
				 * Explicit chaining can be enabled by using the `_.chain` method.
				 *
				 * @name _
				 * @constructor
				 * @category Chaining
				 * @param {*} value The value to wrap in a `lodash` instance.
				 * @returns {Object} Returns a `lodash` instance.
				 * @example
				 *
				 * var wrapped = _([1, 2, 3]);
				 *
				 * // returns an unwrapped value
				 * wrapped.reduce(function(sum, num) {
     *   return sum + num;
     * });
				 * // => 6
				 *
				 * // returns a wrapped value
				 * var squares = wrapped.map(function(num) {
     *   return num * num;
     * });
				 *
				 * _.isArray(squares);
				 * // => false
				 *
				 * _.isArray(squares.value());
				 * // => true
				 */
				function lodash( value ) {
					// don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
					return (value && typeof value == 'object' && !isArray( value ) && hasOwnProperty.call( value, '__wrapped__' ))
						? value
						: new lodashWrapper( value );
				}

				/**
				 * A fast path for creating `lodash` wrapper objects.
				 *
				 * @private
				 * @param {*} value The value to wrap in a `lodash` instance.
				 * @param {boolean} chainAll A flag to enable chaining for all methods
				 * @returns {Object} Returns a `lodash` instance.
				 */
				function lodashWrapper( value, chainAll ) {
					this.__chain__ = !!chainAll;
					this.__wrapped__ = value;
				}

				// ensure `new lodashWrapper` is an instance of `lodash`
				lodashWrapper.prototype = lodash.prototype;

				/**
				 * An object used to flag environments features.
				 *
				 * @static
				 * @memberOf _
				 * @type Object
				 */
				var support = lodash.support = {};

				/**
				 * Detect if functions can be decompiled by `Function#toString`
				 * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
				 *
				 * @memberOf _.support
				 * @type boolean
				 */
				support.funcDecomp = !reNative.test( context.WinRTError ) && reThis.test( runInContext );

				/**
				 * Detect if `Function#name` is supported (all but IE).
				 *
				 * @memberOf _.support
				 * @type boolean
				 */
				support.funcNames = typeof Function.name == 'string';

				/**
				 * By default, the template delimiters used by Lo-Dash are similar to those in
				 * embedded Ruby (ERB). Change the following template settings to use alternative
				 * delimiters.
				 *
				 * @static
				 * @memberOf _
				 * @type Object
				 */
				lodash.templateSettings = {

					/**
					 * Used to detect `data` property values to be HTML-escaped.
					 *
					 * @memberOf _.templateSettings
					 * @type RegExp
					 */
					'escape' : /<%-([\s\S]+?)%>/g,

					/**
					 * Used to detect code to be evaluated.
					 *
					 * @memberOf _.templateSettings
					 * @type RegExp
					 */
					'evaluate' : /<%([\s\S]+?)%>/g,

					/**
					 * Used to detect `data` property values to inject.
					 *
					 * @memberOf _.templateSettings
					 * @type RegExp
					 */
					'interpolate' : reInterpolate,

					/**
					 * Used to reference the data object in the template text.
					 *
					 * @memberOf _.templateSettings
					 * @type string
					 */
					'variable' : '',

					/**
					 * Used to import variables into the compiled template.
					 *
					 * @memberOf _.templateSettings
					 * @type Object
					 */
					'imports' : {

						/**
						 * A reference to the `lodash` function.
						 *
						 * @memberOf _.templateSettings.imports
						 * @type Function
						 */
						'_' : lodash
					}
				};

				/*--------------------------------------------------------------------------*/

				/**
				 * The base implementation of `_.bind` that creates the bound function and
				 * sets its meta data.
				 *
				 * @private
				 * @param {Array} bindData The bind data array.
				 * @returns {Function} Returns the new bound function.
				 */
				function baseBind( bindData ) {
					var func = bindData[0],
						partialArgs = bindData[2],
						thisArg = bindData[4];

					function bound() {
						// `Function#bind` spec
						// http://es5.github.io/#x15.3.4.5
						if ( partialArgs ) {
							var args = partialArgs.slice();
							push.apply( args, arguments );
						}
						// mimic the constructor's `return` behavior
						// http://es5.github.io/#x13.2.2
						if ( this instanceof bound ) {
							// ensure `new bound` is an instance of `func`
							var thisBinding = baseCreate( func.prototype ),
								result = func.apply( thisBinding, args || arguments );
							return isObject( result ) ? result : thisBinding;
						}
						return func.apply( thisArg, args || arguments );
					}

					setBindData( bound, bindData );
					return bound;
				}

				/**
				 * The base implementation of `_.clone` without argument juggling or support
				 * for `thisArg` binding.
				 *
				 * @private
				 * @param {*} value The value to clone.
				 * @param {boolean} [isDeep=false] Specify a deep clone.
				 * @param {Function} [callback] The function to customize cloning values.
				 * @param {Array} [stackA=[]] Tracks traversed source objects.
				 * @param {Array} [stackB=[]] Associates clones with source counterparts.
				 * @returns {*} Returns the cloned value.
				 */
				function baseClone( value, isDeep, callback, stackA, stackB ) {
					if ( callback ) {
						var result = callback( value );
						if ( typeof result != 'undefined' ) {
							return result;
						}
					}
					// inspect [[Class]]
					var isObj = isObject( value );
					if ( isObj ) {
						var className = toString.call( value );
						if ( !cloneableClasses[className] ) {
							return value;
						}
						var ctor = ctorByClass[className];
						switch ( className ) {
							case boolClass:
							case dateClass:
								return new ctor( +value );

							case numberClass:
							case stringClass:
								return new ctor( value );

							case regexpClass:
								result = ctor( value.source, reFlags.exec( value ) );
								result.lastIndex = value.lastIndex;
								return result;
						}
					} else {
						return value;
					}
					var isArr = isArray( value );
					if ( isDeep ) {
						// check for circular references and return corresponding clone
						var initedStack = !stackA;
						stackA || (stackA = getArray());
						stackB || (stackB = getArray());

						var length = stackA.length;
						while ( length-- ) {
							if ( stackA[length] == value ) {
								return stackB[length];
							}
						}
						result = isArr ? ctor( value.length ) : {};
					}
					else {
						result = isArr ? slice( value ) : assign( {}, value );
					}
					// add array properties assigned by `RegExp#exec`
					if ( isArr ) {
						if ( hasOwnProperty.call( value, 'index' ) ) {
							result.index = value.index;
						}
						if ( hasOwnProperty.call( value, 'input' ) ) {
							result.input = value.input;
						}
					}
					// exit for shallow clone
					if ( !isDeep ) {
						return result;
					}
					// add the source value to the stack of traversed objects
					// and associate it with its clone
					stackA.push( value );
					stackB.push( result );

					// recursively populate clone (susceptible to call stack limits)
					(isArr ? forEach : forOwn)( value, function ( objValue, key ) {
						result[key] = baseClone( objValue, isDeep, callback, stackA, stackB );
					} );

					if ( initedStack ) {
						releaseArray( stackA );
						releaseArray( stackB );
					}
					return result;
				}

				/**
				 * The base implementation of `_.create` without support for assigning
				 * properties to the created object.
				 *
				 * @private
				 * @param {Object} prototype The object to inherit from.
				 * @returns {Object} Returns the new object.
				 */
				function baseCreate( prototype, properties ) {
					return isObject( prototype ) ? nativeCreate( prototype ) : {};
				}

				// fallback for browsers without `Object.create`
				if ( !nativeCreate ) {
					baseCreate = (function () {
						function Object() {}

						return function ( prototype ) {
							if ( isObject( prototype ) ) {
								Object.prototype = prototype;
								var result = new Object;
								Object.prototype = null;
							}
							return result || context.Object();
						};
					}());
				}

				/**
				 * The base implementation of `_.createCallback` without support for creating
				 * "_.pluck" or "_.where" style callbacks.
				 *
				 * @private
				 * @param {*} [func=identity] The value to convert to a callback.
				 * @param {*} [thisArg] The `this` binding of the created callback.
				 * @param {number} [argCount] The number of arguments the callback accepts.
				 * @returns {Function} Returns a callback function.
				 */
				function baseCreateCallback( func, thisArg, argCount ) {
					if ( typeof func != 'function' ) {
						return identity;
					}
					// exit early for no `thisArg` or already bound by `Function#bind`
					if ( typeof thisArg == 'undefined' || !('prototype' in func) ) {
						return func;
					}
					var bindData = func.__bindData__;
					if ( typeof bindData == 'undefined' ) {
						if ( support.funcNames ) {
							bindData = !func.name;
						}
						bindData = bindData || !support.funcDecomp;
						if ( !bindData ) {
							var source = fnToString.call( func );
							if ( !support.funcNames ) {
								bindData = !reFuncName.test( source );
							}
							if ( !bindData ) {
								// checks if `func` references the `this` keyword and stores the result
								bindData = reThis.test( source );
								setBindData( func, bindData );
							}
						}
					}
					// exit early if there are no `this` references or `func` is bound
					if ( bindData === false || (bindData !== true && bindData[1] & 1) ) {
						return func;
					}
					switch ( argCount ) {
						case 1:
							return function ( value ) {
								return func.call( thisArg, value );
							};
						case 2:
							return function ( a, b ) {
								return func.call( thisArg, a, b );
							};
						case 3:
							return function ( value, index, collection ) {
								return func.call( thisArg, value, index, collection );
							};
						case 4:
							return function ( accumulator, value, index, collection ) {
								return func.call( thisArg, accumulator, value, index, collection );
							};
					}
					return bind( func, thisArg );
				}

				/**
				 * The base implementation of `createWrapper` that creates the wrapper and
				 * sets its meta data.
				 *
				 * @private
				 * @param {Array} bindData The bind data array.
				 * @returns {Function} Returns the new function.
				 */
				function baseCreateWrapper( bindData ) {
					var func = bindData[0],
						bitmask = bindData[1],
						partialArgs = bindData[2],
						partialRightArgs = bindData[3],
						thisArg = bindData[4],
						arity = bindData[5];

					var isBind = bitmask & 1,
						isBindKey = bitmask & 2,
						isCurry = bitmask & 4,
						isCurryBound = bitmask & 8,
						key = func;

					function bound() {
						var thisBinding = isBind ? thisArg : this;
						if ( partialArgs ) {
							var args = partialArgs.slice();
							push.apply( args, arguments );
						}
						if ( partialRightArgs || isCurry ) {
							args || (args = slice( arguments ));
							if ( partialRightArgs ) {
								push.apply( args, partialRightArgs );
							}
							if ( isCurry && args.length < arity ) {
								bitmask |= 16 & ~32;
								return baseCreateWrapper( [func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity] );
							}
						}
						args || (args = arguments);
						if ( isBindKey ) {
							func = thisBinding[key];
						}
						if ( this instanceof bound ) {
							thisBinding = baseCreate( func.prototype );
							var result = func.apply( thisBinding, args );
							return isObject( result ) ? result : thisBinding;
						}
						return func.apply( thisBinding, args );
					}

					setBindData( bound, bindData );
					return bound;
				}

				/**
				 * The base implementation of `_.difference` that accepts a single array
				 * of values to exclude.
				 *
				 * @private
				 * @param {Array} array The array to process.
				 * @param {Array} [values] The array of values to exclude.
				 * @returns {Array} Returns a new array of filtered values.
				 */
				function baseDifference( array, values ) {
					var index = -1,
						indexOf = getIndexOf(),
						length = array ? array.length : 0,
						isLarge = length >= largeArraySize && indexOf === baseIndexOf,
						result = [];

					if ( isLarge ) {
						var cache = createCache( values );
						if ( cache ) {
							indexOf = cacheIndexOf;
							values = cache;
						} else {
							isLarge = false;
						}
					}
					while ( ++index < length ) {
						var value = array[index];
						if ( indexOf( values, value ) < 0 ) {
							result.push( value );
						}
					}
					if ( isLarge ) {
						releaseObject( values );
					}
					return result;
				}

				/**
				 * The base implementation of `_.flatten` without support for callback
				 * shorthands or `thisArg` binding.
				 *
				 * @private
				 * @param {Array} array The array to flatten.
				 * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
				 * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
				 * @param {number} [fromIndex=0] The index to start from.
				 * @returns {Array} Returns a new flattened array.
				 */
				function baseFlatten( array, isShallow, isStrict, fromIndex ) {
					var index = (fromIndex || 0) - 1,
						length = array ? array.length : 0,
						result = [];

					while ( ++index < length ) {
						var value = array[index];

						if ( value && typeof value == 'object' && typeof value.length == 'number'
							&& (isArray( value ) || isArguments( value )) ) {
							// recursively flatten arrays (susceptible to call stack limits)
							if ( !isShallow ) {
								value = baseFlatten( value, isShallow, isStrict );
							}
							var valIndex = -1,
								valLength = value.length,
								resIndex = result.length;

							result.length += valLength;
							while ( ++valIndex < valLength ) {
								result[resIndex++] = value[valIndex];
							}
						} else if ( !isStrict ) {
							result.push( value );
						}
					}
					return result;
				}

				/**
				 * The base implementation of `_.isEqual`, without support for `thisArg` binding,
				 * that allows partial "_.where" style comparisons.
				 *
				 * @private
				 * @param {*} a The value to compare.
				 * @param {*} b The other value to compare.
				 * @param {Function} [callback] The function to customize comparing values.
				 * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
				 * @param {Array} [stackA=[]] Tracks traversed `a` objects.
				 * @param {Array} [stackB=[]] Tracks traversed `b` objects.
				 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
				 */
				function baseIsEqual( a, b, callback, isWhere, stackA, stackB ) {
					// used to indicate that when comparing objects, `a` has at least the properties of `b`
					if ( callback ) {
						var result = callback( a, b );
						if ( typeof result != 'undefined' ) {
							return !!result;
						}
					}
					// exit early for identical values
					if ( a === b ) {
						// treat `+0` vs. `-0` as not equal
						return a !== 0 || (1 / a == 1 / b);
					}
					var type = typeof a,
						otherType = typeof b;

					// exit early for unlike primitive values
					if ( a === a && !(a && objectTypes[type]) && !(b && objectTypes[otherType]) ) {
						return false;
					}
					// exit early for `null` and `undefined` avoiding ES3's Function#call behavior
					// http://es5.github.io/#x15.3.4.4
					if ( a == null || b == null ) {
						return a === b;
					}
					// compare [[Class]] names
					var className = toString.call( a ),
						otherClass = toString.call( b );

					if ( className == argsClass ) {
						className = objectClass;
					}
					if ( otherClass == argsClass ) {
						otherClass = objectClass;
					}
					if ( className != otherClass ) {
						return false;
					}
					switch ( className ) {
						case boolClass:
						case dateClass:
							// coerce dates and booleans to numbers, dates to milliseconds and booleans
							// to `1` or `0` treating invalid dates coerced to `NaN` as not equal
							return +a == +b;

						case numberClass:
							// treat `NaN` vs. `NaN` as equal
							return (a != +a)
								? b != +b
								// but treat `+0` vs. `-0` as not equal
								: (a == 0 ? (1 / a == 1 / b) : a == +b);

						case regexpClass:
						case stringClass:
							// coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
							// treat string primitives and their corresponding object instances as equal
							return a == String( b );
					}
					var isArr = className == arrayClass;
					if ( !isArr ) {
						// unwrap any `lodash` wrapped values
						var aWrapped = hasOwnProperty.call( a, '__wrapped__' ),
							bWrapped = hasOwnProperty.call( b, '__wrapped__' );

						if ( aWrapped || bWrapped ) {
							return baseIsEqual( aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB );
						}
						// exit for functions and DOM nodes
						if ( className != objectClass ) {
							return false;
						}
						// in older versions of Opera, `arguments` objects have `Array` constructors
						var ctorA = a.constructor,
							ctorB = b.constructor;

						// non `Object` object instances with different constructors are not equal
						if ( ctorA != ctorB && !(isFunction( ctorA ) && ctorA instanceof ctorA && isFunction( ctorB ) && ctorB instanceof ctorB) &&
							('constructor' in a && 'constructor' in b)
							) {
							return false;
						}
					}
					// assume cyclic structures are equal
					// the algorithm for detecting cyclic structures is adapted from ES 5.1
					// section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
					var initedStack = !stackA;
					stackA || (stackA = getArray());
					stackB || (stackB = getArray());

					var length = stackA.length;
					while ( length-- ) {
						if ( stackA[length] == a ) {
							return stackB[length] == b;
						}
					}
					var size = 0;
					result = true;

					// add `a` and `b` to the stack of traversed objects
					stackA.push( a );
					stackB.push( b );

					// recursively compare objects and arrays (susceptible to call stack limits)
					if ( isArr ) {
						length = a.length;
						size = b.length;

						// compare lengths to determine if a deep comparison is necessary
						result = size == a.length;
						if ( !result && !isWhere ) {
							return result;
						}
						// deep compare the contents, ignoring non-numeric properties
						while ( size-- ) {
							var index = length,
								value = b[size];

							if ( isWhere ) {
								while ( index-- ) {
									if ( (result = baseIsEqual( a[index], value, callback, isWhere, stackA, stackB )) ) {
										break;
									}
								}
							} else if ( !(result = baseIsEqual( a[size], value, callback, isWhere, stackA, stackB )) ) {
								break;
							}
						}
						return result;
					}
					// deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
					// which, in this case, is more costly
					forIn( b, function ( value, key, b ) {
						if ( hasOwnProperty.call( b, key ) ) {
							// count the number of properties.
							size++;
							// deep compare each property value.
							return (result = hasOwnProperty.call( a, key ) && baseIsEqual( a[key], value, callback, isWhere, stackA, stackB ));
						}
					} );

					if ( result && !isWhere ) {
						// ensure both objects have the same number of properties
						forIn( a, function ( value, key, a ) {
							if ( hasOwnProperty.call( a, key ) ) {
								// `size` will be `-1` if `a` has more properties than `b`
								return (result = --size > -1);
							}
						} );
					}
					if ( initedStack ) {
						releaseArray( stackA );
						releaseArray( stackB );
					}
					return result;
				}

				/**
				 * The base implementation of `_.merge` without argument juggling or support
				 * for `thisArg` binding.
				 *
				 * @private
				 * @param {Object} object The destination object.
				 * @param {Object} source The source object.
				 * @param {Function} [callback] The function to customize merging properties.
				 * @param {Array} [stackA=[]] Tracks traversed source objects.
				 * @param {Array} [stackB=[]] Associates values with source counterparts.
				 */
				function baseMerge( object, source, callback, stackA, stackB ) {
					(isArray( source ) ? forEach : forOwn)( source, function ( source, key ) {
						var found,
							isArr,
							result = source,
							value = object[key];

						if ( source && ((isArr = isArray( source )) || isPlainObject( source )) ) {
							// avoid merging previously merged cyclic sources
							var stackLength = stackA.length;
							while ( stackLength-- ) {
								if ( (found = stackA[stackLength] == source) ) {
									value = stackB[stackLength];
									break;
								}
							}
							if ( !found ) {
								var isShallow;
								if ( callback ) {
									result = callback( value, source );
									if ( (isShallow = typeof result != 'undefined') ) {
										value = result;
									}
								}
								if ( !isShallow ) {
									value = isArr
										? (isArray( value ) ? value : [])
										: (isPlainObject( value ) ? value : {});
								}
								// add `source` and associated `value` to the stack of traversed objects
								stackA.push( source );
								stackB.push( value );

								// recursively merge objects and arrays (susceptible to call stack limits)
								if ( !isShallow ) {
									baseMerge( value, source, callback, stackA, stackB );
								}
							}
						}
						else {
							if ( callback ) {
								result = callback( value, source );
								if ( typeof result == 'undefined' ) {
									result = source;
								}
							}
							if ( typeof result != 'undefined' ) {
								value = result;
							}
						}
						object[key] = value;
					} );
				}

				/**
				 * The base implementation of `_.random` without argument juggling or support
				 * for returning floating-point numbers.
				 *
				 * @private
				 * @param {number} min The minimum possible value.
				 * @param {number} max The maximum possible value.
				 * @returns {number} Returns a random number.
				 */
				function baseRandom( min, max ) {
					return min + floor( nativeRandom() * (max - min + 1) );
				}

				/**
				 * The base implementation of `_.uniq` without support for callback shorthands
				 * or `thisArg` binding.
				 *
				 * @private
				 * @param {Array} array The array to process.
				 * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
				 * @param {Function} [callback] The function called per iteration.
				 * @returns {Array} Returns a duplicate-value-free array.
				 */
				function baseUniq( array, isSorted, callback ) {
					var index = -1,
						indexOf = getIndexOf(),
						length = array ? array.length : 0,
						result = [];

					var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf,
						seen = (callback || isLarge) ? getArray() : result;

					if ( isLarge ) {
						var cache = createCache( seen );
						if ( cache ) {
							indexOf = cacheIndexOf;
							seen = cache;
						} else {
							isLarge = false;
							seen = callback ? seen : (releaseArray( seen ), result);
						}
					}
					while ( ++index < length ) {
						var value = array[index],
							computed = callback ? callback( value, index, array ) : value;

						if ( isSorted
							? !index || seen[seen.length - 1] !== computed
							: indexOf( seen, computed ) < 0
							) {
							if ( callback || isLarge ) {
								seen.push( computed );
							}
							result.push( value );
						}
					}
					if ( isLarge ) {
						releaseArray( seen.array );
						releaseObject( seen );
					} else if ( callback ) {
						releaseArray( seen );
					}
					return result;
				}

				/**
				 * Creates a function that aggregates a collection, creating an object composed
				 * of keys generated from the results of running each element of the collection
				 * through a callback. The given `setter` function sets the keys and values
				 * of the composed object.
				 *
				 * @private
				 * @param {Function} setter The setter function.
				 * @returns {Function} Returns the new aggregator function.
				 */
				function createAggregator( setter ) {
					return function ( collection, callback, thisArg ) {
						var result = {};
						callback = lodash.createCallback( callback, thisArg, 3 );

						var index = -1,
							length = collection ? collection.length : 0;

						if ( typeof length == 'number' ) {
							while ( ++index < length ) {
								var value = collection[index];
								setter( result, value, callback( value, index, collection ), collection );
							}
						} else {
							forOwn( collection, function ( value, key, collection ) {
								setter( result, value, callback( value, key, collection ), collection );
							} );
						}
						return result;
					};
				}

				/**
				 * Creates a function that, when called, either curries or invokes `func`
				 * with an optional `this` binding and partially applied arguments.
				 *
				 * @private
				 * @param {Function|string} func The function or method name to reference.
				 * @param {number} bitmask The bitmask of method flags to compose.
				 *  The bitmask may be composed of the following flags:
				 *  1 - `_.bind`
				 *  2 - `_.bindKey`
				 *  4 - `_.curry`
				 *  8 - `_.curry` (bound)
				 *  16 - `_.partial`
				 *  32 - `_.partialRight`
				 * @param {Array} [partialArgs] An array of arguments to prepend to those
				 *  provided to the new function.
				 * @param {Array} [partialRightArgs] An array of arguments to append to those
				 *  provided to the new function.
				 * @param {*} [thisArg] The `this` binding of `func`.
				 * @param {number} [arity] The arity of `func`.
				 * @returns {Function} Returns the new function.
				 */
				function createWrapper( func, bitmask, partialArgs, partialRightArgs, thisArg, arity ) {
					var isBind = bitmask & 1,
						isBindKey = bitmask & 2,
						isCurry = bitmask & 4,
						isCurryBound = bitmask & 8,
						isPartial = bitmask & 16,
						isPartialRight = bitmask & 32;

					if ( !isBindKey && !isFunction( func ) ) {
						throw new TypeError;
					}
					if ( isPartial && !partialArgs.length ) {
						bitmask &= ~16;
						isPartial = partialArgs = false;
					}
					if ( isPartialRight && !partialRightArgs.length ) {
						bitmask &= ~32;
						isPartialRight = partialRightArgs = false;
					}
					var bindData = func && func.__bindData__;
					if ( bindData && bindData !== true ) {
						bindData = bindData.slice();

						// set `thisBinding` is not previously bound
						if ( isBind && !(bindData[1] & 1) ) {
							bindData[4] = thisArg;
						}
						// set if previously bound but not currently (subsequent curried functions)
						if ( !isBind && bindData[1] & 1 ) {
							bitmask |= 8;
						}
						// set curried arity if not yet set
						if ( isCurry && !(bindData[1] & 4) ) {
							bindData[5] = arity;
						}
						// append partial left arguments
						if ( isPartial ) {
							push.apply( bindData[2] || (bindData[2] = []), partialArgs );
						}
						// append partial right arguments
						if ( isPartialRight ) {
							push.apply( bindData[3] || (bindData[3] = []), partialRightArgs );
						}
						// merge flags
						bindData[1] |= bitmask;
						return createWrapper.apply( null, bindData );
					}
					// fast path for `_.bind`
					var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
					return creater( [func, bitmask, partialArgs, partialRightArgs, thisArg, arity] );
				}

				/**
				 * Used by `escape` to convert characters to HTML entities.
				 *
				 * @private
				 * @param {string} match The matched character to escape.
				 * @returns {string} Returns the escaped character.
				 */
				function escapeHtmlChar( match ) {
					return htmlEscapes[match];
				}

				/**
				 * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
				 * customized, this method returns the custom method, otherwise it returns
				 * the `baseIndexOf` function.
				 *
				 * @private
				 * @returns {Function} Returns the "indexOf" function.
				 */
				function getIndexOf() {
					var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
					return result;
				}

				/**
				 * Sets `this` binding data on a given function.
				 *
				 * @private
				 * @param {Function} func The function to set data on.
				 * @param {Array} value The data array to set.
				 */
				var setBindData = !defineProperty ? noop : function ( func, value ) {
					descriptor.value = value;
					defineProperty( func, '__bindData__', descriptor );
				};

				/**
				 * A fallback implementation of `isPlainObject` which checks if a given value
				 * is an object created by the `Object` constructor, assuming objects created
				 * by the `Object` constructor have no inherited enumerable properties and that
				 * there are no `Object.prototype` extensions.
				 *
				 * @private
				 * @param {*} value The value to check.
				 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
				 */
				function shimIsPlainObject( value ) {
					var ctor,
						result;

					// avoid non Object objects, `arguments` objects, and DOM elements
					if ( !(value && toString.call( value ) == objectClass) ||
						(ctor = value.constructor, isFunction( ctor ) && !(ctor instanceof ctor)) ) {
						return false;
					}
					// In most environments an object's own properties are iterated before
					// its inherited properties. If the last iterated property is an object's
					// own property then there are no inherited enumerable properties.
					forIn( value, function ( value, key ) {
						result = key;
					} );
					return typeof result == 'undefined' || hasOwnProperty.call( value, result );
				}

				/**
				 * Used by `unescape` to convert HTML entities to characters.
				 *
				 * @private
				 * @param {string} match The matched character to unescape.
				 * @returns {string} Returns the unescaped character.
				 */
				function unescapeHtmlChar( match ) {
					return htmlUnescapes[match];
				}

				/*--------------------------------------------------------------------------*/

				/**
				 * Checks if `value` is an `arguments` object.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {*} value The value to check.
				 * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
				 * @example
				 *
				 * (function() { return _.isArguments(arguments); })(1, 2, 3);
				 * // => true
				 *
				 * _.isArguments([1, 2, 3]);
				 * // => false
				 */
				function isArguments( value ) {
					return value && typeof value == 'object' && typeof value.length == 'number' &&
						toString.call( value ) == argsClass || false;
				}

				/**
				 * Checks if `value` is an array.
				 *
				 * @static
				 * @memberOf _
				 * @type Function
				 * @category Objects
				 * @param {*} value The value to check.
				 * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
				 * @example
				 *
				 * (function() { return _.isArray(arguments); })();
				 * // => false
				 *
				 * _.isArray([1, 2, 3]);
				 * // => true
				 */
				var isArray = nativeIsArray || function ( value ) {
					return value && typeof value == 'object' && typeof value.length == 'number' &&
						toString.call( value ) == arrayClass || false;
				};

				/**
				 * A fallback implementation of `Object.keys` which produces an array of the
				 * given object's own enumerable property names.
				 *
				 * @private
				 * @type Function
				 * @param {Object} object The object to inspect.
				 * @returns {Array} Returns an array of property names.
				 */
				var shimKeys = function ( object ) {
					var index, iterable = object, result = [];
					if ( !iterable ) return result;
					if ( !(objectTypes[typeof object]) ) return result;
					for ( index in iterable ) {
						if ( hasOwnProperty.call( iterable, index ) ) {
							result.push( index );
						}
					}
					return result
				};

				/**
				 * Creates an array composed of the own enumerable property names of an object.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {Object} object The object to inspect.
				 * @returns {Array} Returns an array of property names.
				 * @example
				 *
				 * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
				 * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
				 */
				var keys = !nativeKeys ? shimKeys : function ( object ) {
					if ( !isObject( object ) ) {
						return [];
					}
					return nativeKeys( object );
				};

				/**
				 * Used to convert characters to HTML entities:
				 *
				 * Though the `>` character is escaped for symmetry, characters like `>` and `/`
				 * don't require escaping in HTML and have no special meaning unless they're part
				 * of a tag or an unquoted attribute value.
				 * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
				 */
				var htmlEscapes = {
					'&' : '&amp;',
					'<' : '&lt;',
					'>' : '&gt;',
					'"' : '&quot;',
					"'" : '&#39;'
				};

				/** Used to convert HTML entities to characters */
				var htmlUnescapes = invert( htmlEscapes );

				/** Used to match HTML entities and HTML characters */
				var reEscapedHtml = RegExp( '(' + keys( htmlUnescapes ).join( '|' ) + ')', 'g' ),
					reUnescapedHtml = RegExp( '[' + keys( htmlEscapes ).join( '' ) + ']', 'g' );

				/*--------------------------------------------------------------------------*/

				/**
				 * Assigns own enumerable properties of source object(s) to the destination
				 * object. Subsequent sources will overwrite property assignments of previous
				 * sources. If a callback is provided it will be executed to produce the
				 * assigned values. The callback is bound to `thisArg` and invoked with two
				 * arguments; (objectValue, sourceValue).
				 *
				 * @static
				 * @memberOf _
				 * @type Function
				 * @alias extend
				 * @category Objects
				 * @param {Object} object The destination object.
				 * @param {...Object} [source] The source objects.
				 * @param {Function} [callback] The function to customize assigning values.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Object} Returns the destination object.
				 * @example
				 *
				 * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
				 * // => { 'name': 'fred', 'employer': 'slate' }
				 *
				 * var defaults = _.partialRight(_.assign, function(a, b) {
     *   return typeof a == 'undefined' ? b : a;
     * });
				 *
				 * var object = { 'name': 'barney' };
				 * defaults(object, { 'name': 'fred', 'employer': 'slate' });
				 * // => { 'name': 'barney', 'employer': 'slate' }
				 */
				var assign = function ( object, source, guard ) {
					var index, iterable = object, result = iterable;
					if ( !iterable ) return result;
					var args = arguments,
						argsIndex = 0,
						argsLength = typeof guard == 'number' ? 2 : args.length;
					if ( argsLength > 3 && typeof args[argsLength - 2] == 'function' ) {
						var callback = baseCreateCallback( args[--argsLength - 1], args[argsLength--], 2 );
					} else if ( argsLength > 2 && typeof args[argsLength - 1] == 'function' ) {
						callback = args[--argsLength];
					}
					while ( ++argsIndex < argsLength ) {
						iterable = args[argsIndex];
						if ( iterable && objectTypes[typeof iterable] ) {
							var ownIndex = -1,
								ownProps = objectTypes[typeof iterable] && keys( iterable ),
								length = ownProps ? ownProps.length : 0;

							while ( ++ownIndex < length ) {
								index = ownProps[ownIndex];
								result[index] = callback ? callback( result[index], iterable[index] ) : iterable[index];
							}
						}
					}
					return result
				};

				/**
				 * Creates a clone of `value`. If `isDeep` is `true` nested objects will also
				 * be cloned, otherwise they will be assigned by reference. If a callback
				 * is provided it will be executed to produce the cloned values. If the
				 * callback returns `undefined` cloning will be handled by the method instead.
				 * The callback is bound to `thisArg` and invoked with one argument; (value).
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {*} value The value to clone.
				 * @param {boolean} [isDeep=false] Specify a deep clone.
				 * @param {Function} [callback] The function to customize cloning values.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {*} Returns the cloned value.
				 * @example
				 *
				 * var characters = [
				 *   { 'name': 'barney', 'age': 36 },
				 *   { 'name': 'fred',   'age': 40 }
				 * ];
				 *
				 * var shallow = _.clone(characters);
				 * shallow[0] === characters[0];
				 * // => true
				 *
				 * var deep = _.clone(characters, true);
				 * deep[0] === characters[0];
				 * // => false
				 *
				 * _.mixin({
     *   'clone': _.partialRight(_.clone, function(value) {
     *     return _.isElement(value) ? value.cloneNode(false) : undefined;
     *   })
     * });
				 *
				 * var clone = _.clone(document.body);
				 * clone.childNodes.length;
				 * // => 0
				 */
				function clone( value, isDeep, callback, thisArg ) {
					// allows working with "Collections" methods without using their `index`
					// and `collection` arguments for `isDeep` and `callback`
					if ( typeof isDeep != 'boolean' && isDeep != null ) {
						thisArg = callback;
						callback = isDeep;
						isDeep = false;
					}
					return baseClone( value, isDeep, typeof callback == 'function' && baseCreateCallback( callback, thisArg, 1 ) );
				}

				/**
				 * Creates a deep clone of `value`. If a callback is provided it will be
				 * executed to produce the cloned values. If the callback returns `undefined`
				 * cloning will be handled by the method instead. The callback is bound to
				 * `thisArg` and invoked with one argument; (value).
				 *
				 * Note: This method is loosely based on the structured clone algorithm. Functions
				 * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and
				 * objects created by constructors other than `Object` are cloned to plain `Object` objects.
				 * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {*} value The value to deep clone.
				 * @param {Function} [callback] The function to customize cloning values.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {*} Returns the deep cloned value.
				 * @example
				 *
				 * var characters = [
				 *   { 'name': 'barney', 'age': 36 },
				 *   { 'name': 'fred',   'age': 40 }
				 * ];
				 *
				 * var deep = _.cloneDeep(characters);
				 * deep[0] === characters[0];
				 * // => false
				 *
				 * var view = {
     *   'label': 'docs',
     *   'node': element
     * };
				 *
				 * var clone = _.cloneDeep(view, function(value) {
     *   return _.isElement(value) ? value.cloneNode(true) : undefined;
     * });
				 *
				 * clone.node == view.node;
				 * // => false
				 */
				function cloneDeep( value, callback, thisArg ) {
					return baseClone( value, true, typeof callback == 'function' && baseCreateCallback( callback, thisArg, 1 ) );
				}

				/**
				 * Creates an object that inherits from the given `prototype` object. If a
				 * `properties` object is provided its own enumerable properties are assigned
				 * to the created object.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {Object} prototype The object to inherit from.
				 * @param {Object} [properties] The properties to assign to the object.
				 * @returns {Object} Returns the new object.
				 * @example
				 *
				 * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
				 *
				 * function Circle() {
     *   Shape.call(this);
     * }
				 *
				 * Circle.prototype = _.create(Shape.prototype, { 'constructor': Circle });
				 *
				 * var circle = new Circle;
				 * circle instanceof Circle;
				 * // => true
				 *
				 * circle instanceof Shape;
				 * // => true
				 */
				function create( prototype, properties ) {
					var result = baseCreate( prototype );
					return properties ? assign( result, properties ) : result;
				}

				/**
				 * Assigns own enumerable properties of source object(s) to the destination
				 * object for all destination properties that resolve to `undefined`. Once a
				 * property is set, additional defaults of the same property will be ignored.
				 *
				 * @static
				 * @memberOf _
				 * @type Function
				 * @category Objects
				 * @param {Object} object The destination object.
				 * @param {...Object} [source] The source objects.
				 * @param- {Object} [guard] Allows working with `_.reduce` without using its
				 *  `key` and `object` arguments as sources.
				 * @returns {Object} Returns the destination object.
				 * @example
				 *
				 * var object = { 'name': 'barney' };
				 * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
				 * // => { 'name': 'barney', 'employer': 'slate' }
				 */
				var defaults = function ( object, source, guard ) {
					var index, iterable = object, result = iterable;
					if ( !iterable ) return result;
					var args = arguments,
						argsIndex = 0,
						argsLength = typeof guard == 'number' ? 2 : args.length;
					while ( ++argsIndex < argsLength ) {
						iterable = args[argsIndex];
						if ( iterable && objectTypes[typeof iterable] ) {
							var ownIndex = -1,
								ownProps = objectTypes[typeof iterable] && keys( iterable ),
								length = ownProps ? ownProps.length : 0;

							while ( ++ownIndex < length ) {
								index = ownProps[ownIndex];
								if ( typeof result[index] == 'undefined' ) result[index] = iterable[index];
							}
						}
					}
					return result
				};

				/**
				 * This method is like `_.findIndex` except that it returns the key of the
				 * first element that passes the callback check, instead of the element itself.
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {Object} object The object to search.
				 * @param {Function|Object|string} [callback=identity] The function called per
				 *  iteration. If a property name or object is provided it will be used to
				 *  create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {string|undefined} Returns the key of the found element, else `undefined`.
				 * @example
				 *
				 * var characters = {
     *   'barney': {  'age': 36, 'blocked': false },
     *   'fred': {    'age': 40, 'blocked': true },
     *   'pebbles': { 'age': 1,  'blocked': false }
     * };
				 *
				 * _.findKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
				 * // => 'barney' (property order is not guaranteed across environments)
				 *
				 * // using "_.where" callback shorthand
				 * _.findKey(characters, { 'age': 1 });
				 * // => 'pebbles'
				 *
				 * // using "_.pluck" callback shorthand
				 * _.findKey(characters, 'blocked');
				 * // => 'fred'
				 */
				function findKey( object, callback, thisArg ) {
					var result;
					callback = lodash.createCallback( callback, thisArg, 3 );
					forOwn( object, function ( value, key, object ) {
						if ( callback( value, key, object ) ) {
							result = key;
							return false;
						}
					} );
					return result;
				}

				/**
				 * This method is like `_.findKey` except that it iterates over elements
				 * of a `collection` in the opposite order.
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {Object} object The object to search.
				 * @param {Function|Object|string} [callback=identity] The function called per
				 *  iteration. If a property name or object is provided it will be used to
				 *  create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {string|undefined} Returns the key of the found element, else `undefined`.
				 * @example
				 *
				 * var characters = {
     *   'barney': {  'age': 36, 'blocked': true },
     *   'fred': {    'age': 40, 'blocked': false },
     *   'pebbles': { 'age': 1,  'blocked': true }
     * };
				 *
				 * _.findLastKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
				 * // => returns `pebbles`, assuming `_.findKey` returns `barney`
				 *
				 * // using "_.where" callback shorthand
				 * _.findLastKey(characters, { 'age': 40 });
				 * // => 'fred'
				 *
				 * // using "_.pluck" callback shorthand
				 * _.findLastKey(characters, 'blocked');
				 * // => 'pebbles'
				 */
				function findLastKey( object, callback, thisArg ) {
					var result;
					callback = lodash.createCallback( callback, thisArg, 3 );
					forOwnRight( object, function ( value, key, object ) {
						if ( callback( value, key, object ) ) {
							result = key;
							return false;
						}
					} );
					return result;
				}

				/**
				 * Iterates over own and inherited enumerable properties of an object,
				 * executing the callback for each property. The callback is bound to `thisArg`
				 * and invoked with three arguments; (value, key, object). Callbacks may exit
				 * iteration early by explicitly returning `false`.
				 *
				 * @static
				 * @memberOf _
				 * @type Function
				 * @category Objects
				 * @param {Object} object The object to iterate over.
				 * @param {Function} [callback=identity] The function called per iteration.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Object} Returns `object`.
				 * @example
				 *
				 * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
				 *
				 * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
				 *
				 * _.forIn(new Shape, function(value, key) {
     *   console.log(key);
     * });
				 * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
				 */
				var forIn = function ( collection, callback, thisArg ) {
					var index, iterable = collection, result = iterable;
					if ( !iterable ) return result;
					if ( !objectTypes[typeof iterable] ) return result;
					callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback( callback, thisArg, 3 );
					for ( index in iterable ) {
						if ( callback( iterable[index], index, collection ) === false ) return result;
					}
					return result
				};

				/**
				 * This method is like `_.forIn` except that it iterates over elements
				 * of a `collection` in the opposite order.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {Object} object The object to iterate over.
				 * @param {Function} [callback=identity] The function called per iteration.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Object} Returns `object`.
				 * @example
				 *
				 * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
				 *
				 * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
				 *
				 * _.forInRight(new Shape, function(value, key) {
     *   console.log(key);
     * });
				 * // => logs 'move', 'y', and 'x' assuming `_.forIn ` logs 'x', 'y', and 'move'
				 */
				function forInRight( object, callback, thisArg ) {
					var pairs = [];

					forIn( object, function ( value, key ) {
						pairs.push( key, value );
					} );

					var length = pairs.length;
					callback = baseCreateCallback( callback, thisArg, 3 );
					while ( length-- ) {
						if ( callback( pairs[length--], pairs[length], object ) === false ) {
							break;
						}
					}
					return object;
				}

				/**
				 * Iterates over own enumerable properties of an object, executing the callback
				 * for each property. The callback is bound to `thisArg` and invoked with three
				 * arguments; (value, key, object). Callbacks may exit iteration early by
				 * explicitly returning `false`.
				 *
				 * @static
				 * @memberOf _
				 * @type Function
				 * @category Objects
				 * @param {Object} object The object to iterate over.
				 * @param {Function} [callback=identity] The function called per iteration.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Object} Returns `object`.
				 * @example
				 *
				 * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
				 * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
				 */
				var forOwn = function ( collection, callback, thisArg ) {
					var index, iterable = collection, result = iterable;
					if ( !iterable ) return result;
					if ( !objectTypes[typeof iterable] ) return result;
					callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback( callback, thisArg, 3 );
					var ownIndex = -1,
						ownProps = objectTypes[typeof iterable] && keys( iterable ),
						length = ownProps ? ownProps.length : 0;

					while ( ++ownIndex < length ) {
						index = ownProps[ownIndex];
						if ( callback( iterable[index], index, collection ) === false ) return result;
					}
					return result
				};

				/**
				 * This method is like `_.forOwn` except that it iterates over elements
				 * of a `collection` in the opposite order.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {Object} object The object to iterate over.
				 * @param {Function} [callback=identity] The function called per iteration.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Object} Returns `object`.
				 * @example
				 *
				 * _.forOwnRight({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
				 * // => logs 'length', '1', and '0' assuming `_.forOwn` logs '0', '1', and 'length'
				 */
				function forOwnRight( object, callback, thisArg ) {
					var props = keys( object ),
						length = props.length;

					callback = baseCreateCallback( callback, thisArg, 3 );
					while ( length-- ) {
						var key = props[length];
						if ( callback( object[key], key, object ) === false ) {
							break;
						}
					}
					return object;
				}

				/**
				 * Creates a sorted array of property names of all enumerable properties,
				 * own and inherited, of `object` that have function values.
				 *
				 * @static
				 * @memberOf _
				 * @alias methods
				 * @category Objects
				 * @param {Object} object The object to inspect.
				 * @returns {Array} Returns an array of property names that have function values.
				 * @example
				 *
				 * _.functions(_);
				 * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
				 */
				function functions( object ) {
					var result = [];
					forIn( object, function ( value, key ) {
						if ( isFunction( value ) ) {
							result.push( key );
						}
					} );
					return result.sort();
				}

				/**
				 * Checks if the specified property name exists as a direct property of `object`,
				 * instead of an inherited property.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {Object} object The object to inspect.
				 * @param {string} key The name of the property to check.
				 * @returns {boolean} Returns `true` if key is a direct property, else `false`.
				 * @example
				 *
				 * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');
				 * // => true
				 */
				function has( object, key ) {
					return object ? hasOwnProperty.call( object, key ) : false;
				}

				/**
				 * Creates an object composed of the inverted keys and values of the given object.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {Object} object The object to invert.
				 * @returns {Object} Returns the created inverted object.
				 * @example
				 *
				 * _.invert({ 'first': 'fred', 'second': 'barney' });
				 * // => { 'fred': 'first', 'barney': 'second' }
				 */
				function invert( object ) {
					var index = -1,
						props = keys( object ),
						length = props.length,
						result = {};

					while ( ++index < length ) {
						var key = props[index];
						result[object[key]] = key;
					}
					return result;
				}

				/**
				 * Checks if `value` is a boolean value.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {*} value The value to check.
				 * @returns {boolean} Returns `true` if the `value` is a boolean value, else `false`.
				 * @example
				 *
				 * _.isBoolean(null);
				 * // => false
				 */
				function isBoolean( value ) {
					return value === true || value === false ||
						value && typeof value == 'object' && toString.call( value ) == boolClass || false;
				}

				/**
				 * Checks if `value` is a date.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {*} value The value to check.
				 * @returns {boolean} Returns `true` if the `value` is a date, else `false`.
				 * @example
				 *
				 * _.isDate(new Date);
				 * // => true
				 */
				function isDate( value ) {
					return value && typeof value == 'object' && toString.call( value ) == dateClass || false;
				}

				/**
				 * Checks if `value` is a DOM element.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {*} value The value to check.
				 * @returns {boolean} Returns `true` if the `value` is a DOM element, else `false`.
				 * @example
				 *
				 * _.isElement(document.body);
				 * // => true
				 */
				function isElement( value ) {
					return value && value.nodeType === 1 || false;
				}

				/**
				 * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
				 * length of `0` and objects with no own enumerable properties are considered
				 * "empty".
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {Array|Object|string} value The value to inspect.
				 * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
				 * @example
				 *
				 * _.isEmpty([1, 2, 3]);
				 * // => false
				 *
				 * _.isEmpty({});
				 * // => true
				 *
				 * _.isEmpty('');
				 * // => true
				 */
				function isEmpty( value ) {
					var result = true;
					if ( !value ) {
						return result;
					}
					var className = toString.call( value ),
						length = value.length;

					if ( (className == arrayClass || className == stringClass || className == argsClass ) ||
						(className == objectClass && typeof length == 'number' && isFunction( value.splice )) ) {
						return !length;
					}
					forOwn( value, function () {
						return (result = false);
					} );
					return result;
				}

				/**
				 * Performs a deep comparison between two values to determine if they are
				 * equivalent to each other. If a callback is provided it will be executed
				 * to compare values. If the callback returns `undefined` comparisons will
				 * be handled by the method instead. The callback is bound to `thisArg` and
				 * invoked with two arguments; (a, b).
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {*} a The value to compare.
				 * @param {*} b The other value to compare.
				 * @param {Function} [callback] The function to customize comparing values.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
				 * @example
				 *
				 * var object = { 'name': 'fred' };
				 * var copy = { 'name': 'fred' };
				 *
				 * object == copy;
				 * // => false
				 *
				 * _.isEqual(object, copy);
				 * // => true
				 *
				 * var words = ['hello', 'goodbye'];
				 * var otherWords = ['hi', 'goodbye'];
				 *
				 * _.isEqual(words, otherWords, function(a, b) {
     *   var reGreet = /^(?:hello|hi)$/i,
     *       aGreet = _.isString(a) && reGreet.test(a),
     *       bGreet = _.isString(b) && reGreet.test(b);
     *
     *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
     * });
				 * // => true
				 */
				function isEqual( a, b, callback, thisArg ) {
					return baseIsEqual( a, b, typeof callback == 'function' && baseCreateCallback( callback, thisArg, 2 ) );
				}

				/**
				 * Checks if `value` is, or can be coerced to, a finite number.
				 *
				 * Note: This is not the same as native `isFinite` which will return true for
				 * booleans and empty strings. See http://es5.github.io/#x15.1.2.5.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {*} value The value to check.
				 * @returns {boolean} Returns `true` if the `value` is finite, else `false`.
				 * @example
				 *
				 * _.isFinite(-101);
				 * // => true
				 *
				 * _.isFinite('10');
				 * // => true
				 *
				 * _.isFinite(true);
				 * // => false
				 *
				 * _.isFinite('');
				 * // => false
				 *
				 * _.isFinite(Infinity);
				 * // => false
				 */
				function isFinite( value ) {
					return nativeIsFinite( value ) && !nativeIsNaN( parseFloat( value ) );
				}

				/**
				 * Checks if `value` is a function.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {*} value The value to check.
				 * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
				 * @example
				 *
				 * _.isFunction(_);
				 * // => true
				 */
				function isFunction( value ) {
					return typeof value == 'function';
				}

				/**
				 * Checks if `value` is the language type of Object.
				 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {*} value The value to check.
				 * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
				 * @example
				 *
				 * _.isObject({});
				 * // => true
				 *
				 * _.isObject([1, 2, 3]);
				 * // => true
				 *
				 * _.isObject(1);
				 * // => false
				 */
				function isObject( value ) {
					// check if the value is the ECMAScript language type of Object
					// http://es5.github.io/#x8
					// and avoid a V8 bug
					// http://code.google.com/p/v8/issues/detail?id=2291
					return !!(value && objectTypes[typeof value]);
				}

				/**
				 * Checks if `value` is `NaN`.
				 *
				 * Note: This is not the same as native `isNaN` which will return `true` for
				 * `undefined` and other non-numeric values. See http://es5.github.io/#x15.1.2.4.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {*} value The value to check.
				 * @returns {boolean} Returns `true` if the `value` is `NaN`, else `false`.
				 * @example
				 *
				 * _.isNaN(NaN);
				 * // => true
				 *
				 * _.isNaN(new Number(NaN));
				 * // => true
				 *
				 * isNaN(undefined);
				 * // => true
				 *
				 * _.isNaN(undefined);
				 * // => false
				 */
				function isNaN( value ) {
					// `NaN` as a primitive is the only value that is not equal to itself
					// (perform the [[Class]] check first to avoid errors with some host objects in IE)
					return isNumber( value ) && value != +value;
				}

				/**
				 * Checks if `value` is `null`.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {*} value The value to check.
				 * @returns {boolean} Returns `true` if the `value` is `null`, else `false`.
				 * @example
				 *
				 * _.isNull(null);
				 * // => true
				 *
				 * _.isNull(undefined);
				 * // => false
				 */
				function isNull( value ) {
					return value === null;
				}

				/**
				 * Checks if `value` is a number.
				 *
				 * Note: `NaN` is considered a number. See http://es5.github.io/#x8.5.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {*} value The value to check.
				 * @returns {boolean} Returns `true` if the `value` is a number, else `false`.
				 * @example
				 *
				 * _.isNumber(8.4 * 5);
				 * // => true
				 */
				function isNumber( value ) {
					return typeof value == 'number' ||
						value && typeof value == 'object' && toString.call( value ) == numberClass || false;
				}

				/**
				 * Checks if `value` is an object created by the `Object` constructor.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {*} value The value to check.
				 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
				 * @example
				 *
				 * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
				 *
				 * _.isPlainObject(new Shape);
				 * // => false
				 *
				 * _.isPlainObject([1, 2, 3]);
				 * // => false
				 *
				 * _.isPlainObject({ 'x': 0, 'y': 0 });
				 * // => true
				 */
				var isPlainObject = function ( value ) {
					if ( !(value && toString.call( value ) == objectClass) ) {
						return false;
					}
					var valueOf = value.valueOf,
						objProto = typeof valueOf == 'function' && (objProto = getPrototypeOf( valueOf )) && getPrototypeOf( objProto );

					return objProto
						? (value == objProto || getPrototypeOf( value ) == objProto)
						: shimIsPlainObject( value );
				};

				/**
				 * Checks if `value` is a regular expression.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {*} value The value to check.
				 * @returns {boolean} Returns `true` if the `value` is a regular expression, else `false`.
				 * @example
				 *
				 * _.isRegExp(/fred/);
				 * // => true
				 */
				function isRegExp( value ) {
					return value && typeof value == 'object' && toString.call( value ) == regexpClass || false;
				}

				/**
				 * Checks if `value` is a string.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {*} value The value to check.
				 * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
				 * @example
				 *
				 * _.isString('fred');
				 * // => true
				 */
				function isString( value ) {
					return typeof value == 'string' ||
						value && typeof value == 'object' && toString.call( value ) == stringClass || false;
				}

				/**
				 * Checks if `value` is `undefined`.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {*} value The value to check.
				 * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.
				 * @example
				 *
				 * _.isUndefined(void 0);
				 * // => true
				 */
				function isUndefined( value ) {
					return typeof value == 'undefined';
				}

				/**
				 * Creates an object with the same keys as `object` and values generated by
				 * running each own enumerable property of `object` through the callback.
				 * The callback is bound to `thisArg` and invoked with three arguments;
				 * (value, key, object).
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {Object} object The object to iterate over.
				 * @param {Function|Object|string} [callback=identity] The function called
				 *  per iteration. If a property name or object is provided it will be used
				 *  to create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Array} Returns a new object with values of the results of each `callback` execution.
				 * @example
				 *
				 * _.mapValues({ 'a': 1, 'b': 2, 'c': 3} , function(num) { return num * 3; });
				 * // => { 'a': 3, 'b': 6, 'c': 9 }
				 *
				 * var characters = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
				 *
				 * // using "_.pluck" callback shorthand
				 * _.mapValues(characters, 'age');
				 * // => { 'fred': 40, 'pebbles': 1 }
				 */
				function mapValues( object, callback, thisArg ) {
					var result = {};
					callback = lodash.createCallback( callback, thisArg, 3 );

					forOwn( object, function ( value, key, object ) {
						result[key] = callback( value, key, object );
					} );
					return result;
				}

				/**
				 * Recursively merges own enumerable properties of the source object(s), that
				 * don't resolve to `undefined` into the destination object. Subsequent sources
				 * will overwrite property assignments of previous sources. If a callback is
				 * provided it will be executed to produce the merged values of the destination
				 * and source properties. If the callback returns `undefined` merging will
				 * be handled by the method instead. The callback is bound to `thisArg` and
				 * invoked with two arguments; (objectValue, sourceValue).
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {Object} object The destination object.
				 * @param {...Object} [source] The source objects.
				 * @param {Function} [callback] The function to customize merging properties.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Object} Returns the destination object.
				 * @example
				 *
				 * var names = {
     *   'characters': [
     *     { 'name': 'barney' },
     *     { 'name': 'fred' }
     *   ]
     * };
				 *
				 * var ages = {
     *   'characters': [
     *     { 'age': 36 },
     *     { 'age': 40 }
     *   ]
     * };
				 *
				 * _.merge(names, ages);
				 * // => { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
				 *
				 * var food = {
     *   'fruits': ['apple'],
     *   'vegetables': ['beet']
     * };
				 *
				 * var otherFood = {
     *   'fruits': ['banana'],
     *   'vegetables': ['carrot']
     * };
				 *
				 * _.merge(food, otherFood, function(a, b) {
     *   return _.isArray(a) ? a.concat(b) : undefined;
     * });
				 * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }
				 */
				function merge( object ) {
					var args = arguments,
						length = 2;

					if ( !isObject( object ) ) {
						return object;
					}
					// allows working with `_.reduce` and `_.reduceRight` without using
					// their `index` and `collection` arguments
					if ( typeof args[2] != 'number' ) {
						length = args.length;
					}
					if ( length > 3 && typeof args[length - 2] == 'function' ) {
						var callback = baseCreateCallback( args[--length - 1], args[length--], 2 );
					} else if ( length > 2 && typeof args[length - 1] == 'function' ) {
						callback = args[--length];
					}
					var sources = slice( arguments, 1, length ),
						index = -1,
						stackA = getArray(),
						stackB = getArray();

					while ( ++index < length ) {
						baseMerge( object, sources[index], callback, stackA, stackB );
					}
					releaseArray( stackA );
					releaseArray( stackB );
					return object;
				}

				/**
				 * Creates a shallow clone of `object` excluding the specified properties.
				 * Property names may be specified as individual arguments or as arrays of
				 * property names. If a callback is provided it will be executed for each
				 * property of `object` omitting the properties the callback returns truey
				 * for. The callback is bound to `thisArg` and invoked with three arguments;
				 * (value, key, object).
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {Object} object The source object.
				 * @param {Function|...string|string[]} [callback] The properties to omit or the
				 *  function called per iteration.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Object} Returns an object without the omitted properties.
				 * @example
				 *
				 * _.omit({ 'name': 'fred', 'age': 40 }, 'age');
				 * // => { 'name': 'fred' }
				 *
				 * _.omit({ 'name': 'fred', 'age': 40 }, function(value) {
     *   return typeof value == 'number';
     * });
				 * // => { 'name': 'fred' }
				 */
				function omit( object, callback, thisArg ) {
					var result = {};
					if ( typeof callback != 'function' ) {
						var props = [];
						forIn( object, function ( value, key ) {
							props.push( key );
						} );
						props = baseDifference( props, baseFlatten( arguments, true, false, 1 ) );

						var index = -1,
							length = props.length;

						while ( ++index < length ) {
							var key = props[index];
							result[key] = object[key];
						}
					} else {
						callback = lodash.createCallback( callback, thisArg, 3 );
						forIn( object, function ( value, key, object ) {
							if ( !callback( value, key, object ) ) {
								result[key] = value;
							}
						} );
					}
					return result;
				}

				/**
				 * Creates a two dimensional array of an object's key-value pairs,
				 * i.e. `[[key1, value1], [key2, value2]]`.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {Object} object The object to inspect.
				 * @returns {Array} Returns new array of key-value pairs.
				 * @example
				 *
				 * _.pairs({ 'barney': 36, 'fred': 40 });
				 * // => [['barney', 36], ['fred', 40]] (property order is not guaranteed across environments)
				 */
				function pairs( object ) {
					var index = -1,
						props = keys( object ),
						length = props.length,
						result = Array( length );

					while ( ++index < length ) {
						var key = props[index];
						result[index] = [key, object[key]];
					}
					return result;
				}

				/**
				 * Creates a shallow clone of `object` composed of the specified properties.
				 * Property names may be specified as individual arguments or as arrays of
				 * property names. If a callback is provided it will be executed for each
				 * property of `object` picking the properties the callback returns truey
				 * for. The callback is bound to `thisArg` and invoked with three arguments;
				 * (value, key, object).
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {Object} object The source object.
				 * @param {Function|...string|string[]} [callback] The function called per
				 *  iteration or property names to pick, specified as individual property
				 *  names or arrays of property names.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Object} Returns an object composed of the picked properties.
				 * @example
				 *
				 * _.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');
				 * // => { 'name': 'fred' }
				 *
				 * _.pick({ 'name': 'fred', '_userid': 'fred1' }, function(value, key) {
     *   return key.charAt(0) != '_';
     * });
				 * // => { 'name': 'fred' }
				 */
				function pick( object, callback, thisArg ) {
					var result = {};
					if ( typeof callback != 'function' ) {
						var index = -1,
							props = baseFlatten( arguments, true, false, 1 ),
							length = isObject( object ) ? props.length : 0;

						while ( ++index < length ) {
							var key = props[index];
							if ( key in object ) {
								result[key] = object[key];
							}
						}
					} else {
						callback = lodash.createCallback( callback, thisArg, 3 );
						forIn( object, function ( value, key, object ) {
							if ( callback( value, key, object ) ) {
								result[key] = value;
							}
						} );
					}
					return result;
				}

				/**
				 * An alternative to `_.reduce` this method transforms `object` to a new
				 * `accumulator` object which is the result of running each of its own
				 * enumerable properties through a callback, with each callback execution
				 * potentially mutating the `accumulator` object. The callback is bound to
				 * `thisArg` and invoked with four arguments; (accumulator, value, key, object).
				 * Callbacks may exit iteration early by explicitly returning `false`.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {Array|Object} object The object to iterate over.
				 * @param {Function} [callback=identity] The function called per iteration.
				 * @param {*} [accumulator] The custom accumulator value.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {*} Returns the accumulated value.
				 * @example
				 *
				 * var squares = _.transform([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(result, num) {
     *   num *= num;
     *   if (num % 2) {
     *     return result.push(num) < 3;
     *   }
     * });
				 * // => [1, 9, 25]
				 *
				 * var mapped = _.transform({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     * });
				 * // => { 'a': 3, 'b': 6, 'c': 9 }
				 */
				function transform( object, callback, accumulator, thisArg ) {
					var isArr = isArray( object );
					if ( accumulator == null ) {
						if ( isArr ) {
							accumulator = [];
						} else {
							var ctor = object && object.constructor,
								proto = ctor && ctor.prototype;

							accumulator = baseCreate( proto );
						}
					}
					if ( callback ) {
						callback = lodash.createCallback( callback, thisArg, 4 );
						(isArr ? forEach : forOwn)( object, function ( value, index, object ) {
							return callback( accumulator, value, index, object );
						} );
					}
					return accumulator;
				}

				/**
				 * Creates an array composed of the own enumerable property values of `object`.
				 *
				 * @static
				 * @memberOf _
				 * @category Objects
				 * @param {Object} object The object to inspect.
				 * @returns {Array} Returns an array of property values.
				 * @example
				 *
				 * _.values({ 'one': 1, 'two': 2, 'three': 3 });
				 * // => [1, 2, 3] (property order is not guaranteed across environments)
				 */
				function values( object ) {
					var index = -1,
						props = keys( object ),
						length = props.length,
						result = Array( length );

					while ( ++index < length ) {
						result[index] = object[props[index]];
					}
					return result;
				}

				/*--------------------------------------------------------------------------*/

				/**
				 * Creates an array of elements from the specified indexes, or keys, of the
				 * `collection`. Indexes may be specified as individual arguments or as arrays
				 * of indexes.
				 *
				 * @static
				 * @memberOf _
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {...(number|number[]|string|string[])} [index] The indexes of `collection`
				 *   to retrieve, specified as individual indexes or arrays of indexes.
				 * @returns {Array} Returns a new array of elements corresponding to the
				 *  provided indexes.
				 * @example
				 *
				 * _.at(['a', 'b', 'c', 'd', 'e'], [0, 2, 4]);
				 * // => ['a', 'c', 'e']
				 *
				 * _.at(['fred', 'barney', 'pebbles'], 0, 2);
				 * // => ['fred', 'pebbles']
				 */
				function at( collection ) {
					var args = arguments,
						index = -1,
						props = baseFlatten( args, true, false, 1 ),
						length = (args[2] && args[2][args[1]] === collection) ? 1 : props.length,
						result = Array( length );

					while ( ++index < length ) {
						result[index] = collection[props[index]];
					}
					return result;
				}

				/**
				 * Checks if a given value is present in a collection using strict equality
				 * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
				 * offset from the end of the collection.
				 *
				 * @static
				 * @memberOf _
				 * @alias include
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {*} target The value to check for.
				 * @param {number} [fromIndex=0] The index to search from.
				 * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
				 * @example
				 *
				 * _.contains([1, 2, 3], 1);
				 * // => true
				 *
				 * _.contains([1, 2, 3], 1, 2);
				 * // => false
				 *
				 * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
				 * // => true
				 *
				 * _.contains('pebbles', 'eb');
				 * // => true
				 */
				function contains( collection, target, fromIndex ) {
					var index = -1,
						indexOf = getIndexOf(),
						length = collection ? collection.length : 0,
						result = false;

					fromIndex = (fromIndex < 0 ? nativeMax( 0, length + fromIndex ) : fromIndex) || 0;
					if ( isArray( collection ) ) {
						result = indexOf( collection, target, fromIndex ) > -1;
					} else if ( typeof length == 'number' ) {
						result = (isString( collection ) ? collection.indexOf( target, fromIndex ) : indexOf( collection, target, fromIndex )) > -1;
					} else {
						forOwn( collection, function ( value ) {
							if ( ++index >= fromIndex ) {
								return !(result = value === target);
							}
						} );
					}
					return result;
				}

				/**
				 * Creates an object composed of keys generated from the results of running
				 * each element of `collection` through the callback. The corresponding value
				 * of each key is the number of times the key was returned by the callback.
				 * The callback is bound to `thisArg` and invoked with three arguments;
				 * (value, index|key, collection).
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {Function|Object|string} [callback=identity] The function called
				 *  per iteration. If a property name or object is provided it will be used
				 *  to create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Object} Returns the composed aggregate object.
				 * @example
				 *
				 * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });
				 * // => { '4': 1, '6': 2 }
				 *
				 * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
				 * // => { '4': 1, '6': 2 }
				 *
				 * _.countBy(['one', 'two', 'three'], 'length');
				 * // => { '3': 2, '5': 1 }
				 */
				var countBy = createAggregator( function ( result, value, key ) {
					(hasOwnProperty.call( result, key ) ? result[key]++ : result[key] = 1);
				} );

				/**
				 * Checks if the given callback returns truey value for **all** elements of
				 * a collection. The callback is bound to `thisArg` and invoked with three
				 * arguments; (value, index|key, collection).
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @alias all
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {Function|Object|string} [callback=identity] The function called
				 *  per iteration. If a property name or object is provided it will be used
				 *  to create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {boolean} Returns `true` if all elements passed the callback check,
				 *  else `false`.
				 * @example
				 *
				 * _.every([true, 1, null, 'yes']);
				 * // => false
				 *
				 * var characters = [
				 *   { 'name': 'barney', 'age': 36 },
				 *   { 'name': 'fred',   'age': 40 }
				 * ];
				 *
				 * // using "_.pluck" callback shorthand
				 * _.every(characters, 'age');
				 * // => true
				 *
				 * // using "_.where" callback shorthand
				 * _.every(characters, { 'age': 36 });
				 * // => false
				 */
				function every( collection, callback, thisArg ) {
					var result = true;
					callback = lodash.createCallback( callback, thisArg, 3 );

					var index = -1,
						length = collection ? collection.length : 0;

					if ( typeof length == 'number' ) {
						while ( ++index < length ) {
							if ( !(result = !!callback( collection[index], index, collection )) ) {
								break;
							}
						}
					} else {
						forOwn( collection, function ( value, index, collection ) {
							return (result = !!callback( value, index, collection ));
						} );
					}
					return result;
				}

				/**
				 * Iterates over elements of a collection, returning an array of all elements
				 * the callback returns truey for. The callback is bound to `thisArg` and
				 * invoked with three arguments; (value, index|key, collection).
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @alias select
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {Function|Object|string} [callback=identity] The function called
				 *  per iteration. If a property name or object is provided it will be used
				 *  to create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Array} Returns a new array of elements that passed the callback check.
				 * @example
				 *
				 * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
				 * // => [2, 4, 6]
				 *
				 * var characters = [
				 *   { 'name': 'barney', 'age': 36, 'blocked': false },
				 *   { 'name': 'fred',   'age': 40, 'blocked': true }
				 * ];
				 *
				 * // using "_.pluck" callback shorthand
				 * _.filter(characters, 'blocked');
				 * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
				 *
				 * // using "_.where" callback shorthand
				 * _.filter(characters, { 'age': 36 });
				 * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
				 */
				function filter( collection, callback, thisArg ) {
					var result = [];
					callback = lodash.createCallback( callback, thisArg, 3 );

					var index = -1,
						length = collection ? collection.length : 0;

					if ( typeof length == 'number' ) {
						while ( ++index < length ) {
							var value = collection[index];
							if ( callback( value, index, collection ) ) {
								result.push( value );
							}
						}
					} else {
						forOwn( collection, function ( value, index, collection ) {
							if ( callback( value, index, collection ) ) {
								result.push( value );
							}
						} );
					}
					return result;
				}

				/**
				 * Iterates over elements of a collection, returning the first element that
				 * the callback returns truey for. The callback is bound to `thisArg` and
				 * invoked with three arguments; (value, index|key, collection).
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @alias detect, findWhere
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {Function|Object|string} [callback=identity] The function called
				 *  per iteration. If a property name or object is provided it will be used
				 *  to create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {*} Returns the found element, else `undefined`.
				 * @example
				 *
				 * var characters = [
				 *   { 'name': 'barney',  'age': 36, 'blocked': false },
				 *   { 'name': 'fred',    'age': 40, 'blocked': true },
				 *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
				 * ];
				 *
				 * _.find(characters, function(chr) {
     *   return chr.age < 40;
     * });
				 * // => { 'name': 'barney', 'age': 36, 'blocked': false }
				 *
				 * // using "_.where" callback shorthand
				 * _.find(characters, { 'age': 1 });
				 * // =>  { 'name': 'pebbles', 'age': 1, 'blocked': false }
				 *
				 * // using "_.pluck" callback shorthand
				 * _.find(characters, 'blocked');
				 * // => { 'name': 'fred', 'age': 40, 'blocked': true }
				 */
				function find( collection, callback, thisArg ) {
					callback = lodash.createCallback( callback, thisArg, 3 );

					var index = -1,
						length = collection ? collection.length : 0;

					if ( typeof length == 'number' ) {
						while ( ++index < length ) {
							var value = collection[index];
							if ( callback( value, index, collection ) ) {
								return value;
							}
						}
					} else {
						var result;
						forOwn( collection, function ( value, index, collection ) {
							if ( callback( value, index, collection ) ) {
								result = value;
								return false;
							}
						} );
						return result;
					}
				}

				/**
				 * This method is like `_.find` except that it iterates over elements
				 * of a `collection` from right to left.
				 *
				 * @static
				 * @memberOf _
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {Function|Object|string} [callback=identity] The function called
				 *  per iteration. If a property name or object is provided it will be used
				 *  to create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {*} Returns the found element, else `undefined`.
				 * @example
				 *
				 * _.findLast([1, 2, 3, 4], function(num) {
     *   return num % 2 == 1;
     * });
				 * // => 3
				 */
				function findLast( collection, callback, thisArg ) {
					var result;
					callback = lodash.createCallback( callback, thisArg, 3 );
					forEachRight( collection, function ( value, index, collection ) {
						if ( callback( value, index, collection ) ) {
							result = value;
							return false;
						}
					} );
					return result;
				}

				/**
				 * Iterates over elements of a collection, executing the callback for each
				 * element. The callback is bound to `thisArg` and invoked with three arguments;
				 * (value, index|key, collection). Callbacks may exit iteration early by
				 * explicitly returning `false`.
				 *
				 * Note: As with other "Collections" methods, objects with a `length` property
				 * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
				 * may be used for object iteration.
				 *
				 * @static
				 * @memberOf _
				 * @alias each
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {Function} [callback=identity] The function called per iteration.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Array|Object|string} Returns `collection`.
				 * @example
				 *
				 * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
				 * // => logs each number and returns '1,2,3'
				 *
				 * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
				 * // => logs each number and returns the object (property order is not guaranteed across environments)
				 */
				function forEach( collection, callback, thisArg ) {
					var index = -1,
						length = collection ? collection.length : 0;

					callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback( callback, thisArg, 3 );
					if ( typeof length == 'number' ) {
						while ( ++index < length ) {
							if ( callback( collection[index], index, collection ) === false ) {
								break;
							}
						}
					} else {
						forOwn( collection, callback );
					}
					return collection;
				}

				/**
				 * This method is like `_.forEach` except that it iterates over elements
				 * of a `collection` from right to left.
				 *
				 * @static
				 * @memberOf _
				 * @alias eachRight
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {Function} [callback=identity] The function called per iteration.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Array|Object|string} Returns `collection`.
				 * @example
				 *
				 * _([1, 2, 3]).forEachRight(function(num) { console.log(num); }).join(',');
				 * // => logs each number from right to left and returns '3,2,1'
				 */
				function forEachRight( collection, callback, thisArg ) {
					var length = collection ? collection.length : 0;
					callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback( callback, thisArg, 3 );
					if ( typeof length == 'number' ) {
						while ( length-- ) {
							if ( callback( collection[length], length, collection ) === false ) {
								break;
							}
						}
					} else {
						var props = keys( collection );
						length = props.length;
						forOwn( collection, function ( value, key, collection ) {
							key = props ? props[--length] : --length;
							return callback( collection[key], key, collection );
						} );
					}
					return collection;
				}

				/**
				 * Creates an object composed of keys generated from the results of running
				 * each element of a collection through the callback. The corresponding value
				 * of each key is an array of the elements responsible for generating the key.
				 * The callback is bound to `thisArg` and invoked with three arguments;
				 * (value, index|key, collection).
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`
				 *
				 * @static
				 * @memberOf _
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {Function|Object|string} [callback=identity] The function called
				 *  per iteration. If a property name or object is provided it will be used
				 *  to create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Object} Returns the composed aggregate object.
				 * @example
				 *
				 * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });
				 * // => { '4': [4.2], '6': [6.1, 6.4] }
				 *
				 * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
				 * // => { '4': [4.2], '6': [6.1, 6.4] }
				 *
				 * // using "_.pluck" callback shorthand
				 * _.groupBy(['one', 'two', 'three'], 'length');
				 * // => { '3': ['one', 'two'], '5': ['three'] }
				 */
				var groupBy = createAggregator( function ( result, value, key ) {
					(hasOwnProperty.call( result, key ) ? result[key] : result[key] = []).push( value );
				} );

				/**
				 * Creates an object composed of keys generated from the results of running
				 * each element of the collection through the given callback. The corresponding
				 * value of each key is the last element responsible for generating the key.
				 * The callback is bound to `thisArg` and invoked with three arguments;
				 * (value, index|key, collection).
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {Function|Object|string} [callback=identity] The function called
				 *  per iteration. If a property name or object is provided it will be used
				 *  to create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Object} Returns the composed aggregate object.
				 * @example
				 *
				 * var keys = [
				 *   { 'dir': 'left', 'code': 97 },
				 *   { 'dir': 'right', 'code': 100 }
				 * ];
				 *
				 * _.indexBy(keys, 'dir');
				 * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
				 *
				 * _.indexBy(keys, function(key) { return String.fromCharCode(key.code); });
				 * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
				 *
				 * _.indexBy(characters, function(key) { this.fromCharCode(key.code); }, String);
				 * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
				 */
				var indexBy = createAggregator( function ( result, value, key ) {
					result[key] = value;
				} );

				/**
				 * Invokes the method named by `methodName` on each element in the `collection`
				 * returning an array of the results of each invoked method. Additional arguments
				 * will be provided to each invoked method. If `methodName` is a function it
				 * will be invoked for, and `this` bound to, each element in the `collection`.
				 *
				 * @static
				 * @memberOf _
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {Function|string} methodName The name of the method to invoke or
				 *  the function invoked per iteration.
				 * @param {...*} [arg] Arguments to invoke the method with.
				 * @returns {Array} Returns a new array of the results of each invoked method.
				 * @example
				 *
				 * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
				 * // => [[1, 5, 7], [1, 2, 3]]
				 *
				 * _.invoke([123, 456], String.prototype.split, '');
				 * // => [['1', '2', '3'], ['4', '5', '6']]
				 */
				function invoke( collection, methodName ) {
					var args = slice( arguments, 2 ),
						index = -1,
						isFunc = typeof methodName == 'function',
						length = collection ? collection.length : 0,
						result = Array( typeof length == 'number' ? length : 0 );

					forEach( collection, function ( value ) {
						result[++index] = (isFunc ? methodName : value[methodName]).apply( value, args );
					} );
					return result;
				}

				/**
				 * Creates an array of values by running each element in the collection
				 * through the callback. The callback is bound to `thisArg` and invoked with
				 * three arguments; (value, index|key, collection).
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @alias collect
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {Function|Object|string} [callback=identity] The function called
				 *  per iteration. If a property name or object is provided it will be used
				 *  to create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Array} Returns a new array of the results of each `callback` execution.
				 * @example
				 *
				 * _.map([1, 2, 3], function(num) { return num * 3; });
				 * // => [3, 6, 9]
				 *
				 * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
				 * // => [3, 6, 9] (property order is not guaranteed across environments)
				 *
				 * var characters = [
				 *   { 'name': 'barney', 'age': 36 },
				 *   { 'name': 'fred',   'age': 40 }
				 * ];
				 *
				 * // using "_.pluck" callback shorthand
				 * _.map(characters, 'name');
				 * // => ['barney', 'fred']
				 */
				function map( collection, callback, thisArg ) {
					var index = -1,
						length = collection ? collection.length : 0;

					callback = lodash.createCallback( callback, thisArg, 3 );
					if ( typeof length == 'number' ) {
						var result = Array( length );
						while ( ++index < length ) {
							result[index] = callback( collection[index], index, collection );
						}
					} else {
						result = [];
						forOwn( collection, function ( value, key, collection ) {
							result[++index] = callback( value, key, collection );
						} );
					}
					return result;
				}

				/**
				 * Retrieves the maximum value of a collection. If the collection is empty or
				 * falsey `-Infinity` is returned. If a callback is provided it will be executed
				 * for each value in the collection to generate the criterion by which the value
				 * is ranked. The callback is bound to `thisArg` and invoked with three
				 * arguments; (value, index, collection).
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {Function|Object|string} [callback=identity] The function called
				 *  per iteration. If a property name or object is provided it will be used
				 *  to create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {*} Returns the maximum value.
				 * @example
				 *
				 * _.max([4, 2, 8, 6]);
				 * // => 8
				 *
				 * var characters = [
				 *   { 'name': 'barney', 'age': 36 },
				 *   { 'name': 'fred',   'age': 40 }
				 * ];
				 *
				 * _.max(characters, function(chr) { return chr.age; });
				 * // => { 'name': 'fred', 'age': 40 };
				 *
				 * // using "_.pluck" callback shorthand
				 * _.max(characters, 'age');
				 * // => { 'name': 'fred', 'age': 40 };
				 */
				function max( collection, callback, thisArg ) {
					var computed = -Infinity,
						result = computed;

					// allows working with functions like `_.map` without using
					// their `index` argument as a callback
					if ( typeof callback != 'function' && thisArg && thisArg[callback] === collection ) {
						callback = null;
					}
					if ( callback == null && isArray( collection ) ) {
						var index = -1,
							length = collection.length;

						while ( ++index < length ) {
							var value = collection[index];
							if ( value > result ) {
								result = value;
							}
						}
					} else {
						callback = (callback == null && isString( collection ))
							? charAtCallback
							: lodash.createCallback( callback, thisArg, 3 );

						forEach( collection, function ( value, index, collection ) {
							var current = callback( value, index, collection );
							if ( current > computed ) {
								computed = current;
								result = value;
							}
						} );
					}
					return result;
				}

				/**
				 * Retrieves the minimum value of a collection. If the collection is empty or
				 * falsey `Infinity` is returned. If a callback is provided it will be executed
				 * for each value in the collection to generate the criterion by which the value
				 * is ranked. The callback is bound to `thisArg` and invoked with three
				 * arguments; (value, index, collection).
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {Function|Object|string} [callback=identity] The function called
				 *  per iteration. If a property name or object is provided it will be used
				 *  to create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {*} Returns the minimum value.
				 * @example
				 *
				 * _.min([4, 2, 8, 6]);
				 * // => 2
				 *
				 * var characters = [
				 *   { 'name': 'barney', 'age': 36 },
				 *   { 'name': 'fred',   'age': 40 }
				 * ];
				 *
				 * _.min(characters, function(chr) { return chr.age; });
				 * // => { 'name': 'barney', 'age': 36 };
				 *
				 * // using "_.pluck" callback shorthand
				 * _.min(characters, 'age');
				 * // => { 'name': 'barney', 'age': 36 };
				 */
				function min( collection, callback, thisArg ) {
					var computed = Infinity,
						result = computed;

					// allows working with functions like `_.map` without using
					// their `index` argument as a callback
					if ( typeof callback != 'function' && thisArg && thisArg[callback] === collection ) {
						callback = null;
					}
					if ( callback == null && isArray( collection ) ) {
						var index = -1,
							length = collection.length;

						while ( ++index < length ) {
							var value = collection[index];
							if ( value < result ) {
								result = value;
							}
						}
					} else {
						callback = (callback == null && isString( collection ))
							? charAtCallback
							: lodash.createCallback( callback, thisArg, 3 );

						forEach( collection, function ( value, index, collection ) {
							var current = callback( value, index, collection );
							if ( current < computed ) {
								computed = current;
								result = value;
							}
						} );
					}
					return result;
				}

				/**
				 * Retrieves the value of a specified property from all elements in the collection.
				 *
				 * @static
				 * @memberOf _
				 * @type Function
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {string} property The name of the property to pluck.
				 * @returns {Array} Returns a new array of property values.
				 * @example
				 *
				 * var characters = [
				 *   { 'name': 'barney', 'age': 36 },
				 *   { 'name': 'fred',   'age': 40 }
				 * ];
				 *
				 * _.pluck(characters, 'name');
				 * // => ['barney', 'fred']
				 */
				var pluck = map;

				/**
				 * Reduces a collection to a value which is the accumulated result of running
				 * each element in the collection through the callback, where each successive
				 * callback execution consumes the return value of the previous execution. If
				 * `accumulator` is not provided the first element of the collection will be
				 * used as the initial `accumulator` value. The callback is bound to `thisArg`
				 * and invoked with four arguments; (accumulator, value, index|key, collection).
				 *
				 * @static
				 * @memberOf _
				 * @alias foldl, inject
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {Function} [callback=identity] The function called per iteration.
				 * @param {*} [accumulator] Initial value of the accumulator.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {*} Returns the accumulated value.
				 * @example
				 *
				 * var sum = _.reduce([1, 2, 3], function(sum, num) {
     *   return sum + num;
     * });
				 * // => 6
				 *
				 * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     *   return result;
     * }, {});
				 * // => { 'a': 3, 'b': 6, 'c': 9 }
				 */
				function reduce( collection, callback, accumulator, thisArg ) {
					if ( !collection ) return accumulator;
					var noaccum = arguments.length < 3;
					callback = lodash.createCallback( callback, thisArg, 4 );

					var index = -1,
						length = collection.length;

					if ( typeof length == 'number' ) {
						if ( noaccum ) {
							accumulator = collection[++index];
						}
						while ( ++index < length ) {
							accumulator = callback( accumulator, collection[index], index, collection );
						}
					} else {
						forOwn( collection, function ( value, index, collection ) {
							accumulator = noaccum
								? (noaccum = false, value)
								: callback( accumulator, value, index, collection )
						} );
					}
					return accumulator;
				}

				/**
				 * This method is like `_.reduce` except that it iterates over elements
				 * of a `collection` from right to left.
				 *
				 * @static
				 * @memberOf _
				 * @alias foldr
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {Function} [callback=identity] The function called per iteration.
				 * @param {*} [accumulator] Initial value of the accumulator.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {*} Returns the accumulated value.
				 * @example
				 *
				 * var list = [[0, 1], [2, 3], [4, 5]];
				 * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);
				 * // => [4, 5, 2, 3, 0, 1]
				 */
				function reduceRight( collection, callback, accumulator, thisArg ) {
					var noaccum = arguments.length < 3;
					callback = lodash.createCallback( callback, thisArg, 4 );
					forEachRight( collection, function ( value, index, collection ) {
						accumulator = noaccum
							? (noaccum = false, value)
							: callback( accumulator, value, index, collection );
					} );
					return accumulator;
				}

				/**
				 * The opposite of `_.filter` this method returns the elements of a
				 * collection that the callback does **not** return truey for.
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {Function|Object|string} [callback=identity] The function called
				 *  per iteration. If a property name or object is provided it will be used
				 *  to create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Array} Returns a new array of elements that failed the callback check.
				 * @example
				 *
				 * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
				 * // => [1, 3, 5]
				 *
				 * var characters = [
				 *   { 'name': 'barney', 'age': 36, 'blocked': false },
				 *   { 'name': 'fred',   'age': 40, 'blocked': true }
				 * ];
				 *
				 * // using "_.pluck" callback shorthand
				 * _.reject(characters, 'blocked');
				 * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
				 *
				 * // using "_.where" callback shorthand
				 * _.reject(characters, { 'age': 36 });
				 * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
				 */
				function reject( collection, callback, thisArg ) {
					callback = lodash.createCallback( callback, thisArg, 3 );
					return filter( collection, function ( value, index, collection ) {
						return !callback( value, index, collection );
					} );
				}

				/**
				 * Retrieves a random element or `n` random elements from a collection.
				 *
				 * @static
				 * @memberOf _
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to sample.
				 * @param {number} [n] The number of elements to sample.
				 * @param- {Object} [guard] Allows working with functions like `_.map`
				 *  without using their `index` arguments as `n`.
				 * @returns {Array} Returns the random sample(s) of `collection`.
				 * @example
				 *
				 * _.sample([1, 2, 3, 4]);
				 * // => 2
				 *
				 * _.sample([1, 2, 3, 4], 2);
				 * // => [3, 1]
				 */
				function sample( collection, n, guard ) {
					if ( collection && typeof collection.length != 'number' ) {
						collection = values( collection );
					}
					if ( n == null || guard ) {
						return collection ? collection[baseRandom( 0, collection.length - 1 )] : undefined;
					}
					var result = shuffle( collection );
					result.length = nativeMin( nativeMax( 0, n ), result.length );
					return result;
				}

				/**
				 * Creates an array of shuffled values, using a version of the Fisher-Yates
				 * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
				 *
				 * @static
				 * @memberOf _
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to shuffle.
				 * @returns {Array} Returns a new shuffled collection.
				 * @example
				 *
				 * _.shuffle([1, 2, 3, 4, 5, 6]);
				 * // => [4, 1, 6, 3, 5, 2]
				 */
				function shuffle( collection ) {
					var index = -1,
						length = collection ? collection.length : 0,
						result = Array( typeof length == 'number' ? length : 0 );

					forEach( collection, function ( value ) {
						var rand = baseRandom( 0, ++index );
						result[index] = result[rand];
						result[rand] = value;
					} );
					return result;
				}

				/**
				 * Gets the size of the `collection` by returning `collection.length` for arrays
				 * and array-like objects or the number of own enumerable properties for objects.
				 *
				 * @static
				 * @memberOf _
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to inspect.
				 * @returns {number} Returns `collection.length` or number of own enumerable properties.
				 * @example
				 *
				 * _.size([1, 2]);
				 * // => 2
				 *
				 * _.size({ 'one': 1, 'two': 2, 'three': 3 });
				 * // => 3
				 *
				 * _.size('pebbles');
				 * // => 7
				 */
				function size( collection ) {
					var length = collection ? collection.length : 0;
					return typeof length == 'number' ? length : keys( collection ).length;
				}

				/**
				 * Checks if the callback returns a truey value for **any** element of a
				 * collection. The function returns as soon as it finds a passing value and
				 * does not iterate over the entire collection. The callback is bound to
				 * `thisArg` and invoked with three arguments; (value, index|key, collection).
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @alias any
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {Function|Object|string} [callback=identity] The function called
				 *  per iteration. If a property name or object is provided it will be used
				 *  to create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {boolean} Returns `true` if any element passed the callback check,
				 *  else `false`.
				 * @example
				 *
				 * _.some([null, 0, 'yes', false], Boolean);
				 * // => true
				 *
				 * var characters = [
				 *   { 'name': 'barney', 'age': 36, 'blocked': false },
				 *   { 'name': 'fred',   'age': 40, 'blocked': true }
				 * ];
				 *
				 * // using "_.pluck" callback shorthand
				 * _.some(characters, 'blocked');
				 * // => true
				 *
				 * // using "_.where" callback shorthand
				 * _.some(characters, { 'age': 1 });
				 * // => false
				 */
				function some( collection, callback, thisArg ) {
					var result;
					callback = lodash.createCallback( callback, thisArg, 3 );

					var index = -1,
						length = collection ? collection.length : 0;

					if ( typeof length == 'number' ) {
						while ( ++index < length ) {
							if ( (result = callback( collection[index], index, collection )) ) {
								break;
							}
						}
					} else {
						forOwn( collection, function ( value, index, collection ) {
							return !(result = callback( value, index, collection ));
						} );
					}
					return !!result;
				}

				/**
				 * Creates an array of elements, sorted in ascending order by the results of
				 * running each element in a collection through the callback. This method
				 * performs a stable sort, that is, it will preserve the original sort order
				 * of equal elements. The callback is bound to `thisArg` and invoked with
				 * three arguments; (value, index|key, collection).
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an array of property names is provided for `callback` the collection
				 * will be sorted by each property value.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {Array|Function|Object|string} [callback=identity] The function called
				 *  per iteration. If a property name or object is provided it will be used
				 *  to create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Array} Returns a new array of sorted elements.
				 * @example
				 *
				 * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });
				 * // => [3, 1, 2]
				 *
				 * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);
				 * // => [3, 1, 2]
				 *
				 * var characters = [
				 *   { 'name': 'barney',  'age': 36 },
				 *   { 'name': 'fred',    'age': 40 },
				 *   { 'name': 'barney',  'age': 26 },
				 *   { 'name': 'fred',    'age': 30 }
				 * ];
				 *
				 * // using "_.pluck" callback shorthand
				 * _.map(_.sortBy(characters, 'age'), _.values);
				 * // => [['barney', 26], ['fred', 30], ['barney', 36], ['fred', 40]]
				 *
				 * // sorting by multiple properties
				 * _.map(_.sortBy(characters, ['name', 'age']), _.values);
				 * // = > [['barney', 26], ['barney', 36], ['fred', 30], ['fred', 40]]
				 */
				function sortBy( collection, callback, thisArg ) {
					var index = -1,
						isArr = isArray( callback ),
						length = collection ? collection.length : 0,
						result = Array( typeof length == 'number' ? length : 0 );

					if ( !isArr ) {
						callback = lodash.createCallback( callback, thisArg, 3 );
					}
					forEach( collection, function ( value, key, collection ) {
						var object = result[++index] = getObject();
						if ( isArr ) {
							object.criteria = map( callback, function ( key ) { return value[key]; } );
						} else {
							(object.criteria = getArray())[0] = callback( value, key, collection );
						}
						object.index = index;
						object.value = value;
					} );

					length = result.length;
					result.sort( compareAscending );
					while ( length-- ) {
						var object = result[length];
						result[length] = object.value;
						if ( !isArr ) {
							releaseArray( object.criteria );
						}
						releaseObject( object );
					}
					return result;
				}

				/**
				 * Converts the `collection` to an array.
				 *
				 * @static
				 * @memberOf _
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to convert.
				 * @returns {Array} Returns the new converted array.
				 * @example
				 *
				 * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
				 * // => [2, 3, 4]
				 */
				function toArray( collection ) {
					if ( collection && typeof collection.length == 'number' ) {
						return slice( collection );
					}
					return values( collection );
				}

				/**
				 * Performs a deep comparison of each element in a `collection` to the given
				 * `properties` object, returning an array of all elements that have equivalent
				 * property values.
				 *
				 * @static
				 * @memberOf _
				 * @type Function
				 * @category Collections
				 * @param {Array|Object|string} collection The collection to iterate over.
				 * @param {Object} props The object of property values to filter by.
				 * @returns {Array} Returns a new array of elements that have the given properties.
				 * @example
				 *
				 * var characters = [
				 *   { 'name': 'barney', 'age': 36, 'pets': ['hoppy'] },
				 *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
				 * ];
				 *
				 * _.where(characters, { 'age': 36 });
				 * // => [{ 'name': 'barney', 'age': 36, 'pets': ['hoppy'] }]
				 *
				 * _.where(characters, { 'pets': ['dino'] });
				 * // => [{ 'name': 'fred', 'age': 40, 'pets': ['baby puss', 'dino'] }]
				 */
				var where = filter;

				/*--------------------------------------------------------------------------*/

				/**
				 * Creates an array with all falsey values removed. The values `false`, `null`,
				 * `0`, `""`, `undefined`, and `NaN` are all falsey.
				 *
				 * @static
				 * @memberOf _
				 * @category Arrays
				 * @param {Array} array The array to compact.
				 * @returns {Array} Returns a new array of filtered values.
				 * @example
				 *
				 * _.compact([0, 1, false, 2, '', 3]);
				 * // => [1, 2, 3]
				 */
				function compact( array ) {
					var index = -1,
						length = array ? array.length : 0,
						result = [];

					while ( ++index < length ) {
						var value = array[index];
						if ( value ) {
							result.push( value );
						}
					}
					return result;
				}

				/**
				 * Creates an array excluding all values of the provided arrays using strict
				 * equality for comparisons, i.e. `===`.
				 *
				 * @static
				 * @memberOf _
				 * @category Arrays
				 * @param {Array} array The array to process.
				 * @param {...Array} [values] The arrays of values to exclude.
				 * @returns {Array} Returns a new array of filtered values.
				 * @example
				 *
				 * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
				 * // => [1, 3, 4]
				 */
				function difference( array ) {
					return baseDifference( array, baseFlatten( arguments, true, true, 1 ) );
				}

				/**
				 * This method is like `_.find` except that it returns the index of the first
				 * element that passes the callback check, instead of the element itself.
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @category Arrays
				 * @param {Array} array The array to search.
				 * @param {Function|Object|string} [callback=identity] The function called
				 *  per iteration. If a property name or object is provided it will be used
				 *  to create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {number} Returns the index of the found element, else `-1`.
				 * @example
				 *
				 * var characters = [
				 *   { 'name': 'barney',  'age': 36, 'blocked': false },
				 *   { 'name': 'fred',    'age': 40, 'blocked': true },
				 *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
				 * ];
				 *
				 * _.findIndex(characters, function(chr) {
     *   return chr.age < 20;
     * });
				 * // => 2
				 *
				 * // using "_.where" callback shorthand
				 * _.findIndex(characters, { 'age': 36 });
				 * // => 0
				 *
				 * // using "_.pluck" callback shorthand
				 * _.findIndex(characters, 'blocked');
				 * // => 1
				 */
				function findIndex( array, callback, thisArg ) {
					var index = -1,
						length = array ? array.length : 0;

					callback = lodash.createCallback( callback, thisArg, 3 );
					while ( ++index < length ) {
						if ( callback( array[index], index, array ) ) {
							return index;
						}
					}
					return -1;
				}

				/**
				 * This method is like `_.findIndex` except that it iterates over elements
				 * of a `collection` from right to left.
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @category Arrays
				 * @param {Array} array The array to search.
				 * @param {Function|Object|string} [callback=identity] The function called
				 *  per iteration. If a property name or object is provided it will be used
				 *  to create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {number} Returns the index of the found element, else `-1`.
				 * @example
				 *
				 * var characters = [
				 *   { 'name': 'barney',  'age': 36, 'blocked': true },
				 *   { 'name': 'fred',    'age': 40, 'blocked': false },
				 *   { 'name': 'pebbles', 'age': 1,  'blocked': true }
				 * ];
				 *
				 * _.findLastIndex(characters, function(chr) {
     *   return chr.age > 30;
     * });
				 * // => 1
				 *
				 * // using "_.where" callback shorthand
				 * _.findLastIndex(characters, { 'age': 36 });
				 * // => 0
				 *
				 * // using "_.pluck" callback shorthand
				 * _.findLastIndex(characters, 'blocked');
				 * // => 2
				 */
				function findLastIndex( array, callback, thisArg ) {
					var length = array ? array.length : 0;
					callback = lodash.createCallback( callback, thisArg, 3 );
					while ( length-- ) {
						if ( callback( array[length], length, array ) ) {
							return length;
						}
					}
					return -1;
				}

				/**
				 * Gets the first element or first `n` elements of an array. If a callback
				 * is provided elements at the beginning of the array are returned as long
				 * as the callback returns truey. The callback is bound to `thisArg` and
				 * invoked with three arguments; (value, index, array).
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @alias head, take
				 * @category Arrays
				 * @param {Array} array The array to query.
				 * @param {Function|Object|number|string} [callback] The function called
				 *  per element or the number of elements to return. If a property name or
				 *  object is provided it will be used to create a "_.pluck" or "_.where"
				 *  style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {*} Returns the first element(s) of `array`.
				 * @example
				 *
				 * _.first([1, 2, 3]);
				 * // => 1
				 *
				 * _.first([1, 2, 3], 2);
				 * // => [1, 2]
				 *
				 * _.first([1, 2, 3], function(num) {
     *   return num < 3;
     * });
				 * // => [1, 2]
				 *
				 * var characters = [
				 *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
				 *   { 'name': 'fred',    'blocked': false, 'employer': 'slate' },
				 *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
				 * ];
				 *
				 * // using "_.pluck" callback shorthand
				 * _.first(characters, 'blocked');
				 * // => [{ 'name': 'barney', 'blocked': true, 'employer': 'slate' }]
				 *
				 * // using "_.where" callback shorthand
				 * _.pluck(_.first(characters, { 'employer': 'slate' }), 'name');
				 * // => ['barney', 'fred']
				 */
				function first( array, callback, thisArg ) {
					var n = 0,
						length = array ? array.length : 0;

					if ( typeof callback != 'number' && callback != null ) {
						var index = -1;
						callback = lodash.createCallback( callback, thisArg, 3 );
						while ( ++index < length && callback( array[index], index, array ) ) {
							n++;
						}
					} else {
						n = callback;
						if ( n == null || thisArg ) {
							return array ? array[0] : undefined;
						}
					}
					return slice( array, 0, nativeMin( nativeMax( 0, n ), length ) );
				}

				/**
				 * Flattens a nested array (the nesting can be to any depth). If `isShallow`
				 * is truey, the array will only be flattened a single level. If a callback
				 * is provided each element of the array is passed through the callback before
				 * flattening. The callback is bound to `thisArg` and invoked with three
				 * arguments; (value, index, array).
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @category Arrays
				 * @param {Array} array The array to flatten.
				 * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
				 * @param {Function|Object|string} [callback=identity] The function called
				 *  per iteration. If a property name or object is provided it will be used
				 *  to create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Array} Returns a new flattened array.
				 * @example
				 *
				 * _.flatten([1, [2], [3, [[4]]]]);
				 * // => [1, 2, 3, 4];
				 *
				 * _.flatten([1, [2], [3, [[4]]]], true);
				 * // => [1, 2, 3, [[4]]];
				 *
				 * var characters = [
				 *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
				 *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
				 * ];
				 *
				 * // using "_.pluck" callback shorthand
				 * _.flatten(characters, 'pets');
				 * // => ['hoppy', 'baby puss', 'dino']
				 */
				function flatten( array, isShallow, callback, thisArg ) {
					// juggle arguments
					if ( typeof isShallow != 'boolean' && isShallow != null ) {
						thisArg = callback;
						callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
						isShallow = false;
					}
					if ( callback != null ) {
						array = map( array, callback, thisArg );
					}
					return baseFlatten( array, isShallow );
				}

				/**
				 * Gets the index at which the first occurrence of `value` is found using
				 * strict equality for comparisons, i.e. `===`. If the array is already sorted
				 * providing `true` for `fromIndex` will run a faster binary search.
				 *
				 * @static
				 * @memberOf _
				 * @category Arrays
				 * @param {Array} array The array to search.
				 * @param {*} value The value to search for.
				 * @param {boolean|number} [fromIndex=0] The index to search from or `true`
				 *  to perform a binary search on a sorted array.
				 * @returns {number} Returns the index of the matched value or `-1`.
				 * @example
				 *
				 * _.indexOf([1, 2, 3, 1, 2, 3], 2);
				 * // => 1
				 *
				 * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);
				 * // => 4
				 *
				 * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);
				 * // => 2
				 */
				function indexOf( array, value, fromIndex ) {
					if ( typeof fromIndex == 'number' ) {
						var length = array ? array.length : 0;
						fromIndex = (fromIndex < 0 ? nativeMax( 0, length + fromIndex ) : fromIndex || 0);
					} else if ( fromIndex ) {
						var index = sortedIndex( array, value );
						return array[index] === value ? index : -1;
					}
					return baseIndexOf( array, value, fromIndex );
				}

				/**
				 * Gets all but the last element or last `n` elements of an array. If a
				 * callback is provided elements at the end of the array are excluded from
				 * the result as long as the callback returns truey. The callback is bound
				 * to `thisArg` and invoked with three arguments; (value, index, array).
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @category Arrays
				 * @param {Array} array The array to query.
				 * @param {Function|Object|number|string} [callback=1] The function called
				 *  per element or the number of elements to exclude. If a property name or
				 *  object is provided it will be used to create a "_.pluck" or "_.where"
				 *  style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Array} Returns a slice of `array`.
				 * @example
				 *
				 * _.initial([1, 2, 3]);
				 * // => [1, 2]
				 *
				 * _.initial([1, 2, 3], 2);
				 * // => [1]
				 *
				 * _.initial([1, 2, 3], function(num) {
     *   return num > 1;
     * });
				 * // => [1]
				 *
				 * var characters = [
				 *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
				 *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
				 *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
				 * ];
				 *
				 * // using "_.pluck" callback shorthand
				 * _.initial(characters, 'blocked');
				 * // => [{ 'name': 'barney',  'blocked': false, 'employer': 'slate' }]
				 *
				 * // using "_.where" callback shorthand
				 * _.pluck(_.initial(characters, { 'employer': 'na' }), 'name');
				 * // => ['barney', 'fred']
				 */
				function initial( array, callback, thisArg ) {
					var n = 0,
						length = array ? array.length : 0;

					if ( typeof callback != 'number' && callback != null ) {
						var index = length;
						callback = lodash.createCallback( callback, thisArg, 3 );
						while ( index-- && callback( array[index], index, array ) ) {
							n++;
						}
					} else {
						n = (callback == null || thisArg) ? 1 : callback || n;
					}
					return slice( array, 0, nativeMin( nativeMax( 0, length - n ), length ) );
				}

				/**
				 * Creates an array of unique values present in all provided arrays using
				 * strict equality for comparisons, i.e. `===`.
				 *
				 * @static
				 * @memberOf _
				 * @category Arrays
				 * @param {...Array} [array] The arrays to inspect.
				 * @returns {Array} Returns an array of shared values.
				 * @example
				 *
				 * _.intersection([1, 2, 3], [5, 2, 1, 4], [2, 1]);
				 * // => [1, 2]
				 */
				function intersection() {
					var args = [],
						argsIndex = -1,
						argsLength = arguments.length,
						caches = getArray(),
						indexOf = getIndexOf(),
						trustIndexOf = indexOf === baseIndexOf,
						seen = getArray();

					while ( ++argsIndex < argsLength ) {
						var value = arguments[argsIndex];
						if ( isArray( value ) || isArguments( value ) ) {
							args.push( value );
							caches.push( trustIndexOf && value.length >= largeArraySize &&
								createCache( argsIndex ? args[argsIndex] : seen ) );
						}
					}
					var array = args[0],
						index = -1,
						length = array ? array.length : 0,
						result = [];

					outer:
						while ( ++index < length ) {
							var cache = caches[0];
							value = array[index];

							if ( (cache ? cacheIndexOf( cache, value ) : indexOf( seen, value )) < 0 ) {
								argsIndex = argsLength;
								(cache || seen).push( value );
								while ( --argsIndex ) {
									cache = caches[argsIndex];
									if ( (cache ? cacheIndexOf( cache, value ) : indexOf( args[argsIndex], value )) < 0 ) {
										continue outer;
									}
								}
								result.push( value );
							}
						}
					while ( argsLength-- ) {
						cache = caches[argsLength];
						if ( cache ) {
							releaseObject( cache );
						}
					}
					releaseArray( caches );
					releaseArray( seen );
					return result;
				}

				/**
				 * Gets the last element or last `n` elements of an array. If a callback is
				 * provided elements at the end of the array are returned as long as the
				 * callback returns truey. The callback is bound to `thisArg` and invoked
				 * with three arguments; (value, index, array).
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @category Arrays
				 * @param {Array} array The array to query.
				 * @param {Function|Object|number|string} [callback] The function called
				 *  per element or the number of elements to return. If a property name or
				 *  object is provided it will be used to create a "_.pluck" or "_.where"
				 *  style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {*} Returns the last element(s) of `array`.
				 * @example
				 *
				 * _.last([1, 2, 3]);
				 * // => 3
				 *
				 * _.last([1, 2, 3], 2);
				 * // => [2, 3]
				 *
				 * _.last([1, 2, 3], function(num) {
     *   return num > 1;
     * });
				 * // => [2, 3]
				 *
				 * var characters = [
				 *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
				 *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
				 *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
				 * ];
				 *
				 * // using "_.pluck" callback shorthand
				 * _.pluck(_.last(characters, 'blocked'), 'name');
				 * // => ['fred', 'pebbles']
				 *
				 * // using "_.where" callback shorthand
				 * _.last(characters, { 'employer': 'na' });
				 * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
				 */
				function last( array, callback, thisArg ) {
					var n = 0,
						length = array ? array.length : 0;

					if ( typeof callback != 'number' && callback != null ) {
						var index = length;
						callback = lodash.createCallback( callback, thisArg, 3 );
						while ( index-- && callback( array[index], index, array ) ) {
							n++;
						}
					} else {
						n = callback;
						if ( n == null || thisArg ) {
							return array ? array[length - 1] : undefined;
						}
					}
					return slice( array, nativeMax( 0, length - n ) );
				}

				/**
				 * Gets the index at which the last occurrence of `value` is found using strict
				 * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
				 * as the offset from the end of the collection.
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @category Arrays
				 * @param {Array} array The array to search.
				 * @param {*} value The value to search for.
				 * @param {number} [fromIndex=array.length-1] The index to search from.
				 * @returns {number} Returns the index of the matched value or `-1`.
				 * @example
				 *
				 * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);
				 * // => 4
				 *
				 * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);
				 * // => 1
				 */
				function lastIndexOf( array, value, fromIndex ) {
					var index = array ? array.length : 0;
					if ( typeof fromIndex == 'number' ) {
						index = (fromIndex < 0 ? nativeMax( 0, index + fromIndex ) : nativeMin( fromIndex, index - 1 )) + 1;
					}
					while ( index-- ) {
						if ( array[index] === value ) {
							return index;
						}
					}
					return -1;
				}

				/**
				 * Removes all provided values from the given array using strict equality for
				 * comparisons, i.e. `===`.
				 *
				 * @static
				 * @memberOf _
				 * @category Arrays
				 * @param {Array} array The array to modify.
				 * @param {...*} [value] The values to remove.
				 * @returns {Array} Returns `array`.
				 * @example
				 *
				 * var array = [1, 2, 3, 1, 2, 3];
				 * _.pull(array, 2, 3);
				 * console.log(array);
				 * // => [1, 1]
				 */
				function pull( array ) {
					var args = arguments,
						argsIndex = 0,
						argsLength = args.length,
						length = array ? array.length : 0;

					while ( ++argsIndex < argsLength ) {
						var index = -1,
							value = args[argsIndex];
						while ( ++index < length ) {
							if ( array[index] === value ) {
								splice.call( array, index--, 1 );
								length--;
							}
						}
					}
					return array;
				}

				/**
				 * Creates an array of numbers (positive and/or negative) progressing from
				 * `start` up to but not including `end`. If `start` is less than `stop` a
				 * zero-length range is created unless a negative `step` is specified.
				 *
				 * @static
				 * @memberOf _
				 * @category Arrays
				 * @param {number} [start=0] The start of the range.
				 * @param {number} end The end of the range.
				 * @param {number} [step=1] The value to increment or decrement by.
				 * @returns {Array} Returns a new range array.
				 * @example
				 *
				 * _.range(4);
				 * // => [0, 1, 2, 3]
				 *
				 * _.range(1, 5);
				 * // => [1, 2, 3, 4]
				 *
				 * _.range(0, 20, 5);
				 * // => [0, 5, 10, 15]
				 *
				 * _.range(0, -4, -1);
				 * // => [0, -1, -2, -3]
				 *
				 * _.range(1, 4, 0);
				 * // => [1, 1, 1]
				 *
				 * _.range(0);
				 * // => []
				 */
				function range( start, end, step ) {
					start = +start || 0;
					step = typeof step == 'number' ? step : (+step || 1);

					if ( end == null ) {
						end = start;
						start = 0;
					}
					// use `Array(length)` so engines like Chakra and V8 avoid slower modes
					// http://youtu.be/XAqIpGU8ZZk#t=17m25s
					var index = -1,
						length = nativeMax( 0, ceil( (end - start) / (step || 1) ) ),
						result = Array( length );

					while ( ++index < length ) {
						result[index] = start;
						start += step;
					}
					return result;
				}

				/**
				 * Removes all elements from an array that the callback returns truey for
				 * and returns an array of removed elements. The callback is bound to `thisArg`
				 * and invoked with three arguments; (value, index, array).
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @category Arrays
				 * @param {Array} array The array to modify.
				 * @param {Function|Object|string} [callback=identity] The function called
				 *  per iteration. If a property name or object is provided it will be used
				 *  to create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Array} Returns a new array of removed elements.
				 * @example
				 *
				 * var array = [1, 2, 3, 4, 5, 6];
				 * var evens = _.remove(array, function(num) { return num % 2 == 0; });
				 *
				 * console.log(array);
				 * // => [1, 3, 5]
				 *
				 * console.log(evens);
				 * // => [2, 4, 6]
				 */
				function remove( array, callback, thisArg ) {
					var index = -1,
						length = array ? array.length : 0,
						result = [];

					callback = lodash.createCallback( callback, thisArg, 3 );
					while ( ++index < length ) {
						var value = array[index];
						if ( callback( value, index, array ) ) {
							result.push( value );
							splice.call( array, index--, 1 );
							length--;
						}
					}
					return result;
				}

				/**
				 * The opposite of `_.initial` this method gets all but the first element or
				 * first `n` elements of an array. If a callback function is provided elements
				 * at the beginning of the array are excluded from the result as long as the
				 * callback returns truey. The callback is bound to `thisArg` and invoked
				 * with three arguments; (value, index, array).
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @alias drop, tail
				 * @category Arrays
				 * @param {Array} array The array to query.
				 * @param {Function|Object|number|string} [callback=1] The function called
				 *  per element or the number of elements to exclude. If a property name or
				 *  object is provided it will be used to create a "_.pluck" or "_.where"
				 *  style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Array} Returns a slice of `array`.
				 * @example
				 *
				 * _.rest([1, 2, 3]);
				 * // => [2, 3]
				 *
				 * _.rest([1, 2, 3], 2);
				 * // => [3]
				 *
				 * _.rest([1, 2, 3], function(num) {
     *   return num < 3;
     * });
				 * // => [3]
				 *
				 * var characters = [
				 *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
				 *   { 'name': 'fred',    'blocked': false,  'employer': 'slate' },
				 *   { 'name': 'pebbles', 'blocked': true, 'employer': 'na' }
				 * ];
				 *
				 * // using "_.pluck" callback shorthand
				 * _.pluck(_.rest(characters, 'blocked'), 'name');
				 * // => ['fred', 'pebbles']
				 *
				 * // using "_.where" callback shorthand
				 * _.rest(characters, { 'employer': 'slate' });
				 * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
				 */
				function rest( array, callback, thisArg ) {
					if ( typeof callback != 'number' && callback != null ) {
						var n = 0,
							index = -1,
							length = array ? array.length : 0;

						callback = lodash.createCallback( callback, thisArg, 3 );
						while ( ++index < length && callback( array[index], index, array ) ) {
							n++;
						}
					} else {
						n = (callback == null || thisArg) ? 1 : nativeMax( 0, callback );
					}
					return slice( array, n );
				}

				/**
				 * Uses a binary search to determine the smallest index at which a value
				 * should be inserted into a given sorted array in order to maintain the sort
				 * order of the array. If a callback is provided it will be executed for
				 * `value` and each element of `array` to compute their sort ranking. The
				 * callback is bound to `thisArg` and invoked with one argument; (value).
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @category Arrays
				 * @param {Array} array The array to inspect.
				 * @param {*} value The value to evaluate.
				 * @param {Function|Object|string} [callback=identity] The function called
				 *  per iteration. If a property name or object is provided it will be used
				 *  to create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {number} Returns the index at which `value` should be inserted
				 *  into `array`.
				 * @example
				 *
				 * _.sortedIndex([20, 30, 50], 40);
				 * // => 2
				 *
				 * // using "_.pluck" callback shorthand
				 * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
				 * // => 2
				 *
				 * var dict = {
     *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
     * };
				 *
				 * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return dict.wordToNumber[word];
     * });
				 * // => 2
				 *
				 * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return this.wordToNumber[word];
     * }, dict);
				 * // => 2
				 */
				function sortedIndex( array, value, callback, thisArg ) {
					var low = 0,
						high = array ? array.length : low;

					// explicitly reference `identity` for better inlining in Firefox
					callback = callback ? lodash.createCallback( callback, thisArg, 1 ) : identity;
					value = callback( value );

					while ( low < high ) {
						var mid = (low + high) >>> 1;
						(callback( array[mid] ) < value)
							? low = mid + 1
							: high = mid;
					}
					return low;
				}

				/**
				 * Creates an array of unique values, in order, of the provided arrays using
				 * strict equality for comparisons, i.e. `===`.
				 *
				 * @static
				 * @memberOf _
				 * @category Arrays
				 * @param {...Array} [array] The arrays to inspect.
				 * @returns {Array} Returns an array of combined values.
				 * @example
				 *
				 * _.union([1, 2, 3], [5, 2, 1, 4], [2, 1]);
				 * // => [1, 2, 3, 5, 4]
				 */
				function union() {
					return baseUniq( baseFlatten( arguments, true, true ) );
				}

				/**
				 * Creates a duplicate-value-free version of an array using strict equality
				 * for comparisons, i.e. `===`. If the array is sorted, providing
				 * `true` for `isSorted` will use a faster algorithm. If a callback is provided
				 * each element of `array` is passed through the callback before uniqueness
				 * is computed. The callback is bound to `thisArg` and invoked with three
				 * arguments; (value, index, array).
				 *
				 * If a property name is provided for `callback` the created "_.pluck" style
				 * callback will return the property value of the given element.
				 *
				 * If an object is provided for `callback` the created "_.where" style callback
				 * will return `true` for elements that have the properties of the given object,
				 * else `false`.
				 *
				 * @static
				 * @memberOf _
				 * @alias unique
				 * @category Arrays
				 * @param {Array} array The array to process.
				 * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
				 * @param {Function|Object|string} [callback=identity] The function called
				 *  per iteration. If a property name or object is provided it will be used
				 *  to create a "_.pluck" or "_.where" style callback, respectively.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Array} Returns a duplicate-value-free array.
				 * @example
				 *
				 * _.uniq([1, 2, 1, 3, 1]);
				 * // => [1, 2, 3]
				 *
				 * _.uniq([1, 1, 2, 2, 3], true);
				 * // => [1, 2, 3]
				 *
				 * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });
				 * // => ['A', 'b', 'C']
				 *
				 * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);
				 * // => [1, 2.5, 3]
				 *
				 * // using "_.pluck" callback shorthand
				 * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
				 * // => [{ 'x': 1 }, { 'x': 2 }]
				 */
				function uniq( array, isSorted, callback, thisArg ) {
					// juggle arguments
					if ( typeof isSorted != 'boolean' && isSorted != null ) {
						thisArg = callback;
						callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;
						isSorted = false;
					}
					if ( callback != null ) {
						callback = lodash.createCallback( callback, thisArg, 3 );
					}
					return baseUniq( array, isSorted, callback );
				}

				/**
				 * Creates an array excluding all provided values using strict equality for
				 * comparisons, i.e. `===`.
				 *
				 * @static
				 * @memberOf _
				 * @category Arrays
				 * @param {Array} array The array to filter.
				 * @param {...*} [value] The values to exclude.
				 * @returns {Array} Returns a new array of filtered values.
				 * @example
				 *
				 * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
				 * // => [2, 3, 4]
				 */
				function without( array ) {
					return baseDifference( array, slice( arguments, 1 ) );
				}

				/**
				 * Creates an array that is the smymetric difference of the provided arrays.
				 * See http://en.wikipedia.org/wiki/Symmetric_difference.
				 *
				 * @static
				 * @memberOf _
				 * @category Arrays
				 * @param {...Array} [array] The arrays to inspect.
				 * @returns {Array} Returns an array of values.
				 * @example
				 *
				 * _.xor([1, 2, 3], [5, 2, 1, 4]);
				 * // => [3, 5, 4]
				 *
				 * _.xor([1, 2, 5], [2, 3, 5], [3, 4, 5]);
				 * // => [1, 4, 5]
				 */
				function xor() {
					var index = -1,
						length = arguments.length;

					while ( ++index < length ) {
						var array = arguments[index];
						if ( isArray( array ) || isArguments( array ) ) {
							var result = result
								? baseUniq( baseDifference( result, array ).concat( baseDifference( array, result ) ) )
								: array;
						}
					}
					return result || [];
				}

				/**
				 * Creates an array of grouped elements, the first of which contains the first
				 * elements of the given arrays, the second of which contains the second
				 * elements of the given arrays, and so on.
				 *
				 * @static
				 * @memberOf _
				 * @alias unzip
				 * @category Arrays
				 * @param {...Array} [array] Arrays to process.
				 * @returns {Array} Returns a new array of grouped elements.
				 * @example
				 *
				 * _.zip(['fred', 'barney'], [30, 40], [true, false]);
				 * // => [['fred', 30, true], ['barney', 40, false]]
				 */
				function zip() {
					var array = arguments.length > 1 ? arguments : arguments[0],
						index = -1,
						length = array ? max( pluck( array, 'length' ) ) : 0,
						result = Array( length < 0 ? 0 : length );

					while ( ++index < length ) {
						result[index] = pluck( array, index );
					}
					return result;
				}

				/**
				 * Creates an object composed from arrays of `keys` and `values`. Provide
				 * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`
				 * or two arrays, one of `keys` and one of corresponding `values`.
				 *
				 * @static
				 * @memberOf _
				 * @alias object
				 * @category Arrays
				 * @param {Array} keys The array of keys.
				 * @param {Array} [values=[]] The array of values.
				 * @returns {Object} Returns an object composed of the given keys and
				 *  corresponding values.
				 * @example
				 *
				 * _.zipObject(['fred', 'barney'], [30, 40]);
				 * // => { 'fred': 30, 'barney': 40 }
				 */
				function zipObject( keys, values ) {
					var index = -1,
						length = keys ? keys.length : 0,
						result = {};

					if ( !values && length && !isArray( keys[0] ) ) {
						values = [];
					}
					while ( ++index < length ) {
						var key = keys[index];
						if ( values ) {
							result[key] = values[index];
						} else if ( key ) {
							result[key[0]] = key[1];
						}
					}
					return result;
				}

				/*--------------------------------------------------------------------------*/

				/**
				 * Creates a function that executes `func`, with  the `this` binding and
				 * arguments of the created function, only after being called `n` times.
				 *
				 * @static
				 * @memberOf _
				 * @category Functions
				 * @param {number} n The number of times the function must be called before
				 *  `func` is executed.
				 * @param {Function} func The function to restrict.
				 * @returns {Function} Returns the new restricted function.
				 * @example
				 *
				 * var saves = ['profile', 'settings'];
				 *
				 * var done = _.after(saves.length, function() {
     *   console.log('Done saving!');
     * });
				 *
				 * _.forEach(saves, function(type) {
     *   asyncSave({ 'type': type, 'complete': done });
     * });
				 * // => logs 'Done saving!', after all saves have completed
				 */
				function after( n, func ) {
					if ( !isFunction( func ) ) {
						throw new TypeError;
					}
					return function () {
						if ( --n < 1 ) {
							return func.apply( this, arguments );
						}
					};
				}

				/**
				 * Creates a function that, when called, invokes `func` with the `this`
				 * binding of `thisArg` and prepends any additional `bind` arguments to those
				 * provided to the bound function.
				 *
				 * @static
				 * @memberOf _
				 * @category Functions
				 * @param {Function} func The function to bind.
				 * @param {*} [thisArg] The `this` binding of `func`.
				 * @param {...*} [arg] Arguments to be partially applied.
				 * @returns {Function} Returns the new bound function.
				 * @example
				 *
				 * var func = function(greeting) {
     *   return greeting + ' ' + this.name;
     * };
				 *
				 * func = _.bind(func, { 'name': 'fred' }, 'hi');
				 * func();
				 * // => 'hi fred'
				 */
				function bind( func, thisArg ) {
					return arguments.length > 2
						? createWrapper( func, 17, slice( arguments, 2 ), null, thisArg )
						: createWrapper( func, 1, null, null, thisArg );
				}

				/**
				 * Binds methods of an object to the object itself, overwriting the existing
				 * method. Method names may be specified as individual arguments or as arrays
				 * of method names. If no method names are provided all the function properties
				 * of `object` will be bound.
				 *
				 * @static
				 * @memberOf _
				 * @category Functions
				 * @param {Object} object The object to bind and assign the bound methods to.
				 * @param {...string} [methodName] The object method names to
				 *  bind, specified as individual method names or arrays of method names.
				 * @returns {Object} Returns `object`.
				 * @example
				 *
				 * var view = {
     *   'label': 'docs',
     *   'onClick': function() { console.log('clicked ' + this.label); }
     * };
				 *
				 * _.bindAll(view);
				 * jQuery('#docs').on('click', view.onClick);
				 * // => logs 'clicked docs', when the button is clicked
				 */
				function bindAll( object ) {
					var funcs = arguments.length > 1 ? baseFlatten( arguments, true, false, 1 ) : functions( object ),
						index = -1,
						length = funcs.length;

					while ( ++index < length ) {
						var key = funcs[index];
						object[key] = createWrapper( object[key], 1, null, null, object );
					}
					return object;
				}

				/**
				 * Creates a function that, when called, invokes the method at `object[key]`
				 * and prepends any additional `bindKey` arguments to those provided to the bound
				 * function. This method differs from `_.bind` by allowing bound functions to
				 * reference methods that will be redefined or don't yet exist.
				 * See http://michaux.ca/articles/lazy-function-definition-pattern.
				 *
				 * @static
				 * @memberOf _
				 * @category Functions
				 * @param {Object} object The object the method belongs to.
				 * @param {string} key The key of the method.
				 * @param {...*} [arg] Arguments to be partially applied.
				 * @returns {Function} Returns the new bound function.
				 * @example
				 *
				 * var object = {
     *   'name': 'fred',
     *   'greet': function(greeting) {
     *     return greeting + ' ' + this.name;
     *   }
     * };
				 *
				 * var func = _.bindKey(object, 'greet', 'hi');
				 * func();
				 * // => 'hi fred'
				 *
				 * object.greet = function(greeting) {
     *   return greeting + 'ya ' + this.name + '!';
     * };
				 *
				 * func();
				 * // => 'hiya fred!'
				 */
				function bindKey( object, key ) {
					return arguments.length > 2
						? createWrapper( key, 19, slice( arguments, 2 ), null, object )
						: createWrapper( key, 3, null, null, object );
				}

				/**
				 * Creates a function that is the composition of the provided functions,
				 * where each function consumes the return value of the function that follows.
				 * For example, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.
				 * Each function is executed with the `this` binding of the composed function.
				 *
				 * @static
				 * @memberOf _
				 * @category Functions
				 * @param {...Function} [func] Functions to compose.
				 * @returns {Function} Returns the new composed function.
				 * @example
				 *
				 * var realNameMap = {
     *   'pebbles': 'penelope'
     * };
				 *
				 * var format = function(name) {
     *   name = realNameMap[name.toLowerCase()] || name;
     *   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
     * };
				 *
				 * var greet = function(formatted) {
     *   return 'Hiya ' + formatted + '!';
     * };
				 *
				 * var welcome = _.compose(greet, format);
				 * welcome('pebbles');
				 * // => 'Hiya Penelope!'
				 */
				function compose() {
					var funcs = arguments,
						length = funcs.length;

					while ( length-- ) {
						if ( !isFunction( funcs[length] ) ) {
							throw new TypeError;
						}
					}
					return function () {
						var args = arguments,
							length = funcs.length;

						while ( length-- ) {
							args = [funcs[length].apply( this, args )];
						}
						return args[0];
					};
				}

				/**
				 * Creates a function which accepts one or more arguments of `func` that when
				 * invoked either executes `func` returning its result, if all `func` arguments
				 * have been provided, or returns a function that accepts one or more of the
				 * remaining `func` arguments, and so on. The arity of `func` can be specified
				 * if `func.length` is not sufficient.
				 *
				 * @static
				 * @memberOf _
				 * @category Functions
				 * @param {Function} func The function to curry.
				 * @param {number} [arity=func.length] The arity of `func`.
				 * @returns {Function} Returns the new curried function.
				 * @example
				 *
				 * var curried = _.curry(function(a, b, c) {
     *   console.log(a + b + c);
     * });
				 *
				 * curried(1)(2)(3);
				 * // => 6
				 *
				 * curried(1, 2)(3);
				 * // => 6
				 *
				 * curried(1, 2, 3);
				 * // => 6
				 */
				function curry( func, arity ) {
					arity = typeof arity == 'number' ? arity : (+arity || func.length);
					return createWrapper( func, 4, null, null, null, arity );
				}

				/**
				 * Creates a function that will delay the execution of `func` until after
				 * `wait` milliseconds have elapsed since the last time it was invoked.
				 * Provide an options object to indicate that `func` should be invoked on
				 * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
				 * to the debounced function will return the result of the last `func` call.
				 *
				 * Note: If `leading` and `trailing` options are `true` `func` will be called
				 * on the trailing edge of the timeout only if the the debounced function is
				 * invoked more than once during the `wait` timeout.
				 *
				 * @static
				 * @memberOf _
				 * @category Functions
				 * @param {Function} func The function to debounce.
				 * @param {number} wait The number of milliseconds to delay.
				 * @param {Object} [options] The options object.
				 * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
				 * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
				 * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
				 * @returns {Function} Returns the new debounced function.
				 * @example
				 *
				 * // avoid costly calculations while the window size is in flux
				 * var lazyLayout = _.debounce(calculateLayout, 150);
				 * jQuery(window).on('resize', lazyLayout);
				 *
				 * // execute `sendMail` when the click event is fired, debouncing subsequent calls
				 * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * });
				 *
				 * // ensure `batchLog` is executed once after 1 second of debounced calls
				 * var source = new EventSource('/stream');
				 * source.addEventListener('message', _.debounce(batchLog, 250, {
     *   'maxWait': 1000
     * }, false);
				 */
				function debounce( func, wait, options ) {
					var args,
						maxTimeoutId,
						result,
						stamp,
						thisArg,
						timeoutId,
						trailingCall,
						lastCalled = 0,
						maxWait = false,
						trailing = true;

					if ( !isFunction( func ) ) {
						throw new TypeError;
					}
					wait = nativeMax( 0, wait ) || 0;
					if ( options === true ) {
						var leading = true;
						trailing = false;
					} else if ( isObject( options ) ) {
						leading = options.leading;
						maxWait = 'maxWait' in options && (nativeMax( wait, options.maxWait ) || 0);
						trailing = 'trailing' in options ? options.trailing : trailing;
					}
					var delayed = function () {
						var remaining = wait - (now() - stamp);
						if ( remaining <= 0 ) {
							if ( maxTimeoutId ) {
								clearTimeout( maxTimeoutId );
							}
							var isCalled = trailingCall;
							maxTimeoutId = timeoutId = trailingCall = undefined;
							if ( isCalled ) {
								lastCalled = now();
								result = func.apply( thisArg, args );
								if ( !timeoutId && !maxTimeoutId ) {
									args = thisArg = null;
								}
							}
						} else {
							timeoutId = setTimeout( delayed, remaining );
						}
					};

					var maxDelayed = function () {
						if ( timeoutId ) {
							clearTimeout( timeoutId );
						}
						maxTimeoutId = timeoutId = trailingCall = undefined;
						if ( trailing || (maxWait !== wait) ) {
							lastCalled = now();
							result = func.apply( thisArg, args );
							if ( !timeoutId && !maxTimeoutId ) {
								args = thisArg = null;
							}
						}
					};

					return function () {
						args = arguments;
						stamp = now();
						thisArg = this;
						trailingCall = trailing && (timeoutId || !leading);

						if ( maxWait === false ) {
							var leadingCall = leading && !timeoutId;
						} else {
							if ( !maxTimeoutId && !leading ) {
								lastCalled = stamp;
							}
							var remaining = maxWait - (stamp - lastCalled),
								isCalled = remaining <= 0;

							if ( isCalled ) {
								if ( maxTimeoutId ) {
									maxTimeoutId = clearTimeout( maxTimeoutId );
								}
								lastCalled = stamp;
								result = func.apply( thisArg, args );
							}
							else if ( !maxTimeoutId ) {
								maxTimeoutId = setTimeout( maxDelayed, remaining );
							}
						}
						if ( isCalled && timeoutId ) {
							timeoutId = clearTimeout( timeoutId );
						}
						else if ( !timeoutId && wait !== maxWait ) {
							timeoutId = setTimeout( delayed, wait );
						}
						if ( leadingCall ) {
							isCalled = true;
							result = func.apply( thisArg, args );
						}
						if ( isCalled && !timeoutId && !maxTimeoutId ) {
							args = thisArg = null;
						}
						return result;
					};
				}

				/**
				 * Defers executing the `func` function until the current call stack has cleared.
				 * Additional arguments will be provided to `func` when it is invoked.
				 *
				 * @static
				 * @memberOf _
				 * @category Functions
				 * @param {Function} func The function to defer.
				 * @param {...*} [arg] Arguments to invoke the function with.
				 * @returns {number} Returns the timer id.
				 * @example
				 *
				 * _.defer(function(text) { console.log(text); }, 'deferred');
				 * // logs 'deferred' after one or more milliseconds
				 */
				function defer( func ) {
					if ( !isFunction( func ) ) {
						throw new TypeError;
					}
					var args = slice( arguments, 1 );
					return setTimeout( function () { func.apply( undefined, args ); }, 1 );
				}

				/**
				 * Executes the `func` function after `wait` milliseconds. Additional arguments
				 * will be provided to `func` when it is invoked.
				 *
				 * @static
				 * @memberOf _
				 * @category Functions
				 * @param {Function} func The function to delay.
				 * @param {number} wait The number of milliseconds to delay execution.
				 * @param {...*} [arg] Arguments to invoke the function with.
				 * @returns {number} Returns the timer id.
				 * @example
				 *
				 * _.delay(function(text) { console.log(text); }, 1000, 'later');
				 * // => logs 'later' after one second
				 */
				function delay( func, wait ) {
					if ( !isFunction( func ) ) {
						throw new TypeError;
					}
					var args = slice( arguments, 2 );
					return setTimeout( function () { func.apply( undefined, args ); }, wait );
				}

				/**
				 * Creates a function that memoizes the result of `func`. If `resolver` is
				 * provided it will be used to determine the cache key for storing the result
				 * based on the arguments provided to the memoized function. By default, the
				 * first argument provided to the memoized function is used as the cache key.
				 * The `func` is executed with the `this` binding of the memoized function.
				 * The result cache is exposed as the `cache` property on the memoized function.
				 *
				 * @static
				 * @memberOf _
				 * @category Functions
				 * @param {Function} func The function to have its output memoized.
				 * @param {Function} [resolver] A function used to resolve the cache key.
				 * @returns {Function} Returns the new memoizing function.
				 * @example
				 *
				 * var fibonacci = _.memoize(function(n) {
     *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
     * });
				 *
				 * fibonacci(9)
				 * // => 34
				 *
				 * var data = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
				 *
				 * // modifying the result cache
				 * var get = _.memoize(function(name) { return data[name]; }, _.identity);
				 * get('pebbles');
				 * // => { 'name': 'pebbles', 'age': 1 }
				 *
				 * get.cache.pebbles.name = 'penelope';
				 * get('pebbles');
				 * // => { 'name': 'penelope', 'age': 1 }
				 */
				function memoize( func, resolver ) {
					if ( !isFunction( func ) ) {
						throw new TypeError;
					}
					var memoized = function () {
						var cache = memoized.cache,
							key = resolver ? resolver.apply( this, arguments ) : keyPrefix + arguments[0];

						return hasOwnProperty.call( cache, key )
							? cache[key]
							: (cache[key] = func.apply( this, arguments ));
					}
					memoized.cache = {};
					return memoized;
				}

				/**
				 * Creates a function that is restricted to execute `func` once. Repeat calls to
				 * the function will return the value of the first call. The `func` is executed
				 * with the `this` binding of the created function.
				 *
				 * @static
				 * @memberOf _
				 * @category Functions
				 * @param {Function} func The function to restrict.
				 * @returns {Function} Returns the new restricted function.
				 * @example
				 *
				 * var initialize = _.once(createApplication);
				 * initialize();
				 * initialize();
				 * // `initialize` executes `createApplication` once
				 */
				function once( func ) {
					var ran,
						result;

					if ( !isFunction( func ) ) {
						throw new TypeError;
					}
					return function () {
						if ( ran ) {
							return result;
						}
						ran = true;
						result = func.apply( this, arguments );

						// clear the `func` variable so the function may be garbage collected
						func = null;
						return result;
					};
				}

				/**
				 * Creates a function that, when called, invokes `func` with any additional
				 * `partial` arguments prepended to those provided to the new function. This
				 * method is similar to `_.bind` except it does **not** alter the `this` binding.
				 *
				 * @static
				 * @memberOf _
				 * @category Functions
				 * @param {Function} func The function to partially apply arguments to.
				 * @param {...*} [arg] Arguments to be partially applied.
				 * @returns {Function} Returns the new partially applied function.
				 * @example
				 *
				 * var greet = function(greeting, name) { return greeting + ' ' + name; };
				 * var hi = _.partial(greet, 'hi');
				 * hi('fred');
				 * // => 'hi fred'
				 */
				function partial( func ) {
					return createWrapper( func, 16, slice( arguments, 1 ) );
				}

				/**
				 * This method is like `_.partial` except that `partial` arguments are
				 * appended to those provided to the new function.
				 *
				 * @static
				 * @memberOf _
				 * @category Functions
				 * @param {Function} func The function to partially apply arguments to.
				 * @param {...*} [arg] Arguments to be partially applied.
				 * @returns {Function} Returns the new partially applied function.
				 * @example
				 *
				 * var defaultsDeep = _.partialRight(_.merge, _.defaults);
				 *
				 * var options = {
     *   'variable': 'data',
     *   'imports': { 'jq': $ }
     * };
				 *
				 * defaultsDeep(options, _.templateSettings);
				 *
				 * options.variable
				 * // => 'data'
				 *
				 * options.imports
				 * // => { '_': _, 'jq': $ }
				 */
				function partialRight( func ) {
					return createWrapper( func, 32, null, slice( arguments, 1 ) );
				}

				/**
				 * Creates a function that, when executed, will only call the `func` function
				 * at most once per every `wait` milliseconds. Provide an options object to
				 * indicate that `func` should be invoked on the leading and/or trailing edge
				 * of the `wait` timeout. Subsequent calls to the throttled function will
				 * return the result of the last `func` call.
				 *
				 * Note: If `leading` and `trailing` options are `true` `func` will be called
				 * on the trailing edge of the timeout only if the the throttled function is
				 * invoked more than once during the `wait` timeout.
				 *
				 * @static
				 * @memberOf _
				 * @category Functions
				 * @param {Function} func The function to throttle.
				 * @param {number} wait The number of milliseconds to throttle executions to.
				 * @param {Object} [options] The options object.
				 * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.
				 * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
				 * @returns {Function} Returns the new throttled function.
				 * @example
				 *
				 * // avoid excessively updating the position while scrolling
				 * var throttled = _.throttle(updatePosition, 100);
				 * jQuery(window).on('scroll', throttled);
				 *
				 * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes
				 * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
     *   'trailing': false
     * }));
				 */
				function throttle( func, wait, options ) {
					var leading = true,
						trailing = true;

					if ( !isFunction( func ) ) {
						throw new TypeError;
					}
					if ( options === false ) {
						leading = false;
					} else if ( isObject( options ) ) {
						leading = 'leading' in options ? options.leading : leading;
						trailing = 'trailing' in options ? options.trailing : trailing;
					}
					debounceOptions.leading = leading;
					debounceOptions.maxWait = wait;
					debounceOptions.trailing = trailing;

					return debounce( func, wait, debounceOptions );
				}

				/**
				 * Creates a function that provides `value` to the wrapper function as its
				 * first argument. Additional arguments provided to the function are appended
				 * to those provided to the wrapper function. The wrapper is executed with
				 * the `this` binding of the created function.
				 *
				 * @static
				 * @memberOf _
				 * @category Functions
				 * @param {*} value The value to wrap.
				 * @param {Function} wrapper The wrapper function.
				 * @returns {Function} Returns the new function.
				 * @example
				 *
				 * var p = _.wrap(_.escape, function(func, text) {
     *   return '<p>' + func(text) + '</p>';
     * });
				 *
				 * p('Fred, Wilma, & Pebbles');
				 * // => '<p>Fred, Wilma, &amp; Pebbles</p>'
				 */
				function wrap( value, wrapper ) {
					return createWrapper( wrapper, 16, [value] );
				}

				/*--------------------------------------------------------------------------*/

				/**
				 * Creates a function that returns `value`.
				 *
				 * @static
				 * @memberOf _
				 * @category Utilities
				 * @param {*} value The value to return from the new function.
				 * @returns {Function} Returns the new function.
				 * @example
				 *
				 * var object = { 'name': 'fred' };
				 * var getter = _.constant(object);
				 * getter() === object;
				 * // => true
				 */
				function constant( value ) {
					return function () {
						return value;
					};
				}

				/**
				 * Produces a callback bound to an optional `thisArg`. If `func` is a property
				 * name the created callback will return the property value for a given element.
				 * If `func` is an object the created callback will return `true` for elements
				 * that contain the equivalent object properties, otherwise it will return `false`.
				 *
				 * @static
				 * @memberOf _
				 * @category Utilities
				 * @param {*} [func=identity] The value to convert to a callback.
				 * @param {*} [thisArg] The `this` binding of the created callback.
				 * @param {number} [argCount] The number of arguments the callback accepts.
				 * @returns {Function} Returns a callback function.
				 * @example
				 *
				 * var characters = [
				 *   { 'name': 'barney', 'age': 36 },
				 *   { 'name': 'fred',   'age': 40 }
				 * ];
				 *
				 * // wrap to create custom callback shorthands
				 * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
     *   return !match ? func(callback, thisArg) : function(object) {
     *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
     *   };
     * });
				 *
				 * _.filter(characters, 'age__gt38');
				 * // => [{ 'name': 'fred', 'age': 40 }]
				 */
				function createCallback( func, thisArg, argCount ) {
					var type = typeof func;
					if ( func == null || type == 'function' ) {
						return baseCreateCallback( func, thisArg, argCount );
					}
					// handle "_.pluck" style callback shorthands
					if ( type != 'object' ) {
						return property( func );
					}
					var props = keys( func ),
						key = props[0],
						a = func[key];

					// handle "_.where" style callback shorthands
					if ( props.length == 1 && a === a && !isObject( a ) ) {
						// fast path the common case of providing an object with a single
						// property containing a primitive value
						return function ( object ) {
							var b = object[key];
							return a === b && (a !== 0 || (1 / a == 1 / b));
						};
					}
					return function ( object ) {
						var length = props.length,
							result = false;

						while ( length-- ) {
							if ( !(result = baseIsEqual( object[props[length]], func[props[length]], null, true )) ) {
								break;
							}
						}
						return result;
					};
				}

				/**
				 * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
				 * corresponding HTML entities.
				 *
				 * @static
				 * @memberOf _
				 * @category Utilities
				 * @param {string} string The string to escape.
				 * @returns {string} Returns the escaped string.
				 * @example
				 *
				 * _.escape('Fred, Wilma, & Pebbles');
				 * // => 'Fred, Wilma, &amp; Pebbles'
				 */
				function escape( string ) {
					return string == null ? '' : String( string ).replace( reUnescapedHtml, escapeHtmlChar );
				}

				/**
				 * This method returns the first argument provided to it.
				 *
				 * @static
				 * @memberOf _
				 * @category Utilities
				 * @param {*} value Any value.
				 * @returns {*} Returns `value`.
				 * @example
				 *
				 * var object = { 'name': 'fred' };
				 * _.identity(object) === object;
				 * // => true
				 */
				function identity( value ) {
					return value;
				}

				/**
				 * Adds function properties of a source object to the destination object.
				 * If `object` is a function methods will be added to its prototype as well.
				 *
				 * @static
				 * @memberOf _
				 * @category Utilities
				 * @param {Function|Object} [object=lodash] object The destination object.
				 * @param {Object} source The object of functions to add.
				 * @param {Object} [options] The options object.
				 * @param {boolean} [options.chain=true] Specify whether the functions added are chainable.
				 * @example
				 *
				 * function capitalize(string) {
     *   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
     * }
				 *
				 * _.mixin({ 'capitalize': capitalize });
				 * _.capitalize('fred');
				 * // => 'Fred'
				 *
				 * _('fred').capitalize().value();
				 * // => 'Fred'
				 *
				 * _.mixin({ 'capitalize': capitalize }, { 'chain': false });
				 * _('fred').capitalize();
				 * // => 'Fred'
				 */
				function mixin( object, source, options ) {
					var chain = true,
						methodNames = source && functions( source );

					if ( !source || (!options && !methodNames.length) ) {
						if ( options == null ) {
							options = source;
						}
						ctor = lodashWrapper;
						source = object;
						object = lodash;
						methodNames = functions( source );
					}
					if ( options === false ) {
						chain = false;
					} else if ( isObject( options ) && 'chain' in options ) {
						chain = options.chain;
					}
					var ctor = object,
						isFunc = isFunction( ctor );

					forEach( methodNames, function ( methodName ) {
						var func = object[methodName] = source[methodName];
						if ( isFunc ) {
							ctor.prototype[methodName] = function () {
								var chainAll = this.__chain__,
									value = this.__wrapped__,
									args = [value];

								push.apply( args, arguments );
								var result = func.apply( object, args );
								if ( chain || chainAll ) {
									if ( value === result && isObject( result ) ) {
										return this;
									}
									result = new ctor( result );
									result.__chain__ = chainAll;
								}
								return result;
							};
						}
					} );
				}

				/**
				 * Reverts the '_' variable to its previous value and returns a reference to
				 * the `lodash` function.
				 *
				 * @static
				 * @memberOf _
				 * @category Utilities
				 * @returns {Function} Returns the `lodash` function.
				 * @example
				 *
				 * var lodash = _.noConflict();
				 */
				function noConflict() {
					context._ = oldDash;
					return this;
				}

				/**
				 * A no-operation function.
				 *
				 * @static
				 * @memberOf _
				 * @category Utilities
				 * @example
				 *
				 * var object = { 'name': 'fred' };
				 * _.noop(object) === undefined;
				 * // => true
				 */
				function noop() {
					// no operation performed
				}

				/**
				 * Gets the number of milliseconds that have elapsed since the Unix epoch
				 * (1 January 1970 00:00:00 UTC).
				 *
				 * @static
				 * @memberOf _
				 * @category Utilities
				 * @example
				 *
				 * var stamp = _.now();
				 * _.defer(function() { console.log(_.now() - stamp); });
				 * // => logs the number of milliseconds it took for the deferred function to be called
				 */
				var now = reNative.test( now = Date.now ) && now || function () {
					return new Date().getTime();
				};

				/**
				 * Converts the given value into an integer of the specified radix.
				 * If `radix` is `undefined` or `0` a `radix` of `10` is used unless the
				 * `value` is a hexadecimal, in which case a `radix` of `16` is used.
				 *
				 * Note: This method avoids differences in native ES3 and ES5 `parseInt`
				 * implementations. See http://es5.github.io/#E.
				 *
				 * @static
				 * @memberOf _
				 * @category Utilities
				 * @param {string} value The value to parse.
				 * @param {number} [radix] The radix used to interpret the value to parse.
				 * @returns {number} Returns the new integer value.
				 * @example
				 *
				 * _.parseInt('08');
				 * // => 8
				 */
				var parseInt = nativeParseInt( whitespace + '08' ) == 8 ? nativeParseInt : function ( value, radix ) {
					// Firefox < 21 and Opera < 15 follow the ES3 specified implementation of `parseInt`
					return nativeParseInt( isString( value ) ? value.replace( reLeadingSpacesAndZeros, '' ) : value, radix || 0 );
				};

				/**
				 * Creates a "_.pluck" style function, which returns the `key` value of a
				 * given object.
				 *
				 * @static
				 * @memberOf _
				 * @category Utilities
				 * @param {string} key The name of the property to retrieve.
				 * @returns {Function} Returns the new function.
				 * @example
				 *
				 * var characters = [
				 *   { 'name': 'fred',   'age': 40 },
				 *   { 'name': 'barney', 'age': 36 }
				 * ];
				 *
				 * var getName = _.property('name');
				 *
				 * _.map(characters, getName);
				 * // => ['barney', 'fred']
				 *
				 * _.sortBy(characters, getName);
				 * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
				 */
				function property( key ) {
					return function ( object ) {
						return object[key];
					};
				}

				/**
				 * Produces a random number between `min` and `max` (inclusive). If only one
				 * argument is provided a number between `0` and the given number will be
				 * returned. If `floating` is truey or either `min` or `max` are floats a
				 * floating-point number will be returned instead of an integer.
				 *
				 * @static
				 * @memberOf _
				 * @category Utilities
				 * @param {number} [min=0] The minimum possible value.
				 * @param {number} [max=1] The maximum possible value.
				 * @param {boolean} [floating=false] Specify returning a floating-point number.
				 * @returns {number} Returns a random number.
				 * @example
				 *
				 * _.random(0, 5);
				 * // => an integer between 0 and 5
				 *
				 * _.random(5);
				 * // => also an integer between 0 and 5
				 *
				 * _.random(5, true);
				 * // => a floating-point number between 0 and 5
				 *
				 * _.random(1.2, 5.2);
				 * // => a floating-point number between 1.2 and 5.2
				 */
				function random( min, max, floating ) {
					var noMin = min == null,
						noMax = max == null;

					if ( floating == null ) {
						if ( typeof min == 'boolean' && noMax ) {
							floating = min;
							min = 1;
						}
						else if ( !noMax && typeof max == 'boolean' ) {
							floating = max;
							noMax = true;
						}
					}
					if ( noMin && noMax ) {
						max = 1;
					}
					min = +min || 0;
					if ( noMax ) {
						max = min;
						min = 0;
					} else {
						max = +max || 0;
					}
					if ( floating || min % 1 || max % 1 ) {
						var rand = nativeRandom();
						return nativeMin( min + (rand * (max - min + parseFloat( '1e-' + ((rand + '').length - 1) ))), max );
					}
					return baseRandom( min, max );
				}

				/**
				 * Resolves the value of property `key` on `object`. If `key` is a function
				 * it will be invoked with the `this` binding of `object` and its result returned,
				 * else the property value is returned. If `object` is falsey then `undefined`
				 * is returned.
				 *
				 * @static
				 * @memberOf _
				 * @category Utilities
				 * @param {Object} object The object to inspect.
				 * @param {string} key The name of the property to resolve.
				 * @returns {*} Returns the resolved value.
				 * @example
				 *
				 * var object = {
     *   'cheese': 'crumpets',
     *   'stuff': function() {
     *     return 'nonsense';
     *   }
     * };
				 *
				 * _.result(object, 'cheese');
				 * // => 'crumpets'
				 *
				 * _.result(object, 'stuff');
				 * // => 'nonsense'
				 */
				function result( object, key ) {
					if ( object ) {
						var value = object[key];
						return isFunction( value ) ? object[key]() : value;
					}
				}

				/**
				 * A micro-templating method that handles arbitrary delimiters, preserves
				 * whitespace, and correctly escapes quotes within interpolated code.
				 *
				 * Note: In the development build, `_.template` utilizes sourceURLs for easier
				 * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
				 *
				 * For more information on precompiling templates see:
				 * http://lodash.com/custom-builds
				 *
				 * For more information on Chrome extension sandboxes see:
				 * http://developer.chrome.com/stable/extensions/sandboxingEval.html
				 *
				 * @static
				 * @memberOf _
				 * @category Utilities
				 * @param {string} text The template text.
				 * @param {Object} data The data object used to populate the text.
				 * @param {Object} [options] The options object.
				 * @param {RegExp} [options.escape] The "escape" delimiter.
				 * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
				 * @param {Object} [options.imports] An object to import into the template as local variables.
				 * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
				 * @param {string} [sourceURL] The sourceURL of the template's compiled source.
				 * @param {string} [variable] The data object variable name.
				 * @returns {Function|string} Returns a compiled function when no `data` object
				 *  is given, else it returns the interpolated text.
				 * @example
				 *
				 * // using the "interpolate" delimiter to create a compiled template
				 * var compiled = _.template('hello <%= name %>');
				 * compiled({ 'name': 'fred' });
				 * // => 'hello fred'
				 *
				 * // using the "escape" delimiter to escape HTML in data property values
				 * _.template('<b><%- value %></b>', { 'value': '<script>' });
				 * // => '<b>&lt;script&gt;</b>'
				 *
				 * // using the "evaluate" delimiter to generate HTML
				 * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
				 * _.template(list, { 'people': ['fred', 'barney'] });
				 * // => '<li>fred</li><li>barney</li>'
				 *
				 * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
				 * _.template('hello ${ name }', { 'name': 'pebbles' });
				 * // => 'hello pebbles'
				 *
				 * // using the internal `print` function in "evaluate" delimiters
				 * _.template('<% print("hello " + name); %>!', { 'name': 'barney' });
				 * // => 'hello barney!'
				 *
				 * // using a custom template delimiters
				 * _.templateSettings = {
     *   'interpolate': /{{([\s\S]+?)}}/g
     * };
				 *
				 * _.template('hello {{ name }}!', { 'name': 'mustache' });
				 * // => 'hello mustache!'
				 *
				 * // using the `imports` option to import jQuery
				 * var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';
				 * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { 'jq': jQuery } });
				 * // => '<li>fred</li><li>barney</li>'
				 *
				 * // using the `sourceURL` option to specify a custom sourceURL for the template
				 * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
				 * compiled(data);
				 * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
				 *
				 * // using the `variable` option to ensure a with-statement isn't used in the compiled template
				 * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });
				 * compiled.source;
				 * // => function(data) {
     *   var __t, __p = '', __e = _.escape;
     *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
     *   return __p;
     * }
				 *
				 * // using the `source` property to inline compiled templates for meaningful
				 * // line numbers in error messages and a stack trace
				 * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
				 *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
				 * ');
				 */
				function template( text, data, options ) {
					// based on John Resig's `tmpl` implementation
					// http://ejohn.org/blog/javascript-micro-templating/
					// and Laura Doktorova's doT.js
					// https://github.com/olado/doT
					var settings = lodash.templateSettings;
					text = String( text || '' );

					// avoid missing dependencies when `iteratorTemplate` is not defined
					options = defaults( {}, options, settings );

					var imports = defaults( {}, options.imports, settings.imports ),
						importsKeys = keys( imports ),
						importsValues = values( imports );

					var isEvaluating,
						index = 0,
						interpolate = options.interpolate || reNoMatch,
						source = "__p += '";

					// compile the regexp to match each delimiter
					var reDelimiters = RegExp(
							(options.escape || reNoMatch).source + '|' +
							interpolate.source + '|' +
							(interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
							(options.evaluate || reNoMatch).source + '|$'
						, 'g' );

					text.replace( reDelimiters, function ( match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset ) {
						interpolateValue || (interpolateValue = esTemplateValue);

						// escape characters that cannot be included in string literals
						source += text.slice( index, offset ).replace( reUnescapedString, escapeStringChar );

						// replace delimiters with snippets
						if ( escapeValue ) {
							source += "' +\n__e(" + escapeValue + ") +\n'";
						}
						if ( evaluateValue ) {
							isEvaluating = true;
							source += "';\n" + evaluateValue + ";\n__p += '";
						}
						if ( interpolateValue ) {
							source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
						}
						index = offset + match.length;

						// the JS engine embedded in Adobe products requires returning the `match`
						// string in order to produce the correct `offset` value
						return match;
					} );

					source += "';\n";

					// if `variable` is not specified, wrap a with-statement around the generated
					// code to add the data object to the top of the scope chain
					var variable = options.variable,
						hasVariable = variable;

					if ( !hasVariable ) {
						variable = 'obj';
						source = 'with (' + variable + ') {\n' + source + '\n}\n';
					}
					// cleanup code by stripping empty strings
					source = (isEvaluating ? source.replace( reEmptyStringLeading, '' ) : source)
						.replace( reEmptyStringMiddle, '$1' )
						.replace( reEmptyStringTrailing, '$1;' );

					// frame code as the function body
					source = 'function(' + variable + ') {\n' +
						(hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
						"var __t, __p = '', __e = _.escape" +
						(isEvaluating
							? ', __j = Array.prototype.join;\n' +
							"function print() { __p += __j.call(arguments, '') }\n"
							: ';\n'
							) +
						source +
						'return __p\n}';

					// Use a sourceURL for easier debugging.
					// http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
					var sourceURL = '\n/*\n//# sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']') + '\n*/';

					try {
						var result = Function( importsKeys, 'return ' + source + sourceURL ).apply( undefined, importsValues );
					} catch ( e ) {
						e.source = source;
						throw e;
					}
					if ( data ) {
						return result( data );
					}
					// provide the compiled function's source by its `toString` method, in
					// supported environments, or the `source` property as a convenience for
					// inlining compiled templates during the build process
					result.source = source;
					return result;
				}

				/**
				 * Executes the callback `n` times, returning an array of the results
				 * of each callback execution. The callback is bound to `thisArg` and invoked
				 * with one argument; (index).
				 *
				 * @static
				 * @memberOf _
				 * @category Utilities
				 * @param {number} n The number of times to execute the callback.
				 * @param {Function} callback The function called per iteration.
				 * @param {*} [thisArg] The `this` binding of `callback`.
				 * @returns {Array} Returns an array of the results of each `callback` execution.
				 * @example
				 *
				 * var diceRolls = _.times(3, _.partial(_.random, 1, 6));
				 * // => [3, 6, 4]
				 *
				 * _.times(3, function(n) { mage.castSpell(n); });
				 * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively
				 *
				 * _.times(3, function(n) { this.cast(n); }, mage);
				 * // => also calls `mage.castSpell(n)` three times
				 */
				function times( n, callback, thisArg ) {
					n = (n = +n) > -1 ? n : 0;
					var index = -1,
						result = Array( n );

					callback = baseCreateCallback( callback, thisArg, 1 );
					while ( ++index < n ) {
						result[index] = callback( index );
					}
					return result;
				}

				/**
				 * The inverse of `_.escape` this method converts the HTML entities
				 * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to their
				 * corresponding characters.
				 *
				 * @static
				 * @memberOf _
				 * @category Utilities
				 * @param {string} string The string to unescape.
				 * @returns {string} Returns the unescaped string.
				 * @example
				 *
				 * _.unescape('Fred, Barney &amp; Pebbles');
				 * // => 'Fred, Barney & Pebbles'
				 */
				function unescape( string ) {
					return string == null ? '' : String( string ).replace( reEscapedHtml, unescapeHtmlChar );
				}

				/**
				 * Generates a unique ID. If `prefix` is provided the ID will be appended to it.
				 *
				 * @static
				 * @memberOf _
				 * @category Utilities
				 * @param {string} [prefix] The value to prefix the ID with.
				 * @returns {string} Returns the unique ID.
				 * @example
				 *
				 * _.uniqueId('contact_');
				 * // => 'contact_104'
				 *
				 * _.uniqueId();
				 * // => '105'
				 */
				function uniqueId( prefix ) {
					var id = ++idCounter;
					return String( prefix == null ? '' : prefix ) + id;
				}

				/*--------------------------------------------------------------------------*/

				/**
				 * Creates a `lodash` object that wraps the given value with explicit
				 * method chaining enabled.
				 *
				 * @static
				 * @memberOf _
				 * @category Chaining
				 * @param {*} value The value to wrap.
				 * @returns {Object} Returns the wrapper object.
				 * @example
				 *
				 * var characters = [
				 *   { 'name': 'barney',  'age': 36 },
				 *   { 'name': 'fred',    'age': 40 },
				 *   { 'name': 'pebbles', 'age': 1 }
				 * ];
				 *
				 * var youngest = _.chain(characters)
				 *     .sortBy('age')
				 *     .map(function(chr) { return chr.name + ' is ' + chr.age; })
				 *     .first()
				 *     .value();
				 * // => 'pebbles is 1'
				 */
				function chain( value ) {
					value = new lodashWrapper( value );
					value.__chain__ = true;
					return value;
				}

				/**
				 * Invokes `interceptor` with the `value` as the first argument and then
				 * returns `value`. The purpose of this method is to "tap into" a method
				 * chain in order to perform operations on intermediate results within
				 * the chain.
				 *
				 * @static
				 * @memberOf _
				 * @category Chaining
				 * @param {*} value The value to provide to `interceptor`.
				 * @param {Function} interceptor The function to invoke.
				 * @returns {*} Returns `value`.
				 * @example
				 *
				 * _([1, 2, 3, 4])
				 *  .tap(function(array) { array.pop(); })
				 *  .reverse()
				 *  .value();
				 * // => [3, 2, 1]
				 */
				function tap( value, interceptor ) {
					interceptor( value );
					return value;
				}

				/**
				 * Enables explicit method chaining on the wrapper object.
				 *
				 * @name chain
				 * @memberOf _
				 * @category Chaining
				 * @returns {*} Returns the wrapper object.
				 * @example
				 *
				 * var characters = [
				 *   { 'name': 'barney', 'age': 36 },
				 *   { 'name': 'fred',   'age': 40 }
				 * ];
				 *
				 * // without explicit chaining
				 * _(characters).first();
				 * // => { 'name': 'barney', 'age': 36 }
				 *
				 * // with explicit chaining
				 * _(characters).chain()
				 *   .first()
				 *   .pick('age')
				 *   .value();
				 * // => { 'age': 36 }
				 */
				function wrapperChain() {
					this.__chain__ = true;
					return this;
				}

				/**
				 * Produces the `toString` result of the wrapped value.
				 *
				 * @name toString
				 * @memberOf _
				 * @category Chaining
				 * @returns {string} Returns the string result.
				 * @example
				 *
				 * _([1, 2, 3]).toString();
				 * // => '1,2,3'
				 */
				function wrapperToString() {
					return String( this.__wrapped__ );
				}

				/**
				 * Extracts the wrapped value.
				 *
				 * @name valueOf
				 * @memberOf _
				 * @alias value
				 * @category Chaining
				 * @returns {*} Returns the wrapped value.
				 * @example
				 *
				 * _([1, 2, 3]).valueOf();
				 * // => [1, 2, 3]
				 */
				function wrapperValueOf() {
					return this.__wrapped__;
				}

				/*--------------------------------------------------------------------------*/

				// add functions that return wrapped values when chaining
				lodash.after = after;
				lodash.assign = assign;
				lodash.at = at;
				lodash.bind = bind;
				lodash.bindAll = bindAll;
				lodash.bindKey = bindKey;
				lodash.chain = chain;
				lodash.compact = compact;
				lodash.compose = compose;
				lodash.constant = constant;
				lodash.countBy = countBy;
				lodash.create = create;
				lodash.createCallback = createCallback;
				lodash.curry = curry;
				lodash.debounce = debounce;
				lodash.defaults = defaults;
				lodash.defer = defer;
				lodash.delay = delay;
				lodash.difference = difference;
				lodash.filter = filter;
				lodash.flatten = flatten;
				lodash.forEach = forEach;
				lodash.forEachRight = forEachRight;
				lodash.forIn = forIn;
				lodash.forInRight = forInRight;
				lodash.forOwn = forOwn;
				lodash.forOwnRight = forOwnRight;
				lodash.functions = functions;
				lodash.groupBy = groupBy;
				lodash.indexBy = indexBy;
				lodash.initial = initial;
				lodash.intersection = intersection;
				lodash.invert = invert;
				lodash.invoke = invoke;
				lodash.keys = keys;
				lodash.map = map;
				lodash.mapValues = mapValues;
				lodash.max = max;
				lodash.memoize = memoize;
				lodash.merge = merge;
				lodash.min = min;
				lodash.omit = omit;
				lodash.once = once;
				lodash.pairs = pairs;
				lodash.partial = partial;
				lodash.partialRight = partialRight;
				lodash.pick = pick;
				lodash.pluck = pluck;
				lodash.property = property;
				lodash.pull = pull;
				lodash.range = range;
				lodash.reject = reject;
				lodash.remove = remove;
				lodash.rest = rest;
				lodash.shuffle = shuffle;
				lodash.sortBy = sortBy;
				lodash.tap = tap;
				lodash.throttle = throttle;
				lodash.times = times;
				lodash.toArray = toArray;
				lodash.transform = transform;
				lodash.union = union;
				lodash.uniq = uniq;
				lodash.values = values;
				lodash.where = where;
				lodash.without = without;
				lodash.wrap = wrap;
				lodash.xor = xor;
				lodash.zip = zip;
				lodash.zipObject = zipObject;

				// add aliases
				lodash.collect = map;
				lodash.drop = rest;
				lodash.each = forEach;
				lodash.eachRight = forEachRight;
				lodash.extend = assign;
				lodash.methods = functions;
				lodash.object = zipObject;
				lodash.select = filter;
				lodash.tail = rest;
				lodash.unique = uniq;
				lodash.unzip = zip;

				// add functions to `lodash.prototype`
				mixin( lodash );

				/*--------------------------------------------------------------------------*/

				// add functions that return unwrapped values when chaining
				lodash.clone = clone;
				lodash.cloneDeep = cloneDeep;
				lodash.contains = contains;
				lodash.escape = escape;
				lodash.every = every;
				lodash.find = find;
				lodash.findIndex = findIndex;
				lodash.findKey = findKey;
				lodash.findLast = findLast;
				lodash.findLastIndex = findLastIndex;
				lodash.findLastKey = findLastKey;
				lodash.has = has;
				lodash.identity = identity;
				lodash.indexOf = indexOf;
				lodash.isArguments = isArguments;
				lodash.isArray = isArray;
				lodash.isBoolean = isBoolean;
				lodash.isDate = isDate;
				lodash.isElement = isElement;
				lodash.isEmpty = isEmpty;
				lodash.isEqual = isEqual;
				lodash.isFinite = isFinite;
				lodash.isFunction = isFunction;
				lodash.isNaN = isNaN;
				lodash.isNull = isNull;
				lodash.isNumber = isNumber;
				lodash.isObject = isObject;
				lodash.isPlainObject = isPlainObject;
				lodash.isRegExp = isRegExp;
				lodash.isString = isString;
				lodash.isUndefined = isUndefined;
				lodash.lastIndexOf = lastIndexOf;
				lodash.mixin = mixin;
				lodash.noConflict = noConflict;
				lodash.noop = noop;
				lodash.now = now;
				lodash.parseInt = parseInt;
				lodash.random = random;
				lodash.reduce = reduce;
				lodash.reduceRight = reduceRight;
				lodash.result = result;
				lodash.runInContext = runInContext;
				lodash.size = size;
				lodash.some = some;
				lodash.sortedIndex = sortedIndex;
				lodash.template = template;
				lodash.unescape = unescape;
				lodash.uniqueId = uniqueId;

				// add aliases
				lodash.all = every;
				lodash.any = some;
				lodash.detect = find;
				lodash.findWhere = find;
				lodash.foldl = reduce;
				lodash.foldr = reduceRight;
				lodash.include = contains;
				lodash.inject = reduce;

				mixin( function () {
					var source = {}
					forOwn( lodash, function ( func, methodName ) {
						if ( !lodash.prototype[methodName] ) {
							source[methodName] = func;
						}
					} );
					return source;
				}(), false );

				/*--------------------------------------------------------------------------*/

				// add functions capable of returning wrapped and unwrapped values when chaining
				lodash.first = first;
				lodash.last = last;
				lodash.sample = sample;

				// add aliases
				lodash.take = first;
				lodash.head = first;

				forOwn( lodash, function ( func, methodName ) {
					var callbackable = methodName !== 'sample';
					if ( !lodash.prototype[methodName] ) {
						lodash.prototype[methodName] = function ( n, guard ) {
							var chainAll = this.__chain__,
								result = func( this.__wrapped__, n, guard );

							return !chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))
								? result
								: new lodashWrapper( result, chainAll );
						};
					}
				} );

				/*--------------------------------------------------------------------------*/

				/**
				 * The semantic version number.
				 *
				 * @static
				 * @memberOf _
				 * @type string
				 */
				lodash.VERSION = '2.4.0';

				// add "Chaining" functions to the wrapper
				lodash.prototype.chain = wrapperChain;
				lodash.prototype.toString = wrapperToString;
				lodash.prototype.value = wrapperValueOf;
				lodash.prototype.valueOf = wrapperValueOf;

				// add `Array` functions that return unwrapped values
				forEach( ['join', 'pop', 'shift'], function ( methodName ) {
					var func = arrayRef[methodName];
					lodash.prototype[methodName] = function () {
						var chainAll = this.__chain__,
							result = func.apply( this.__wrapped__, arguments );

						return chainAll
							? new lodashWrapper( result, chainAll )
							: result;
					};
				} );

				// add `Array` functions that return the existing wrapped value
				forEach( ['push', 'reverse', 'sort', 'unshift'], function ( methodName ) {
					var func = arrayRef[methodName];
					lodash.prototype[methodName] = function () {
						func.apply( this.__wrapped__, arguments );
						return this;
					};
				} );

				// add `Array` functions that return new wrapped values
				forEach( ['concat', 'slice', 'splice'], function ( methodName ) {
					var func = arrayRef[methodName];
					lodash.prototype[methodName] = function () {
						return new lodashWrapper( func.apply( this.__wrapped__, arguments ), this.__chain__ );
					};
				} );

				return lodash;
			}

			/*--------------------------------------------------------------------------*/

			// expose Lo-Dash
			var _ = runInContext();

			// some AMD build optimizers like r.js check for condition patterns like the following:
			if ( typeof define == 'function' && typeof define.amd == 'object' && define.amd ) {
				// Expose Lo-Dash to the global object even when an AMD loader is present in
				// case Lo-Dash is loaded with a RequireJS shim config.
				// See http://requirejs.org/docs/api.html#config-shim
				root._ = _;

				// define as an anonymous module so, through path mapping, it can be
				// referenced as the "underscore" module
				define( function () {
					return _;
				} );
			}
			// check for `exports` after `define` in case a build optimizer adds an `exports` object
			else if ( freeExports && freeModule ) {
				// in Node.js or RingoJS
				if ( moduleExports ) {
					(freeModule.exports = _)._ = _;
				}
				// in Narwhal or Rhino -require
				else {
					freeExports._ = _;
				}
			}
			else {
				// in a browser or Rhino
				root._ = _;
			}
		}.call( this ));

	}).call( this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {} )
}, {}], 13                                                                                                                              : [function ( require, module, exports ) {
	/*jslint onevar:true, undef:true, newcap:true, regexp:true, bitwise:true, maxerr:50, indent:4, white:false, nomen:false, plusplus:false */
	/*global define:false, require:false, exports:false, module:false, signals:false */

	/** @license
	 * JS Signals <http://millermedeiros.github.com/js-signals/>
	 * Released under the MIT license
	 * Author: Miller Medeiros
	 * Version: 1.0.0 - Build: 268 (2012/11/29 05:48 PM)
	 */

	(function ( global ) {

		// SignalBinding -------------------------------------------------
		//================================================================

		/**
		 * Object that represents a binding between a Signal and a listener function.
		 * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
		 * <br />- inspired by Joa Ebert AS3 SignalBinding and Robert Penner's Slot classes.
		 * @author Miller Medeiros
		 * @constructor
		 * @internal
		 * @name SignalBinding
		 * @param {Signal} signal Reference to Signal object that listener is currently bound to.
		 * @param {Function} listener Handler function bound to the signal.
		 * @param {boolean} isOnce If binding should be executed just once.
		 * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
		 * @param {Number} [priority] The priority level of the event listener. (default = 0).
		 */
		function SignalBinding( signal, listener, isOnce, listenerContext, priority ) {

			/**
			 * Handler function bound to the signal.
			 * @type Function
			 * @private
			 */
			this._listener = listener;

			/**
			 * If binding should be executed just once.
			 * @type boolean
			 * @private
			 */
			this._isOnce = isOnce;

			/**
			 * Context on which listener will be executed (object that should represent the `this` variable inside listener function).
			 * @memberOf SignalBinding.prototype
			 * @name context
			 * @type Object|undefined|null
			 */
			this.context = listenerContext;

			/**
			 * Reference to Signal object that listener is currently bound to.
			 * @type Signal
			 * @private
			 */
			this._signal = signal;

			/**
			 * Listener priority
			 * @type Number
			 * @private
			 */
			this._priority = priority || 0;
		}

		SignalBinding.prototype = {

			/**
			 * If binding is active and should be executed.
			 * @type boolean
			 */
			active : true,

			/**
			 * Default parameters passed to listener during `Signal.dispatch` and `SignalBinding.execute`. (curried parameters)
			 * @type Array|null
			 */
			params : null,

			/**
			 * Call listener passing arbitrary parameters.
			 * <p>If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.</p>
			 * @param {Array} [paramsArr] Array of parameters that should be passed to the listener
			 * @return {*} Value returned by the listener.
			 */
			execute : function ( paramsArr ) {
				var handlerReturn, params;
				if ( this.active && !!this._listener ) {
					params = this.params ? this.params.concat( paramsArr ) : paramsArr;
					handlerReturn = this._listener.apply( this.context, params );
					if ( this._isOnce ) {
						this.detach();
					}
				}
				return handlerReturn;
			},

			/**
			 * Detach binding from signal.
			 * - alias to: mySignal.remove(myBinding.getListener());
			 * @return {Function|null} Handler function bound to the signal or `null` if binding was previously detached.
			 */
			detach : function () {
				return this.isBound() ? this._signal.remove( this._listener, this.context ) : null;
			},

			/**
			 * @return {Boolean} `true` if binding is still bound to the signal and have a listener.
			 */
			isBound : function () {
				return (!!this._signal && !!this._listener);
			},

			/**
			 * @return {boolean} If SignalBinding will only be executed once.
			 */
			isOnce : function () {
				return this._isOnce;
			},

			/**
			 * @return {Function} Handler function bound to the signal.
			 */
			getListener : function () {
				return this._listener;
			},

			/**
			 * @return {Signal} Signal that listener is currently bound to.
			 */
			getSignal : function () {
				return this._signal;
			},

			/**
			 * Delete instance properties
			 * @private
			 */
			_destroy : function () {
				delete this._signal;
				delete this._listener;
				delete this.context;
			},

			/**
			 * @return {string} String representation of the object.
			 */
			toString : function () {
				return '[SignalBinding isOnce:' + this._isOnce + ', isBound:' + this.isBound() + ', active:' + this.active + ']';
			}

		};

		/*global SignalBinding:false*/

		// Signal --------------------------------------------------------
		//================================================================

		function validateListener( listener, fnName ) {
			if ( typeof listener !== 'function' ) {
				throw new Error( 'listener is a required param of {fn}() and should be a Function.'.replace( '{fn}', fnName ) );
			}
		}

		/**
		 * Custom event broadcaster
		 * <br />- inspired by Robert Penner's AS3 Signals.
		 * @name Signal
		 * @author Miller Medeiros
		 * @constructor
		 */
		function Signal() {
			/**
			 * @type Array.<SignalBinding>
			 * @private
			 */
			this._bindings = [];
			this._prevParams = null;

			// enforce dispatch to aways work on same context (#47)
			var self = this;
			this.dispatch = function () {
				Signal.prototype.dispatch.apply( self, arguments );
			};
		}

		Signal.prototype = {

			/**
			 * Signals Version Number
			 * @type String
			 * @const
			 */
			VERSION : '1.0.0',

			/**
			 * If Signal should keep record of previously dispatched parameters and
			 * automatically execute listener during `add()`/`addOnce()` if Signal was
			 * already dispatched before.
			 * @type boolean
			 */
			memorize : false,

			/**
			 * @type boolean
			 * @private
			 */
			_shouldPropagate : true,

			/**
			 * If Signal is active and should broadcast events.
			 * <p><strong>IMPORTANT:</strong> Setting this property during a dispatch will only affect the next dispatch, if you want to stop the propagation of a signal use `halt()` instead.</p>
			 * @type boolean
			 */
			active : true,

			/**
			 * @param {Function} listener
			 * @param {boolean} isOnce
			 * @param {Object} [listenerContext]
			 * @param {Number} [priority]
			 * @return {SignalBinding}
			 * @private
			 */
			_registerListener : function ( listener, isOnce, listenerContext, priority ) {

				var prevIndex = this._indexOfListener( listener, listenerContext ),
					binding;

				if ( prevIndex !== -1 ) {
					binding = this._bindings[prevIndex];
					if ( binding.isOnce() !== isOnce ) {
						throw new Error( 'You cannot add' + (isOnce ? '' : 'Once') + '() then add' + (!isOnce ? '' : 'Once') + '() the same listener without removing the relationship first.' );
					}
				} else {
					binding = new SignalBinding( this, listener, isOnce, listenerContext, priority );
					this._addBinding( binding );
				}

				if ( this.memorize && this._prevParams ) {
					binding.execute( this._prevParams );
				}

				return binding;
			},

			/**
			 * @param {SignalBinding} binding
			 * @private
			 */
			_addBinding : function ( binding ) {
				//simplified insertion sort
				var n = this._bindings.length;
				do { --n; } while ( this._bindings[n] && binding._priority <= this._bindings[n]._priority );
				this._bindings.splice( n + 1, 0, binding );
			},

			/**
			 * @param {Function} listener
			 * @return {number}
			 * @private
			 */
			_indexOfListener : function ( listener, context ) {
				var n = this._bindings.length,
					cur;
				while ( n-- ) {
					cur = this._bindings[n];
					if ( cur._listener === listener && cur.context === context ) {
						return n;
					}
				}
				return -1;
			},

			/**
			 * Check if listener was attached to Signal.
			 * @param {Function} listener
			 * @param {Object} [context]
			 * @return {boolean} if Signal has the specified listener.
			 */
			has : function ( listener, context ) {
				return this._indexOfListener( listener, context ) !== -1;
			},

			/**
			 * Add a listener to the signal.
			 * @param {Function} listener Signal handler function.
			 * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
			 * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
			 * @return {SignalBinding} An Object representing the binding between the Signal and listener.
			 */
			add : function ( listener, listenerContext, priority ) {
				validateListener( listener, 'add' );
				return this._registerListener( listener, false, listenerContext, priority );
			},

			/**
			 * Add listener to the signal that should be removed after first execution (will be executed only once).
			 * @param {Function} listener Signal handler function.
			 * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
			 * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
			 * @return {SignalBinding} An Object representing the binding between the Signal and listener.
			 */
			addOnce : function ( listener, listenerContext, priority ) {
				validateListener( listener, 'addOnce' );
				return this._registerListener( listener, true, listenerContext, priority );
			},

			/**
			 * Remove a single listener from the dispatch queue.
			 * @param {Function} listener Handler function that should be removed.
			 * @param {Object} [context] Execution context (since you can add the same handler multiple times if executing in a different context).
			 * @return {Function} Listener handler function.
			 */
			remove : function ( listener, context ) {
				validateListener( listener, 'remove' );

				var i = this._indexOfListener( listener, context );
				if ( i !== -1 ) {
					this._bindings[i]._destroy(); //no reason to a SignalBinding exist if it isn't attached to a signal
					this._bindings.splice( i, 1 );
				}
				return listener;
			},

			/**
			 * Remove all listeners from the Signal.
			 */
			removeAll : function () {
				var n = this._bindings.length;
				while ( n-- ) {
					this._bindings[n]._destroy();
				}
				this._bindings.length = 0;
			},

			/**
			 * @return {number} Number of listeners attached to the Signal.
			 */
			getNumListeners : function () {
				return this._bindings.length;
			},

			/**
			 * Stop propagation of the event, blocking the dispatch to next listeners on the queue.
			 * <p><strong>IMPORTANT:</strong> should be called only during signal dispatch, calling it before/after dispatch won't affect signal broadcast.</p>
			 * @see Signal.prototype.disable
			 */
			halt : function () {
				this._shouldPropagate = false;
			},

			/**
			 * Dispatch/Broadcast Signal to all listeners added to the queue.
			 * @param {...*} [params] Parameters that should be passed to each handler.
			 */
			dispatch : function ( params ) {
				if ( !this.active ) {
					return;
				}

				var paramsArr = Array.prototype.slice.call( arguments ),
					n = this._bindings.length,
					bindings;

				if ( this.memorize ) {
					this._prevParams = paramsArr;
				}

				if ( !n ) {
					//should come after memorize
					return;
				}

				bindings = this._bindings.slice(); //clone array in case add/remove items during dispatch
				this._shouldPropagate = true; //in case `halt` was called before dispatch or during the previous dispatch.

				//execute all callbacks until end of the list or until a callback returns `false` or stops propagation
				//reverse loop since listeners with higher priority will be added at the end of the list
				do { n--; } while ( bindings[n] && this._shouldPropagate && bindings[n].execute( paramsArr ) !== false );
			},

			/**
			 * Forget memorized arguments.
			 * @see Signal.memorize
			 */
			forget : function () {
				this._prevParams = null;
			},

			/**
			 * Remove all bindings from signal and destroy any reference to external objects (destroy Signal object).
			 * <p><strong>IMPORTANT:</strong> calling any method on the signal instance after calling dispose will throw errors.</p>
			 */
			dispose : function () {
				this.removeAll();
				delete this._bindings;
				delete this._prevParams;
			},

			/**
			 * @return {string} String representation of the object.
			 */
			toString : function () {
				return '[Signal active:' + this.active + ' numListeners:' + this.getNumListeners() + ']';
			}

		};

		// Namespace -----------------------------------------------------
		//================================================================

		/**
		 * Signals namespace
		 * @namespace
		 * @name signals
		 */
		var signals = Signal;

		/**
		 * Custom event broadcaster
		 * @see Signal
		 */
			// alias for backwards compatibility (see #gh-44)
		signals.Signal = Signal;

		//exports to multiple environments
		if ( typeof define === 'function' && define.amd ) { //AMD
			define( function () { return signals; } );
		} else if ( typeof module !== 'undefined' && module.exports ) { //node
			module.exports = signals;
		} else { //browser
			//use string because of Google closure compiler ADVANCED_MODE
			/*jslint sub:true */
			global['signals'] = signals;
		}

	}( this ));

}, {}], 14                                                                                                                              : [function ( require, module, exports ) {
	"use strict";
	/**
	 * @fileOverview The chains define the primary composition elements (functions) that determine the order of execution.
	 *
	 * @module base/chains
	 * @requires dcl
	 */
	var dcl = require( "dcl" );
	/**
	 * @classDesc Chains define the primary composition elements (functions) that determine the order of execution.
	 * @exports base/chains
	 * @constructor
	 */
	var Chains = dcl( null, {declaredClass : "base/chains"} );
	/**
	 * The `close` method asks an object to shut itself down in a way that will allow it to be reopened, unlike the
	 * [end method]{@link base/chains#end} which will call the destroy method which should make the object unusable, but also
	 * devoid of all resources whereas `close` may still keep some resources open.
	 *
	 * This uses the `before` chain which means the last one defined in the first one destroyed
	 * @memberOf base/chains#
	 * @name close
	 * @see base/chains#open
	 */
	dcl.chainBefore( Chains, "close" );
	/**
	 * The `end` method will call the destroy method which should make the object unusable and
	 * devoid of all resources, unlike the
	 * [close method]{@link base/chains#close} asks an object to shut itself down in a way that will allow it to be reopened.
	 *
	 * This uses the `before` chain which means the last one defined in the first one destroyed
	 * @memberOf base/chains#
	 * @name end
	 */
	dcl.chainBefore( Chains, "end" );
	/**
	 * Destroy is called by the end method and it is here that you should clean up after yourself. The difference between
	 * `destroy` and [end]{@link base/chains#end} is the `end` is the verb that you raise on an object to ask it to go away
	 * and `destroy` is where you actually do the work to clean up. Think of this as the counterpart of `constructor` yet
	 * not called automatically.
	 *
	 * This uses the `before` chain which means the last one defined is the first one destroyed
	 * @private
	 * @memberOf base/chains#
	 * @name destroy
	 */
	dcl.chainBefore( Chains, "destroy" );

	/**
	 * If you are using the open/close paradigm for an object that can kind of go dormant on {@link base/chains#close} and can be "reopened"
	 * again later, here is where the "open" code will go.
	 *
	 * This used the `after` chain which means that the first one defined is the first one destroyed.
	 *
	 * @memberOf base/chains#
	 * @name open
	 * @see base/chains#close
	 */
	dcl.chainAfter( Chains, "open" );
	/**
	 * The `start` method will initialize the object such that is can be opened, if construction was not sufficient to the task. The
	 * [end method]{@link base/chains#end} asks an object to shut itself down in a way that prepares it for destruction.
	 *
	 * This uses the `after` chain which means the last one defined in the first one destroyed
	 * @memberOf base/chains#
	 * @name start
	 */
	dcl.chainAfter( Chains, "start" );
	module.exports = Chains;

}, {"dcl" : 9}], 15                                                                                                                     : [function ( require, module, exports ) {
	"use strict";
	/**
	 * @fileOverview This is base definition for all composed classes defined by the system
	 * @module base
	 * @requires base/chains
	 * @requires dcl
	 */

	var dcl = require( "dcl" );
	var chains = require( "./chains" );
	var logger = require( "../utils/logger" );

	/**
	 * @classdesc The base of all classes in the system, this is one of the few pure "classes" in core the of the system. It is a
	 * pretty clean little class whose primary purpose is to surface the composition chains and a basis for storing
	 * options on mixin and subclass instances. Options are handled at the instance rather than the prototype level
	 * so that multiple instances don't compete for default values.
	 *
	 * @exports base
	 * @constructor
	 * @extends base/chains
	 */
	var Base = dcl( [chains], /** @lends base# */{
		declaredClass      : "Base",
		constructor        : function () {
			logger.trace( this.declaredClass, "constructor" );
		},
		close              : function () {
			logger.trace( this.declaredClass, "close" );
		},
		open               : function () {
			logger.trace( this.declaredClass, "open" );
		},
		start              : function () {
			logger.trace( this.declaredClass, "start" );
		},
		/**
		 * Add an option to a class. If any members of the hash already exist in `this._options`, they will be overwritten.
		 * @param {hash} options A hash of options you want to set
		 * @see {base#addDefaultOptions}
		 * @protected
		 */
		_addOptions        : function ( options ) {
			options = options || {};
			if ( this._options ) {options = sys.extend( {}, sys.result( this, '_options' ), options );}
			this._options = options;
		},
		/**
		 * Add a default option to a class. The default options are only set if there is not already a
		 * value for the option.
		 * @param {hash} options A hash of options you want to set
		 * @see {base#addOptions}
		 * @protected
		 */
		_addDefaultOptions : function ( options ) {
			options = options || {};
			if ( this._options ) {options = sys.defaults( {}, sys.result( this, '_options' ), options );}
			this._options = options;
		},

		/**
		 * Call this to close your object and dispose of all maintained resources. You can define this method on your
		 * own classes without having to call the superclass instance, however it is reccomended that you put
		 * all disposal code in `destroy()`. You must be disciplined about calling this on your instances.
		 * @see {base/chains#end}
		 * @see {base/chains#destroy}
		 */
		end : function () {
			logger.trace( this.declaredClass, "end" );
			this.destroy()
		},

		/**
		 * Called when it is time to get rid of all of your instance level references and objects and events. You can
		 * define this method on your own classes without having to call the superclass instance. It is called by
		 * `instance.end()` automatically
		 * @see {base/chains#end}
		 * @see {base/chains#destroy}
		 * @private
		 */
		destroy : function () {
			logger.trace( this.declaredClass, "destroy" );
			this._options = null;
		}
//	/**
//	 * All objects should have a JSON representation if possible
//	 * @returns {object?}
//	 */
//	toJSON  : function () {
//		var retval;
//		try {
//			retval = JSON.parse( JSON.stringify( this ) );
//		} catch ( e ) {
//			retval = this;
//		}
//		return retval;
//	}

	} );

	Base.compose = dcl;
	Base.mixin = dcl.mix;
	Base.super = dcl.superCall;
	module.exports = Base;

}, {"../utils/logger" : 20, "./chains" : 14, "dcl" : 9}], 16                                                                            : [function ( require, module, exports ) {
	"use strict";
	/**
	 @fileOverview An object and array collector
	 @module document/collector
	 */

	var Base = require( "../base" );
	var probe = require( "./probe" );
	var sys = require( "lodash" );
	var dcl = require( "dcl" );

	/**
	 * A collector
	 * @constructor
	 */
	var CollectorBase = dcl( Base, /** @lends module:document/collector~CollectorBase#*/ {
		declaredClass : "document/collector",
		constructor   : function ( obj ) {
			var that = this;
			if ( obj && !sys.isObject( obj ) ) {
				throw new TypeError( "Collectors require an initial object or array passed to the constructor" );
			}
			/**
			 * The collection that being managed
			 * @memberOf module:document/collector~CollectorBase#
			 * @type {object|array}
			 * @name heap
			 * @private
			 */
			this._heap = obj || {};
			// mixin the probe
			probe.mixin( this, this._heap );
			/**
			 * Get the size of the collection
			 * @name length
			 * @type {number}
			 * @memberOf module:document/collector~CollectorBase#
			 */
			Object.defineProperty( this, "length", {
					get : function () {
						return sys.size( that._heap );
					}
				}
			);
			/**
			 * Creates an array of shuffled array values, using a version of the Fisher-Yates shuffle.
			 * See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
			 * @function
			 * @memberOf module:document/collector~CollectorBase#
			 * @returns {array}
			 * @name shuffle
			 */
			this.shuffle = sys.bind( sys.shuffle, this, this._heap );

		},
		/**
		 * Adds an item to the collection
		 * @param {*} key The key to use for the item being added.
		 * @param {*} item The item to add to the collection. The item is not iterated so that you could add bundled items to the collection
		 */
		add           : function ( key, item ) {
			this._heap[key] = item;
		},
		/**
		 * Iterate over each item in the collection, or a subset that matches a query. This supports two signatures:
		 * `.each(query, function)` and `.each(function)`. If you pass in a query, only the items that match the query
		 * are iterated over.
		 * @param {object=} query A query to evaluate
		 * @param {function(val, key)} iterator Function to execute against each item in the collection
		 * @param {object=} thisobj The value of `this`
		 */
		each          : function ( query, iterator, thisobj ) {
			if ( sys.isPlainObject( query ) ) {
				thisobj = thisobj || this;
				sys.each( this.find( query ), iterator, thisobj );
			} else {
				thisobj = iterator || this;
				sys.each( this._heap, query, thisobj );
			}
		},
		/**
		 * Returns the collection as an array. If it is already an array, it just returns that.
		 * @return {array}
		 */
		toArray       : function () {
			return sys.toArray( this._heap );
		},
		/**
		 * Supports conversion to a JSON string or for passing over the wire
		 *
		 * @returns {Object|array}
		 */
		toJSON        : function () {
			return this._heap;
		},
		/**
		 * Maps the contents to an array by iterating over it and transforming it. You supply the iterator. Supports two signatures:
		 * `.map(query, function)` and `.map(function)`. If you pass in a query, only the items that match the query
		 * are iterated over.
		 * @param {object=} query A query to evaluate
		 * @param {function(val, key)} iterator Function to execute against each item in the collection
		 * @param {object=} thisobj The value of `this`
		 */
		map           : function ( query, iterator, thisobj ) {
			if ( sys.isPlainObject( query ) ) {
				thisobj = thisobj || this;
				return sys.map( this.find( query ), iterator, thisobj );
			} else {
				thisobj = iterator || this;
				return sys.map( this._heap, query, thisobj );
			}
		},
		/**
		 * Reduces a collection to a value which is the accumulated result of running each element in the collection through the
		 * callback, where each successive callback execution consumes the return value of the previous execution. If accumulator
		 * is not passed, the first element of the collection will be used as the initial accumulator value.
		 * are iterated over.
		 * @param {object=} query A query to evaluate
		 * @param {function(result, val, key)} iterator The function that will be executed in each item in the collection
		 * @param {*=} accumulator Initial value of the accumulator.
		 * @param {object=} thisobj The value of `this`
		 * @return {*}
		 */
		reduce        : function ( query, iterator, accumulator, thisobj ) {
			if ( sys.isPlainObject( query ) ) {
				thisobj = thisobj || this;
				return sys.reduce( this.find( query ), iterator, accumulator, thisobj );
			} else {
				thisobj = accumulator || this;
				return  sys.reduce( this._heap, query, iterator, thisobj );
			}
		},
		/**
		 * Creates an object composed of keys returned from running each element
		 * of the collection through the given callback. The corresponding value of each key
		 * is the number of times the key was returned by the callback.
		 * @param {object=} query A query to evaluate. If you pass in a query, only the items that match the query
		 * are iterated over.
		 * @param  {function(value, key, collection)} iterator
		 * @param {object=} thisobj The value of `this`
		 * @return {object}
		 */
		countBy       : function ( query, iterator, thisobj ) {
			if ( sys.isPlainObject( query ) ) {
				thisobj = thisobj || this;
				return sys.countBy( this.find( query ), iterator, thisobj );
			} else {
				thisobj = iterator || this;
				return sys.countBy( this._heap, query, thisobj );
			}
		},
		/**
		 * Creates an object composed of keys returned from running each element of the collection through the callback.
		 * The corresponding value of each key is an array of elements passed to callback that returned the key.
		 * The callback is invoked with three arguments: (value, index|key, collection).
		 * @param {object=} query A query to evaluate . If you pass in a query, only the items that match the query
		 * are iterated over.
		 * @param {function(value, key, collection)} iterator
		 * @param {object=} thisobj The value of `this`
		 * @return {object}
		 */
		groupBy       : function ( query, iterator, thisobj ) {
			if ( sys.isPlainObject( query ) ) {
				thisobj = thisobj || this;
				return sys.groupBy( this.find( query ), iterator, thisobj );
			} else {
				thisobj = iterator || this;
				return sys.groupBy( this._heap, query, thisobj );
			}
		},
		/**
		 * Reduce the collection to a single value. Supports two signatures:
		 * `.pluck(query, function)` and `.pluck(function)`
		 * @param {object=} query The query to evaluate. If you pass in a query, only the items that match the query
		 * are iterated over.
		 * @param {string} property The property that will be 'plucked' from the contents of the collection
		 * @return {*}
		 */
		pluck         : function ( query, property ) {
			if ( arguments.length === 2 ) {
				return sys.map( this.find( query ), function ( record ) {
					return probe.get( record, property );
				} );
			} else {
				return sys.map( this._heap, function ( record ) {
					return probe.get( record, query );
				} );
			}
		},
		/**
		 * Returns a sorted copy of the collection.
		 * @param {object=} query The query to evaluate. If you pass in a query, only the items that match the query
		 * are iterated over.
		 * @param {function(value, key)} iterator
		 * @param {object=} thisobj The value of `this`
		 * @return {array}
		 */
		sortBy        : function ( query, iterator, thisobj ) {
			if ( sys.isPlainObject( query ) ) {
				thisobj = thisobj || this;
				return sys.sortBy( this.find( query ), iterator, thisobj );
			} else {
				thisobj = iterator || this;
				return sys.sortBy( this._heap, query, thisobj );
			}
		},
		/**
		 * Retrieves the maximum value of an array. If callback is passed,
		 * it will be executed for each value in the array to generate the criterion by which the value is ranked.
		 * @param {object=} query A query to evaluate . If you pass in a query, only the items that match the query
		 * are iterated over.
		 * @param {function(value, key, collection)} iterator
		 * @param {object=} thisobj The value of `this`
		 * @return {number}
		 */
		max           : function ( query, iterator, thisobj ) {
			if ( sys.isPlainObject( query ) ) {
				thisobj = thisobj || this;
				return sys.max( this.find( query ), iterator, thisobj );
			} else {
				thisobj = iterator || this;
				return sys.max( this._heap, query, thisobj );
			}
		},
		/**
		 * Retrieves the minimum value of an array. If callback is passed,
		 * it will be executed for each value in the array to generate the criterion by which the value is ranked.
		 * @param {object=} query A query to evaluate . If you pass in a query, only the items that match the query
		 * are iterated over.
		 * @param {function(value, key, collection)} iterator
		 * @param {object=} thisobj The value of `this`
		 * @return {number}
		 */
		min           : function ( query, iterator, thisobj ) {
			if ( sys.isPlainObject( query ) ) {
				thisobj = thisobj || this;
				return sys.min( this.find( query ), iterator, thisobj );
			} else {
				thisobj = iterator || this;
				return sys.min( this._heap, query, thisobj );
			}
		},
		/**
		 * Destructor called when the object is destroyed.
		 * @private
		 */
		destroy       : function () {
			this._heap = null;
		}
	} );

	/**
	 * An object based collector
	 * @extends module:document/collector~CollectorBase
	 * @constructor
	 */
	var OCollector = dcl( CollectorBase, {
		/**
		 * Get a record by key
		 * @param {*} key The key of the record to get
		 * @return {*}
		 */
		key : function ( key ) {
			return this._heap[key];
		}
	} );

//noinspection JSCommentMatchesSignature
	/**
	 An array based collector
	 @extends module:document/collector~CollectorBase
	 @constructor
	 */
	var ACollector = dcl( CollectorBase, /** @lends module:document/collector~ACollector# */{
			constructor : function ( obj ) {
				if ( obj && !sys.isArray( obj ) ) {
					throw new TypeError( "Collectors require an array passed to the constructor" );
				}
				this._heap = obj || [];
				/**
				 * Creates an array of array elements not present in the other arrays using strict equality for comparisons, i.e. ===.
				 * @returns {array}
				 * @member module:document/collector~ACollector#
				 * @name difference
				 * @function
				 */
				this.difference = sys.bind( sys.difference, this, this._heap );
				/**
				 * This method gets all but the first values of array
				 * @param {number=} n The numer of items to return
				 * @returns {*}
				 * @member module:document/collector~ACollector#
				 * @name tail
				 * @function
				 */
				this.tail = sys.bind( sys.tail, this, this._heap );
				/**
				 * Gets the first n values of the array
				 * @param {number=} n The numer of items to return
				 * @returns {*}
				 * @member module:document/collector~ACollector#
				 * @name head
				 * @function
				 */
				this.head = sys.bind( sys.head, this, this._heap );
			},
			/**
			 * Adds to the top of the collection
			 * @param {*} item The item to add to the collection. Only one item at a time can be added
			 */
			add         : function ( item ) {
				this._heap.unshift( item );
			},
			/**
			 * Add to the bottom of the list
			 * @param {*} item The item to add to the collection.  Only one item at a time can be added
			 */
			append      : function ( item ) {
				this._heap.push( item );
			},
			/**
			 * Add an item to the top of the list. This is identical to `add`, but is provided for stack semantics
			 * @param {*} item The item to add to the collection. Only one item at a time can be added
			 */
			push        : function ( item ) {
				this.add( item );
			},
			/**
			 * Modifies the collection with all falsey values of array removed. The values false, null, 0, "", undefined and NaN are all falsey.
			 */
			compact     : function () {
				this._heap = sys.compact( this._heap );
			},
			/**
			 * Creates an array of elements from the specified indexes, or keys, of the collection. Indexes may be specified as
			 * individual arguments or as arrays of indexes
			 * @param {indexes} args The indexes to use
			 */
			at          : function () {
				var arr = sys.toArray( arguments );
				arr.unshift( this._heap );
				return sys.at.apply( this, arr );
			},
			/**
			 * Flattens a nested array (the nesting can be to any depth). If isShallow is truthy, array will only be flattened a single level.
			 * If callback is passed, each element of array is passed through a callback before flattening.
			 * @param {object=} query A query to evaluate . If you pass in a query, only the items that match the query
			 * are iterated over.
			 * @param {function(value, key, collection)} iterator,
			 * @param {object=} thisobj The value of `this`
			 * @return {number}
			 */
			flatten     : function ( query, iterator, thisobj ) {
				if ( sys.isPlainObject( query ) ) {
					thisobj = thisobj || this;
					return sys.flatten( this.find( query ), iterator, thisobj );
				} else {
					thisobj = iterator || this;
					return sys.flatten( this._heap, query, thisobj );
				}
			},
			/**
			 * Gets an items by its index
			 * @param {number} key The index to get
			 * @return {*}
			 */
			index       : function ( index ) {
				return this._heap[ index ];
			}
		}
	);

	/**
	 Collect an object
	 @param {array|object} obj What to collect
	 @return {ACollector|OCollector}
	 */
	exports.collect = function ( obj ) {
		if ( sys.isArray( obj ) ) {
			return new ACollector( obj );
		} else {
			return new OCollector( obj );
		}
	};

	exports.array = function ( obj ) {
		return new ACollector( obj );
	};

	exports.object = function ( obj ) {
		return new OCollector( obj );
	};

	/**
	 Returns true if all items match the query. Aliases as `all`
	 @function

	 @param {object} qu The query to execute
	 @returns {boolean}
	 @name every
	 @memberOf module:document/collector~CollectorBase#
	 */

	/**
	 Returns true if any of the items match the query. Aliases as `any`
	 @function

	 @param {object} qu The query to execute
	 @returns {boolean}
	 @memberOf module:document/collector~CollectorBase#
	 @name some
	 */

	/**
	 Returns the set of unique records that match a query

	 @param {object} qu The query to execute.
	 @return {array}
	 @memberOf module:document/collector~CollectorBase#
	 @name unique
	 @method
	 **/

	/**
	 Returns true if all items match the query. Aliases as `every`
	 @function

	 @param {object} qu The query to execute
	 @returns {boolean}
	 @name all
	 @memberOf module:document/collector~CollectorBase#
	 */

	/**
	 Returns true if any of the items match the query. Aliases as `all`
	 @function

	 @param {object} qu The query to execute
	 @returns {boolean}
	 @memberOf module:document/collector~CollectorBase#
	 @name any
	 */

	/**
	 Remove all items in the object/array that match the query

	 @param {object} qu The query to execute. See {@link module:document/probe.queryOperators} for the operators you can use.
	 @return {object|array} The array or object as appropriate without the records.
	 @memberOf module:document/collector~CollectorBase#
	 @name remove
	 @method
	 **/

	/**
	 Returns the first record that matches the query and returns its key or index depending on whether `obj` is an object or array respectively.
	 Aliased as `seekKey`.

	 @param {object} qu The query to execute.
	 @returns {object}
	 @memberOf module:document/collector~CollectorBase#
	 @name findOneKey
	 @method
	 */

	/**
	 Returns the first record that matches the query. Aliased as `seek`.

	 @param {object} qu The query to execute.
	 @returns {object}
	 @memberOf module:document/collector~CollectorBase#
	 @name findOne
	 @method
	 */

	/**
	 Find all records that match a query and returns the keys for those items. This is similar to {@link module:document/probe.find} but instead of returning
	 records, returns the keys. If `obj` is an object it will return the hash key. If 'obj' is an array, it will return the index

	 @param {object} qu The query to execute.
	 @returns {array}
	 @memberOf module:document/collector~CollectorBase#
	 @name findKeys
	 @method
	 */

	/**
	 Find all records that match a query

	 @param {object} qu The query to execute.
	 @returns {array} The results
	 @memberOf module:document/collector~CollectorBase#
	 @name find
	 @method
	 **/

	/**
	 Updates all records in obj that match the query. See {@link module:document/probe.updateOperators} for the operators that are supported.

	 @param {object} qu The query which will be used to identify the records to updated
	 @param {object} setDocument The update operator. See {@link module:document/probe.updateOperators}
	 @memberOf module:document/collector~CollectorBase#
	 @name update
	 @method
	 */

}, {"../base" : 15, "./probe" : 17, "dcl" : 9, "lodash" : 12}], 17                                                                      : [function ( require, module, exports ) {
	"use strict";
	/**
	 @fileOverview Queries objects in memory using a mongo-like notation for reaching into objects and filtering for records

	 @module document/probe
	 @author Terry Weiss
	 @license MIT
	 @requires lodash
	 */

	var sys = require( "lodash" );
	/**
	 The list of operators that are nested within the expression object. These take the form <code>{path:{operator:operand}}</code>
	 @private
	 @type {array.<string>}
	 **/
	var nestedOps = ["$eq", "$gt", "$gte", "$in", "$lt", "$lte", "$ne", "$nin", "$exists", "$mod", "$size", "$all"];

	/**
	 The list of operators that prefix the expression object. These take the form <code>{operator:{operands}}</code> or <code>{operator: [operands]}</code>
	 @private
	 @type {array.<string>}
	 **/
	var prefixOps = ["$and", "$or", "$nor", "$not"];

	/**
	 Processes a nested operator by picking the operator out of the expression object. Returns a formatted object that can be used for querying
	 @private
	 @param {string} path The path to element to work with
	 @param {object} operand The operands to use for the query
	 @return {object} A formatted operation definition
	 **/
	function processNestedOperator( path, operand ) {
		var opKeys = Object.keys( operand );
		return {
			operation : opKeys[ 0 ],
			operands  : [operand[ opKeys[ 0 ] ]],
			path      : path
		};
	}

	/**
	 Interrogates a single query expression object and calls the appropriate handler for its contents
	 @private
	 @param {object} val The expression
	 @param {object} key The prefix
	 @returns {object} A formatted operation definition
	 **/
	function processExpressionObject( val, key ) {
		var operator;
		if ( sys.isObject( val ) ) {
			var opKeys = Object.keys( val );
			var op = opKeys[ 0 ];

			if ( sys.indexOf( nestedOps, op ) > -1 ) {
				operator = processNestedOperator( key, val );
			} else if ( sys.indexOf( prefixOps, key ) > -1 ) {
				operator = processPrefixOperator( key, val );
			} else if ( op === "$regex" ) {
				// special handling for regex options
				operator = processNestedOperator( key, val );
			} else if ( op === "$elemMatch" ) {
				// elemMatch is just a weird duck
				operator = {
					path      : key,
					operation : op,
					operands  : []
				};
				sys.each( val[ op ], function ( entry ) {
					operator.operands = parseQueryExpression( entry );
				} );
			}
			else {
				throw new Error( "Unrecognized operator" );
			}
		} else {
			operator = processNestedOperator( key, { $eq : val } );
		}
		return operator;
	}

	/**
	 Processes a prefixed operator and then passes control to the nested operator method to pick out the contained values
	 @private
	 @param {string} operation The operation prefix
	 @param {object} operand The operands to use for the query
	 @return {object} A formatted operation definition
	 **/
	function processPrefixOperator( operation, operand ) {
		var component = {
			operation : operation,
			path      : null,
			operands  : []
		};

		if ( sys.isArray( operand ) ) {
			//if it is an array we need to loop through the array and parse each operand
			//if it is an array we need to loop through the array and parse each operand
			sys.each( operand, function ( obj ) {
				sys.each( obj, function ( val, key ) {
					component.operands.push( processExpressionObject( val, key ) );
				} );
			} );
		} else {
			//otherwise it is an object and we can parse it directly
			sys.each( operand, function ( val, key ) {
				component.operands.push( processExpressionObject( val, key ) );
			} );
		}
		return component;

	}

	/**
	 Parses a query request and builds an object that can used to process a query target
	 @private
	 @param {object} obj The expression object
	 @returns {object} All components of the expression in a kind of execution tree
	 **/

	function parseQueryExpression( obj ) {
		if ( sys.size( obj ) > 1 ) {
			var arr = sys.map( obj, function ( v, k ) {
				var entry = {};
				entry[k] = v;
				return entry;
			} );
			obj = {
				$and : arr
			};
		}
		var payload = [];
		sys.each( obj, function ( val, key ) {

			var exprObj = processExpressionObject( val, key );

			if ( exprObj.operation === "$regex" ) {
				exprObj.options = val.$options;
			}

			payload.push( exprObj );
		} );

		return payload;
	}

	/**
	 The delimiter to use when splitting an expression
	 @type {string}
	 @static
	 @default '.'
	 **/

	exports.delimiter = '.';

	/**
	 Splits a path expression into its component parts
	 @private
	 @param {string} path The path to split
	 @returns {array}
	 **/

	function splitPath( path ) {
		return path.split( exports.delimiter );
	}

	/**
	 Reaches into an object and allows you to get at a value deeply nested in an object
	 @private
	 @param {array} path The split path of the element to work with
	 @param {object} record The record to reach into
	 @return {*} Whatever was found in the record
	 **/
	function reachin( path, record ) {
		var context = record;
		var part;
		var _i;
		var _len;

		for ( _i = 0, _len = path.length; _i < _len; _i++ ) {
			part = path[_i];
			context = context[part];
			if ( sys.isNull( context ) || sys.isUndefined( context ) ) {
				break;
			}
		}

		return context;
	}

	/**
	 This will write the value into a record at the path, creating intervening objects if they don't exist
	 @private
	 @param {array} path The split path of the element to work with
	 @param {object} record The record to reach into
	 @param {string} setter The set command, defaults to $set
	 @param {object} newValue The value to write to the, or if the operator is $pull, the query of items to look for
	 */
	function pushin( path, record, setter, newValue ) {
		var context = record;
		var parent = record;
		var lastPart = null;
		var _i;
		var _len;
		var part;
		var keys;

		for ( _i = 0, _len = path.length; _i < _len; _i++ ) {
			part = path[_i];
			lastPart = part;
			parent = context;
			context = context[part];
			if ( sys.isNull( context ) || sys.isUndefined( context ) ) {
				parent[part] = {};
				context = parent[part];
			}
		}

		if ( sys.isEmpty( setter ) || setter === '$set' ) {
			parent[lastPart] = newValue;
			return parent[lastPart];
		} else {
			switch ( setter ) {
				case '$inc':
					/**
					 * Increments a field by the amount you specify. It takes the form
					 * `{ $inc: { field1: amount } }`
					 * @name $inc
					 * @memberOf module:document/probe.updateOperators
					 * @example
					 * var probe = require("document/probe");
					 * probe.update( obj, {'name.last' : 'Owen', 'name.first' : 'LeRoy'},
					 * {$inc : {'password.changes' : 2}} );
					 */

					if ( !sys.isNumber( newValue ) ) {
						newValue = 1;
					}
					if ( sys.isNumber( parent[lastPart] ) ) {
						parent[lastPart] = parent[lastPart] + newValue;
						return parent[lastPart];
					}
					break;
				case '$dec':
					/**
					 * Decrements a field by the amount you specify. It takes the form
					 * `{ $dec: { field1: amount }`
                 * @name $dec
					 * @memberOf module:document/probe.updateOperators
					 * @example
					 *  var probe = require("document/probe");
					 * probe.update( obj, {'name.last' : 'Owen', 'name.first' : 'LeRoy'},
					 * {$dec : {'password.changes' : 2}} );
					 */

					if ( !sys.isNumber( newValue ) ) {
						newValue = 1;
					}
					if ( sys.isNumber( parent[lastPart] ) ) {
						parent[lastPart] = parent[lastPart] - newValue;
						return parent[lastPart];
					}
					break;
				case '$unset':
					/**
					 * Removes the field from the object. It takes the form
					 * `{ $unset: { field1: "" } }`
					 * @name $unset
					 * @memberOf module:document/probe.updateOperators
					 * @example
					 * var probe = require("document/probe");
					 * probe.update( data, {'name.first' : 'Yogi'}, {$unset : {'name.first' : ''}} );
					 */

					return delete parent[lastPart];
				case '$pop':
					/**
					 * The $pop operator removes the first or last element of an array. Pass $pop a value of 1 to remove the last element
					 * in an array and a value of -1 to remove the first element of an array. This will only work on arrays. Syntax:
					 * `{ $pop: { field: 1 } }` or `{ $pop: { field: -1 } }`
					 * @name $pop
					 * @memberOf module:document/probe.updateOperators
					 * @example
					 * var probe = require("document/probe");
					 * // attr is the name of the array field
					 * probe.update( data, {_id : '511d18827da2b88b09000133'}, {$pop : {attr : 1}} );
					 */

					if ( sys.isArray( parent[lastPart] ) ) {
						if ( !sys.isNumber( newValue ) ) {
							newValue = 1;
						}
						if ( newValue === 1 ) {
							return parent[lastPart].pop();
						} else {
							return parent[lastPart].shift();
						}
					}
					break;
				case '$push':
					/**
					 * The $push operator appends a specified value to an array. It looks like this:
					 * `{ $push: { <field>: <value> } }`
					 * @name $push
					 * @memberOf module:document/probe.updateOperators
					 * @example
					 * var probe = require("document/probe");
					 * // attr is the name of the array field
					 * probe.update( data, {_id : '511d18827da2b88b09000133'},
					 * {$push : {attr : {"hand" : "new", "color" : "new"}}} );
					 */

					if ( sys.isArray( parent[lastPart] ) ) {
						return parent[lastPart].push( newValue );
					}
					break;
				case '$pull':
					/**
					 * The $pull operator removes all instances of a value from an existing array. It looks like this:
					 * `{ $pull: { field: <query> } }`
					 * @name $pull
					 * @memberOf module:document/probe.updateOperators
					 * @example
					 * var probe = require("document/probe");
					 * // attr is the name of the array field
					 * probe.update( data, {'email' : 'EWallace.43@fauxprisons.com'},
					 * {$pull : {attr : {"color" : "green"}}} );
					 */

					if ( sys.isArray( parent[lastPart] ) ) {
						keys = exports.findKeys( parent[lastPart], newValue );
						sys.each( keys, function ( val, index ) {
							return delete parent[lastPart][index];
						} );
						parent[lastPart] = sys.compact( parent[lastPart] );
						return parent[lastPart];
					}
			}
		}
	}

	/**
	 The query operations that evaluate directly from an operation
	 @private
	 **/
	var operations = {
		/**
		 * `$eq` performs a `===` comparison by comparing the value directly if it is an atomic value.
		 * otherwise if it is an array, it checks to see if the value looked for is in the array.
		 * `{field: value}` or `{field: {$eq : value}}` or `{array: value}` or `{array: {$eq : value}}`
		 * @name $eq
		 * @memberOf module:document/probe.queryOperators
		 * @example
		 * var probe = require("document/probe");
		 * probe.find( data, {categories : "cat1"} );
		 * // is the same as
		 * probe.find( data, {categories : {$eq: "cat1"}} );
		 */

		$eq        : function ( qu, value ) {
			if ( sys.isArray( value ) ) {
				return sys.find( value, function ( entry ) {
					return JSON.stringify( qu.operands[0] ) === JSON.stringify( entry );
				} ) !== void 0;
			} else {
				return JSON.stringify( qu.operands[0] ) === JSON.stringify( value );
			}
		},
		/**
		 *  `$ne` performs a `!==` comparison by comparing the value directly if it is an atomic value. Otherwise, if it is an array
		 * this is performs a "not in array".
		 * '{field: {$ne : value}}` or '{array: {$ne : value}}`
		 * @name $ne
		 * @memberOf module:document/probe.queryOperators
		 * @example
		 * var probe = require("document/probe");
		 * probe.find( data, {"name.first" : {$ne : "Sheryl"}} );
		 */

		$ne        : function ( qu, value ) {
			if ( sys.isArray( value ) ) {
				return sys.find( value, function ( entry ) {
					return JSON.stringify( qu.operands[0] ) !== JSON.stringify( entry );
				} ) !== void 0;
			} else {
				return JSON.stringify( qu.operands[0] ) !== JSON.stringify( value );
			}
		},
		/**
		 * `$all` checks to see if all of the members of the query are included in an array
		 * `{array: {$all: [val1, val2, val3]}}`
		 * @name $all
		 * @memberOf module:document/probe.queryOperators
		 * @example
		 * var probe = require("document/probe");
		 * probe.find( data, {"categories" : {$all : ["cat4", "cat2", "cat1"]}} );
		 */

		$all       : function ( qu, value ) {
			var operands, result;

			result = false;
			if ( sys.isArray( value ) ) {
				operands = sys.flatten( qu.operands );
				result = sys.intersection( operands, value ).length === operands.length;
			}
			return result;
		},
		/**
		 * `$gt` Sees if a field is greater than the value
		 * `{field: {$gt: value}}`
		 * @name $gt
		 * @memberOf module:document/probe.queryOperators
		 * @example
		 * var probe = require("document/probe");
		 * probe.find( data, {"age" : {$gt : 24}} );
		 */

		$gt        : function ( qu, value ) {
			return qu.operands[0] < value;
		},
		/**
		 * `$gte` Sees if a field is greater than or equal to the value
		 * `{field: {$gte: value}}`
		 * @name $gte
		 * @memberOf module:document/probe.queryOperators
		 * @example
		 * var probe = require("document/probe");
		 * probe.find( data, {"age" : {$gte : 50}} );
		 */

		$gte       : function ( qu, value ) {
			return qu.operands[0] <= value;
		},
		/**
		 * `$lt` Sees if a field is less than the value
		 * `{field: {$lt: value}}`
		 * @name $lt
		 * @memberOf module:document/probe.queryOperators
		 * @example
		 * var probe = require("document/probe");
		 * probe.find( data, {"age" : {$lt : 24}} );
		 */

		$lt        : function ( qu, value ) {
			return qu.operands[0] > value;
		},
		/**
		 * `$lte` Sees if a field is less than or equal to the value
		 * `{field: {$lte: value}}`
		 * @name $lte
		 * @memberOf module:document/probe.queryOperators
		 * @example
		 * var probe = require("document/probe");
		 * probe.find( data, {"age" : {$lte : 50}} );
		 */

		$lte       : function ( qu, value ) {
			return qu.operands[0] >= value;
		},
		/**
		 * `$in` Sees if a field has one of the values in the query
		 * `{field: {$in: [test1, test2, test3,...]}}`
		 * @name $in
		 * @memberOf module:document/probe.queryOperators
		 * @example
		 * var probe = require("document/probe");
		 * probe.find( data, {"age" : {$in : [24, 28, 60]}} );
		 */

		$in        : function ( qu, value ) {
			var operands;

			operands = sys.flatten( qu.operands );
			return sys.indexOf( operands, value ) > -1;
		},
		/**
		 * `$nin` Sees if a field has none of the values in the query
		 * `{field: {$nin: [test1, test2, test3,...]}}`
		 * @name $nin
		 * @memberOf module:document/probe.queryOperators
		 * @example
		 * var probe = require("document/probe");
		 * probe.find( data, {"age" : {$nin : [24, 28, 60]}} );
		 */

		$nin       : function ( qu, value ) {
			var operands;

			operands = sys.flatten( qu.operands );
			return sys.indexOf( operands, value ) === -1;
		},
		/**
		 * `$exists` Sees if a field exists.
		 * `{field: {$exists: true|false}}`
		 * @name $exists
		 * @memberOf module:document/probe.queryOperators
		 * @example
		 * var probe = require("document/probe");
		 * probe.find( data, {"name.middle" : {$exists : true}} );
		 */

		$exists    : function ( qu, value ) {
			return (sys.isNull( value ) || sys.isUndefined( value )) !== qu.operands[0];
		},
		/**
		 * Checks equality to a modulus operation on a field
		 * `{field: {$mod: [divisor, remainder]}}`
		 * @name $mod
		 * @memberOf module:document/probe.queryOperators
		 * @example
		 * var probe = require("document/probe");
		 * probe.find( data, {"age" : {$mod : [2, 0]}} );
		 */

		$mod       : function ( qu, value ) {
			var operands = sys.flatten( qu.operands );
			if ( operands.length !== 2 ) {
				throw new Error( "$mod requires two operands" );
			}
			var mod = operands[0];
			var rem = operands[1];
			return value % mod === rem;
		},
		/**
		 * Compares the size of the field/array to the query. This can be used on arrays, strings and objects (where it will count keys)
		 * `{'field|array`: {$size: value}}`
		 * @name $size
		 * @memberOf module:document/probe.queryOperators
		 * @example
		 * var probe = require("document/probe");
		 * probe.find( data, {attr : {$size : 3}} );
		 */

		$size      : function ( qu, value ) {
			return sys.size( value ) === qu.operands[0];
		},
		/**
		 * Performs a regular expression test againts the field
		 * `{field: {$regex: re, $options: reOptions}}`
		 * @name $regex
		 * @memberOf module:document/probe.queryOperators
		 * @example
		 * var probe = require("document/probe");
		 * probe.find( data, {"name.first" : {$regex : "m*", $options : "i"}} );
		 */

		$regex     : function ( qu, value ) {
			var r = new RegExp( qu.operands[0], qu.options );
			return r.test( value );
		},
		/**
		 * This is like $all except that it works with an array of objects or value. It checks to see the array matches all
		 * of the conditions of the query
		 * `{array: {$elemMatch: {path: value, path: {$operation: value2}}}`
     * @name $elemMatch
		 * @memberOf module:document/probe.queryOperators
		 * @example
		 * var probe = require("document/probe");
		 * probe.find( data, {attr : {$elemMatch : [
     *  {color : "red", "hand" : "left"}
     * ]}} );
		 */
		$elemMatch : function ( qu, value ) {
			var expression, test, _i, _len;

			if ( sys.isArray( value ) ) {
				var _ref = qu.operands;
				for ( _i = 0, _len = _ref.length; _i < _len; _i++ ) {
					expression = _ref[_i];
					if ( expression.path ) {
						expression.splitPath = splitPath( expression.path );
					}
				}
				test = execQuery( value, qu.operands, null, true ).arrayResults;
			}
			return test.length > 0;
		},
		/**
		 * Returns true if all of the conditions of the query are met
		 * `{$and: [query1, query2, query3]}`
		 * @name $and
		 * @memberOf module:document/probe.queryOperators
		 * @example
		 * var probe = require("document/probe");
		 * probe.find( data, {$and : [
     *      {"name.first" : "Mildred"},
     *      {"name.last" : "Graves"}
     * ]} );
		 */

		$and       : function ( qu, value, record ) {
			var isAnd = false;

			sys.each( qu.operands, function ( expr ) {
				if ( expr.path ) {
					expr.splitPath = expr.splitPath || splitPath( expr.path );
				}
				var test = reachin( expr.splitPath, record, expr.operation );
				isAnd = operations[expr.operation]( expr, test, record );
				if ( !isAnd ) {
					return false;
				}
			} );

			return isAnd;
		},
		/**
		 * Returns true if any of the conditions of the query are met
		 * `{$or: [query1, query2, query3]}`
		 * @name $or
		 * @memberOf module:document/probe.queryOperators
		 * @example
		 * var probe = require("document/probe");
		 * probe.find( data, {$or : [
     *      "age" : {$in : [24, 28, 60]}},
		 *      {categories : "cat1"}
		 * ]} );
		 */
		$or        : function ( qu, value, record ) {
			var isOr = false;
			sys.each( qu.operands, function ( expr ) {
				if ( expr.path ) {
					expr.splitPath = expr.splitPath || splitPath( expr.path );
				}
				var test = reachin( expr.splitPath, record, expr.operation );
				isOr = operations[expr.operation]( expr, test, record );
				if ( isOr ) {
					return false;
				}
			} );

			return isOr;
		},
		/**
		 * Returns true if none of the conditions of the query are met
		 * `{$nor: [query1, query2, query3]}`
		 * @name $nor
		 * @memberOf module:document/probe.queryOperators
		 * @example
		 * var probe = require("document/probe");
		 * probe.find( data, {$nor : [
     *      {"age" : {$in : [24, 28, 60]}},
     *      {categories : "cat1"}
     * ]} );
		 */
		$nor       : function ( qu, value, record ) {
			var isOr = false;
			sys.each( qu.operands, function ( expr ) {
				if ( expr.path ) {
					expr.splitPath = expr.splitPath || splitPath( expr.path );
				}
				var test = reachin( expr.splitPath, record, expr.operation );
				isOr = operations[expr.operation]( expr, test, record );
				if ( isOr ) {
					return false;
				}
			} );

			return !isOr;
		},
		/**
		 * Logical NOT on the conditions of the query
		 * `{$not: [query1, query2, query3]}`
		 * @name $not
		 * @memberOf module:document/probe.queryOperators
		 * @example
		 * var probe = require("document/probe");
		 * probe.find( data, {$not : {"age" : {$lt : 24}}} );
		 */
		$not       : function ( qu, value, record ) {

			var result = false;
			sys.each( qu.operands, function ( expr ) {
				if ( expr.path ) {
					expr.splitPath = expr.splitPath || splitPath( expr.path );
				}
				var test = reachin( expr.splitPath, record, expr.operation );
				result = operations[expr.operation]( expr, test, record );
				if ( result ) {
					return false;
				}
			} );

			return !result;

		}
	};

	/**
	 Executes a query by traversing a document and evaluating each record
	 @private
	 @param {array|object} obj The object to query
	 @param {object} qu The query to execute
	 @param {?boolean} shortCircuit When true, the condition that matches the query stops evaluation for that record, otherwise all conditions have to be met
	 @param {?boolean} stopOnFirst When true all evaluation stops after the first record is found to match the conditons
	 **/
	function execQuery( obj, qu, shortCircuit, stopOnFirst ) {
		var arrayResults = [];
		var keyResults = [];
		sys.each( obj, function ( record, key ) {
			var expr, result, test, _i, _len;

			for ( _i = 0, _len = qu.length; _i < _len; _i++ ) {
				expr = qu[_i];
				if ( expr.splitPath ) {
					test = reachin( expr.splitPath, record, expr.operation );
				}
				result = operations[expr.operation]( expr, test, record );
				if ( result ) {
					arrayResults.push( record );
					keyResults.push( key );
				}
				if ( !result && shortCircuit ) {
					break;
				}
			}
			if ( arrayResults.length > 0 && stopOnFirst ) {
				return false;
			}
		} );
		return {
			arrayResults : arrayResults,
			keyResults   : keyResults
		};
	}

	/**
	 Updates all records in obj that match the query. See {@link module:document/probe.updateOperators} for the operators that are supported.
	 @param {object|array} obj The object to update
	 @param {object} qu The query which will be used to identify the records to updated
	 @param {object} setDocument The update operator. See {@link module:document/probe.updateOperators}
	 */
	exports.update = function ( obj, qu, setDocument ) {
		var records = exports.find( obj, qu );
		return sys.each( records, function ( record ) {
			return sys.each( setDocument, function ( fields, operator ) {
				return sys.each( fields, function ( newValue, path ) {
					return pushin( splitPath( path ), record, operator, newValue );
				} );
			} );
		} );
	};
	/**
	 Find all records that match a query
	 @param {array|object} obj The object to query
	 @param {object} qu The query to execute. See {@link module:document/probe.queryOperators} for the operators you can use.
	 @returns {array} The results
	 **/
	exports.find = function ( obj, qu ) {
		var expression, _i, _len;

		var query = parseQueryExpression( qu );
		for ( _i = 0, _len = query.length; _i < _len; _i++ ) {
			expression = query[_i];
			if ( expression.path ) {
				expression.splitPath = splitPath( expression.path );
			}
		}
		return execQuery( obj, query ).arrayResults;
	};
	/**
	 Find all records that match a query and returns the keys for those items. This is similar to {@link module:document/probe.find} but instead of returning
	 records, returns the keys. If `obj` is an object it will return the hash key. If 'obj' is an array, it will return the index
	 @param {array|object} obj The object to query
	 @param {object} qu The query to execute. See {@link module:document/probe.queryOperators} for the operators you can use.
	 @returns {array}
	 */
	exports.findKeys = function ( obj, qu ) {
		var expression, _i, _len;

		var query = parseQueryExpression( qu );
		for ( _i = 0, _len = query.length; _i < _len; _i++ ) {
			expression = query[_i];
			if ( expression.path ) {
				expression.splitPath = splitPath( expression.path );
			}
		}
		return execQuery( obj, query ).keyResults;
	};

	/**
	 Returns the first record that matches the query. Aliased as `seek`.
	 @param {array|object} obj The object to query
	 @param {object} qu The query to execute. See {@link module:document/probe.queryOperators} for the operators you can use.
	 @returns {object}
	 */
	exports.findOne = function ( obj, qu ) {
		var expression, _i, _len;

		var query = parseQueryExpression( qu );
		for ( _i = 0, _len = query.length; _i < _len; _i++ ) {
			expression = query[_i];
			if ( expression.path ) {
				expression.splitPath = splitPath( expression.path );
			}
		}
		var results = execQuery( obj, query, false, true ).arrayResults;
		if ( results.length > 0 ) {
			return results[0];
		} else {
			return null;
		}
	};
	exports.seek = exports.findOne;
	/**
	 Returns the first record that matches the query and returns its key or index depending on whether `obj` is an object or array respectively.
	 Aliased as `seekKey`.
	 @param {array|object} obj The object to query
	 @param {object} qu The query to execute. See {@link module:document/probe.queryOperators} for the operators you can use.
	 @returns {object}
	 */
	exports.findOneKey = function ( obj, qu ) {
		var expression, _i, _len;

		var query = parseQueryExpression( qu );
		for ( _i = 0, _len = query.length; _i < _len; _i++ ) {
			expression = query[_i];
			if ( expression.path ) {
				expression.splitPath = splitPath( expression.path );
			}
		}
		var results = execQuery( obj, query, false, true ).keyResults;
		if ( results.length > 0 ) {
			return results[0];
		} else {
			return null;
		}
	};
	exports.seekKey = exports.findOneKey;

	/**
	 Remove all items in the object/array that match the query
	 @param {array|object} obj The object to query
	 @param {object} qu The query to execute. See {@link module:document/probe.queryOperators} for the operators you can use.
	 @return {object|array} The array or object as appropriate without the records.
	 **/
	exports.remove = function ( obj, qu ) {
		var expression, _i, _len;

		var query = parseQueryExpression( qu );
		for ( _i = 0, _len = query.length; _i < _len; _i++ ) {
			expression = query[_i];
			if ( expression.path ) {
				expression.splitPath = splitPath( expression.path );
			}
		}
		var results = execQuery( obj, query, false, false ).keyResults;
		if ( sys.isArray( obj ) ) {
			var newArr = [];
			sys.each( obj, function ( item, index ) {
				if ( sys.indexOf( results, index ) === -1 ) {
					return newArr.push( item );
				}
			} );
			return newArr;
		} else {
			sys.each( results, function ( key ) {
				return delete obj[key];
			} );
			return obj;
		}
	};
	/**
	 Returns true if all items match the query

	 @param {array|object} obj The object to query
	 @param {object} qu The query to execute. See {@link module:document/probe.queryOperators} for the operators you can use.
	 @returns {boolean}
	 **/
	exports.all = function ( obj, qu ) {
		return exports.find( obj, qu ).length === sys.size( obj );
	};

	/**
	 Returns true if any of the items match the query

	 @param {array|object} obj The object to query
	 @param {object} qu The query to execute. See {@link module:document/probe.queryOperators} for the operators you can use.
	 @returns {boolean}
	 **/
	exports.any = function ( obj, qu ) {
		var expression, _i, _len;

		var query = parseQueryExpression( qu );
		for ( _i = 0, _len = query.length; _i < _len; _i++ ) {
			expression = query[_i];
			if ( expression.path ) {
				expression.splitPath = splitPath( expression.path );
			}
		}
		var results = execQuery( obj, query, true, true ).keyResults;
		return results.length > 0;
	};

	/**
	 Returns the set of unique records that match a query
	 @param {array|object} obj The object to query
	 @param {object} qu The query to execute. See {@link module:document/probe.queryOperators} for the operators you can use.
	 @return {array}
	 **/
	exports.unique = function ( obj, qu ) {
		var test = exports.find( obj, qu );
		return sys.unique( test, function ( item ) {
			return JSON.stringify( item );
		} );
	};

	/**
	 This will write the value into a record at the path, creating intervening objects if they don't exist. This does not work as filtered
	 update and is meant to be used on a single record. It is a nice way of setting a property at an arbitrary depth at will.

	 @param {array} path The split path of the element to work with
	 @param {object} record The record to reach into
	 @param {string} setter The set operation.  See {@link module:document/probe.updateOperators} for the operators you can use.
	 @param {object} newValue The value to write to the, or if the operator is $pull, the query of items to look for
	 */
	exports.set = function ( record, path, setter, newValue ) {
		return pushin( splitPath( path ), record, setter, newValue );
	};

	/**
	 Reaches into an object and allows you to get at a value deeply nested in an object. This is not a query, but a
	 straight reach in, useful for event bindings

	 @param {array} path The split path of the element to work with
	 @param {object} record The record to reach into
	 @return {*} Whatever was found in the record
	 **/
	exports.get = function ( record, path ) {
		return reachin( splitPath( path ), record );
	};

	/**
	 Returns true if any of the items match the query. Aliases as `any`
	 @function
	 @param {array|object} obj The object to query
	 @param {object} qu The query to execute
	 @returns {boolean}
	 */
	exports.some = exports.any;

	/**
	 Returns true if all items match the query. Aliases as `all`
	 @function
	 @param {array|object} obj The object to query
	 @param {object} qu The query to execute
	 @returns {boolean}
	 */
	exports.every = exports.all;

	var bindables = {
		any        : exports.any,
		all        : exports.all,
		remove     : exports.remove,
		seekKey    : exports.seekKey,
		seek       : exports.seek,
		findOneKey : exports.findOneKey,
		findOne    : exports.findOne,
		findKeys   : exports.findKeys,
		find       : exports.find,
		update     : exports.update,
		some       : exports.some,
		every      : exports.every,
		"get"      : exports.get,
		"set"      : exports.set
	};

	/**
	 Binds the query and update methods to a new object. When called these
	 methods can skip the first parameter so that find(object, query) can just be called as find(query)
	 @param {object|array} obj The object or array to bind to
	 @return {object} An object with method bindings in place
	 **/
	exports.proxy = function ( obj ) {
		var retVal;

		retVal = {};
		sys.each( bindables, function ( val, key ) {
			retVal[key] = sys.bind( val, obj, obj );
		} );
		return retVal;
	};

	/**
	 Binds the query and update methods to a specific object and adds the methods to that object. When called these
	 methods can skip the first parameter so that find(object, query) can just be called as object.find(query)
	 @param {object|array} obj The object or array to bind to
	 @param {object|array=} collection If the collection is not the same as <code>this</code> but is a property, or even
	 a whole other object, you specify that here. Otherwise the <code>obj</code> is assumed to be the same as the collection
	 **/
	exports.mixin = function ( obj, collection ) {
		collection = collection || obj;
		return sys.each( bindables, function ( val, key ) {
			obj[key] = sys.bind( val, obj, collection );
		} );
	};

	/**
	 * These are the supported query operators
	 *
	 * @memberOf module:document/probe
	 * @name queryOperators
	 * @class This is not actually a class, but an artifact of the documentation system
	 */

	/**
	 * These are the supported update operators
	 *
	 * @memberOf module:document/probe
	 * @name updateOperators
	 * @class This is not actually a class, but an artifact of the documentation system
	 */

}, {"lodash" : 12}], 18                                                                                                                 : [function ( require, module, exports ) {
	"use strict";
	/**
	 * @fileOverview Add the ability to fire signals on your objects. Signals are events, but hard coded into the object
	 * and don't rely on strings like other events and `eventables`
	 * @module mixins/signalable
	 * @requires base
	 * @requires signals
	 * @requires async
	 * @requires base/logger
	 */

	var Base = require( "../base/index" );
	var signals = require( 'signals' );
	var format = require( "../strings/format" );
	var sys = require( "lodash" );
	var async = require( "async" );

	/**
	 * @typedef
	 * @property {boolean=} memorize If Signal should keep record of previously dispatched parameters and automatically execute listener. Defaults to `false`
	 * @property {array=} params Default parameters passed to listener during `Signal.raise`/`Signal.fire`/`Signal.trigger` and SignalBinding.execute. (curried parameters). Defaults to `null`
	 * @property {object=} context When provided the signal will be raised in the context of this object. Defaults to `this` - the signal host
	 * @name SignalOptions
	 * @memberOf module:mixins/signalable
	 * @example
	 *
	 *  signals:{
 *      opened: null,
 *      twisted: { memorize:true },
 *      applied: { memorize: false, params:[one, two] }
 *  }
	 *
	 *  // Setting the context initially can be a hassle, so this also supports a function that returns a hash
	 *
	 *  signals: function(){
 *      return {
 *      opened: null,
 *      twisted: { memorize:true },
 *      applied: { memorize: false, params:[one, two] },
 *      reversed: {context: someOtherRuntimeObject}
 *      };
 *  }
	 *
	 */

	/**
	 * @classDesc A signal that can be raised on an object. When you deploy the `Signalable` mixin, it
	 * creates instances of these for you.
	 *
	 * @constructor
	 * @param {?object} host If hosted, you can identify the host here.
	 * @param {?string} name The name of the signal
	 * @type module:mixins/signalable.SignalOptions
	 */
	var Signal = Base.compose( [Base, signals.Signal], /** @lends module:mixins/signalable~Signal# */{
		declaredClass : "mixins/Signal",

		constructor : function ( host, name, options ) {
			this.options = options = options || {};
			this.memorize = options.memorize === true;
			this.host = host;
//		this.trigger = this.fire = this.raise = this.dispatch;
			this.name = name || sys.uniqueId( "signal" );
			this.params = options.params;
			this.defaultContext = options.context;
			sys.bindAll( this );
		},

		/**
		 * Cleans up
		 * @private
		 */
		destroy : function () {
			this.removeAll();
			this.dispose();
			this.host = null;
		},

		/**
		 * Fire an event that may potentially execute asynchronously
		 */
		fire : function () {
			if ( !this.active ) {return;}

			var params = sys.toArray( arguments );
			var paramsArr = sys.initial( params );
			var n = this._bindings.length;
			var bindings = this._bindings.slice(); //clone array in case add/remove items during dispatch
			var callback = params.length > 0 ? sys.last( params ) : null;
			this._shouldPropagate = true; //in case `halt` was called before dispatch or during the previous dispatch.

			if ( !sys.isFunction( callback ) ) {
				callback = sys.identity;
				paramsArr = params;
			}
			if ( this.memorize ) {
				this._prevParams = paramsArr;
			}

			if ( !n ) {
				//should come after memorize
				return callback();
			}

			var that = this;
			//execute all callbacks until end of the list or until a callback returns `false` or stops propagation
			//reverse loop since listeners with higher priority will be added at the end of the list
			async.doWhilst( function ( done ) {
				n--;
				if ( bindings[n] ) {
					if ( bindings[n].async ) {
						var p = paramsArr.slice();
						p.push( done );
						bindings[n].execute( p );
					} else {
						var res = bindings[n].execute( paramsArr );
						if ( res === false ) {
							return done( new Error( "canceled" ) );
						}
						return done();
					}

				} else {
					return done();
				}
			}, function ( done ) {
				return bindings[n] && that._shouldPropagate;
			}, callback );

//		do { n--; } while ( bindings[n] && this._shouldPropagate && bindings[n].execute( paramsArr ) !== false );
		},

		/**
		 * Ties a listener to a signal.
		 * @param {function} listener The function to call when the signal is raised
		 * @param {?object} listenerContext A context to set for the listener. The event host may set a default for this value, but you may override that here.
		 * @param {?number|string} priority A priority for the listener. Or the string `"async"`
		 * @returns {SignalBinding}
		 */
		on       : function ( listener, listenerContext, priority ) {
			var isAsync = false;
			if ( sys.isNumber( listenerContext ) ) {
				priority = listenerContext;
				listenerContext = null;
			}
			if ( sys.isString( listenerContext ) ) {
				priority = listenerContext;
				listenerContext = null;
			}
			if ( sys.isString( priority ) ) {
				isAsync = true;
				priority = null;
			}
			listenerContext = listenerContext || this.defaultContext || this.host;
			var binding = this.add( listener, listenerContext, priority );
			if ( this.options.params ) {
				binding.params = this.params;
			}
			if ( isAsync ) {
				binding.async = true;
			} else {
				binding.async = false;
			}
			return binding;
		},
		/**
		 * Ties a listener to for a signal for one execution.
		 * @param {function} listener The function to call when the signal is raised
		 * @param {?object} listenerContext A context to set for the listener. The event host may set a default for this value, but you may override that here.
		 * @param {?number} priority A priority for the listener.
		 * @returns {SignalBinding}
		 */
		once     : function ( listener, listenerContext, priority ) {
			var isAsync = false;
			if ( sys.isNumber( listenerContext ) ) {
				priority = listenerContext;
				listenerContext = null;
			}
			if ( sys.isString( listenerContext ) ) {
				priority = listenerContext;
				listenerContext = null;
			}
			if ( sys.isString( priority ) ) {
				isAsync = true;
				priority = null;
			}
			listenerContext = listenerContext || this.defaultContext || this.host;
			var binding = this.addOnce( listener, listenerContext, priority );
			if ( this.options.params ) {
				binding.params = this.params;
			}
			if ( isAsync ) {
				binding.async = true;
			} else {
				binding.async = false;
			}
			return binding;
		},
		/**
		 * Unbinds a listener to a signal.
		 * @param {function} listener The function to unbind
		 * @param {?object} listenerContext The context that was bound
		 * @returns {function}
		 */
		off      : function ( listener, listenerContext ) {
			listenerContext = listenerContext || this.host;
			return this.remove( listener, listenerContext );
		},
		/**
		 * Check if listener was attached to Signal.
		 * @param {function} listener The function to check
		 * @param {?object} listenerContext The context that was bound
		 * @returns {boolean}
		 */
		has      : function ( listener, listenerContext ) {
			listenerContext = listenerContext || this.defaultContext || this.host;
			return this.remove( listener, listenerContext );
		},
		/**
		 * Strings!
		 */
		toString : function () {
			return  format( "{0}\nname:{1}\nlisteners:{2}",
				this.declaredClass,
				this.name,
				this.getNumListeners()
			);
		}
	} );

	/**
	 * @classDesc Make an object capable of handling a signal. Or many signals.
	 * @exports mixins/signalable
	 * @mixin
	 * @extends base
	 */
	var Signalable = Base.compose( [Base], /** @lends mixins/signalable# */{
		declaredClass : "mixins/Signalable",

		constructor : function () {
			this.autoLoadSignals = this.autoLoadSignals || true;
			if ( this.autoLoadSignals === true ) {
				this._loadSignals();
			}
		},

		/**
		 * When you make a change to the signals hash after loading, then you can make it reload
		 */
		refreshSignals : function () {
			this._loadSignals();
		},

		/**
		 * Interprets the `signals` hash and instantiates it
		 * @private
		 */
		_loadSignals : function () {
			var signals = this.signals || {};
			sys.each( signals, function ( value, key ) {
				var opts = {};
				if ( !sys.isEmpty( value ) ) {
					if ( sys.isBoolean( value.memorize ) ) {
						opts.memorize = value.memorize;
					}
					if ( sys.isBoolean( value.params ) ) {
						opts.params = value.params;
					}
					if ( !sys.isEmpty( value.context ) ) {
						opts.context = value.context;
					}
				}
				this._addSignal( key, opts );
			} );
		},

		/**
		 * Creates a single signal
		 * @param {string} name The name of the signal
		 * @param {module:mixins/signalable~SignalOptions} options The options the signal expects
		 * @protected
		 */
		_addSignal : function ( name, options ) {
			if ( sys.isEmpty( this[name] ) ) {
				this[name] = new Signal( this, name, options );
			}
		},

		/**
		 * Add a signal to an object. If any members of the hash already exist in `this.signals`, they will be overwritten.
		 * @param {module:mixins/signalable.SignalOptions} signals
		 * @protected
		 */
		_addSignals    : function ( signals ) {
			signals = signals || {};
			sys.each( signals, function ( val, key ) {
				this._addSignal( key, val );
			}, this );
			if ( this.options ) {signals = sys.extend( {}, sys.result( this, 'signals' ), signals );}
			this.signals = signals;
		},
		/**
		 * Clean up
		 * @private
		 */
		destroy        : function () {
			sys.each( sys.keys( this ), function ( key ) {
				if ( this[key] instanceof Signal || this[key] instanceof signals.Signal ) {
					this[key].close();
					this[key].end();
				}
			}, this );
		},
		/**
		 * Request cascade for a signal. NOT READY FOR PRIMETIME!!!!
		 *
		 * @param {string} name The name of the event to cascade
		 * @param {...*} params An *array* of params to pass
		 * @param {number=} depth How deep the cascade should go.
		 * @protected
		 */
		_cascadeSignal : function ( name, params, depth ) {
			depth = depth || 20;
			var that = this;

			cascade( that );

			function cascade( parent ) {
				if ( depth === 0 ) {return false;}

				sys.each( parent, function ( val, key ) {
					if ( !sys.isEmpty( val ) && sys.isObject( val ) ) {
						if ( val instanceof Signal && val === parent[name] ) {
							sys.bind( parent[name].fire, parent, params )( that );
						} else if ( !(val instanceof Signal) ) {
							cascade( val );
						}
					}

				} );
				depth--;
			}
		}

	} );

	module.exports = Signalable;
	Signalable.Signal = Signal;
	Signalable.mixin = Base.mixin;

	/**
	 * When true, the class will load the `signals` hash and create the signal definitions during construction
	 * @memberOf mixins/signalable#
	 * @name autoLoadSignals
	 * @type boolean
	 */

	/**
	 * A hash of signals to create automatically. Each definition consists of a name for the signal as the key
	 * and then a hash of options (nullable) for each signal
	 * @type {hash|function():hash}
	 * @memberOf mixins/signalable#
	 * @name signals
	 * @type module:mixins/signalable.SignalOptions
	 */

}, {"../base/index" : 15, "../strings/format" : 19, "async" : 8, "lodash" : 12, "signals" : 13}], 19                                    : [function ( require, module, exports ) {
	"use strict";
	/**
	 * @fileOverview String helper methods
	 *
	 * @module strings/format
	 */

	/**
	 * Format a string quickly and easily using .net style format strings
	 * @param {string} format A string format like "Hello {0}, now take off your {1}!"
	 * @param {...?} args One argument per `{}` in the string, positionally replaced
	 * @returns {string}
	 *
	 */
	module.exports = function ( format ) {
		var args = Array.prototype.slice.call( arguments, 1 );
		return format.replace( /{(\d+)}/g, function ( match, number ) {
			return typeof args[number] != 'undefined'
				? args[number]
				: match
				;
		} );
	};

}, {}], 20                                                                                                                              : [function ( require, module, exports ) {
	"use strict";
	/**
	 * @fileOverview The logging system for papyrus is based on [http://pimterry.github.io/loglevel/](loglevel) and slightly decorated
	 * @module utils/logger
	 * @requires dcl
	 * @requires loglevel
	 */

	var dcl = require( "dcl" );
//var log = require( 'loglevel' );
	var log = require( "js-logger" );
	/**
	 * A logger class that you can mix into your classes to handle logging settings and state at an object level.
	 * See {@link utils/logger} for the members of this class
	 *
	 * @exports utils/logger.Logger
	 * @class
	 * @see utils/logger
	 */
	var Logger = dcl( null, /** @lends  utils/logger.Logger# */{
		declaredClass : "utils/Logger",
		constructor   : function () {
			log.useDefaults();
		},

		/**
		 * Turn off all logging. If you log something, it will not error, but will not do anything either
		 * and the cycles are minimal.
		 *
		 */
		silent : function () {
//		log.disableAll();
			log.setLevel( log.OFF );
		},
		/**
		 * Turns on all logging levels
		 *
		 */
		all    : function () {
//		log.enableAll();
			log.setLevel( log.DEBUG );
		},
		/**
		 * Sets the logging level to one of `trace`, `debug`, `info`, `warn`, `error`.
		 * @param {string} lvl The level to set it to. Can be  one of `trace`, `debug`, `info`, `warn`, `error`.
		 *
		 */
		level  : function ( lvl ) {
			if ( lvl.toLowerCase() === "none" ) {
				this.disableAll();
			} else {
				log.setLevel( lvl );
			}
		},
		/**
		 * Log a `trace` call
		 * @method
		 * @param {string} The value to log
		 */
		trace  : log.debug,
		/**
		 * Log a `debug` call
		 * @method
		 * @param {string} The value to log
		 */
		debug  : log.debug,
		/**
		 * Log a `info` call
		 * @method
		 * @param {string} The value to log
		 */
		info   : log.info,
		/**
		 * Log a `warn` call
		 * @method
		 * @param {string} The value to log
		 */
		warn   : log.warn,
		/**
		 * Log a `error` call
		 * @method
		 * @param {string} The value to log
		 */
		error  : log.error
	} );

	module.exports = new Logger();
	/**
	 * The system global, cross-platform logger
	 * @name utils/logger
	 * @static
	 * @type {utils/logger.Logger}
	 */
	module.exports.Logger = Logger;

}, {"dcl" : 9, "js-logger" : 11}], 21                                                                                                   : [function ( require, module, exports ) {
	"use strict";
	/**
	 * @fileOverview The basis for all views in the system
	 * @module view
	 * @requires base
	 * @requires async
	 */

	var Base = require( "../base" );
	var Signalable = require( "../mixins/signalable" );
	var Presence = require( "./presence" );
	var async = require( "async" );
	var sys = require( "lodash" );
	/**
	 * A view is the most basic mode of displaying things on a web document
	 * @exports View
	 * @constructor
	 * @memberOf module:view
	 */
	var View = Base.compose( [Base, Presence, Signalable], /** @lends module:view.View# */{
		declaredClass : "view",
		/**
		 * The template that will be rendered, if supplied
		 *
		 * @type {function}
		 */
		template      : null,
		constructor   : function ( options ) {
			options = options || {};
			if ( options.template ) {
				this.template = options.template;
			}
			var that = this;
			this.options = this.options || options;
			this._viewCallState = {
				start : false,
				open  : false,
				close : false,
				end   : false
			};
			this._resetViewCallState = function () {
				this._viewCallState.start = this._viewCallState.open = this._viewCallState.close = this._viewCallState.end = false;
			};
			this._addSignals( {
				/**
				 * When the view has been started
				 * @event module:view.View#viewStarted
				 */
				viewStarted          : null,
				/**
				 * Just before we start the view
				 * @event module:view.View#beforeViewStarted
				 */
				beforeViewStarted    : null,
				/**
				 * When the view has been ended
				 * @event module:view.View#viewEnded
				 */
				viewEnded            : null,
				/**
				 * Just before we end the view
				 * @event module:view.View#beforeViewEnded
				 */
				beforeViewEnded      : null,
				/**
				 * When the view has been rendered
				 * @event module:view.View#viewRendered
				 */
				viewRendered         : null,
				/**
				 * Just before we render the view
				 * @event module:view.View#beforeViewRendered
				 */
				beforeViewRendered   : null,
				/**
				 * When the view has been opened
				 * @event module:view.View#viewOpened
				 */
				viewOpened           : null,
				/**
				 * Just before we open the view
				 * @event module:view.View#beforeViewOpened
				 */
				beforeViewOpened     : null,
				/**
				 * When the view has been closeed
				 * @event module:view.View#viewClosed
				 */
				viewClosed           : null,
				/**
				 * Just before we close the view
				 * @event module:view.View#beforeViewClosed
				 */
				beforeViewClosed     : null,
				/**
				 * When the view has been shown
				 * @event module:view.View#viewShown
				 */
				viewShown            : null,
				/**
				 * Just before we show the view
				 * @event module:view.View#beforeViewShown
				 */
				beforeViewShown      : null,
				/**
				 * When the view has been hidden
				 * @event module:view.View#viewHidden
				 */
				viewHidden           : null,
				/**
				 * Just before we hide the view
				 * @event module:view.View#beforeViewHidden
				 */
				beforeViewHidden     : null,
				/**
				 * When the view has been unrendered
				 * @event module:view.View#viewUnrendered
				 */
				viewUnrendered       : null,
				/**
				 * Just before we unrender the view
				 * @event module:view.View#beforeViewUnrendered
				 */
				beforeViewUnrendered : null
			} );

			/**
			 * The current state of the view. This value is protected by `viewState`
			 * @type {number}
			 * @private
			 */
			var state = 0;

			/**
			 * The current state of the view. You can set a new state by assigning to this or calling one of the state methods
			 * @type {number}
			 * @name viewState
			 * @memberOf module:view.View#
			 * @readOnly
			 */
			Object.defineProperty( this, "viewState", {
				get : function () {
					return viewStates.fromValue( state );
				}
			} );

			/**
			 * The current view state name
			 * @type {number}
			 * @name viewStateName
			 * @memberOf module:view.View#
			 * @readOnly
			 */
			Object.defineProperty( this, "viewStateName", {
				get : function () {
					var s = viewStates.fromValue( state );
					if ( s ) {
						return s.name;
					} else {
						return null;
					}
				}
			} );

			/**
			 * Set level will change the state to one of the `viewState`s and call each intervening step
			 * @param {number|viewState|string} requestedLevel The level to set it to, see {@link viewStates} for possible value
			 * @param {object=} params A hash of parameters to pass to the operation
			 * @param {function(err)} callback When done
			 * @private
			 */
			this._setLevel = function ( requestedLevel, params, callback ) {

				if ( sys.isFunction( params ) ) {
					callback = params;
					params = null;
				}
				params = params || {};
				callback = callback || function () {};

				var newLevel = requestedLevel;

				if ( newLevel ) {
					newLevel = newLevel.val;
				} else if ( !sys.isNumber( newLevel ) ) {
					callback( new TypeError( "newLevel must be a number or viewState record" ) );
				}

				var dir;
				if ( newLevel > state ) {
					dir = "up"
				} else if ( newLevel < state ) {
					dir = "down";
				} else {
					return callback();
				}

				async.whilst( function () {
					return newLevel !== state;
				}, function ( done ) {
					var next;
					if ( dir === "up" ) {
						next = viewStates.nextUp( state );
						state = next.val;

						if ( next && next.upOp ) {
							that[next.upOp]( params, done );
						} else {
							done();
						}
					} else {
						next = viewStates.nextDown( state );
						state = next.val;

						if ( next && next.downOp ) {

							that[next.downOp]( params, done );
						} else {
							done();
						}
					}

				}, callback );

			}
		},

		/**
		 * Render the template to `$el`
		 * @param {object?} params Anything you want to pass to the operation
		 * @param {function(err)} callback When done
		 */
		render : function ( params, callback ) {
			this._resetViewCallState();
			this._setLevel( viewStates.rendered, params, callback );
		},

		/**
		 * Starts the view, which is just to bootstrap stuff
		 * @param {object?} params Anything you want to pass to the operation
		 * @param {function(err)} callback When done
		 */
		start : function ( params, callback ) {
			this._resetViewCallState();
			this._viewCallState.start = true;
			this._setLevel( viewStates.started, params, callback );
		},

		/**
		 * Opens the view, which is the step before rendering, grab your data and format it for the template
		 * @param {object?} params Anything you want to pass to the operation
		 * @param {function(err)} callback When done
		 */
		open : function ( params, callback ) {
			this._resetViewCallState();
			this._viewCallState.open = true;
			this._setLevel( viewStates.opened, params, callback );
		},

		/**
		 * Shows a view. If called by a zone, it means this will be mounted somewhere. Otherwise it just calls `show` on `$el` with
		 * any animations you may have set for this view
		 * @param {object?} params Anything you want to pass to the operation
		 * @param {function(err)} callback When done
		 */
		show : function ( params, callback ) {
			this._resetViewCallState();
			this._setLevel( viewStates.interactive, params, callback );
		},

		/**
		 * Hides a view. If called by a zone, it means this will be unmounted. Otherwise it just calls `hide` on `$el` with
		 * any animations you may have set for this view
		 * @param {object?} params Anything you want to pass to the operation
		 * @param {function(err)} callback When done
		 */
		hide : function ( params, callback ) {
			this._resetViewCallState();
			this._setLevel( viewStates.rendered, params, callback );
		},

		/**
		 * Remove the template from `$el`
		 * @param {object?} params Anything you want to pass to the operation
		 * @param {function(err)} callback When done
		 */
		unrender : function ( params, callback ) {
			this._resetViewCallState();
			this._setLevel( viewStates.opened, params, callback );
		},
		/**
		 * End
		 * @param {object?} params Anything you want to pass to the operation
		 * @param {function(err)} callback When done
		 */
		end      : function ( params, callback ) {
			this._resetViewCallState();
			this._viewCallState.end = true;
			this._setLevel( viewStates.dormant, params, callback );
		},

		/**
		 * Close
		 * @param {object?} params Anything you want to pass to the operation
		 * @param {function(err)} callback When done
		 */
		close : function ( params, callback ) {
			this._resetViewCallState();
			this._viewCallState.close = true;
			this._setLevel( viewStates.started, params, callback );
		},

		/**
		 * Start the view
		 */
		_doStart : function ( params, callback ) {
			if ( sys.isFunction( params ) ) {
				callback = params;
				params = null;
			}
			if ( !sys.isFunction( callback ) ) {
				callback = sys.identity;
			}
			var that = this;
			async.series( [
				sys.partial( this.beforeViewStarted.fire, params ),
				sys.partial( this.viewStarted.fire, params ) ,
				function ( done ) {
					if ( that._viewCallState.start === false ) {
						Base.prototype.start.call( that, params );
						that._viewCallState.start = true;
					}
					done();
				}
			], callback );
		},

		/**
		 * Open the view
		 */
		_doOpen : function ( params, callback ) {
			if ( sys.isFunction( params ) ) {
				callback = params;
				params = null;
			}
			if ( !sys.isFunction( callback ) ) {
				callback = sys.identity;
			}
			var that = this;
			async.series( [
				sys.partial( this.beforeViewOpened.fire, params ),
				sys.partial( this.viewOpened.fire, params ),
				function ( done ) {
					if ( that._viewCallState.open === false ) {
						Base.prototype.open.call( that, params );
						that._viewCallState.open = true;
					}
					done();
				}
			], callback );
		},

		/**
		 * Render the view
		 * @protected
		 */
		_doRender   : function ( params, callback ) {

			if ( sys.isFunction( params ) ) {
				callback = params;
				params = null;
			}
			if ( !sys.isFunction( callback ) ) {
				callback = sys.identity;
			}
			var that = this;

			async.series( [
				sys.partial( this.beforeViewRendered.fire, params ),
				function ( done ) {
					if ( sys.isFunction( that.template ) ) {
						params = params || {};
						params._options = that.options;
						params._view = sys.isFunction( that.toJSON ) ? that.toJSON() : that;
						that.$el.html( that.template( params ) );
					}
					done();
				},
				sys.partial( this.viewRendered.fire, params )
			], callback );
		},
		/**
		 * Show the view
		 */
		_doShow     : function ( params, callback ) {
			if ( sys.isFunction( params ) ) {
				callback = params;
				params = null;
			}
			if ( !sys.isFunction( callback ) ) {
				callback = sys.identity;
			}
			var that = this;

			async.series( [
				sys.partial( that.beforeViewShown.fire, params ),
				function ( done ) {
					if ( !sys.isEmpty( that.showAnimation ) ) {
						that.showAnimation.animate( this.$el, params, done );
					} else {
						that.$el.show();
						done();
					}
				},
				sys.partial( that.viewShown.fire, params )
			], callback );

		},
		/**
		 * Hide the view
		 */
		_doHide     : function ( params, callback ) {
			if ( sys.isFunction( params ) ) {
				callback = params;
				params = null;
			}
			if ( !sys.isFunction( callback ) ) {
				callback = sys.identity;
			}
			var that = this;

			async.series( [
				sys.partial( this.beforeViewHidden.fire, params ),
				function ( done ) {
					if ( !sys.isEmpty( that.hideAnimation ) ) {
						that.hideAnimation.animate( this.$el, params, done );
					} else {
						that.$el.hide();
						done();
					}
				},
				sys.partial( this.viewHidden.fire, params )
			], callback );

		},
		/**
		 * Unrender the view
		 */
		_doUnrender : function ( params, callback ) {
			if ( !sys.isFunction( this.template ) ) {
				throw new TypeError( "render requires a template method" );
			}

			if ( sys.isFunction( params ) ) {
				callback = params;
				params = null;
			}
			if ( !sys.isFunction( callback ) ) {
				callback = sys.identity;
			}
			var that = this;

			async.series( [
				sys.partial( that.beforeViewUnrendered.fire, params ),
				function ( done ) {
					that.$el.empty();
					done();
				},
				sys.partial( that.viewUnrendered.fire, params )
			], callback );

		},
		/**
		 * Close the view
		 */
		_doClose    : function ( params, callback ) {
			if ( sys.isFunction( params ) ) {
				callback = params;
				params = null;
			}
			if ( !sys.isFunction( callback ) ) {
				callback = sys.identity;
			}
			var that = this;
			async.series( [
				sys.partial( this.beforeViewClosed.fire, params ),
				sys.partial( this.viewClosed.fire, params ) ,
				function ( done ) {
					if ( that._viewCallState.close === false ) {
						Base.prototype.close.call( that, params );
						that._viewCallState.close = true;
					}
					done();
				}
			], callback );
		},
		/**
		 * End the view
		 */
		_doEnd      : function ( params, callback ) {
			if ( sys.isFunction( params ) ) {
				callback = params;
				params = null;
			}
			if ( !sys.isFunction( callback ) ) {
				callback = sys.identity;
			}
			var that = this;
			async.series( [
				sys.partial( this.beforeViewEnded.fire, params ),
				sys.partial( this.viewEnded.fire, params ),
				function ( done ) {
					if ( that._viewCallState.end === false ) {
						Base.prototype.end.call( that, params );
						that._viewCallState.end = true;
					}
					done();
				}
			], callback );
		}
	} );
	/**
	 * The states a view can occupy. This is used to determine what state we need to be in order to accomplish what is being asked.
	 * @readonly
	 * @enum {number}
	 */
	var viewStates = {
		/**
		 * Get a viewState from a name
		 * @param {string} name The name to lookup
		 * @return {viewStates?}
		 */
		fromName  : function ( name ) {
			return viewStates[name];
		},
		/**
		 * Get a view state from a value
		 * @param {number} val The value to look for
		 * @return {viewStates?}
		 */
		fromValue : function ( val ) {
			return sys.find( viewStates, function ( item ) {
				return item.val === val;
			} );
		},
		/**
		 * Gets the next state up from the one provided
		 * @param {val|viewState}
		 * @return {viewStates?}
		 */
		nextUp    : function ( state ) {

			var toAnalyze = viewStates.resolve( state );
			var nextUp = viewStates.resolve( toAnalyze.nextStateUp );

			return nextUp;
		},
		/**
		 * Gets the next state down from the one provided
		 * @param {val|viewState}
		 * @return {viewStates?}
		 */
		nextDown  : function ( state ) {
			var toAnalyze = viewStates.resolve( state );
			var nextDown = viewStates.resolve( toAnalyze.nextStateDown );

			return nextDown;

		},
		/**
		 * Resolves a value or name or viewState and returns the viewState
		 * @param {string|number|viewState} res The value to resolve
		 * @return {viewStates?}
		 */
		resolve   : function ( res ) {
			if ( sys.isObject( res ) ) {
				return res;
			} else if ( sys.isString( res ) ) {
				return viewStates.fromName( res );
			} else {
				return viewStates.fromValue( res );
			}
		},

		/**
		 * Nothing is happening, no visual or hidden components are available
		 */
		"dormant"     : {val : 0, nextStateUp : "started", nextStateDown : null, upOp : null, downOp : null, name : "dormant"},
		/**
		 * The view is started, it has all it needs to render and display
		 */
		"started"     : {val : 10, nextStateUp : "opened", nextStateDown : "dormant", upOp : "_doStart", downOp : "_doEnd", name : "started"},
		/**
		 * Ready to render
		 */
		"opened"      : {val : 20, nextStateUp : "rendered", nextStateDown : "started", upOp : "_doOpen", downOp : "_doClose", name : "opened"},
		/**
		 * Ready to show
		 */
		"rendered"    : {val : 30, nextStateUp : "shown", nextStateDown : "opened", upOp : "_doRender", downOp : "_doUnrender", name : "rendered" },
		/**
		 * Displayed
		 */
		"shown"       : {val : 40, nextStateUp : "interactive", nextStateDown : "rendered", upOp : "_doShow", downOp : "_doHide", name : "shown"},
		/**
		 * Whole hog
		 */
		"interactive" : {val : 50, nextStateUp : null, nextStateDown : "shown", upOp : null, downOp : null, name : "intertactive"}
	};

	module.exports = View;

}, {"../base" : 15, "../mixins/signalable" : 18, "./presence" : 22, "async" : 8, "lodash" : 12}], 22                                    : [function ( require, module, exports ) {
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

}, {"../base" : 15, "../mixins/signalable" : 18, "../strings/format" : 19, "lodash" : 12}], 23                                          : [function ( require, module, exports ) {
	"use strict";

	var Base = require( "../base" );
	var Signalable = require( "../mixins/signalable" );
	var View = require( "./index" );
	var sys = require( "lodash" );
	var collector = require( "../document/collector" ).object;
	var async = require( "async" );
	/**
	 * A zone is a special kind of view that contains other views
	 * @constructor
	 * @exports view/zone
	 */
	var Zone = Base.compose( [Base, View], /** @lends view/zone# */{
		declaredClass : "view/zone",
		constructor   : function () {
			this.viewsCollection = collector();
			this.views = this.viewsCollection._heap;

			this._loadViews();
		},

		/**
		 * Add a a view definitions to the zone. If any members of the hash already exist, they will be overwritten.
		 * @param {hash} viewDefs A hash of viewDefs you want to set
		 * @protected
		 */
		_addViewDefs : function ( viewDefs ) {
			viewDefs = viewDefs || {};
			if ( this._viewsDefs ) {viewDefs = sys.extend( {}, sys.result( this, '_viewsDefs' ), viewDefs );}
			this._viewsDefs = viewDefs;
		},

		/**
		 * Loads up the view definitions that were defined and adds them to the collection
		 * @param {object} views The views to load on render
		 * @protected
		 */
		_loadViews : function ( views ) {
			views = sys.extend( {}, sys.result( this, '_viewsDefs' ), views );

			sys.each( views, function ( val, key ) {
				this.loadView( key, val );
			}, this );
		},

		/**
		 * Create an instance of a view and it will be added to the views collection
		 * @param {string} key The name of the view
		 * @param {object|string} val The definition
		 */
		loadView         : function ( key, val ) {
			var instance;
			var opts = sys.isString( val ) ? {selector : this.$el.find( val )} : val || {};

			if ( sys.isFunction( val.Type ) ) {
				opts = sys.omit( val, "Type" );
				instance = new val.Type( opts );
			} else {
				instance = new View( val );
			}

			if ( instance ) {
				this.views[key] = instance;
			}
		},
		/**
		 * Does what it says
		 * @param {object?} params Parameters to pass to the views
		 * @param {function?} callback A callback for when it is done
		 */
		showAllViews     : function ( params, callback ) {
			this.viewsCollection.each( function ( val, key ) {
				val.show( params, callback );
			}, this );
		},
		/**
		 * Does what it says
		 * @param {object?} params Parameters to pass to the views
		 * @param {function?} callback A callback for when it is done
		 */
		renderAllViews   : function ( params, callback ) {
			this.viewsCollection.each( function ( val, key ) {
				val.render( params, callback );
			}, this );
		},
		/**
		 * Does what it says
		 * @param {object?} params Parameters to pass to the views
		 * @param {function?} callback A callback for when it is done
		 */
		startAllViews    : function ( params, callback ) {
			this.viewsCollection.each( function ( val, key ) {
				val.start( params, callback );
			}, this );
		},
		/**
		 * Does what it says
		 * @param {object?} params Parameters to pass to the views
		 * @param {function?} callback A callback for when it is done
		 */
		openAllViews     : function ( params, callback ) {
			this.viewsCollection.each( function ( val, key ) {
				val.open( params, callback );
			}, this );
		},
		/**
		 * Does what it says
		 * @param {object?} params Parameters to pass to the views
		 * @param {function?} callback A callback for when it is done
		 */
		hideAllViews     : function ( params, callback ) {
			this.viewsCollection.each( function ( val, key ) {
				val.hide( params, callback );
			}, this );
		},
		/**
		 * Does what it says
		 * @param {object?} params Parameters to pass to the views
		 * @param {function?} callback A callback for when it is done
		 */
		unrenderAllViews : function ( params, callback ) {
			this.viewsCollection.each( function ( val, key ) {
				val.unrender( params, callback );
			}, this );
		},
		/**
		 * Does what it says
		 * @param {object?} params Parameters to pass to the views
		 * @param {function?} callback A callback for when it is done
		 */
		endAllViews      : function ( params, callback ) {
			this.viewsCollection.each( function ( val, key ) {
				val.end( params, callback );
			}, this );
		},
		/**
		 * Does what it says
		 * @param {object?} params Parameters to pass to the views
		 * @param {function?} callback A callback for when it is done
		 */
		closeAllViews    : function ( params, callback ) {
			this.viewsCollection.each( function ( val, key ) {
				val.close( params, callback );
			}, this );
		},
		/**
		 * Renders the zone and optionally renders all child views
		 * @param {object?} params Anything you want to pass to the operation
		 * @param {function(err)} callback When done
		 */
		render           : Base.super( function ( sup ) {

			return function ( params, callback ) {
				sup.call( this, params, callback )
				if ( params && params._allViews ) {
					this.renderAllViews( params, callback );
				}
			}
		} ),

		/**
		 * Starts the zone and optionally renders all child views
		 * @param {object?} params Anything you want to pass to the operation
		 * @param {function(err)} callback When done
		 */
		start : Base.super( function ( sup ) {

			return function ( params, callback ) {
				sup.call( this, params, callback );
				if ( params && params._allViews ) {
					this.startAllViews( params, callback );
				}
			}
		} ),

		/**
		 * Opens the zone and optionally renders all child views
		 * @param {object?} params Anything you want to pass to the operation
		 * @param {function(err)} callback When done
		 */
		open : Base.super( function ( sup ) {

			return function ( params, callback ) {
				sup.call( this, params, callback );
				if ( params && params._allViews ) {
					this.openAllViews( params, callback );
				}
			}
		} ),

		/**
		 * Shows the zone and optionally renders all child views
		 * @param {object?} params Anything you want to pass to the operation
		 * @param {function(err)} callback When done
		 */
		show : Base.super( function ( sup ) {

			return function ( params, callback ) {
				sup.call( this, params, callback );
				if ( params && params._allViews ) {
					this.showAllViews( params, callback );
				}
			}
		} ),

		/**
		 * Hides the zone and optionally renders all child views
		 * @param {object?} params Anything you want to pass to the operation
		 * @param {function(err)} callback When done
		 */
		hide : Base.super( function ( sup ) {

			return function ( params, callback ) {
				sup.call( this, params, callback );
				if ( params && params._allViews ) {
					this.hideAllViews( params, callback );
				}
			}
		} ),

		/**
		 * Undrenders the zone and optionally renders all child views
		 * @param {object?} params Anything you want to pass to the operation
		 * @param {function(err)} callback When done
		 */
		unrender : Base.super( function ( sup ) {

			return function ( params, callback ) {
				sup.call( this, params, callback );
				if ( params && params._allViews ) {
					this.startAllViews( params, callback );
				}
			}
		} ),

		/**
		 * Ends the zone and optionally renders all child views
		 * @param {object?} params Anything you want to pass to the operation
		 * @param {function(err)} callback When done
		 */
		end : Base.super( function ( sup ) {

			return function ( params, callback ) {
				sup.call( this, params, callback );
				if ( params && params._allViews ) {
					this.endAllViews( params, callback );
				}
			}
		} ),

		/**
		 * Closes the zone and optionally renders all child views
		 * @param {object?} params Anything you want to pass to the operation
		 * @param {function(err)} callback When done
		 */
		close : Base.super( function ( sup ) {

			return function ( params, callback ) {
				sup.call( this, params, callback );
				if ( params && params._allViews ) {
					this.closeAllViews( params, callback );
				}
			}
		} ),

		mountView : function ( name, view, opts, callback ) {
			var mountIn = null;
			if ( sys.isString( opts ) ) {
				opts = sys( isString( opts ) ) ? {selector : opts} : opts || {empty : true, placement : "append"};
			}
			async.series( [
				function ( done ) {
					if ( this.views[name] && this.views[name] instanceof View ) {
						this.views[name].end( done );
					} else {
						done();
					}
				},
				function ( done ) {
					if ( opts.selector ) {
						if ( opts.global === true ) {
							mountIn = $( opts.selector );
						} else {
							mountIn = this.$el.find( opts.selector );
						}
					} else if ( opts.mountIn && opts.mountIn instanceof jQuery ) {
						mountIn = opts.mountIn;
					} else {
						mountIn = this.$el;
					}
					done();
				},
				function ( done ) {
					if ( mountIn ) {
						if ( opts.empty === true ) {
							mountIn.empty();
						}
						if ( opts.placement === "append" ) {
							mountIn.append( view.$el );
						} else {
							mountIn.prepend( view.$el );
						}
					}
					done();
				}
			], callback );
		}
	} );

	module.exports = Zone;

}, {"../base" : 15, "../document/collector" : 16, "../mixins/signalable" : 18, "./index" : 21, "async" : 8, "lodash" : 12}]}, {}, [7] )
