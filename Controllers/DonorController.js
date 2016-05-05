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


var createDonor = function (payloadData, callback) {
    var accessToken = null;
    var donorData = null;
    var uniqueCode = null;
    var dataToSave = payloadData;
    if (dataToSave.password)
        dataToSave.password = UniversalFunctions.CryptData(dataToSave.password);
    dataToSave.firstTimeLogin = false;
    var dataToUpdate = {};


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
            //Validate for facebookId and password
            if (typeof dataToSave.facebookId != 'undefined' && dataToSave.facebookId) {
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
            if (dataToSave.facebookId != 'undefined' && dataToSave.facebookId) {
                finalDataToSave.facebookId = dataToSave.facebookId;
            }else{
                finalDataToSave.passwordHash = dataToSave.password;
            }
            Service.DonorService.createDonor(finalDataToSave, function (err, donorDataFromDB) {
                if (err) {
                    if (err.code == 11000 && err.message.indexOf('donorschemas.$emailId_1') > -1){
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIST);
                    }
                    else if (err.code == 11000 && err.message.indexOf('donorschemas.$facebookId_1') > -1){
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.FACEBOOK_ID_EXIST);
                    }
                    else {
                        cb(err)
                    }
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
                    type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.DONOR
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
                userDetails: UniversalFunctions.deleteUnnecessaryDonorData(donorData.toObject())
            });
        }
    });
};



var UpdateDonor = function (payloadData, DonorData, callback) {
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
            Service.DonorService.getDonor(criteria, projection, options, function (err, data) {
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
            Service.DonorService.updateDonor(criteria, setQuery, options, function(err,suceess){
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


var getCampaign = function (callback) {


    var _date = new Date();
    var criteria = {
            $and:[
                {complete:false},
                {'endDate':{$gte:new Date()}}
            ]},
        options = {lean: true},
        projection = {createdOn:0};

    var populateVariable = {
        path: "charityId",
        select: 'name'
    };

    Service.DonorService.getCampaignPopulate(criteria, projection, options, populateVariable, function (err, res) {
        if (err) {
            callback(err)
        } else {
            callback(null,res);
        }
    });
};


var getCampaignById = function (payloadData, callback) {

    var criteria      = { _id:payloadData.campaignId},
        options = {lean: true},
        projection ={charityId:0};

    Service.DonorService.getCharityCampaign(criteria, projection, options, function (err, res) {
        if (err) {
            callback(err)
        } else {
            callback(null,res);
        }
    });
};

var loginDonor = function (payloadData, callback) {
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
            Service.DonorService.getDonor(criteria, projection, option, function (err, result) {
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
                    type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.DONOR
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

        },
        function (cb) {
            var criteria = {
                _id: userFound._id
            };
            var setQuery = {
                appVersion: payloadData.appVersion,
                deviceToken: payloadData.deviceToken,
                deviceType: payloadData.deviceType,
                onceLogin:true
            };
            Service.DonorService.updateDonor(criteria, setQuery, {lean: true}, function (err, data) {
                updatedUserDetails = data;
                cb(err, data);
            });

        },
    ], function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, {accessToken: accessToken,
                userDetails: UniversalFunctions.deleteUnnecessaryDonorData(updatedUserDetails)});
        }
    });
};


var addCard = function (payloadData, userData, callback) {

    var cardData = {};
    var dataToSave = payloadData;
    async.series([
        function (cb) {
            if (!dataToSave.Digit) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.CARD_DIGIT_REQUIRED);
            } else {
                cb();
            }
        },
        function (cb) {
            if (!dataToSave.payPalId) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PAYPALID_REQUIRED);
            } else {
                cb();
            }
        },
        function (cb) {
            dataToSave.createdOn = new Date().toISOString();
            dataToSave.isDefault = true;
            Service.DonorService.createCard(dataToSave, function (err, donorDataFromDB) {
                if (err) {
                    if (err.code == 11000 && err.message.indexOf('donorcardsschemas.$payPalId_1') > -1) {
                        return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.CARD_EXIST);
                    }
                    else {
                        cb(err)
                    }
                } else {
                    cardData = donorDataFromDB;
                    return cb();
                }
            })
        },
        function (cb){
            var criteria = { $and: [{'_id':{ $nin: [cardData._id] }}]};
            var setData = {isDefault:false};
            DAO.UpdateMultipleRecords(Models.donorCards,criteria, setData, {multi: true},function(err, data){
                if (err) return cb(err)
                if(data==null)return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                return cb()
            });
        },
        function (cb) {
            var criteria    = {_id:userData._id};
            var dataCard  = {cards:cardData._id};
            var datatoSet1  = {$addToSet:dataCard};
            var options     = {multi: true};
            Service.DonorService.updateDonor(criteria, datatoSet1, options,function (err, donorDataFromDB) {
                if (err) {
                    cb(err)
                } else {
                    cb();
                }
            })
        }
    ], function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
};

