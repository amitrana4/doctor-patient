'use strict';

/**
 * Created by shahab on 10/7/15.
 */

//External Dependencies
var Hapi = require('hapi');

//Internal Dependencies
var Config = require('./Config');
var Routes = require('./Routes');
var Plugins = require('./Plugins');
var Controller = require('./Controllers');
var Bootstrap = require('./Utils/BootStrap');

//Create Server
var server = new Hapi.Server({
    app: {
        name: Config.APP_CONSTANTS.SERVER.appName
    }
});

server.connection({
    port: Config.APP_CONSTANTS.SERVER.PORTS.HAPI,
    routes: { cors: true }
});

//Register All Plugins
server.register(Plugins, function (err) {
    if (err){
        server.error('Error while loading plugins : ' + err)
    }else {
        server.log('info','Plugins Loaded')
    }
});

//Default Routes
server.route(
    {
        method: 'GET',
        path: '/',
        handler: function (req, res) {
            //TODO Change for production server
            res.view('index')
        }
    }
);

//API Routes
server.route(Routes);

//Connect To Socket.io
Bootstrap.connectSocket(server);

//Bootstrap admin data
Bootstrap.bootstrapAdmin(function (err, message) {
    if (err) {
        console.log('Error while bootstrapping admin : ' + err)
    } else {
        console.log(message);
    }
});

//Bootstrap Version data
/*Bootstrap.bootstrapAppVersion(function (err, message) {
    if (err) {
        console.log('Error while bootstrapping version : ' + err)
    } else {
        console.log(message);
    }
});*/


var schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();

rule.hour = 12;
rule.minute = 5;

var j = schedule.scheduleJob(rule, function(){
    Controller.DonorController.cronRecurringDonationCampaign(function (err, data) {
        if (err) {
            console.log('error in api')
        } else {
            console.log('Cron success campaign')
        }
    })

});

var q = schedule.scheduleJob(rule, function(){
    Controller.DonorController.cronRecurringDonationCharity(function (err, data) {
        if (err) {
            console.log('error in api')
        } else {
            console.log('Cron success charity')
        }
    })

});


//Adding Views
server.views({
    engines: {
        html: require('handlebars')
    },
    relativeTo: __dirname,
    path: './Views'
});

//Start Server
server.start(function () {
    server.log('info', 'Server running at: ' + server.info.uri);
});

