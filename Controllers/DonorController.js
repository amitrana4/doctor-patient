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

var paypal = require('paypal-rest-sdk');
var moment = require('moment');
var Config = require('../Config');


var createDonor = function (payloadData, callback) {
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
        function(cb){
            if (dataToSave.profilePic) {
                var document = UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.FILE_TYPES.DOCUMENT;
                UploadManager.uploadFile(dataToSave.profilePic, donorData._id, document, function (err, uploadedInfo) {
                    if (err) {
                        cb(err)
                    }
                    var supportingDocumentFileId = uploadedInfo && uploadedInfo.original && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.original || null;
                    dataToUpdate.profilePic = supportingDocumentFileId;
                    return  cb();
                });
            }else{
                cb();
            }
        },
        function(cb){
            if (dataToSave.profilePic) {
                var criteria = {_id: donorData._id};

                Service.DonorService.updateDonor(criteria, dataToUpdate, {new: true}, function (err, DataFromDB) {
                    if (err) {
                        cb(err)
                    } else {
                        updatedDonorData = DataFromDB;
                        cb();
                    }
                });
            }else{
                cb();
            }
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
                {feature:true},
                {'endDate':{$gte:new Date()}}
            ]},
        options = {lean: true},
        projection = {createdOn:0};

    var populateVariable = {
        path: "charityId",
        select: 'name contactPerson emailId'
        };

    Service.DonorService.getCampaignPopulate(criteria, projection, options, populateVariable, function (err, res) {
        if (err) {
            callback(err)
        } else {
            callback(null,res);
        }
    });
};

var getAllCampaign = function (callback) {


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
        select: 'name contactPerson emailId'
    };

    Service.DonorService.getCampaignPopulate(criteria, projection, options, populateVariable, function (err, res) {
        if (err) {
            callback(err)
        } else {
            callback(null,res);
        }
    });
};

var getCharities = function (callback) {

console.log(new Date())
    var _date = new Date();
    var criteria = {},
        options = {lean: true},
        projection = {createdOn:0};

    Service.CharityService.getCharityOwner(criteria, projection, options, function (err, res) {
        if (err) {
            callback(err)
        } else {
            callback(null,res);
        }
    });
};


var getCampaignById = function (payloadData, callback) {


    var finalData = {};
    async.series([
        function (cb) {
            var populateVariable = [{
                path: "donation",
                options: {sort: {'createdOn': -1}, limit: 2},
                select: 'donatedAmount donatedUnit donatedCurrency costPerUnit comment rating donorId createdOn'
            },
                {
                    path: "charityId",
                    select: 'name website contactPerson emailId description keyWord type phoneNumber'
                }];

            var criteria = {_id: payloadData.campaignId},
                options = {lean: true},
                projection = {};

            Service.DonorService.getCampaignDeepPopulate(criteria, projection, options, populateVariable, function (err, res) {
                if (err) {
                    cb(err)
                } else {
                    if (res.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                    finalData = res[0];
                    cb();
                }
            });
        },
       /* function (cb) {
            var criteria = {campaignId: payloadData.campaignId},
                projection = {campaignId:1};
            Service.DonorService.getDonationDistict(criteria, projection, function (err, res) {
                console.log(err, res)
                if (err) {
                    cb(err)
                } else {
                    finalData.count = res.length;
                    cb();
                }
            });

        }*/
    ], function (err, result) {
        if (err) {
            callback(err);
        }
        callback(null, finalData);
    })


};

var getCommentsById = function (payloadData, callback) {

    var populateVariable = {
        path: "donorId",
        select: 'firstName profilePic'
    };

    var criteria= {campaignId: payloadData.campaignId},
        options = {lean: true},
        projection ={comment:1, rating:1, createdOn:1, donorId:1};

    Service.DonorService.getDonationPopulate(criteria, projection, options, populateVariable, function (err, res) {
        if (err) {
            callback(err)
        } else {
            if (res.length == 0) return callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.NO_COMMENT_FOUND);
            callback(null,res);
        }
    });
};

