#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var Path = require('path');
var sprintf = require('yow/sprintf');
var mkpath = require('yow/fs').mkpath;
var isObject = require('yow/is').isObject;
var logs = require('yow/logs');
var Twitter = require('twitter');


function debug() {
	console.log.apply(this, arguments);
}

var App = function() {

	function parseArgs() {

		var args = require('yargs');

		args.usage('Usage: $0 [options]');
		args.help('h').alias('h', 'help');

		args.option('log', {alias: 'l', describe:'Log output to file'});
		args.option('port', {alias: 'p', describe:'Listen to specified port', default:3911});

		args.wrap(null);

		args.check(function(argv) {
			return true;
		});

		return args.argv;
	}


	function run(argv) {

		var app = require('http').createServer(function(){});
		var io = require('socket.io')(app);

		if (argv.log) {
			var logFile = Path.join(__dirname, Path.join('../..', 'alerts.log'));
			logs.redirect(logFile);
		}

		logs.prefix();

		app.listen(argv.port, function() {
			console.log(sprintf('Server started. Listening on port %d...', argv.port));
		});

		io.on('connection', function(socket) {

			socket.on('disconnect', function() {
				console.log('A socket disconnected.');
			});

			socket.on('tweet', function(options) {

				var client = new Twitter({
					consumer_key: 'eFrUDj30QXyM4kjBeAevUIhik',
					consumer_secret: '9X6Wln6wXFg9yGB574AoA4GIwYFWGNksqhTDFdUrtue3ut5uqI',
					access_token_key: '802934085089951746-bnN7ElNsOyRlShcEtnQYh3e6Lrz2mlv',
					access_token_secret: 'DxjDouf0UGcPY9r76SPxI5ZmqtKf7LqWMbLiqoi1apKpN'
				});

				if (options.status) {
					var now = new Date();
					var text = sprintf('%s: %s', now.toISOString(), options.status);

					client.post('statuses/update', {status: text},  function(error, tweet, response) {
						if (error) {
							console.log('Tweet failed.');
							console.log(error);
						};
					});
				}

			});

		});
	}



	run(parseArgs());
};

module.exports = new App();
