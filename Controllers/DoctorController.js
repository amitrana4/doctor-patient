'use strict';

var Service = require('../Services');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var Config = require('../Config');
var async = require('async');

var UploadManager = require('../Lib/UploadManager');
var TokenManager = require('../Lib/TokenManager');
var NotificationManager = require('../Lib/NotificationManager');
var CodeGenerator = require('../Lib/CodeGenerator');
var DAO = require('../DAO/DAO');
var Models = require('../Models');
var moment = require('moment');
var ERROR_MESSAGE = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;


var loginDoctor = function (payloadData, callback) {
    var userFound = false;
    var accessToken = null;
    var successLogin = false;
    var updatedUserDetails = null;
    payloadData.email =payloadData.email.toLowerCase();
    async.series([
        function (cb) {
            var criteria = {
                emailId: payloadData.email
            };
            var projection = {};
            var option = {
                lean: true
            };
            Service.DoctorService.getDoctor(criteria, projection, option, function (err, result) {
                if (err) return cb(err)
                if(result.length==0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_NOT_FOUND);
                userFound = result && result[0] || null;
                // updatedUserDetails= result;
                return cb();
            });
        },
        function (cb) {

            if (!userFound) {
                cb(ERROR_MESSAGE.EMAIL_NOT_FOUND);
            } else {
                if (userFound && userFound.passwordHash != UniversalFunctions.CryptData(payloadData.password)) {
                    return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INCORRECT_PASSWORD);
                } else {
                    successLogin = true;
                    cb();
                }
            }
        },
        function (cb) { //console.log("userFound 153  ",userFound);
            if (successLogin) {
                var tokenData = {
                    id: userFound._id,
                    type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.DOCTOR
                };
                TokenManager.setToken(tokenData, function (err, output) {
                    if (err) {
                        cb(err);
                    } else {
                        if (output && output.accessToken){
                            accessToken = output && output.accessToken;
                            cb();
                        }else {
                            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.ERROR.IMP_ERROR)
                        }
                    }
                })
            } else {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.ERROR.IMP_ERROR)
            }

        }
    ], function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, {accessToken: accessToken,
                userDetails: UniversalFunctions.deleteUnnecessaryCharityData(userFound)});
        }
    });
};




var logoutDoctor = function (userData, callback) {
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        var userId = userData && userData.id || 1;

        async.series([
            function (cb) {
                //Check if the driver is free or not
                Service.CharityService.getCharityOwnerId({_id : userData.id}, {},{lean:true}, function (err, charityAry) {
                    if (err){
                        cb(err)
                    }else {
                            cb()
                    }
                })
            },
            function (cb) {
                var criteria = {
                    _id: userId
                };
                var setQuery = {
                    $unset: {
                        accessToken: 1,
                        deviceToken:1
                    }
                };
                var options = {};
                Service.CharityService.updateCharityOwnerId(criteria, setQuery, options, cb);
            },
            function (cb) {
                var criteria = {
                    _id: userData.charityId
                };
                var setQuery = {
                    $unset: {
                        deviceToken:1
                    }
                };
                var options = {};
                Service.CharityService.updateCharityOwner(criteria, setQuery, options, cb);
            }
        ], function (err, result) {
            callback(err, null);
        })
    }
};


module.exports = {
    loginDoctor: loginDoctor,
    logoutDoctor: logoutDoctor
};