var getCharityById = function (payloadData, callback) {

    var criteria      = { _id:payloadData.charityId},
        options = {lean: true},
        projection ={};

    Service.CharityService.getCharityOwner(criteria, projection, options, function (err, res) {
        if (err) {
            callback(err)
        } else {
            if (res.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
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
    var cardDataPaypal = {};
    var paypalReturnData = {};
    var dataToSave = payloadData;
    async.series([
        function (cb) {
            if (!dataToSave.type) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.CARD_DIGIT_REQUIRED);
            } else {
                cb();
            }
        },
        function (cb) {
            if (!dataToSave.number) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PAYPALID_REQUIRED);
            } else {
                cb();
            }
        },function (cb) {
            if (!dataToSave.expire_month) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PAYPALID_REQUIRED);
            } else {
                cb();
            }
        },function (cb) {
            if (!dataToSave.expire_year) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PAYPALID_REQUIRED);
            } else {
                cb();
            }
        },function (cb) {
            if (!dataToSave.cvv2) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PAYPALID_REQUIRED);
            } else {
                cb();
            }
        },function (cb) {
            if (!dataToSave.first_name) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PAYPALID_REQUIRED);
            } else {
                cb();
            }
        },function (cb) {
            if (!dataToSave.last_name) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PAYPALID_REQUIRED);
            } else {
                cb();
            }
        },
        function (cb) {
            var savedCard = {
                "type": dataToSave.type,
                "number": dataToSave.number,
                "expire_month": dataToSave.expire_month,
                "expire_year": dataToSave.expire_year,
                "cvv2": dataToSave.cvv2,
                "first_name": dataToSave.first_name,
                "last_name": dataToSave.last_name
            };

            paypal.creditCard.create(savedCard, function (error, credit_card) {
                if (error) return cb(error.response.details[0].issue)
                cardDataPaypal = credit_card;
                cb()

            })
        },
        function (cb) {
            paypalReturnData.createdOn = new Date().toISOString();
            paypalReturnData.isDefault = true;
            paypalReturnData.payPalId = cardDataPaypal.id;
            paypalReturnData.type = cardDataPaypal.type;
            paypalReturnData.Digit = cardDataPaypal.number;
            paypalReturnData.expire_month = cardDataPaypal.expire_month;
            paypalReturnData.expire_year = cardDataPaypal.expire_year;
            paypalReturnData.first_name = cardDataPaypal.first_name;
            paypalReturnData.last_name = cardDataPaypal.last_name;
            Service.DonorService.createCard(paypalReturnData, function (err, donorDataFromDB) {
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
            callback(null, cardData);
        }
    });
};


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
        select: 'type expire_month expire_year first_name last_name Digit isDefault'
    };

    Service.DonorService.getDonorCardPopulate(criteria, projection, options, populateVariable, function (err, res) {
        if (err) {
            callback(err)
        } else {
            callback(null,res);
        }
    });
};


