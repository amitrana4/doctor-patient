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
var ERROR_MESSAGE = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;

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
            //Validate phone No
            if (!dataToSave.charityRegistrationNo) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.REGISTRATIONNUMBER_REQUIRED);
            } else {
                cb();
            }
        },
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

            //Insert Into DB
            var finalDataToSave = {};
            finalDataToSave.createdOn = new Date().toISOString();
            finalDataToSave.loggedInOn = new Date().toISOString();
            finalDataToSave.emailId = dataToSave.emailId;
            finalDataToSave.phoneNumber = dataToSave.phoneNumber;
            finalDataToSave.charityRegistrationNo = dataToSave.charityRegistrationNo;
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

                    }
                    else if (err.code == 11000 && err.message.indexOf('customers.$charityRegistrationNo_1') > -1) {
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.CHARITYREGNO_ALREADY_EXIST);

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

                var charityFinalDataToSave = {};
                charityFinalDataToSave.createdOn = new Date().toISOString();
                charityFinalDataToSave.name = dataToSave.name;
                charityFinalDataToSave.website = dataToSave.website;
                charityFinalDataToSave.contactPerson = dataToSave.contactPerson;
                charityFinalDataToSave.charityOwnerId = charityOwnerData._id;
                charityFinalDataToSave.emailId = dataToSave.emailId;
                charityFinalDataToSave.phoneNumber = dataToSave.phoneNumber;
                charityFinalDataToSave.countryCode = dataToSave.countryCode;
                charityFinalDataToSave.country = dataToSave.country;
                charityFinalDataToSave.taxId = dataToSave.taxId;
                charityFinalDataToSave.deviceType = dataToSave.deviceType;
                charityFinalDataToSave.deviceToken = dataToSave.deviceToken;
                charityFinalDataToSave.appVersion = dataToSave.appVersion;
                charityFinalDataToSave.taxDeductionCode = dataToSave.taxDeductionCode;
                charityFinalDataToSave.profileComplete = 0;
                if(dataToSave.salesRepCode){
                    finalDataToSave.salesRepCode = dataToSave.salesRepCode;
                }
                Service.CharityService.createCharityOwner(charityFinalDataToSave, function (err, charityDataFromDB) {
                    if (err) {
                        if (err.code == 11000 && err.message.indexOf('customers.$phoneNumber_1') > -1) {
                            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST);

                        }
                        else if (err.code == 11000 && err.message.indexOf('customers.$emailId_1') > -1) {
                            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIST);
                        }
                        else {
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




var CharityOwnerProfileStep1 = function (payloadData, CharityData, callback) {
    var charityOwnerProfileData = null;
    var profileDataToUpdateStep1 = {};
    var mImage = [];
    var image = {};
    var imagesids = []
    var dataToSave = payloadData;


    async.series([

        function (cb) {
            //Validate phone No
            if (!dataToSave.officeAddress1) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.OFFICEADDRESS1_REQUIRED);
            } else {
                cb();
            }
        },
        function (cb) {
            //Validate phone No
            if (!dataToSave.officeCity) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.CITY_REQUIRED);
            } else {
                cb();
            }
        },
        function (cb) {
            //Validate phone No
            if (!dataToSave.officeState) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.STATE_REQUIRED);
            } else {
                cb();
            }
        },
        function (cb) {
            //Validate phone No
            if (!dataToSave.officeCountry) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.COUNTRY_REQUIRED);
            } else {
                cb();
            }
        },
        function (cb) {
            //Validate phone No
            if (!dataToSave.foundationDate) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.FOUNDATIONDATE_REQUIRED);
            } else {
                cb();
            }
        }, function (cb) {
            //Validate phone No
            if (!dataToSave.type) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.TYPE_REQUIRED);
            } else {
                cb();
            }
        }, function (cb) {
            //Validate phone No
            if (!dataToSave.description) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DESCRIPTION_REQUIRED);
            } else {
                cb();
            }
        }, function (cb) {
            //Validate phone No
            if (!dataToSave.keyWord) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.KEYWORD_REQUIRED);
            } else {
                cb();
            }
        },
        function (cb) {
            //Insert Into DB
            var finalDataToSave = {};
            finalDataToSave.foundationDate = dataToSave.foundationDate;
            finalDataToSave.type = dataToSave.type;
            finalDataToSave.description = dataToSave.description;
            finalDataToSave.keyWord = dataToSave.keyWord;
            finalDataToSave.officeAddress1 = dataToSave.officeAddress1;
            finalDataToSave.officeAddress2 = dataToSave.officeAddress2;
            finalDataToSave.officeCity = dataToSave.officeCity;
            finalDataToSave.officeState = dataToSave.officeState;
            finalDataToSave.officeCountry = dataToSave.officeCountry;
            finalDataToSave.profileComplete = 1;

            var criteria = {charityOwnerId: CharityData._id};
            var datatoSet = {$addToSet: finalDataToSave};
            var options = {lean: true};


            Service.CharityService.updateCharityOwner(criteria, finalDataToSave, options, function (err, charityDataFromDB) {
                if (err) {
                    cb(err)
                } else {
                    charityOwnerProfileData = charityDataFromDB;
                    cb();
                }
            });
        },
        function (cb) {
            if (dataToSave.pictures != undefined && dataToSave.pictures.length > 0) {
                var taskInParallel = [];
                for (var key in dataToSave.pictures) {
                    (function (key) {
                        taskInParallel.push((function (key) {
                            return function (embeddedCB) {//TODO
                                var document = UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.FILE_TYPES.DOCUMENT;
                                UploadManager.uploadFileToS3WithThumbnail(dataToSave.pictures[key], charityOwnerProfileData._id, function (err, uploadedInfo) {


                                    image.images = {original: null, thumbnail: null}
                                    if (err) {
                                        cb(err)
                                    } else {
                                        image.images.original = uploadedInfo && uploadedInfo.original && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.original || null;
                                        image.images.thumbnail = uploadedInfo && uploadedInfo.thumbnail && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.thumbnail || null;
                                        //mImage.push(image);
                                        image.charityId = charityOwnerProfileData._id;
                                        image.createdOn = new Date().toISOString();
                                        Service.CharityService.createCharityImages(image, function (err, result) {

                                            if (err) return embeddedCB(err);
                                            imagesids.push(result._id);
                                            return embeddedCB();
                                        })

                                    }
                                })
                            }
                        })(key))
                    }(key));
                }
                async.parallel(taskInParallel, function (err, result) {
                    cb();
                });
            } else {
                cb();
            }
        },
        function (cb) {
            //Insert Into DB
            var imgagesToSave = {};
            imgagesToSave.pictures = imagesids;

            var criteria = {_id: charityOwnerProfileData._id};
            var datatoSet = {$addToSet: imgagesToSave};
            var options = {lean: true};


            Service.CharityService.updateCharityOwner(criteria, imgagesToSave, options, function (err, imagesResult) {
                if (err) {
                    cb(err)
                } else {
                    cb();
                }
            });
        },
        function (cb) {
            if (charityOwnerProfileData && charityOwnerProfileData._id && dataToSave.logoFileId) {
                var document = UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.FILE_TYPES.DOCUMENT;
                UploadManager.uploadFile(dataToSave.logoFileId, charityOwnerProfileData._id, document, function (err, uploadedInfo) {
                    if (err) {
                        cb(err)
                    }
                    var logoFile = uploadedInfo && uploadedInfo.original && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.original || null;
                    profileDataToUpdateStep1.logoFileId = logoFile;
                    return cb();
                });
            } else {
                cb();
            }
        },
        function (cb) {
            if (charityOwnerProfileData && charityOwnerProfileData._id && dataToSave.videos) {
                var document = UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.FILE_TYPES.DOCUMENT;
                UploadManager.uploadFile(dataToSave.videos, charityOwnerProfileData._id, document, function (err, uploadedInfo) {
                    if (err) {
                        cb(err)
                    }
                    var videosFile = uploadedInfo && uploadedInfo.original && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.original || null;
                    profileDataToUpdateStep1.videos = videosFile;
                    return cb();
                });
            } else {
                cb();
            }
        },
        function (cb) {
            var criteria = {_id: charityOwnerProfileData._id};
            var options = {}; //{multi: true};
            DAO.findOneAndUpdateData(Models.charity, criteria, profileDataToUpdateStep1, {new: true}, function (err, data) {
                if (err) {
                    return cb(err)
                }
                return cb();
            });
        }
    ], function (err, result) {
        if (err) {
            return callback(err);
        }
        callback();
    });
};


