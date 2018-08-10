'use strict';

var Service = require('../Services');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var async = require('async');

var UploadManager = require('../Lib/UploadManager');
var TokenManager = require('../Lib/TokenManager');



var updatePatient = function (payloadData, DonorData, callback) {
    var donorProfileData = null;
    var dataToSave = payloadData;


    async.series([
        function (cb) {

            var finalDataToSave = {};
            if (dataToSave.firstName != 'undefined' && dataToSave.firstName) {
                finalDataToSave.firstName = dataToSave.firstName;
            }
            if (dataToSave.lastName != 'undefined' && dataToSave.lastName) {
                finalDataToSave.lastName = dataToSave.lastName;
            }
            if (dataToSave.phoneNumber != 'undefined' && dataToSave.phoneNumber) {
                finalDataToSave.phoneNumber = dataToSave.phoneNumber;
            }
            if (dataToSave.country != 'undefined' && dataToSave.country) {
                finalDataToSave.country = dataToSave.country;
            }

            var criteria = {_id: DonorData._id};
            var options = {lean: true};


            Service.DonorService.updateDonor(criteria, finalDataToSave, options, function (err, charityDataFromDB) {
                if (err) {
                    if (err.code == 11000 && err.message.indexOf('donorschemas.$phoneNumber_1') > -1) {
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST);
                    }
                    else {
                        cb(err)
                    }
                    cb(err)
                } else {
                    cb();
                }
            });
        }
    ], function (err, result) {
        if (err) {
            return callback(err);
        }
        callback();
    });
};

var getAllPatients = function (donorData, callback) {


    var _date = new Date();
    var criteria = {
            $and:[
                {complete:false},
                {feature:true},
                {'endDate':{$gte:new Date()}}
            ]},
        options = {lean: true},
        projection = {createdOn:0};

    /*var populateVariable = {
        path: "charityId",
        select: 'name contactPerson emailId'
    };*/

   /* Service.DonorService.getCampaignPopulate(criteria, projection, options, populateVariable, function (err, res) {
        if (err) {
            callback(err)
        } else {
            callback(null,res);
        }
    });
*/


    var allcampaign = {}
    var favcampaign = {}
    async.series([
        function (callb) {

            Service.CharityService.getCharityCampaign(criteria, function (err, campaignAry) {
                if (err) {
                    callb(err)
                } else {
                    allcampaign = campaignAry;
                    callb()
                }
            })
        },
        function (callb) {

            Service.DonorService.getfavouriteCampaign({
                donorId: donorData.id,
                favourite: true
            }, {createdOn: 0}, {lean: true}, function (err, campaignAry) {
                if (err) {
                    callb(err)
                } else {
                    favcampaign = campaignAry;
                    callb()
                }
            })
        },
        function (callb) {
            _.each(allcampaign, function(arr2obj ,i ) {
                _.each(favcampaign, function(arr1obj) {
                    if(arr1obj.campaignId.toString() == arr2obj._id.toString()){
                        allcampaign[i]["favourite"] = true;
                    }
                })
            })
            callb()
        }
    ], function (err, result) {
        if (err) {
            callback(err)
        } else {
            callback(null,allcampaign);
        }
    })
};


var loginPatient = function (payloadData, callback) {
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
            Service.PatientService.getPatient(criteria, projection, option, function (err, result) {
                if (err) return cb(err)
                if(result.length==0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_NOT_FOUND);
                userFound = result && result[0] || null;
                // updatedUserDetails= result;
                return cb();
            });
        },
        function (cb) {

            if (!userFound) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_NOT_FOUND);
            } else {
                if (userFound && userFound.passwordHash != UniversalFunctions.CryptData(payloadData.password)) {
                    cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INCORRECT_PASSWORD);
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
                    type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.PATIENT
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
                userDetails: UniversalFunctions.deleteUnnecessaryDonorData(userFound)});
        }
    });
};




module.exports = {
    loginPatient: loginPatient,
    getAllPatients: getAllPatients,
    updatePatient: updatePatient
};