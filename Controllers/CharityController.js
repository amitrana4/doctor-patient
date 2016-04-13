'use strict';

var Service = require('../Services');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var async = require('async');

var UploadManager = require('../Lib/UploadManager');
var TokenManager = require('../Lib/TokenManager');
var NotificationManager = require('../Lib/NotificationManager');
var CodeGenerator = require('../Lib/CodeGenerator');
var DAO = require('../DAO/DAO');
var Models = require('../Models');


var createCharityOwner = function (payloadData, callback) {
    var accessToken = null;
    var charityOwnerData = null;
    var uniqueCode = null;
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

    async.series([
        function (cb) {
            //verify email address
            if (!UniversalFunctions.verifyEmailFormat(dataToSave.emailId)) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL);
            } else {
                cb();
            }
        },
        function (cb) {
            //Validate for facebookId and password
            if (dataToSave.facebookId != 'undefined' && dataToSave.facebookId) {
                if (dataToSave.password) {
                    cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.FACEBOOK_ID_PASSWORD_ERROR);
                } else {
                    cb();
                }
            } else if (!dataToSave.password) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PASSWORD_REQUIRED);
            } else {
                cb();
            }
        },
        function (cb) {
            //Validate phone No
            if (!dataToSave.charityOwnerId) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.CHARITYOWNERID);
            } else {
                cb();
            }
        },function (cb) {
            //Validate phone No
            if (!dataToSave.country) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.COUNTRY_REQUIRED);
            } else {
                cb();
            }
        },function (cb) {
            //Validate phone No
            if (!dataToSave.taxId) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.TAXID_REQUIRED);
            } else {
                cb();
            }
        },function (cb) {
            //Validate phone No
            if (!dataToSave.taxDeductionCode) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.TAXDEDUCTIONCODE_REQUIRED);
            } else {
                cb();
            }
        },

        function (cb) {
            //Validate phone No
            if (dataToSave.phoneNumber && dataToSave.phoneNumber.split('')[0] == 0) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_PHONE_NO_FORMAT);
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
            finalDataToSave.phoneNumber = dataToSave.phoneNumber;
            if (dataToSave.facebookId != 'undefined' && dataToSave.facebookId) {
                finalDataToSave.facebookId = dataToSave.facebookId;
            }else{
                finalDataToSave.passwordHash = dataToSave.password;
            }
            Service.CharityService.createCharityOwnerId(finalDataToSave, function (err, charityDataFromDB) {
                if (err) {
                    if (err.code == 11000 && err.message.indexOf('customers.$phoneNumber_1') > -1){
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST);

                    } else if (err.code == 11000 && err.message.indexOf('customers.$emailId_1') > -1){
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIST);

                    }else {
                        cb(err)
                    }
                    cb(err)
                } else {
                    charityOwnerData = charityDataFromDB;
                    cb();
                }
            })
        },
        function (cb) {

            if (charityOwnerData && charityOwnerData._id) {
                //Insert Into DB
                var finalDataToSave = {};
                finalDataToSave.createdOn = new Date().toISOString();
                finalDataToSave.name = dataToSave.name;
                finalDataToSave.charityOwnerId = charityOwnerData._id;
                finalDataToSave.emailId = dataToSave.emailId;
                finalDataToSave.phoneNumber = dataToSave.phoneNumber;
                finalDataToSave.country = dataToSave.country;
                finalDataToSave.taxId = dataToSave.taxId;
                finalDataToSave.taxDeductionCode = dataToSave.taxDeductionCode;
                Service.CharityService.createCharityOwner(finalDataToSave, function (err, charityDataFromDB) {
                    if (err) {
                        if (err.code == 11000 && err.message.indexOf('customers.$phoneNumber_1') > -1) {
                            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST);

                        } else if (err.code == 11000 && err.message.indexOf('customers.$emailId_1') > -1) {
                            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIST);

                        } else {
                            cb(err)
                        }
                        cb(err)
                    } else {
                        charityData = charityDataFromDB;
                        cb();
                    }
                })
            }
        },
        function(cb){
            if (charityData && charityData._id && dataToSave.registrationProofFileId) {
                var document = UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.FILE_TYPES.DOCUMENT;
                UploadManager.uploadFile(dataToSave.registrationProofFileId, charityData._id, document, function (err, uploadedInfo) {
                    if (err) {
                        cb(err)
                    }
                    var registrationProofFileId = uploadedInfo && uploadedInfo.original && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.original || null;
                    dataToUpdate.registrationProofFileId = registrationProofFileId;
                    return  cb();
                });
            }else{
                cb();
            }
        },
        function(cb){
            if (charityData && charityData._id && dataToSave.supportingDocumentFileId) {
                var document = UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.FILE_TYPES.DOCUMENT;
                UploadManager.uploadFile(dataToSave.supportingDocumentFileId, charityData._id, document, function (err, uploadedInfo) {
                    if (err) {
                        cb(err)
                    }
                    var supportingDocumentFileId = uploadedInfo && uploadedInfo.original && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.original || null;
                    dataToUpdate.supportingDocumentFileId = supportingDocumentFileId;
                    return  cb();
                });
            }else{
                cb();
            }
        },
        function(cb){
            var criteria ={_id:charityData._id};
            var options = {}; //{multi: true};
            DAO.findOneAndUpdateData(Models.charity,criteria, dataToUpdate, {new: true},function(err, data){
                if (err) {
                    return    cb(err)
                }
                charityData=data;
                return  cb();
            });
        },
        function (cb) {
            if (charityOwnerData) {
                var tokenData = {
                    id: charityOwnerData._id,
                    type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.CHARITYOWNER
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
            callback(null, {
                accessToken: accessToken,
                userDetails: UniversalFunctions.deleteUnnecessaryUserData(charityData.toObject())
            });
        }
    });
};




