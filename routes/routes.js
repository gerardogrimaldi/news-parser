'use strict';

const express = require('express'),
	env = process.env.NODE_ENV || 'development';

module.exports = (app) => {

	//app.get('*', require('../redirector').taggify);

	app.all('*', (req, res, next) => {
		res.header('Access-Control-Allow-Origin', '*');
		res.header(
			'Access-Control-Allow-Headers',
			'Origin, X-Requested-With, Content-Type, Accept, X-UserId, X-Nonce, ' +
			'X-Secret, X-Ts, X-Sig, X-Vendor-Sig, X-Vendor-Apikey, X-Vendor-Nonce, X-Vendor-Ts, X-ProfileId');
		res.header('Access-Control-Allow-Methods', 'HEAD,OPTIONS,GET,PUT,POST,DELETE');
		next();
	});

	app.get('/', (req, res) => {
		res.redirect('/');
	});

	if (env === 'production') {
		app.use('/docs', express.static('dist'));
	} else {
		app.use('/docs', express.static('docs'));
	}

	require('./private/parser')(app);

};