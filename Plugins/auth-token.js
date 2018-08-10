'use strict';
/**
 * Created by Amit on 12/7/15.
 */

var TokenManager = require('../Lib/TokenManager');
var UniversalFunctions = require('../Utils/UniversalFunctions');

exports.register = function(server, options, next){

//Register Authorization Plugin
    server.register(require('hapi-auth-bearer-token'), function (err) {
        server.auth.strategy('UserAuth', 'bearer-access-token', {
            allowQueryToken: false,
            allowMultipleHeaders: true,
            accessTokenName: 'accessToken',
            validateFunc: function (token, callback) {
                TokenManager.verifyToken(token, function (err,response) {
                    if (err || !response || !response.userData){
                        callback(null, false, {token: token, userData: null})
                    }else {
                        callback(null, true, {token: token, userData: response.userData})
                    }
                });

            }
        });
        server.auth.strategy('DoctorAuth', 'bearer-access-token', {
            allowQueryToken: false,
            allowMultipleHeaders: true,
            accessTokenName: 'accessToken',
            validateFunc: function (token, callback) {
                console.log(token,'======')
                TokenManager.verifyDoctorToken(token, function (err,response) {
                    if (err || !response || !response.userData){
                        callback(null, false, {token: token, userData: null})
                    }else {
                        callback(null, true, {token: token, userData: response.userData})
                    }
                });

            }
        });
        server.auth.strategy('PatientAuth', 'bearer-access-token', {
            allowQueryToken: false,
            allowMultipleHeaders: true,
            accessTokenName: 'accessToken',
            validateFunc: function (token, callback) {
                console.log(token,'======')
                TokenManager.verifyPatientToken(token, function (err,response) {
                    if (err || !response || !response.userData){
                        callback(null, false, {token: token, userData: null})
                    }else {
                        callback(null, true, {token: token, userData: response.userData})
                    }
                });

            }
        });

    });

    next();
};

exports.register.attributes = {
    name: 'auth-token-plugin'
};