/*var setDefaultCard1 = function(payloadData,userID,callbackRoute){
    async.series({
        checkCard:function(callback){
            var query = {
                $and:[
                    {_id:userID._id},
                    {'cards': { $in : [payloadData.cardID]}}
                ]
            }
            var options = {lean:true};
            var projections = {_id:1};
            Service.DonorService.getDonor(query,projections,options,function(err,result){
                if(err) return callback(err);
                if(result.length == 0) return callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                if(result) return callback();
                callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
            })
        },
        setDefaultCard:function(callback){
            var query = {
                _id:userID._id,
            }
            var options = {lean:true};
            var dataToSet = {
                isDefault:payloadData.cardID
            }
            Service.DonorService.updateDonor(query,dataToSet,options,function(err,result){
                if(err) return callback(err);
                if(result) return callback();
                callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
            })
        }
    },function(err,result){
        if(err) return callbackRoute(err);
        callbackRoute();
    })
}*/



var setDefaultCard = function(payload, userData, callbackRoute) {
    var cardArray = [];
    async.series([
        function(callback) {
            var query = {
                $and:[
                    {_id:userData._id},
                    {'cards': { $in : [payload.cardID]}}
                ]
            }
            var options = {lean:true};
            var projections = {_id:1};
            Service.DonorService.getDonor(query,projections,options,function(err,result){
                if(err) return callback(err);
                if(result.length == 0) return callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                if(result) return callback();
                callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
            })
        },
        function(callback) {
            var query = {_id:payload.cardID,isDeleted:false};
            var dataToset = {isDefault:true}
            Service.DonorService.updateDonorCards(query,dataToset, {new :true},function (err, CustomerCardData) {
                if(err) return callback(err);
                if(CustomerCardData==null) return callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                cardArray=CustomerCardData;
                return callback();
            });
        },
        function (cb){
            var criteria = { $and: [{'_id':{ $nin: [payload.cardID] }}]};
            var setData = {isDefault:false};
            DAO.UpdateMultipleRecords(Models.donorCards,criteria, setData, {multi: true},function(err, data){
                if (err) return cb(err)
                if(data==null)return cb(ERROR_MSG.INVALID_CARD_ID);
                return cb()
            });
        },
    ], function (err, result) {
        if(err)return callbackRoute(err);
        return callbackRoute(null , cardArray);
    });
};


var listCards = function (payloadData, userID, callback) {

    var criteria = {
                _id:userID._id
            },
        options = {lean: true},
        projection = {cards:1, isDefault:1};

    var populateVariable = {
        path: "cards",
        select: 'Digit'
    };

    Service.DonorService.getDonorCardPopulate(criteria, projection, options, populateVariable, function (err, res) {
        if (err) {
            callback(err)
        } else {
            callback(null,res);
        }
    });
};




