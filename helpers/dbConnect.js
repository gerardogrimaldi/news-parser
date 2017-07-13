'use strict';
const uriString = process.env.MONGOLAB_URI || 'mongodb://localhost:27017',
	mongoose = require('mongoose');


module.exports = mongoose.connect(uriString, function (err, res) {
	if (err) {
		console.log ('ERROR connecting to: ' + uriString + '. ' + err);
	} else {
		console.log ('Succeeded connected to: ' + uriString);
	}
});