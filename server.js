'use strict';

const express = require('express'),
	http = require('http'),
	https = require('https'),
	dbConnect = require('./helpers/db-connect'),
	api = express();

/*require('./config/config')(api);
require('./routes/routes')(api);*/

// If dev create https server, in production Heroku handles this
if (process.env.NODE_ENV === 'development') {
 https.createServer(credentials, api).listen(process.env.PORT || 3002);
} else {
 http.createServer(api).listen(process.env.PORT || 3002);
}

console.log('FWTV-API application started on port ' + (process.env.PORT || 3002));

// Expose api
module.exports = api;

/*
function main() {
    if (work) {
        var day = new Date(new Date( new Date().getTime() + offset * 3600 * 1000).toUTCString().replace( / GMT$/, '' )).getDay();//var day = new Date( new Date().getTime() + offset * 3600 * 1000).toUTCString().replace( / GMT$/, '' ).getDay();//;
        if (day !== 0 && day !==6 ) {
            var hour = new Date(new Date(new Date().getTime() + offset * 3600 * 1000).toUTCString().replace( / GMT$/, '' )).getHours();
            if (hour >= 9 && hour <= 18) {
                console.log('Working...');
                try {
                    worker();
                } catch (Err) {
                    onError(Err);
                }
            } else {
                console.log('Not Working hours...');
            }
        } else {
            console.log('No Working Weekday...');
        }
    }
    setTimeout(main, intervalTime);
}

function worker() {
    var c = new Crawler( {'maxConnections': 10, 'callback': function(error,result,$) {}});
    c.queue([{
        'uri':'http://www.ambito.com/economia/mercados/monedas/dolar/',
        'jQuery':false,
        'callback':function(error,result) {
            if(error && error.response.statusCode !== 200) { console.log('Request error.'); }
            if(result.body.length > 0){
                getValuesDolar(result.body.toString());
                console.log('Grabbed Dolar ', result.body.length, 'bytes');
            }
        }
    }]);
    c.queue([{
        'uri': 'http://www.ambito.com/economia/mercados/monedas/euro/?ric=EUR=X',//'http://ambito.com/economia/mercados/monedas/euro/',
        'jQuery':false,
        'callback':function(error,result) {
            if(error && error.response.statusCode !== 200) { console.log('Request error.'); }
            if(result.body.length > 0){
                getValuesEuro(result.body.toString());
                console.log('Grabbed Euro ', result.body.length, 'bytes');
            }
        }
    }]);
    c.queue([{
        'uri': 'http://www.ambito.com/economia/mercados/monedas/info/?ric=BRL=X',
        'jQuery':false,
        'callback':function(error,result) {
            if(error && error.response.statusCode !== 200) { console.log('Request error.'); }
            if(result.body.length > 0){
                getValuesReal(result.body.toString());
                console.log('Grabbed Real ', result.body.length, 'bytes');
            }
        }
    }]);
}

function getValuesReal(resultString){
    var window = require('jsdom').jsdom(resultString, null, {
        FetchExternalResources: false,
        ProcessExternalResources: false,
        MutationEvents: false,
        QuerySelector: false
    }).createWindow();
    var $ = jquery.create(window);
    compraReal = $('#compra big').text();
    ventaReal = $('#venta big').text();
    console.log(compraReal);
    console.log(ventaReal);
    if(compraReal === '' && ventaReal === '') {
        onError('Ambito esta caido FIJATE!');
    }
    console.log('real');
    saveVals();
}

function getValuesDolar(resultString){
    var window = require('jsdom').jsdom(resultString, null, {
        FetchExternalResources: false,
        ProcessExternalResources: false,
        MutationEvents: false,
        QuerySelector: false
    }).createWindow();
    var $ = jquery.create(window);
    compraDolar = $('.bonosPrincipal.dolarPrincipal .floatleft .ultimo').text().split('COMPRA');
    ventaDolar = $('.bonosPrincipal.dolarPrincipal .floatleft .cierreAnterior').text().split('VENTA');
    console.log(compraDolar);
    console.log(ventaDolar);
    if(compraDolar === '' && ventaDolar === '') {
        onError('Ambito esta caido FIJATE!');
    }
    console.log('dolar');
    saveVals();
}

function getValuesEuro(resultString){
    var window = require('jsdom').jsdom(resultString, null, {
        FetchExternalResources: false,
        ProcessExternalResources: false,
        MutationEvents: false,
        QuerySelector: false
    }).createWindow();
    var $ = jquery.create(window);
    compraEuro = $('#compra big').text();
    ventaEuro = $('#venta big').text();
    console.log(compraEuro);
    console.log(ventaEuro);
    if(compraEuro === '' && ventaEuro === '') {
        onError('Ambito esta caido FIJATE!');
    }
    console.log('euro');
    saveVals();
}

function saveVals(){
    try {
        console.log('deaca');
        console.log(compraDolar);
        console.log(ventaDolar);
        console.log(compraReal);
        console.log(ventaReal);
        console.log(compraEuro);
        console.log(ventaEuro);
        if (compraDolar !== undefined && ventaDolar !== undefined && compraReal !== undefined && ventaReal !== undefined && compraEuro !== undefined && ventaEuro !== undefined) {
            var dolarTarjeta;
            var valoresDolarHoyObj;
            var dateBA = new Date(new Date().getTime() + offset * 3600 * 1000).toUTCString().replace(/ GMT$/, '');
            dolarTarjeta = parseFloat(ventaDolar[0].replace(',', '.')) + (parseFloat(ventaDolar[0].replace(',', '.')) * 35 / 100);
            dolarTarjeta = dolarTarjeta.toFixed(3);
            valoresDolarHoyObj = new Valores({
                dolarCompra: compraDolar[0].replace(',', '.'),
                dolarVenta: ventaDolar[0].replace(',', '.'),
                dolarBlueCompra: compraDolar[1].replace(',', '.'),
                dolarBlueVenta: ventaDolar[1].replace(',', '.'),
                dolarTarjeta: dolarTarjeta,
                realCompra: compraReal.replace(',', '.'),
                realVenta: ventaReal.replace(',', '.'),
                euroCompra: compraEuro.replace(',', '.'),
                euroVenta: ventaEuro.replace(',', '.'),
                date: dateBA
            });

            Valores.findOne()
                .select('dolarCompra dolarVenta dolarBlueCompra dolarBlueVenta dolarTarjeta realCompra realVenta euroCompra euroVenta date')
                .sort('-date')
                .exec(
                    function (err, doc) {
                        if (err) {
                            return onError(err);
                        }
                        if (doc.dolarCompra !== valoresDolarHoyObj.dolarCompra ||
                            doc.dolarVenta !== valoresDolarHoyObj.dolarVenta ||
                            doc.dolarBlueCompra !== valoresDolarHoyObj.dolarBlueCompra ||
                            doc.dolarBlueVenta !== valoresDolarHoyObj.dolarBlueVenta ||
                            doc.realCompra !== valoresDolarHoyObj.realCompra ||
                            doc.realVenta !== valoresDolarHoyObj.realVenta ||
                            doc.euroCompra !== valoresDolarHoyObj.euroCompra ||
                            doc.euroVenta !== valoresDolarHoyObj.euroVenta) {
                            valoresDolarHoyObj.save(
                                function (err) {
                                    if (err) {
                                        console.log('Error on save!');
                                    }
                                    else {
                                        console.log('Saved!');
                                    }
                                }
                            )
                        }
                    }
                );
            compraDolar = undefined;
            ventaDolar = undefined;
            compraReal = undefined;
            ventaReal = undefined;
            compraEuro = undefined;
            ventaEuro = undefined;
        }
    } catch(err) {
        onError(err);
    }
}

function onError(err) {
    mail.mailOptions.subject = 'DolarHoyServer Info: Error';
    mail.mailOptions.html = 'ERROR connecting to: ' + uriString + '. ' + err;
    mail.sendMail();
    console.log(err);
}

app.get('/start/:pass', function(req, res) {
    if (req.params.pass !== 'Hola123!') {
        return res.send('Error: Wrong password...');
    }
    try {
        work = true;
        main();
        return res.send('Starting the server stand by...');
    } catch(err) {
        onError(err);
    }
});

app.get('/forcestart/:pass', function(req, res) {
    if (req.params.pass !== 'Hola123!') {
        return res.send('Error: Wrong password...');
    }
    try{
        worker();
        return res.send('Done...');
    } catch(err) {
        onError(err);
    }
});

app.get('/stop/:pass', function(req, res) {
    if(req.params.pass !== 'Hola123!') {
        return res.send('Error: Wrong password...');
    }
    try {
        work = false;
        main();
        return res.send('Stoping the server...');
    } catch (err) {
        onError(err);
    }
});

app.listen(process.env.PORT, process.env.IP);

console.log('Server HTTP Listening on port ' + process.env.PORT + '...');*/
