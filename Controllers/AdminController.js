'use strict';

var Service = require('../Services');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var async = require('async');

var UploadManager = require('../Lib/UploadManager');
var TokenManager = require('../Lib/TokenManager');
var NotificationManager = require('../Lib/NotificationManager');

var adminLogin = function(userData, callback) {

    var tokenToSend = null;
    var responseToSend = {};
    var tokenData = null;

    async.series([
        function (cb) {
        var getCriteria = {
            email: userData.email,
            password: UniversalFunctions.CryptData(userData.password)
        };
        Service.AdminService.getAdmin(getCriteria, {}, {}, function (err, data) {
            if (err) {
                cb({errorMessage: 'DB Error: ' + err})
            } else {
                if (data && data.length > 0 && data[0].email) {
                    tokenData = {
                        id: data[0]._id,
                        username: data[0].username,
                        type : UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN
                    };
                    cb()
                } else {
                    cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_USER_PASS)
                }
            }
        });
    }, function (cb) {
        var setCriteria = {
            email: userData.email
        };
        var setQuery = {
            $push: {
                loginAttempts: {
                    validAttempt: (tokenData != null),
                    ipAddress: userData.ipAddress
                }
            }
        };
        Service.AdminService.updateAdmin(setCriteria, setQuery, function (err, data) {
            cb(err,data);
        });
    }, function (cb) {
        if (tokenData && tokenData.id) {
            TokenManager.setToken(tokenData, function (err, output) {
                if (err) {
                    cb(err);
                } else {
                    tokenToSend = output && output.accessToken || null;
                    cb();
                }
            });

        } else {
            cb()
        }

    }], function (err, data) {
        console.log('sending response')
        responseToSend = {access_token: tokenToSend, ipAddress: userData.ipAddress};
        if (err) {
            callback(err);
        } else {
            callback(null,responseToSend)
        }

    });


};

var adminLogout = function (token, callback) {
    TokenManager.expireToken(token, function (err, data) {
        if (!err && data) {
            callback(null, UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT);
        } else {
            callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.TOKEN_ALREADY_EXPIRED)
        }
    })
};



var getAllPatient = function (callback) {
        Service.PatientService.getPatient({}, function (err, charityAry) {
            if (err) {
                callback(err);
            } else {
                callback(null, charityAry);
            }
        });
};


var getAllDoctor = function (callback) {
        Service.DoctorService.getDoctor({}, function (err, charityAry) {
            if (err) {
                callback(err);
            } else {
                callback(null, charityAry);
            }
        });
};

var createDoctor = function (payloadData, callback) {
    var accessToken = null;
    var charityOwnerData = null;
    var dataToSave = payloadData;
    if (dataToSave.password)
        dataToSave.password = UniversalFunctions.CryptData(dataToSave.password);
    dataToSave.firstTimeLogin = false;
    var charityData = null;
    var dataToUpdate = {};
    if (payloadData.registrationProofFileId && payloadData.registrationProofFileId.filename) {
        dataToUpdate.registrationProofFileIdURL = {
            original: null,
            thumbnail: null
        }
    }

    dataToSave.emailId =dataToSave.emailId.toLowerCase();

    async.series([
        function (cb) {

            //Insert Into DB
            var finalDataToSave = {};
            finalDataToSave.createdOn = new Date().toISOString();
            finalDataToSave.loggedInOn = new Date().toISOString();
            finalDataToSave.emailId = dataToSave.emailId;
            finalDataToSave.phoneNumber = dataToSave.phoneNumber;
            finalDataToSave.passwordHash = dataToSave.password;
            Service.DoctorService.createDoctor(finalDataToSave, function (err, charityDataFromDB) {
                console.log(err, charityDataFromDB, '=========')
                if (err) {
                    cb(err)
                } else {
                    charityOwnerData = charityDataFromDB;
                    cb();
                }
            })
        },
        function (cb) {
            if (charityOwnerData) {
                var tokenData = {
                    id: charityOwnerData._id,
                    type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.DOCTOR
                };
                TokenManager.setToken(tokenData, function (err, output) {
                    console.log(err, output)
                    if (err) {
                        cb(err);
                    } else {
                        accessToken = output && output.accessToken || null;
                        cb();
                    }
                });
            } else {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
            }
        }
    ], function (err, data) {
        if (err) {
            callback(err);
        } else {
            console.log(charityData)
            callback(null, {
                accessToken: accessToken,
                userDetails: UniversalFunctions.deleteUnnecessaryUserData(charityOwnerData)
            });
        }
    });
};


var createPatient = function (payloadData, callback) {
    var accessToken = null;
    var donorData = null;
    var uniqueCode = null;
    var dataToSave = payloadData;
    if (dataToSave.password)
        dataToSave.password = UniversalFunctions.CryptData(dataToSave.password);
    dataToSave.firstTimeLogin = false;
    var dataToUpdate = {};
    var updatedDonorData = {};


    dataToSave.emailId =dataToSave.emailId.toLowerCase();
    async.series([
        function (cb) {
            //Validate firstname
            if (!dataToSave.firstName) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.NAME_REQUIRED);
            } else {
                cb();
            }
        },
        function (cb) {
            //verify email 
            if (!UniversalFunctions.verifyEmailFormat(dataToSave.emailId)) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL);
            } else {
                cb();
            }
        },
        function (cb) {

            //Insert Into DB
            var finalDataToSave = {};
            finalDataToSave.createdOn = new Date().toISOString();
            finalDataToSave.loggedInOn = new Date().toISOString();
            finalDataToSave.emailId = dataToSave.emailId;
            finalDataToSave.firstName = dataToSave.firstName;
            finalDataToSave.deviceType = dataToSave.deviceType;
            finalDataToSave.deviceToken = dataToSave.deviceToken;
            finalDataToSave.appVersion = dataToSave.appVersion;
            if (dataToSave.lastName != 'undefined' && dataToSave.lastName) {
                finalDataToSave.lastName = dataToSave.lastName;
            }
            finalDataToSave.passwordHash = dataToSave.password;
            Service.PatientService.createPatient(finalDataToSave, function (err, donorDataFromDB) {
                console.log(err, donorDataFromDB)
                if (err) {
                        cb(err)
                } else {
                    donorData = donorDataFromDB;
                    cb();
                }
            })
        },
        function (cb) {
            if (donorData) {
                var tokenData = {
                    id: donorData._id,
                    type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.PATIENT
                };
                TokenManager.setToken(tokenData, function (err, output) {
                    if (err) {
                        cb(err);
                    } else {
                        accessToken = output && output.accessToken || null;
                        cb();
                    }
                });
            } else {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
            }
        }
    ], function (err, data) {
        if (err) {
            callback(err);
        } else {
            var finalD;
            if (dataToSave.profilePic) {
                finalD = updatedDonorData;
            }else {
                finalD = donorData;
            }
            callback(null, {
                accessToken: accessToken,
                userDetails: UniversalFunctions.deleteUnnecessaryDonorData(finalD)
            });
        }
    });
};



module.exports = {
    adminLogin: adminLogin,
    adminLogout: adminLogout,
    getAllPatient: getAllPatient,
    createPatient: createPatient,
    createDoctor: createDoctor,
    getAllDoctor: getAllDoctor
};