var Donation = function (payloadData, userData, callback) {

    var finalDonation = {};
    var dataToSave = payloadData;
    var campaignData = {};
    async.series([
        function (callback) {
            var criteria = {_id: dataToSave.campaignId},
                options = {lean: true},
                projection = {charityId: 0};

            Service.DonorService.getCharityCampaign(criteria, projection, options, function (err, res) {
                if (err) callback(err);
                if (res.length == 0) callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                if (new Date(res[0].endDate) < new Date() || res[0].complete == true) callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.CAMPAIGN_CLOSED);
                if (res[0].targetUnitCount < Number(res[0].unitRaised + dataToSave.donatedUnit)) callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.CAMPAIGN_OVERFLOW);
                if (Number(res[0].targetUnitCount) == Number(res[0].unitRaised)) callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.CAMPAIGN_CLOSED);
                campaignData = res[0];
                callback();
            });
        },
        function (callback) {
            var query = {
                $and: [
                    {_id: userData._id},
                    {'cards': {$in: [dataToSave.cardId]}}
                ]
            }
            var options = {lean: true};
            var projections = {};
            Service.DonorService.getDonor(query, projections, options, function (err, result) {
                console.log(result)
                if (err) return callback(err);
                if (result.length == 0) return callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_CARDID);
                if (result) return callback();
                callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
            })
        },
        function (cb) {
            dataToSave.charityId = campaignData.charityId;
            dataToSave.costPerUnit = campaignData.costPerUnit;
            dataToSave.donorId = userData._id;
            dataToSave.cardId = campaignData.cardId;
            dataToSave.endDate = campaignData.endDate;
            dataToSave.createdOn = new Date().toISOString();

            Service.DonorService.createDonation(dataToSave, function (err, donorDataFromDB) {
                if (err) {
                    cb(err)
                } else {
                    finalDonation = donorDataFromDB;
                    cb();
                }
            })
        },
        function (callback) {
            var query = {
                _id: finalDonation.donorId
            }
            var options = {lean: true};
            var dataToSet = {
                $addToSet: {
                    donation: finalDonation._id
                }
            }
            Service.DonorService.updateDonor(query, dataToSet, options, function (err, result) {
                if (err) return callback(err);
                if (result) return callback();
                callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
            })
        },
        function (callback) {
            var newCount = campaignData.unitRaised + dataToSave.donatedUnit
            var query = {
                _id: finalDonation.campaignId
            }

            var options = {lean: true};
            var finalDataToSave = {};
            finalDataToSave.donation = finalDonation._id;
            if(campaignData.targetUnitCount == newCount){
                var dataToSet = {
                    unitRaised: newCount,
                    complete: true,
                    $addToSet: finalDataToSave
                }
            }
            else {
                var dataToSet = {
                    unitRaised: newCount,
                    $addToSet: finalDataToSave
                }
            }
            Service.CharityService.updateCharityCampaign(query, dataToSet, options, function (err, result) {
                if (err) return callback(err);
                if (result) return callback();
                callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
            })
        }
    ], function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, UniversalFunctions.deleteUnnecessaryDonorData(finalDonation.toObject()));
        }
    });
};


var setRating = function (payloadData, userData, callback) {

    var dataToSave = payloadData;
            var query = {
                _id: dataToSave.donationId,
                donorId: userData._id
            }
            var options = {lean: true};
            var dataToSet = {
                $set: {
                    rating: dataToSave.rating,
                    comment: dataToSave.comment
                }
            }
            Service.DonorService.updateDonation(query, dataToSet, options, function (err, result) {
                console.log(err, result)
                if (err) return callback(err);
                if (result == null) return callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                if (result.donorId.toString() != userData._id.toString()) return callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                if (result) return callback();
                callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
            })
};


module.exports = {
    createDonor: createDonor,
    changePassword: changePassword,
    getCampaign: getCampaign,
    getCampaignById: getCampaignById,
    loginDonor: loginDonor,
    addCard: addCard,
    setDefaultCard: setDefaultCard,
    setRating: setRating,
    listCards: listCards,
    Donation: Donation,
    UpdateDonor: UpdateDonor
};