#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var Path = require('path');
var sprintf = require('yow/sprintf');
var mkpath = require('yow/fs').mkpath;
var isObject = require('yow/is').isObject;
var isString = require('yow/is').isString;
var logs = require('yow/logs');
var Twitter = require('twitter');


function debug() {
	console.log.apply(this, arguments);
}

var App = function() {

	function parseArgs() {

		var args = require('yargs');

		args.usage('Usage: $0 [options]');
		args.help('help').alias('help', 'h');

		args.option('log', {alias: 'l', describe:'Log output to file'});
		args.option('port', {alias: 'p', describe:'Listen to specified port', default:3911});

		args.wrap(null);

		args.check(function(argv) {
			if (!isString(process.env.TWITTER_CONSUMER_KEY))
				return "TWITTER_CONSUMER_KEY not set.";

			if (!isString(process.env.TWITTER_CONSUMER_SECRET))
				return "TWITTER_CONSUMER_SECRET not set.";

			if (!isString(process.env.TWITTER_ACCESS_TOKEN_KEY))
				return "TWITTER_ACCESS_TOKEN_KEY not set.";

			if (!isString(process.env.TWITTER_ACCESS_TOKEN_SECRET))
				return "TWITTER_ACCESS_TOKEN_SECRET not set.";

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

			console.log('A socket connected.');

			socket.on('disconnect', function() {
				console.log('A socket disconnected.');
			});

			socket.on('tweet', function(options) {

				var client = new Twitter({
					consumer_key: process.env.TWITTER_CONSUMER_KEY,
					consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
					access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
					access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
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
				else {
					console.log('No tweet status specified.');
				}

			});

		});
	}



	run(parseArgs());
};

module.exports = new App();