var getDonations = function (userID, callback) {
    var criteria = {
                _id:userID._id
            },
        options = {lean: true},
        projection = {donation:1, charityDonation:1};

    var populateVariable = [{
        path: "donation",
        select: 'campaignId donorId'
    },{
        path: "charityDonation",
        select: 'donatedAmount charityId'
    }];

    Service.DonorService.getDonorPopulate(criteria, projection, options, populateVariable, function (err, res) {
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
    var cardSelected;
    var savedCard = {};
    var totalAmount;
    var paypalReturn;
    async.series([
        function (callback) {
            var criteria = {_id: dataToSave.campaignId},
                options = {lean: true},
                projection = {};

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
            var populateVariable = {
                path: "cards",
                select: 'payPalId'
            };
            Service.DonorService.getDonorCardPopulate(query, projections, options, populateVariable, function (err, result) {
                if (err) return callback(err);
                if (result.length == 0) return callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_CARDID);
                result[0].cards.forEach(function(val, index){
                    if(val._id == dataToSave.cardId){
                        cardSelected = val.payPalId;
                    }
                })
                if (result) return callback();
                callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
            })
        },function (callback) {

            totalAmount = campaignData.costPerUnit * dataToSave.donatedUnit;
            savedCard = {
                "intent": "sale",
                "payer": {
                    "payment_method": "credit_card",
                    "funding_instruments": [{
                        "credit_card_token": {
                            "credit_card_id": cardSelected
                        }
                    }]
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": campaignData.campaignName,
                            "sku": campaignData.campaignName,
                            "price": campaignData.costPerUnit,
                            "currency": "USD",
                            "quantity": dataToSave.donatedUnit
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": totalAmount
                    },
                    "description": "This is the payment description for" + campaignData.campaignName
                }]
            };

            paypal.payment.create(savedCard, function (error, payment) {
                if (error) {
                    //  throw error;
                    callback(error)
                } else {
                    paypalReturn = payment;
                    callback()
                }

            });

        },
        function (cb) {
            dataToSave.charityId = campaignData.charityId;
            dataToSave.campaignId = campaignData._id;
            dataToSave.donorId = userData._id;
            dataToSave.cardId = campaignData.cardId;
            dataToSave.donatedAmount = totalAmount;
            dataToSave.donatedUnit = dataToSave.donatedUnit;
            dataToSave.costPerUnit = campaignData.costPerUnit;
            dataToSave.paymentGatewayTransactionId = paypalReturn.id;
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
            finalDataToSave.donor = finalDonation.donorId;
            if(campaignData.targetUnitCount == newCount){
                var dataToSet = {
                    unitRaised: newCount,
                    complete: true,
                    completedOn: new Date(),
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








var charityDonation = function (payloadData, userData, callback) {

    var finalDonation = {};
    var dataToSave = payloadData;
    var charityData = {};
    var cardSelected = '';
    var paypalReturn = {};
    async.series([
        function (callback) {
            var criteria = {_id: dataToSave.charityId},
                options = {lean: true},
                projection = {charityId: 0};

            Service.CharityService.getCharityOwner(criteria, projection, options, function (err, res) {
                if (err) callback(err);
                if (res.length == 0) callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                charityData = res[0];
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
            var populateVariable = {
                path: "cards",
                select: 'payPalId'
            };
            Service.DonorService.getDonorCardPopulate(query, projections, options, populateVariable, function (err, result) {
                if (err) return callback(err);
                if (result.length == 0) return callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_CARDID);
                result[0].cards.forEach(function(val, index){
                    if(val._id == dataToSave.cardId){
                        cardSelected = val.payPalId;
                    }
                })
                if (result) return callback();
                callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
            })
        },
        function (callback) {
            var savedCard = {
                "intent": "sale",
                "payer": {
                    "payment_method": "credit_card",
                    "funding_instruments": [{
                        "credit_card_token": {
                            "credit_card_id": cardSelected
                        }
                    }]
                },
                "transactions": [{
                    "amount": {
                        "currency": "USD",
                        "total": dataToSave.donatedAmount
                    },
                    "description": "This is the payment description for" + charityData.campaignName
                }]
            };

            paypal.payment.create(savedCard, function (error, payment) {
                if (error) {
                    //  throw error;
                    callback(error)
                } else {
                    paypalReturn = payment;
                    callback()
                }

            });

        },
        function (cb) {
            dataToSave.charityId = charityData._id;
            dataToSave.donorId = userData._id;
            dataToSave.cardId = charityData.cardId;
            dataToSave.endDate = charityData.endDate;
            dataToSave.donatedAmount = dataToSave.donatedAmount;
            dataToSave.paymentGatewayTransactionId = paypalReturn.id;
            dataToSave.createdOn = new Date().toISOString();

            Service.DonorService.createCharityDonation(dataToSave, function (err, donorDataFromDB) {
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
                    charityDonation: finalDonation._id
                }
            }
            Service.DonorService.updateDonor(query, dataToSet, options, function (err, result) {
                if (err) return callback(err);
                if (result) return callback();
                callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
            })
        },
        function (callback) {
            var query = {
                _id: finalDonation.charityId
            }

            var options = {lean: true};
            var finalDataToSave = {};
            finalDataToSave.donation = finalDonation._id;
            finalDataToSave.recurringDonor = finalDonation.donorId;
            var dataToSet = {
                $addToSet: finalDataToSave
            }
            Service.CharityService.updateCharityOwner(query, dataToSet, options, function (err, result) {
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




var recurringDonation = function (payloadData, userData, callback) {

    var finalDonation = {};
    var dataToSave = payloadData;
    var campaignData = {};
    var cardSelected;
    var savedCard = {};
    var totalAmount;
    var paypalReturn;
    async.series([
        function (callback) {
            var criteria = {_id: dataToSave.campaignId},
                options = {lean: true},
                projection = {};

            Service.DonorService.getCharityCampaign(criteria, projection, options, function (err, res) {
                if (err) callback(err);
                if (res.length == 0) callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                if (new Date(res[0].endDate) < new Date() || res[0].complete == true) callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.CAMPAIGN_CLOSED);
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
            var populateVariable = {
                path: "cards",
                select: 'payPalId'
            };
            Service.DonorService.getDonorCardPopulate(query, projections, options, populateVariable, function (err, result) {
                if (err) return callback(err);
                if (result.length == 0) return callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_CARDID);
                result[0].cards.forEach(function(val, index){
                    if(val._id == dataToSave.cardId){
                        cardSelected = val.payPalId;
                    }
                })
                if (result) return callback();
                callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
            })
        },
        function (cb) {
            var ruccDonation = {};
            ruccDonation.charityId = campaignData.charityId;
            ruccDonation.campaignId = campaignData._id;
            ruccDonation.donorId = userData._id;
            ruccDonation.cardId = payloadData.cardId;
            ruccDonation.frequency = payloadData.frequency;
            ruccDonation.donatedUnit = payloadData.donatedUnit;
            ruccDonation.startDate = new Date().toISOString();
            ruccDonation.endDate = payloadData.endDate;
            ruccDonation.createdOn = new Date().toISOString();


            Service.DonorService.createDonationRecurring(ruccDonation, function (err, donorDataFromDB) {
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
                    recurring: finalDonation._id
                }
            }
            Service.DonorService.updateDonor(query, dataToSet, options, function (err, result) {
                if (err) return callback(err);
                if (result) return callback();
                callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
            })
        },
        function (callback) {
            var query = {
                _id: finalDonation.campaignId
            }

            var options = {lean: true};
            /*var finalDataToSave = {};
            finalDataToSave.recurring = finalDonation._id;*/
            var dataToSet = {
                $addToSet: {
                    recurringDonor: finalDonation.donorId,
                    recurring: finalDonation._id
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
            callback();
        }
    });
};




var charityRecurringDonation = function (payloadData, userData, callback) {

    var finalDonation = {};
    var charityData = {};
    var cardSelected;
    async.series([
        function (callback) {
            var criteria = {_id: payloadData.charityId},
                options = {lean: true},
                projection = {};

            Service.CharityService.getCharityOwner(criteria, projection, options, function (err, res) {
                if (err) callback(err);
                if (res.length == 0) callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                charityData = res[0];
                callback();
            });
        },
        function (callback) {
            var query = {
                $and: [
                    {_id: userData._id},
                    {'cards': {$in: [payloadData.cardId]}}
                ]
            }
            var options = {lean: true};
            var projections = {};
            var populateVariable = {
                path: "cards",
                select: 'payPalId'
            };
            Service.DonorService.getDonorCardPopulate(query, projections, options, populateVariable, function (err, result) {
                if (err) return callback(err);
                if (result.length == 0) return callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_CARDID);
                result[0].cards.forEach(function(val, index){
                    if(val._id == payloadData.cardId){
                        cardSelected = val.payPalId;
                    }
                })
                if(cardSelected == ''){ callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID); }
                if (result) return callback();
                callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
            })
        },
        function (cb) {
            var ruccDonation = {};
            ruccDonation.charityId = charityData._id;
            ruccDonation.donorId = userData._id;
            ruccDonation.cardId = payloadData.cardId;
            ruccDonation.frequency = payloadData.frequency;
            ruccDonation.donatedAmount = payloadData.donatedAmount;
            ruccDonation.startDate = new Date().toISOString();
            ruccDonation.endDate = payloadData.endDate;
            ruccDonation.createdOn = new Date().toISOString();


            Service.DonorService.createDonationRecurringCharity(ruccDonation, function (err, donorDataFromDB) {
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
                    charityRecurring: finalDonation._id
                }
            }
            Service.DonorService.updateDonor(query, dataToSet, options, function (err, result) {
                if (err) return callback(err);
                if (result) return callback();
                callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
            })
        },
        function (callback) {
            var query = {
                _id: finalDonation.charityId
            }
            var options = {lean: true};
            var dataToSet = {
                $addToSet: {
                    recurringDonor: finalDonation.donorId,
                    charityRecurring: finalDonation._id
                }
            }
            Service.CharityService.updateCharityOwner(query, dataToSet, options, function (err, result) {
                if (err) return callback(err);
                if (result) return callback();
                callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
            })
        }
    ], function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback();
        }
    });
};


var cronFunction = function (data, callback){
    var campaignData = {};
    var finalDonation = {};
    var cardSelected = {};
    var totalAmount;
    var paypalReturn;
    async.series([
        /*function (callB) {
            var startDate = data.startDate;
            var endDate = data.endDate;
            var frequency = data.frequency;
            var today = new Date();

            if(data.LastRecurring){
                startDate = data.LastRecurring;
            }
            if(frequency == 7) {
                var d = moment(startDate).add(7, 'days');
                if (d == today) callB();
            }
            else if (frequency == 15){
                var d = moment(startDate).add(15, 'days');
                if (d == today) callB();
            }
            else if (frequency == 30){
                var d = moment(startDate).add(1, 'months');
                if (d == today) callB();
            }
        },*/
        function (callB) {
            console.log('here')
            if(data.complete == true) return callB('completed');
            callB();
        },
        function (callB) {
            var criteria = {_id: data.campaignId},
                options = {lean: true},
                projection = {};

            Service.DonorService.getCharityCampaign(criteria, projection, options, function (err, res) {
                if (err) callB(err);
                if (res.length == 0) callB(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                campaignData = res[0];
                callB();
            });
        },
        function (callback) {
            var query = {
                _id:data.cardId
            }
            var options = {lean: true};
            var projections = {};
            Service.DonorService.getDonorCards(query, projections, options, function (err, result) {
                if (err) return callback(err);
                if (result.length == 0) return callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_CARDID);
                cardSelected = result[0];
                if (result) return callback();
            })
        },
        function (callB) {
            if(data.endDate <= new Date() || campaignData.targetUnitCount == campaignData.unitRaised || campaignData.endDate <= new Date()) {
                var query = {
                    _id: data._id
                }
                var options = {lean: true};
                var dataToSet = {
                    $set: {
                        complete: true
                    }
                }
                Service.DonorService.updateDonationRecurring(query, dataToSet, options, function (err, donorDataFromDB) {
                    if (err) {
                        callB(err)
                    }
                })
                callB('job or recuurence expired')
            }
            else{
                var query = {
                    _id: data._id
                }
                var options = {lean: true};
                var dataToSet = {
                    $set: {
                        LastRecurring: new Date().toISOString()
                    }
                }
                Service.DonorService.updateDonationRecurring(query, dataToSet, options, function (err, donorDataFromDB) {
                    if (err) {
                        callB(err)
                    }
                })
                callB()
            }
        },
        function (callback) {
            totalAmount = campaignData.costPerUnit * data.donatedUnit;
            var savedCard = {
                "intent": "sale",
                "payer": {
                    "payment_method": "credit_card",
                    "funding_instruments": [{
                        "credit_card_token": {
                            "credit_card_id": cardSelected.payPalId
                        }
                    }]
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": campaignData.campaignName,
                            "sku": campaignData.campaignName,
                            "price": campaignData.costPerUnit,
                            "currency": "USD",
                            "quantity": data.donatedUnit
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": totalAmount
                    },
                    "description": "This is the payment description for" + campaignData.campaignName
                }]
            };

            paypal.payment.create(savedCard, function (error, payment) {
                if (error) {
                    //  throw error;
                    callback(error)
                } else {
                    console.log(payment,'========')
                    paypalReturn = payment;
                    callback()
                }

            });

        },
        function (cb) {
            var dataToSave = {};
            dataToSave.charityId = campaignData.charityId;
            dataToSave.campaignId = campaignData._id;
            dataToSave.donorId = data.donorId;
            dataToSave.cardId = campaignData.cardId;
            dataToSave.donatedAmount = totalAmount;
            dataToSave.donatedUnit = data.donatedUnit;
            dataToSave.costPerUnit = campaignData.costPerUnit;
            dataToSave.paymentGatewayTransactionId = paypalReturn.id;
            dataToSave.recurringDonation = true;
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
        function (cb) {

            var query = {
                _id: data._id
            }
            var options = {lean: true};
            var dataToSet = {
                $addToSet: {
                    donation: finalDonation._id
                }
            }
            Service.DonorService.updateDonationRecurring(query, dataToSet, options, function (err, donorDataFromDB) {
                if (err) {
                    cb(err)
                }
                else{
                    cb()
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
            var newCount = campaignData.unitRaised + data.donatedUnit
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
                    completedOn: new Date(),
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
            callback();
    });
}

var cronRecurringDonationCampaign = function (callback) {

    var campaignData = {};
    var finalDonation = {};
    var cardSelected;
    async.series([
        function (cb) {
            var criteria = {complete: false}

            Service.DonorService.getDonationRecurring({}, {}, {lean: true}, function (err, res) {
                if (err) cb(err);
                campaignData = res;
                cb();
            });
        },
        function (cb) {
            async.eachSeries(campaignData,cronFunction, function(data, err) {
                if(err){
                    console.log("Error ", err);
                }
                console.log("cron completed successfully");
            });
        }
    ], function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback();
        }
    });
};






var cronFunctionCharity = function (data, callback){
    var charityData = {};
    var finalDonation = {};
    var cardSelected = {};
    var totalAmount;
    var paypalReturn;
    async.series([
       /* function (callB) {
            var startDate = data.startDate;
            var endDate = data.endDate;
            var frequency = data.frequency;
            var today = new Date();

            if(data.LastRecurring){
                startDate = data.LastRecurring;
            }
            if(frequency == 7) {
                var d = moment(startDate).add(7, 'days');
                if (d == today) callB();
            }
            else if (frequency == 15){
                var d = moment(startDate).add(15, 'days');
                if (d == today) callB();
            }
            else if (frequency == 30){
                var d = moment(startDate).add(1, 'months');
                if (d == today) callB();
            }
        },*/
        function (callB) {
            if(data.complete == true) return callB('completed');
            callB();
        },
        function (callB) {
            var criteria = {_id: data.charityId},
                options = {lean: true},
                projection = {};

            Service.CharityService.getCharityOwner(criteria, projection, options, function (err, res) {
                if (err) callB(err);
                if (res.length == 0) callB(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                charityData = res[0];
                callB();
            });
        },
        function (callback) {
            var query = {
                _id:data.cardId
            }
            var options = {lean: true};
            var projections = {};
            Service.DonorService.getDonorCards(query, projections, options, function (err, result) {
                if (err) return callback(err);
                if (result.length == 0) return callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_CARDID);
                cardSelected = result[0];
                if (result) return callback();
            })
        },
        function (callB) {
            if(data.endDate <= new Date()) {
                var query = {
                    _id: data._id
                }
                var options = {lean: true};
                var dataToSet = {
                    $set: {
                        complete: true
                    }
                }
                Service.DonorService.updateDonationRecurringCharity(query, dataToSet, options, function (err, donorDataFromDB) {
                    if (err) {
                        callB(err)
                    }
                })
                callB('job or recuurence expired')
            }
            else{
                var query = {
                    _id: data._id
                }
                var options = {lean: true};
                var dataToSet = {
                    $set: {
                        LastRecurring: new Date().toISOString()
                    }
                }
                Service.DonorService.updateDonationRecurringCharity(query, dataToSet, options, function (err, donorDataFromDB) {
                    if (err) {
                        callB(err)
                    }
                })
                callB()
            }
        },
        function (callback) {
            totalAmount = data.donatedAmount;
            var savedCard = {
                "intent": "sale",
                "payer": {
                    "payment_method": "credit_card",
                    "funding_instruments": [{
                        "credit_card_token": {
                            "credit_card_id": cardSelected.payPalId
                        }
                    }]
                },
                "transactions": [{
                    "amount": {
                        "currency": "USD",
                        "total": totalAmount
                    },
                    "description": "This is the payment description for" + charityData.campaignName
                }]
            };

            paypal.payment.create(savedCard, function (error, payment) {
                if (error) {
                    //  throw error;
                    callback(error)
                } else {
                    paypalReturn = payment;
                    callback()
                }

            });

        },
        function (cb) {

            var dataToSave = {};
            console.log(charityData,'==========')
            dataToSave.charityId = charityData._id;
            dataToSave.donorId = data.donorId;
            dataToSave.cardId = cardSelected._id;
            dataToSave.donatedAmount = totalAmount;
            dataToSave.paymentGatewayTransactionId = paypalReturn.id;
            dataToSave.recurringDonation = true;
            dataToSave.createdOn = new Date().toISOString();

            Service.DonorService.createCharityDonation(dataToSave, function (err, donorDataFromDB) {
                if (err) {
                    cb(err)
                } else {
                    finalDonation = donorDataFromDB;
                    cb();
                }
            })
        },
        function (cb) {

            var query = {
                _id: data._id
            }
            var options = {lean: true};
            var dataToSet = {
                $addToSet: {
                    donation: finalDonation._id
                }
            }
            Service.DonorService.updateDonationRecurringCharity(query, dataToSet, options, function (err, donorDataFromDB) {
                if (err) {
                    cb(err)
                }
                else{
                    cb()
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
                    charityDonation: finalDonation._id
                }
            }
            Service.DonorService.updateDonor(query, dataToSet, options, function (err, result) {
                if (err) return callback(err);
                if (result) return callback();
                callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
            })
        },
        function (callback) {
            var query = {
                _id: finalDonation.charityId
            }
            var options = {lean: true};
            var dataToSet = {
                $addToSet: {
                    donation: finalDonation._id
                }
            }
            Service.CharityService.updateCharityOwner(query, dataToSet, options, function (err, result) {
                if (err) return callback(err);
                if (result) return callback();
                callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
            })
        }
    ], function (err, data) {
        callback();
    });
}

var cronRecurringDonationCharity = function (callback) {

    var charityData = {};
    async.series([
        function (cb) {
              var criteria = {complete: false}

            Service.DonorService.getDonationRecurringCharity({}, {}, {lean: true}, function (err, res) {
                if (err) cb(err);
                charityData = res;
                cb();
            });
        },
        function (cb) {
            async.eachSeries(charityData,cronFunctionCharity, function(data, err) {
                if(err){
                    console.log("Error ", err);
                }
                console.log("charity cron completed successfully");
            });
        }
    ], function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback();
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
                if (err) return callback(err);
                if (result == null) return callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                if (result.donorId.toString() != userData._id.toString()) return callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                if (result) return callback();
                callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
            })
};



var loginViaFacebook = function (payloadData, callback) {

    var accessToken;
    var finalDonation = {};
    var userFound = {};
    var successLogin = false;
    var flushPreviousSessions = payloadData.flushPreviousSessions || false;
    var updatedUserDetails = {};
    async.series([
        function (cb) {
            var criteria = {
                facebookId: payloadData.facebookId
            };
            var projection = {};
            var option = {
                lean: true
            };
            Service.DonorService.getDonor(criteria, projection, option, function (err, result) {
                if (err) {
                    cb(err)
                } else {
                    userFound = result && result[0] || null;
                    cb();
                }
            });

        },
        function (cb) {
            //validations
            if (!userFound) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.FACEBOOK_ID_NOT_FOUND);
            } else {
                successLogin = true;
                cb();
            }
        },
        function (cb) {
            //Clear Device Tokens if present anywhere else
            if (userFound && payloadData.deviceToken != userFound.deviceToken && !flushPreviousSessions) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.ACTIVE_PREVIOUS_SESSIONS)
            } else {
                var criteria = {
                    deviceToken: payloadData.deviceToken
                };
                var setQuery = {
                    $unset: {deviceToken: 1}
                };
                var options = {
                    multi: true
                };
                Service.DonorService.updateDonor(criteria, setQuery, options, cb)
            }
        },
        function (cb) {
            var criteria = {
                _id: userFound._id
            };
            var setQuery = {
                appVersion: payloadData.appVersion,
                deviceToken: payloadData.deviceToken,
                deviceType: payloadData.deviceType
            };
            Service.DonorService.updateDonor(criteria, setQuery, {new: true}, function (err, data) {
                updatedUserDetails = data;
                cb(err, data);
            });

        },
        function (cb) {
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
    ], function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, {accessToken: accessToken,
                userDetails: UniversalFunctions.deleteUnnecessaryDonorData(updatedUserDetails.toObject())});
        }
    });
};





var setFavourite = function (payload, userData, callback) {
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        var campaignData;
        var charityData;
        async.series([
            function (cb) {
                if (payload.type == 'CAMPAIGN') {
                    //Check if the driver is free or not
                    Service.DonorService.getCharityCampaign({_id: payload.id}, {}, {lean: true}, function (err, campaignAry) {
                        if (err) {
                            cb(err)
                        } else {
                            if (campaignAry.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                            campaignData = campaignAry[0];
                            cb()
                        }
                    })
                }
                else if (payload.type == 'CHARITY') {
                    //Check if the driver is free or not
                    Service.CharityService.getCharityOwner({_id: payload.id}, {}, {lean: true}, function (err, charityAry) {
                        if (err) {
                            cb(err)
                        } else {
                            if (charityAry.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                            charityData = charityAry[0];
                            cb()
                        }
                    })
                }

            },
            function (cb) {
                if (payload.type == 'CAMPAIGN') {
                    var onQuery = {
                        campaignId: campaignData._id,
                        donorId: userData._id,
                    };
                    var setQuery = {
                        campaignId: campaignData._id,
                        donorId: userData._id,
                        createdOn: new Date(),
                        favourite: payload.favourite
                    };
                    Service.DonorService.updateFavouriteCampaign(onQuery, setQuery, {upsert: true}, function (err, charityDataFromDB) {
                        if(err) {
                            if (err.code == 11000 && err.message.indexOf('favouritecampaignschemas.$campaignId_1_donorId_1') > -1) {
                                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE);

                            }
                            else{
                                cb(err)
                            }
                        }
                        else{
                            cb()
                        }
                    });

                }

                if (payload.type == 'CHARITY') {
                    var setQuery = {
                        charityId: charityData._id,
                        donorId: userData._id,
                        createdOn: new Date(),
                        favourite: payload.favourite
                    };
                    Service.DonorService.updateFavouriteCharity(onQuery, setQuery, {upsert: true}, function (err, charityDataFromDB) {
                        if(err) {
                            if (err.code == 11000 && err.message.indexOf('favouritecharityschemas.$campaignId_1_donorId_1') > -1) {
                                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE);
                            }
                            else{
                                cb(err)
                            }
                        }
                        else{
                            cb()
                        }
                    });
                }

            }
        ], function (err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        });
    }
};



var getFavourites = function (payload, userData, callback) {
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        var finalData;
        async.auto([
            function (cb) {
                if (payload.type == 'CAMPAIGN') {
                    if(payload.jobType == 'FAVOURITE') {
                        var populateVariable = {
                            path: "campaignId"
                        };
                        Service.DonorService.getFavouriteCampaignPopulate({donorId: userData.id, favourite : true}, {campaignId:1}, {lean: true}, populateVariable, function (err, campaignAry) {
                            if (err) {
                                cb(err)
                            } else {
                                finalData = campaignAry;
                                cb()
                            }
                        })
                    }
                    else {
                        Service.CharityService.getCharityCampaign({}, function (err, campaignAry) {
                            if (err) {
                                cb(err)
                            } else {
                                finalData = campaignAry;
                                cb()
                            }
                        })
                    }
                }
                else{
                    cb();
                }

            },
            function (cb) {

                if (payload.type == 'CHARITY') {
                    if(payload.jobType == 'FAVOURITE') {
                        var populateVariable = {
                            path: "charityId"
                        };
                        Service.DonorService.getFavouriteCharityPopulate({donorId: userData.id, favourite : true}, {charityId:1}, {lean: true}, populateVariable, function (err, charityAry) {
                            if (err) {
                                cb(err)
                            } else {
                                finalData = charityAry;
                                cb()
                            }
                        })
                    }
                    else{
                        Service.CharityService.getCharityOwner({}, function (err, charityAry) {
                            if (err) {
                                cb(err)
                            } else {
                                finalData = charityAry;
                                cb()
                            }
                        })
                    }
                }
                else{
                    cb();
                }

            }
        ], function (err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null, finalData);
            }
        });
    }
};







var getResetPasswordToken = function (query, callback) {
    var variableDetails = {};
    if(query.email){
        var email = query.email;
        var generatedString = UniversalFunctions.generateRandomString();
        var donorData = null;
        var charityOwnerData = null;
        if (!email) {
            callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        } else {
            async.series([
                function (cb) {
                    //update user
                    var criteria = {
                        emailId: email
                    };
                    var setQuery = {
                        passwordResetToken: UniversalFunctions.CryptData(generatedString)
                    };
                    Service.DonorService.updateDonor(criteria, setQuery, {new: true}, function (err, userData) {
                        if (err) {
                            cb(err)
                        } else {
                            if (!userData || userData.length == 0) {
                                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_NOT_FOUND);
                            } else {
                                donorData = userData;
                                cb()
                            }
                        }
                    })
                },
                function (cb) {
                    if (donorData) {
                        variableDetails = {
                            user_name: donorData.name,
                            password_reset_token: donorData.passwordResetToken,
                            date: moment().format("D MMMM YYYY"),
                            password_reset_link:Config.APP_CONSTANTS.DOMAIN_NAME_MAIL +'/api/charity/resetPassword?passwordResetToken='+donorData.passwordResetToken+'&email='+donorData.emailId+"&newPassword=" //TODO change this to proper html page link
                        };
                        cb();
                    } else {
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
                    }
                },
                function(callback){
                    NotificationManager.sendEmailToUser('CHARITY_FORGOT_PASSWORD', variableDetails, donorData.emailId, function(err){
                        if(err){
                            return callback(err);
                        }
                        callback();
                    });
                }
            ], function (err, result) {
                if (err) {
                    callback(err)
                } else {
                    //callback(null, {password_reset_token: driverObj.passwordResetToken})//TODO Change in production DO NOT Expose the password
                    callback(null)//TODO Change in production DO NOT Expose the password
                }
            })
        }
    }
    else {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMPTY_VALUE);
    }
};


module.exports = {
    createDonor: createDonor,
    changePassword: changePassword,
    getCampaign: getCampaign,
    getCharities: getCharities,
    getCampaignById: getCampaignById,
    getCharityById: getCharityById,
    loginDonor: loginDonor,
    addCard: addCard,
    setDefaultCard: setDefaultCard,
    setRating: setRating,
    listCards: listCards,
    Donation: Donation,
    charityDonation: charityDonation,
    loginViaFacebook: loginViaFacebook,
    setFavourite: setFavourite,
    getDonations: getDonations,
    getFavourites: getFavourites,
    recurringDonation: recurringDonation,
    getCommentsById: getCommentsById,
    cronRecurringDonationCampaign: cronRecurringDonationCampaign,
    cronRecurringDonationCharity: cronRecurringDonationCharity,
    charityRecurringDonation: charityRecurringDonation,
    getResetPasswordToken: getResetPasswordToken,
    getAllCampaign: getAllCampaign,
    UpdateDonor: UpdateDonor
};