var CharityOwnerProfileStep1 = function (payloadData, callback) {
    var charityOwnerProfileData = null;
    var dataToSave = payloadData;

    if (payloadData.logoFileId && payloadData.logoFileId.filename) {
        dataToSave.logoFileId = {
            original: null,
            thumbnail: null
        }
    }

    async.series([
        function (cb) {
            //Validate phone No
            if (!dataToSave.country) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.COUNTRY_REQUIRED);
            } else {
                cb();
            }
        },function (cb) {
            //Validate phone No
            if (!dataToSave.taxId) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.TAXID_REQUIRED);
            } else {
                cb();
            }
        },function (cb) {
            //Validate phone No
            if (!dataToSave.taxDeductionCode) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.TAXDEDUCTIONCODE_REQUIRED);
            } else {
                cb();
            }
        },

        function (cb) {
            //Validate phone No
            if (dataToSave.phoneNumber && dataToSave.phoneNumber.split('')[0] == 0) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_PHONE_NO_FORMAT);
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
            finalDataToSave.phoneNumber = dataToSave.phoneNumber;
            if (dataToSave.facebookId != 'undefined' && dataToSave.facebookId) {
                finalDataToSave.facebookId = dataToSave.facebookId;
            }else{
                finalDataToSave.passwordHash = dataToSave.password;
            }
            Service.CharityService.createCharityOwnerId(finalDataToSave, function (err, charityDataFromDB) {
                if (err) {
                    if (err.code == 11000 && err.message.indexOf('customers.$phoneNumber_1') > -1){
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST);

                    } else if (err.code == 11000 && err.message.indexOf('customers.$emailId_1') > -1){
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIST);

                    }else {
                        cb(err)
                    }
                    cb(err)
                } else {
                    charityOwnerData = charityDataFromDB;
                    cb();
                }
            })
        },
        function (cb) {

            if (charityOwnerData && charityOwnerData._id) {
                //Insert Into DB
                var finalDataToSave = {};
                finalDataToSave.createdOn = new Date().toISOString();
                finalDataToSave.name = dataToSave.name;
                finalDataToSave.charityOwnerId = charityOwnerData._id;
                finalDataToSave.emailId = dataToSave.emailId;
                finalDataToSave.phoneNumber = dataToSave.phoneNumber;
                finalDataToSave.country = dataToSave.country;
                finalDataToSave.taxId = dataToSave.taxId;
                finalDataToSave.taxDeductionCode = dataToSave.taxDeductionCode;
                Service.CharityService.createCharityOwner(finalDataToSave, function (err, charityDataFromDB) {
                    if (err) {
                        if (err.code == 11000 && err.message.indexOf('customers.$phoneNumber_1') > -1) {
                            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST);

                        } else if (err.code == 11000 && err.message.indexOf('customers.$emailId_1') > -1) {
                            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIST);

                        } else {
                            cb(err)
                        }
                        cb(err)
                    } else {
                        charityData = charityDataFromDB;
                        cb();
                    }
                })
            }
        },
        function(cb){
            if (charityData && charityData._id && dataToSave.registrationProofFileId) {
                var document = UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.FILE_TYPES.DOCUMENT;
                UploadManager.uploadFile(dataToSave.registrationProofFileId, charityData._id, document, function (err, uploadedInfo) {
                    if (err) {
                        cb(err)
                    }
                    var registrationProofFileId = uploadedInfo && uploadedInfo.original && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.original || null;
                    dataToUpdate.registrationProofFileId = registrationProofFileId;
                    return  cb();
                });
            }else{
                cb();
            }
        },
        function(cb){
            if (charityData && charityData._id && dataToSave.supportingDocumentFileId) {
                var document = UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.FILE_TYPES.DOCUMENT;
                UploadManager.uploadFile(dataToSave.supportingDocumentFileId, charityData._id, document, function (err, uploadedInfo) {
                    if (err) {
                        cb(err)
                    }
                    var supportingDocumentFileId = uploadedInfo && uploadedInfo.original && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.original || null;
                    dataToUpdate.supportingDocumentFileId = supportingDocumentFileId;
                    return  cb();
                });
            }else{
                cb();
            }
        },
        function(cb){
            var criteria ={_id:charityData._id};
            var options = {}; //{multi: true};
            DAO.findOneAndUpdateData(Models.charity,criteria, dataToUpdate, {new: true},function(err, data){
                if (err) {
                    return    cb(err)
                }
                charityData=data;
                return  cb();
            });
        },
        function (cb) {
            if (charityOwnerData) {
                var tokenData = {
                    id: charityOwnerData._id,
                    type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.CHARITYOWNER
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
            callback(null, {
                accessToken: accessToken,
                userDetails: UniversalFunctions.deleteUnnecessaryUserData(charityData.toObject())
            });
        }
    });
};