var CharityOwnerBankDetails = function (payloadData, CharityData, callback) {
    var charityOwnerProfileData = null;

    async.series([

        function (cb) {
            //Validate phone No
            if (!payloadData.bankAccountHolderName) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.BANKACCOUNTHOLDERNAME_REQUIRED);
            } else {
                cb();
            }
        },
        function (cb) {
            //Validate phone No
            if (!payloadData.bankAccountHolderPhoneNumber) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.BANKACCOUNTHOLDERPHONE_REQUIRED);
            } else {
                cb();
            }
        },
        function (cb) {
            //Validate phone No
            if (!payloadData.bankAccountNumber) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.BANKACCOUNTHOLDERACCNUMBER_REQUIRED);
            } else {
                cb();
            }
        },
        function (cb) {
            //Insert Into DB

            payloadData.profileComplete = 2;
            var criteria = {charityOwnerId: CharityData._id,
                "bankAccountNumber" : { $exists : true, $ne : null }};
            var options = {lean: true};

            Service.CharityService.getCharityOwner(criteria, payloadData, options, function (err, charityDataFromDB) {
                if (err) {
                    cb(err)
                } else {
                    if(charityDataFromDB.length == 0){
                        var criteria = {charityOwnerId: CharityData._id};
                        Service.CharityService.updateCharityOwner(criteria, payloadData, options, function (err, charityDataFromDB) {
                            if (err) {
                                cb(err)
                            } else {
                                cb();
                            }
                        });
                    }
                    else{
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.VALUE_EXIST);
                    }
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
                if (err) return cb(err)
                if(result.length==0) return cb("asdsadsdasdas");
                userFound = result && result[0] || null;
                updatedUserDetails= result;
                return cb();
            });
        },
        function (cb) {

            if (!userFound) {
                cb(ERROR_MESSAGE.EMAIL_NOT_FOUND);
            } else {
                if (userFound && userFound.passwordHash != UniversalFunctions.CryptData(payloadData.password)) {
                    cb(ERROR_MESSAGE.INCORRECT_PASSWORD);
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
        } else {
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






var createCampaign = function (payloadData, CharityData, callback) {
    var campaignData = null;
    var completeStatus = null;
    var campaignToUpdate = {};
    var campaignMainImageFileId = {};
    var campaignPictures = [];
    var dataToSave = payloadData;

    async.series([

        function (cb) {
            var criteria = {
                charityOwnerId: CharityData._id
            };
            var projection = {profileComplete:1};
            var option = {
                lean: true
            };
            Service.CharityService.getCharityOwner(criteria, projection, option, function (err, result) {
                if (err) {
                    cb(err)
                } else {
                    completeStatus = result && result[0] || null;
                    if(completeStatus.profileComplete != 2){
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PROFILE_INCOMPLETE);
                    }
                    else{
                        cb();
                    }

                }
            });
        },function (cb) {
            //Validate phone No
            if (!dataToSave.name) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.NAME_REQUIRED);
            } else {
                cb();
            }
        },
        function (cb) {
            //Validate phone No
            if (!dataToSave.lat) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.LOCATION_REQUIRED);
            } else {
                cb();
            }
        },function (cb) {
            //Validate phone No
            if (!dataToSave.long) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.LOCATION_REQUIRED);
            } else {
                cb();
            }
        },
        function (cb) {
            //Validate phone No
            if (!dataToSave.description) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DESCRIPTION_REQUIRED);
            } else {
                cb();
            }
        },
        function (cb) {
            //Validate phone No
            if (!dataToSave.hasKeyWords) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.KEYWORD_REQUIRED);
            } else {
                cb();
            }
        },
        function (cb) {
            //Validate phone No
            if (!dataToSave.unitName) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.UNITNAME_REQUIRED);
            } else {
                cb();
            }
        }, function (cb) {
            //Validate phone No
            if (!dataToSave.costPerUnit) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.COSTPERUNIT_REQUIRED);
            } else {
                cb();
            }
        }, function (cb) {
            //Validate phone No
            if (!dataToSave.targetUnitCount) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.TARGETUNITCOUNT_REQUIRED);
            } else {
                cb();
            }
        }, function (cb) {
            //Validate phone No
            if (!dataToSave.endDate) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.CAMPAIGNENDDATE_REQUIRED);
            } else {
                cb();
            }
        },
        function (cb) {
            //Insert Into DB

            var campDataToSave = {};
            campDataToSave.charityOwnerId = CharityData._id;
            campDataToSave.name = dataToSave.name;
            campDataToSave.lat = dataToSave.lat;
            campDataToSave.long = dataToSave.long;
            campDataToSave.address = dataToSave.address;
            campDataToSave.description = dataToSave.description;
            campDataToSave.hasKeyWords = dataToSave.hasKeyWords;
            campDataToSave.unitName = dataToSave.unitName;
            campDataToSave.costPerUnit = dataToSave.costPerUnit;
            campDataToSave.targetUnitCount = dataToSave.targetUnitCount;
            campDataToSave.endDate = dataToSave.endDate;
            campDataToSave.createdOn = new Date().toISOString();
            if(dataToSave.videoLink) {
                campDataToSave.videoLink = dataToSave.videoLink;
            }

            Service.CharityService.createCharityCampaign(campDataToSave, function (err, charityDataFromDB) {
                if (err) {
                    cb(err)
                } else {
                    campaignData = charityDataFromDB;
                    cb();
                }
            });
        },
        function (cb) {
            if (campaignData && campaignData._id && dataToSave.mainImageFileId) {
                var document = UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.FILE_TYPES.DOCUMENT;
                UploadManager.uploadFile(dataToSave.mainImageFileId, campaignData._id, document, function (err, uploadedInfo) {
                    if (err) {
                        cb(err)
                    }
                    var mainImageFile = uploadedInfo && uploadedInfo.original && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.original || null;
                    campaignMainImageFileId.mainImageFileId = mainImageFile;
                    return cb();
                });
            } else {
                cb();
            }
        },

        function (cb) {
            var criteria = {_id: campaignData._id};
            var options = {}; //{multi: true};
            DAO.findOneAndUpdateData(Models.charityCampaign, criteria, campaignMainImageFileId, {new: true}, function (err, data) {
                if (err) {
                    return cb(err)
                }
                return cb();
            });
        },
        function (cb) {
                var criteria    = {_id:CharityData._id};
                var dataCampaign  = {campaignId:campaignData._id};
                var datatoSet1  = {$addToSet:dataCampaign};
                var options     = {multi: true};
                Service.CharityService.updateCharityOwnerId(criteria, datatoSet1, options,function (err, result) {
                    if (err) {
                        return  cb(err)
                    }
                    return  cb();
                });
        },
        function (cb) {
            if (dataToSave.pictures != undefined && dataToSave.pictures.length > 0) {
                var taskInParallel = [];
                for (var key in dataToSave.pictures) {
                    (function (key) {
                        taskInParallel.push((function (key) {
                            return function (embeddedCB) {//TODO
                                var document = UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.FILE_TYPES.DOCUMENT;
                                UploadManager.uploadFile(dataToSave.pictures[key], campaignData._id, document, function (err, uploadedInfo) {

                                    if (err) {
                                        cb(err)
                                    }
                                    var mainImageFile = uploadedInfo && uploadedInfo.original && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.original || null;

                                    if (err) return embeddedCB(err);
                                    campaignPictures.push(mainImageFile);
                                    return embeddedCB();

                                })
                            }
                        })(key))
                    }(key));
                }
                async.parallel(taskInParallel, function (err, result) {
                    cb();
                });
            } else {
                cb();
            }
        },
        function (cb) {
            //Insert Into DB
            var imgagesToSave = {};
            imgagesToSave.pictures = campaignPictures;

            var criteria = {_id: campaignData._id};
            var datatoSet = {$addToSet: imgagesToSave};
            var options = {lean: true};


            Service.CharityService.updateCharityCampaign(criteria, datatoSet, options, function (err, imagesResult) {
                if (err) {
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





var campaignList = function (payloadData, CharityData, callback) {
    var campaignData = null;
    var dataToSave = payloadData;

    /* var criteria      = { complete:false},*/

    var criteria  = {};
    if(dataToSave.type) {
        if(dataToSave.type == 'COMPLETE'){

            var query = {
                $and:[
                    {$or:[
                        {complete:true},
                        {'endDate':{$gte:new Date()}}

                    ]},
                    {'charityOwnerId':CharityData._id}
                ]
            };
        }
        if(dataToSave.type == 'PENDING'){

            var query = {
                $and:[
                    {complete:false},
                    {'endDate':{$gte:new Date()}},
                    {'charityOwnerId':CharityData._id}
                ]
            };
        }
    }


    var _date = new Date();
    var options = {lean: true},
        projection = {createdOn:0};

    Service.CampaignService.getCampaign(query, projection, options, function (err, res) {
        if (err) {
            callback(err)
        } else {
            callback(null,res);
        }
    });
};


var getCharityProfileInfo = function (CharityData,callbackRoute) {



    var populateVariable = {
        path: "pictures",
        match: {isDelete:false},
        select: 'images'
    };

    var criteria      = { charityOwnerId:CharityData._id},
        options = {lean: true},
        projection ={logoFileId:1,type:1,description:1,keyWord:1,foundationDate:1,officeAddress1:1,officeAddress2:1,
            officeCity:1,officeState:1,officeCountry:1,pictures:1,videos:1};




    Service.CharityService.getCharityPopulate(criteria, projection, options,populateVariable, function (err, res) {
        if (err) {
            callbackRoute(err)
        } else {
            callbackRoute(null,res);
        }
    });
};



var updateCampaign = function (payloadData, CharityData, callback) {
    console.log('here')
    var campaignData = null;
    var campaignMainImageFileId = {};
    var dataToSave = payloadData;
    var campDataToSave = {};

    async.series([

        function (cb) {
            if (dataToSave.name) {
                campDataToSave.name = dataToSave.name;
            }
            if (dataToSave.lat) {
                campDataToSave.lat = dataToSave.lat;
            }
            if (dataToSave.long) {
                campDataToSave.long = dataToSave.long;
            }
            if (dataToSave.address) {
                campDataToSave.address = dataToSave.address;
            }
            if (dataToSave.description) {
                campDataToSave.description = dataToSave.description;
            }
            if (dataToSave.hasKeyWords) {
                campDataToSave.hasKeyWords = dataToSave.hasKeyWords;
            }
            if (dataToSave.unitName) {
                campDataToSave.unitName = dataToSave.unitName;
            }
            if (dataToSave.costPerUnit) {
                campDataToSave.costPerUnit = dataToSave.costPerUnit;
            }
            if (dataToSave.targetUnitCount) {
                campDataToSave.targetUnitCount = dataToSave.targetUnitCount;
            }
            if (dataToSave.endDate) {
                campDataToSave.endDate = dataToSave.endDate;
            }
            if (dataToSave.videoLink) {
                campDataToSave.videoLink = dataToSave.videoLink;
            }
            if (dataToSave.complete) {
                campDataToSave.complete = dataToSave.complete;
            }
            cb();
        },
        function (cb) {
            console.log(dataToSave.id,'================', campDataToSave)
            if (dataToSave.mainImageFileId) {
                var document = UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.FILE_TYPES.DOCUMENT;
                UploadManager.uploadFile(dataToSave.mainImageFileId, dataToSave.id, document, function (err, uploadedInfo) {
                    if (err) {
                        cb(err)
                    }
                    var mainImageFile = uploadedInfo && uploadedInfo.original && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.original || null;
                    campDataToSave.mainImageFileId = mainImageFile;
                    return cb();
                });
            } else {
                cb();
            }
        },
        function (cb) {
            //Insert Into DB

            console.log(dataToSave.id,'================', campDataToSave)
            var criteria = {
                $and:[
                    {_id: dataToSave.id},
                    {'charityOwnerId':CharityData._id}
                ]
            };

            var datatoSet = {$addToSet: campDataToSave};
            var options = {lean: true};
            Service.CharityService.updateCharityCampaign(criteria, campDataToSave, options, function (err, charityDataFromDB) {
                if (err) {
                    cb(err)
                } else {
                    campaignData = charityDataFromDB;
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

module.exports = {
    createCharityOwner: createCharityOwner,
    CharityOwnerBankDetails: CharityOwnerBankDetails,
    getCharityProfileInfo: getCharityProfileInfo,
    updateCampaign: updateCampaign,
    createCampaign: createCampaign,
    changePassword: changePassword,
    CharityOwnerProfileStep1: CharityOwnerProfileStep1,
    campaignList: campaignList,
    loginCharityOwner: loginCharityOwner
};