'use strict';

const express = require('express'),
	http = require('http'),
	https = require('https'),
	dbConnect = require('./helpers/db-connect'),
	api = express(),
	FeedParser = require('feedparser'),
	request = require('request');

/*require('./config/config')(api);
require('./routes/routes')(api);*/

const req = request('http://foros.3dgames.com.ar/external.php?type=RSS2'),
feedparser = new FeedParser();

req.on('error', function (error) {
	// handle any request errors
});

req.on('response', function (res) {
	var stream = this; // `this` is `req`, which is a stream

	if (res.statusCode !== 200) {
		this.emit('error', new Error('Bad status code'));
	}
	else {
		stream.pipe(feedparser);
	}
});

feedparser.on('error', function (error) {
	// always handle errors
});

feedparser.on('readable', function () {
	// This is where the action is!
	var stream = this; // `this` is `feedparser`, which is a stream
	var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
	var item;

	while (item = stream.read()) {
		console.log(item);
	}
});

if (process.env.NODE_ENV === 'development') {
	https.createServer(credentials, api).listen(process.env.PORT || 3002);
} else {
	http.createServer(api).listen(process.env.PORT || 3002);
}
console.log('FWTV-API application started on port ' + (process.env.PORT || 3002));

module.exports = api;