var loginCharityOwner = function (payloadData, callback) {
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
            Service.CharityService.getCharityOwnerId(criteria, projection, option, function (err, result) {
                if (err) {
                    cb(err)
                } else {
                    userFound = result && result[0] || null;
                    updatedUserDetails= result;
                    cb();

                }
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
                    type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.CHARITYOWNER
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
        } else { //console.log("else 178  ",updatedUserDetails);
            callback(null, {accessToken: accessToken,
                userDetails: UniversalFunctions.deleteUnnecessaryCharityData(updatedUserDetails[0])});
        }
    });
};




var changePassword = function (queryData,userData, callback) {
    var userFound = null;
    if (!queryData.oldPassword || !queryData.newPassword || !userData) {
        return callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
    async.series([
        function (cb) {
            var criteria = {_id : userData.id  };
            var projection = {passwordHash:1};
            var options = {
                lean: true
            };
            Service.CharityService.getCharityOwnerId(criteria, projection, options, function (err, data) {
                if (err) {
                    return cb(err);
                }

                if (data.length==0) {
                    return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_FOUND)
                }
                userFound = data[0];
                return cb();
            });
        },
        function (cb) {

            if (userFound.passwordHash != UniversalFunctions.CryptData(queryData.oldPassword)){
                return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INCORRECT_OLD_PASS)
            }else if (userFound.passwordHash == UniversalFunctions.CryptData(queryData.newPassword)){
                return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.SAME_PASSWORD)
            }
            return  cb();
        },
        function (cb) {
            var criteria = {_id: userFound._id};
            var setQuery = {
                $set: {
                    passwordHash: UniversalFunctions.CryptData(queryData.newPassword)
                }
            };
            var options = {lean: true};
            Service.CharityService.updateCharityOwnerId(criteria, setQuery, options, function(err,suceess){
                if(err)
                {
                    return cb(err);
                }
                cb();
            });
        }

    ], function (err, result) {
        if(err)
        {
            return callback(err);
        }
        return callback();
    })
};




module.exports = {
    createCharityOwner: createCharityOwner,
    changePassword: changePassword,
    CharityOwnerProfileStep1: CharityOwnerProfileStep1,
    loginCharityOwner: loginCharityOwner
};