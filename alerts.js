#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var Path = require('path');
var sprintf = require('yow/sprintf');
var mkpath = require('yow/fs').mkpath;
var isObject = require('yow/is').isObject;
var logs = require('yow/logs');


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
				console.log('tweet', options);
			});

		});
	}



	run(parseArgs());
};

module.exports = new App();
