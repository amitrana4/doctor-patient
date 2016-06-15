'use strict';

var Service = require('../Services');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var async = require('async');

var UploadManager = require('../Lib/UploadManager');
var TokenManager = require('../Lib/TokenManager');
var NotificationManager = require('../Lib/NotificationManager');

/*var updateCustomer = function (phoneNo, data, callback) {
    var criteria = {
        phoneNo: phoneNo
    };
    var dataToSet = {};
    if (data.name) {
        dataToSet.name = data.name;
    }
    if (data.email) {
        dataToSet.email = data.email;
    }
    if (data.phoneNo) {
        dataToSet.phoneNo = data.phoneNo;
    }
    if (data.deviceToken) {
        dataToSet.deviceToken = data.deviceToken;
    }
    if (data.appVersion) {
        dataToSet.appVersion = data.appVersion;
    }
    if (data.deviceType) {
        dataToSet.deviceType = data.deviceType;
    }
    if (data.hasOwnProperty('isBlocked')) {
        dataToSet.isBlocked = data.isBlocked;
    }
    if (data.hasOwnProperty('defaultCheckoutOption')) {
        dataToSet.defaultCheckoutOption = data.defaultCheckoutOption;
    }
    var options = {
        new: true
    };
    Service.CustomerService.updateCustomer(criteria, dataToSet, options, function (err, data) {
        if (err) {
            callback(err)
        } else {
            if (data) {
                callback(null, data)
            } else {
                callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_FOUND)
            }
        }
    })
};*/

/*var resetPassword = function (email, callback) {
    var generatedPassword = UniversalFunctions.generateRandomString();
    var customerObj = null;
    if (!email) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        async.series([
            function (cb) {
                //Get User
                var criteria = {
                    email: email
                };
                var setQuery = {
                    firstTimeLogin: true,
                    password: UniversalFunctions.CryptData(generatedPassword)
                };
                Service.CustomerService.updateCustomer(criteria, setQuery, {new: true}, function (err, userData) {
                    console.log('update customer', err, userData)
                    if (err) {
                        cb(err)
                    } else {
                        if (!userData || userData.length == 0) {
                            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_FOUND);
                        } else {
                            customerObj = userData;
                            cb()
                        }
                    }
                })
            },
            function (cb) {
                if (customerObj) {
                    var variableDetails = {
                        user_name: customerObj.name,
                        password_to_login: generatedPassword
                    };
                    NotificationManager.sendEmailToUser(variableDetails, customerObj.email, cb)
                } else {
                    cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
                }
            }
        ], function (err, result) {
            callback(err, {generatedPassword: generatedPassword}); //TODO Change in production DO NOT Expose the password
        })
    }
};*/

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

/*
var changePassword = function (queryData, userData, callback) {
    var userFound = null;
    if (!queryData.oldPassword || !queryData.newPassword || !userData) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        async.series([
            function (cb) {
                var criteria = {
                    _id: userData.id
                };
                var projection = {};
                var options = {
                    lean: true
                };
                Service.CustomerService.getCustomer(criteria, projection, options, function (err, data) {
                    if (err) {
                        cb(err)
                    } else {
                        if (data && data.length > 0 && data[0]._id) {
                            userFound = data[0];
                            cb();
                        } else {
                            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_FOUND)
                        }
                    }
                })
            },
            function (cb) {
                //Check Old Password
                if (userFound.password != UniversalFunctions.CryptData(queryData.oldPassword)) {
                    cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INCORRECT_OLD_PASS)
                } else if (userFound.password == UniversalFunctions.CryptData(queryData.newPassword)) {
                    cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.SAME_PASSWORD)
                } else {
                    cb();
                }
            },
            function (cb) {
                // Update User Here
                var criteria = {
                    _id: userFound._id
                };
                var setQuery = {
                    $set: {
                        firstTimeLogin: false,
                        password: UniversalFunctions.CryptData(queryData.newPassword)
                    }
                };
                var options = {
                    lean: true
                };
                Service.CustomerService.updateCustomer(criteria, setQuery, options, cb);
            }

        ], function (err, result) {
            callback(err, null);
        })
    }
};

var getCustomer = function (queryData, callback) {
    var criteria = {};
    if (queryData.userId) {
        criteria._id = queryData.userId;
    }
    if (queryData.phoneNo) {
        criteria.phoneNo = queryData.phoneNo;
    }
    if (queryData.email) {
        criteria.email = queryData.email;
    }
    if (queryData.deviceToken) {
        criteria.deviceToken = queryData.deviceToken;
    }
    if (queryData.appVersion) {
        criteria.appVersion = queryData.appVersion;
    }
    if (queryData.deviceType) {
        criteria.deviceType = queryData.deviceType;
    }
    if (queryData.defaultCheckoutOption) {
        criteria.defaultCheckoutOption = queryData.defaultCheckoutOption;
    }
    if (queryData.hasOwnProperty('isBlocked')) {
        criteria.isBlocked = queryData.isBlocked;
    }
    var options = {
        limit: queryData.limit || 0,
        skip: queryData.skip || 0,
        sort: {registrationDate: -1}
    };
    Service.CustomerService.getCustomer(criteria, { __v: 0}, options, function (err, data) {
        callback(err, {count: data && data.length || 0, customersArray: data})
    })
};

var getPartner = function (queryData, callback) {
    var criteria = {};
    if (queryData.partnerId) {
        criteria._id = queryData.partnerId;
    }
    if (queryData.phoneNo) {
        criteria.phoneNo = queryData.phoneNo;
    }
    if (queryData.email) {
        criteria.email = queryData.email;
    }
    if (queryData.hasOwnProperty('isBlocked')) {
        criteria.isBlocked = queryData.isBlocked;
    }
    var options = {
        limit: queryData.limit || 0,
        skip: queryData.skip || 0,
        sort: {registrationDate: -1}
    };
    Service.PartnerService.getPartner(criteria, { __v: 0}, options, function (err, data) {
        callback(err, {count: data && data.length || 0, partnersArray: data})
    })
};

var getInvitedUsers = function (data, callback) {
    var criteria = {};
    if (data.phoneNo) {
        criteria.phoneNo = data.phoneNo;
    }
    if (data.deviceToken) {
        criteria.deviceToken = data.deviceToken;
    }
    if (data.appVersion) {
        criteria.appVersion = data.appVersion;
    }
    if (data.deviceType) {
        criteria.deviceType = data.deviceType;
    }
    if (data.referralCode) {
        criteria.referralCode = data.referralCode;
    }
    var options = {
        limit: data.limit || 0
        , skip: data.skip || 0,
        sort : {rank: 1}
    };
    Service.InvitedUserService.getUser(criteria, {__v: 0}, options, function (err, data) {
        callback(err, {count: data.length || 0, invitedUsersArray: data})
    })
};

var deleteCustomer = function (phoneNo, callback) {
    var userId = null;
    if (!phoneNo) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        async.series([
            function (cb) {
                //Get User
                var criteria = {
                    phoneNo: phoneNo
                };
                Service.CustomerService.getCustomer(criteria, function (err, userData) {
                    if (err) {
                        cb(err)
                    } else {
                        if (!userData || userData.length == 0) {
                            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_FOUND);
                        } else {
                            userId = userData[0] && userData[0]._id;
                            cb()
                        }
                    }
                })
            },
            /!*function (cb) {
             //TODO use it later when bookings API are completed
             //Delete Booking
             var criteria = {
             $or: [{driver: userId}, {customer: userId}]
             };
             Service.Booking.deleteBooking(criteria, cb)
             },*!/
            function (cb) {
                //Finally Delete User
                var criteria = {
                    _id: userId
                };
                Service.CustomerService.deleteCustomer(criteria, function (err, data) {
                    cb(err, data);
                })
            }
        ], function (err, result) {
            callback(err, null)

        })
    }
};
*/

var getContactBusiness= function (payload, callback) {
    Service.ContactFormService.getBusinessData({},{__v:0},{lean:true}, function (err, businessArray) {
        if (err){
            callback(err)
        }else {
            callback(null,{count:businessArray && businessArray.length || 0, businessArray : businessArray || []})
        }
    })};

var getContactDriver = function (payload, callback) {
    Service.ContactFormService.getDriverData({},{__v:0},{lean:true}, function (err, driverArray) {
        if (err){
            callback(err)
        }else {
            callback(null,{count:driverArray && driverArray.length || 0, driverArray : driverArray || []})
        }
    })
};


var getAllCharity = function (userData, callback) {
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        Service.CharityService.getCharityOwner({}, function (err, charityAry) {
            if (err) {
                callback(err);
            } else {
                callback(null, charityAry);
            }
        });
    }
};

var getAllCampaign = function (userData, callback) {
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        var populateVariable = {
            path: "charityId",
            select: 'name website contactPerson emailId phoneNumber countryCode bankAccountNumber bankAccountHolderPhoneNumber bankAccountHolderName'
        };
        Service.CharityService.getCharityCampaignPopulate({}, {}, {lean:true}, populateVariable, function (err, charityAry) {
            if (err) {
                callback(err);
            } else {
                console.log(charityAry)
                callback(null, charityAry);
            }
        });
    }
};

var getAllCampaignDonation = function (userData, callback) {
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {

        var populateVariable = [{
            path: "campaignId"
        },{
            path: "charityId",
            select: 'name website contactPerson emailId phoneNumber countryCode bankAccountNumber bankAccountHolderPhoneNumber bankAccountHolderName'
        },{
            path: "donorId"
        }];

        Service.AdminService.getDonationPopulate({}, {}, {lean:true}, populateVariable, function (err, donations) {
            if (err) {
                callback(err);
            } else {
                callback(null, donations);
            }
        });
    }
};


var getAllCharityDonation = function (userData, callback) {
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {

        var populateVariable = [{
            path: "charityId",
            select: 'name website contactPerson emailId phoneNumber countryCode bankAccountNumber bankAccountHolderPhoneNumber bankAccountHolderName'
        },{
            path: "donorId",
            select: 'emailId firstName lastName'
        }];

        Service.AdminService.getcharityDonationsPopulate({}, {}, {lean:true}, populateVariable, function (err, donations) {
            if (err) {
                callback(err);
            } else {
                callback(null, donations);
            }
        });
    }
};

var getCharityRecurring = function (userData, callback) {
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {

        var populateVariable = [{
            path: "charityId",
            select: 'name website contactPerson emailId phoneNumber countryCode bankAccountNumber bankAccountHolderPhoneNumber bankAccountHolderName'
        },{
            path: "donorId",
            select: 'emailId firstName lastName'
        },{
            path: "cardId"
        },{
            path: "donation"
        }];

        Service.AdminService.getdonationRecurringCharityPopulate({}, {}, {lean:true}, populateVariable, function (err, donations) {
            if (err) {
                callback(err);
            } else {
                callback(null, donations);
            }
        });
    }
};


var paymentStatus = function (userData, callback) {
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {

        async.series([
            function (cb) {
                var criteria = [
                    {
                        $group : {
                            _id: {$recurringDonation : true},
                            totalAmount: { $sum: "$donatedAmount" },
                        }
                    }
                ];
                Service.AdminService.getCampaignRecurringDonation(criteria, function (err, donations) {
                    if (err) {
                        cb(err);
                    } else {
                        console.log(donations)
                        cb();
                    }
                });
            },
           /* function (cb) {
                Service.AdminService.getCharityRecurringDonation({}, {}, {lean:true}, populateVariable, function (err, donations) {
                    if (err) {
                        console.log(donations)
                        cb(err);
                    } else {
                        cb();
                    }
                });
            }*/
        ], function (err, result) {
            if (err) {
                return callback(err);
            }
            callback();
        });
    }
};


var getCampaignRecurring = function (userData, callback) {
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {

        var populateVariable = [{
            path: "charityId",
            select: 'name website contactPerson emailId phoneNumber countryCode bankAccountNumber bankAccountHolderPhoneNumber bankAccountHolderName'
        },{
            path: "donorId",
            select: 'emailId firstName lastName'
        },{
            path: "cardId"
        },{
            path: "donation"
        },{
            path: "campaignId"
        }];

        Service.AdminService.getdonationRecurringCampaignPopulate({}, {}, {lean:true}, populateVariable, function (err, donations) {
            if (err) {
                callback(err);
            } else {
                callback(null, donations);
            }
        });
    }
};


var charityPayment = function (userData, payload, callback) {
    var donation = {};
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        var criteria = {
            charityId: payload.charityId
        };
        var populateVariable = [{
            path: "charityId",
            select: 'name website contactPerson emailId phoneNumber countryCode bankAccountNumber bankAccountHolderPhoneNumber bankAccountHolderName'
        }, {
            path: "donorId",
            select: 'emailId firstName lastName'
        }];
        Service.AdminService.getcharityDonationsPopulate(criteria, {}, {lean: true}, populateVariable, function (err, donations) {
            if (err) {
                callback(err);
            } else {
                if (donations.length == 0) return callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.RECORD_NOT_FOUND);
                donation = donations;
                callback(null, donation);
            }
        });
    }
};

var addAdminMargin = function (userData, payload, callback) {
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        var data = {
            $set : {rate: payload.rate}
        };
        Service.AdminService.updateAdminMargin({}, data, {lean: true}, function (err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        })
    }
};

var changeCampaignRecurring = function (payload, userData, callback) {
    var donation = {};
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        var campaignData = {};
        var recurringData = {};
        async.series([
            function (cb) {
                Service.CharityService.getCharityCampaign({_id: payload.campaignId}, {}, {lean: true}, function (err, campArray) {
                    if (err) {
                        cb(err)
                    } else {
                        if (campArray.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                        campaignData = campArray[0];
                        cb()
                    }
                })
            },
            function (cb) {
                Service.DonorService.getDonationRecurring({_id: payload.recurringId, campaignId: payload.campaignId}, {}, {lean: true}, function (err, recc) {
                    if (err) {
                        cb(err)
                    } else {
                        if (recc.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                        if (recc[0].complete == true) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.CAMPAIGN_CLOSED);
                        recurringData = recc[0];
                        cb()
                    }
                })
            },
            function (cb) {
                if (payload.endDate < new Date() && payload.endDate && payload.frequency) {
                    cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_DATE);
                }
                else if (payload.status == 'true') {
                    if (payload.endDate || payload.unit) {
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.TYPE_STATUS_ERROR);
                    } else {
                        cb();
                    }
                } else {
                    cb();
                }
            },
            function (cb) {
                if (payload.status == 'true') {
                    var crt = {campaignId:payload.campaignId, _id:payload.recurringId};
                    var dataToUpdate = {
                        $set: {
                            complete: true,
                            adminAction: true,
                            adminEndAction: true,
                            AdminEndDate: new Date().toISOString()
                        }
                    };
                    Service.DonorService.updateDonationRecurring(crt, dataToUpdate, {multi:true}, function (err, charityAry) {
                        if (err) {
                            cb(err)
                        } else {
                            if (charityAry == null) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                            if (charityAry.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                            cb()
                        }
                    })
                }
                else{
                    var crt = {campaignId:payload.campaignId, _id:payload.recurringId};
                    var FData = {adminAction: true}
                    if(payload.endDate){
                        FData.endDate = payload.endDate;
                    }
                    if(payload.frequency){
                        FData.frequency = payload.frequency;
                    }
                    if(payload.unit){
                        FData.donatedUnit = payload.unit;
                    }
                    var dataToUpdate = {
                        $set: FData
                    }
                    Service.DonorService.updateDonationRecurring(crt, dataToUpdate, {lean: true}, function (err, charityAry) {
                        console.log(charityAry)
                        if (err) {
                            cb(err)
                        } else {
                            if (charityAry == null) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                            if (charityAry.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                            cb()
                        }
                    })
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

var changeCharityRecurring = function (payload, userData, callback) {
    var donation = {};
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        var campaignData = {};
        var recurringData = {};
        async.series([
            function (cb) {
                Service.CharityService.getCharityOwner({_id: payload.charityId}, {}, {lean: true}, function (err, campArray) {
                    if (err) {
                        cb(err)
                    } else {
                        if (campArray.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                        campaignData = campArray[0];
                        cb()
                    }
                })
            },
            function (cb) {
                Service.DonorService.getDonationRecurringCharity({_id: payload.recurringId, charityId: payload.charityId}, {}, {lean: true}, function (err, recc) {
                    if (err) {
                        cb(err)
                    } else {
                        if (recc.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                        if (recc[0].complete == true) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.CAMPAIGN_CLOSED);
                        recurringData = recc[0];
                        cb()
                    }
                })
            },
            function (cb) {
                if (payload.endDate < new Date() && payload.endDate && payload.frequency) {
                    cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_DATE);
                }
                else if (payload.status == 'true') {
                    if (payload.endDate || payload.donatedAmount) {
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.TYPE_STATUS_ERROR);
                    } else {
                        cb();
                    }
                } else {
                    cb();
                }
            },
            function (cb) {
                if (payload.status == 'true') {
                    var crt = {campaignId:payload.campaignId, _id:payload.recurringId};
                    var dataToUpdate = {
                        $set: {
                            complete: true,
                            adminAction: true,
                            adminEndAction: true,
                            AdminEndDate: new Date().toISOString()
                        }
                    };
                    Service.DonorService.updateDonationRecurringCharity(crt, dataToUpdate, {multi:true}, function (err, charityAry) {
                        if (err) {
                            cb(err)
                        } else {
                            if (charityAry == null) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                            if (charityAry.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                            cb()
                        }
                    })
                }
                else{
                    var crt = {campaignId:payload.campaignId, _id:payload.recurringId};
                    var FData = {adminAction: true}
                    if(payload.endDate){
                        FData.endDate = payload.endDate;
                    }
                    if(payload.donatedAmount){
                        FData.donatedAmount = payload.donatedAmount;
                    }
                    if(payload.frequency){
                        FData.frequency = payload.frequency;
                    }
                    var dataToUpdate = {
                        $set: FData
                    }
                    Service.DonorService.updateDonationRecurringCharity(crt, dataToUpdate, {lean: true}, function (err, charityAry) {
                        console.log(charityAry)
                        if (err) {
                            cb(err)
                        } else {
                            if (charityAry == null) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                            if (charityAry.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                            cb()
                        }
                    })
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



var editDonor = function (payload, userData, callback) {
    var newData = {}
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        var donorData = {};
        async.series([
            function (cb) {
                Service.DonorService.getDonor({_id: payload.donorId}, {}, {lean: true}, function (err, dnrData) {
                    if (err) {
                        cb(err)
                    } else {
                        if (dnrData.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                        donorData = dnrData[0];
                        cb()
                    }
                })
            },
            function(cb){
                if (payload.profilePic) {
                    var document = UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.FILE_TYPES.DOCUMENT;
                    console.log(payload.profilePic, donorData._id, document)
                    UploadManager.uploadFile(payload.profilePic, donorData._id, document, function (err, uploadedInfo) {
                        if (err) {
                            cb(err)
                        }
                        var supportingDocumentFileId = uploadedInfo && uploadedInfo.original && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.original || null;
                        newData.profilePic = supportingDocumentFileId;
                        return  cb();
                    });
                }else{
                    cb();
                }
            },
            function (cb) {
                var crt = {_id: payload.donorId};
                if(payload.firstName){
                    newData.firstName = payload.firstName
                }
                if(payload.lastName){
                    newData.lastName = payload.lastName
                }
                if(payload.country){
                    newData.country = payload.country
                }
                if(payload.phoneNumber){
                    newData.phoneNumber = payload.phoneNumber
                }
                var dataToUpdate = {
                    $set: newData
                };
                Service.DonorService.updateDonor(crt, dataToUpdate, {multi: true}, function (err, dnrArray) {
                    if (err) {
                        cb(err)
                    } else {
                        if (dnrArray == null) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                        if (dnrArray.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                        cb()
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
    }
};


var CampaignPayment = function (userData, payload, callback) {
    var donation = {};
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {

        var criteria = {
            campaignId: payload.campaignId
        };
        var populateVariable = [{
            path: "charityId",
            select: 'name website contactPerson emailId phoneNumber countryCode bankAccountNumber bankAccountHolderPhoneNumber bankAccountHolderName'
        }, {
            path: "donorId",
            select: 'emailId firstName lastName'
        }];
        Service.AdminService.getDonationPopulate(criteria, {}, {lean: true}, populateVariable, function (err, donations) {
            if (err) {
                callback(err);
            } else {
                if (donations.length == 0) return callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                donation = donations;
                callback(null, donation);
            }
        });
    }
};


var getAllDonors = function (userData, callback) {
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        Service.DonorService.getDonor({}, function (err, charityAry) {
            if (err) {
                callback(err);
            } else {
                callback(null, charityAry);
            }
        });
    }
};



var approveCharity = function (payload, userData, callback) {
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        var charityData;
        async.series([
            function (cb) {
                    Service.CharityService.getCharityOwner({_id: payload.charityId}, {}, {lean: true}, function (err, charityAry) {
                        if (err) {
                            cb(err)
                        } else {
                            if (charityAry.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                            charityData = charityAry[0];
                            cb()
                        }
                    })
            },
            function (cb) {
                var setQuery = {}
                var onQuery = {
                    _id: payload.charityId
                };
                if(payload.status == 'true'){
                    setQuery = {
                        "$set" : {adminApproval: payload.status}
                    };
                }
                else if(payload.status == 'false'){
                    setQuery = {
                            "$set" : {reject: true}
                    };

                }
                    Service.CharityService.updateCharityOwner(onQuery, setQuery, {lean: true}, function (err, charityDataFromDB) {
                        console.log(setQuery, charityDataFromDB, payload.status, '====================')
                        if(err) cb(err);
                        cb();
                    });
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


var payCharityById = function (payload, userData, callback) {
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        var charityData;
        async.series([
            function (cb) {
                    Service.CharityService.getCharityOwner({_id: payload.charityId}, {}, {lean: true}, function (err, charityAry) {
                        if (err) {
                            cb(err)
                        } else {
                            if (charityAry.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                            charityData = charityAry[0];
                            cb()
                        }
                    })
            },
            function (cb) {
                //Validate for facebookId and password
                console.log(payload.type,'======', payload.donationId)
                if (payload.type == 'ALL' && payload.type) {
                    if (payload.donationId) {
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.TYPE_ALL_ERROR);
                    } else {
                        cb();
                    }
                } else if (!payload.donationId) {
                    cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DONATION_REQUIRED);
                } else {
                    cb();
                }
            },
            function (cb) {
                if (payload.type == 'ALL' && payload.type) {
                    var crt;
                    var dataToUpdate = {paid : true};
                    if(payload.status == 'ONETIME'){
                        crt = {charityId: charityData._id,
                            recurringDonation: false}
                    }
                    else{
                        crt = {charityId: charityData._id, recurringDonation: true}
                    }
                    Service.AdminService.updateManyDonation(crt, dataToUpdate, {multi:true}, function (err, charityAry) {
                        if (err) {
                            cb(err)
                        } else {
                            if (charityAry == null) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                            if (charityAry.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                            charityData = charityAry[0];
                            cb()
                        }
                    })
                }
                else{
                    var crt;
                    var dataToUpdate = {
                        $set: {
                            paid: true
                        }
                    }
                    if(payload.status == 'ONETIME'){
                        crt = {charityId: charityData._id,
                            _id: payload.donationId,
                                recurringDonation: false}
                    }
                    else{
                        crt = {charityId: charityData._id,
                            _id: payload.donationId,
                            recurringDonation: true}
                    }
                    Service.AdminService.updateCharityDonations(crt, dataToUpdate, {lean: true}, function (err, charityAry) {
                        if (err) {
                            cb(err)
                        } else {
                            if (charityAry == null) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                            if (charityAry.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                            charityData = charityAry[0];
                            cb()
                        }
                    })
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


var deleteDonor = function (payload, userData, callback) {
    var newData = {}
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        var donorData = {};
        async.series([
            function (cb) {
                Service.DonorService.getDonor({_id: payload.donorId}, {}, {lean: true}, function (err, dnrData) {
                    if (err) {
                        cb(err)
                    } else {
                        if (dnrData.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                        donorData = dnrData[0];
                        cb()
                    }
                })
            },
            function (cb) {
                var crt = {_id: payload.donorId};
                var dataToUpdate = {
                    $set: {deleteByAdmin: true}
                };
                Service.DonorService.updateDonor(crt, dataToUpdate, {multi: true}, function (err, dnrArray) {
                    if (err) {
                        cb(err)
                    } else {
                        if (dnrArray == null) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                        if (dnrArray.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                        cb()
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
    }
};

var payCampaignById = function (payload, userData, callback) {
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        var CampaignData;
        async.series([
            function (cb) {
                    Service.CharityService.getCharityCampaign({_id: payload.CampaignId}, {}, {lean: true}, function (err, campaignAry) {
                        if (err) {
                            cb(err)
                        } else {
                            if (campaignAry.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                            CampaignData = campaignAry[0];
                            cb()
                        }
                    })
            },
            function (cb) {
                if (payload.type == 'ALL' && payload.type) {
                    if (payload.donationId) {
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.TYPE_ALL_ERROR);
                    } else {
                        cb();
                    }
                } else if (!payload.donationId) {
                    cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DONATION_REQUIRED);
                } else {
                    cb();
                }
            },
            function (cb) {
                if (payload.type == 'ALL' && payload.type) {
                    var crt;
                    var dataToUpdate = {paid : true};
                    if(payload.status == 'ONETIME'){
                        crt = {campaignId: CampaignData._id,
                            recurringDonation: false}
                    }
                    else{
                        crt = {campaignId: CampaignData._id, recurringDonation: true}
                    }
                    Service.AdminService.updateManyCampDonation(crt, dataToUpdate, {multi:true}, function (err, campaignAry) {
                        if (err) {
                            cb(err)
                        } else {
                            if (campaignAry == null) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                            if (campaignAry.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                            cb()
                        }
                    })
                }
                else{
                    var crt;
                    var dataToUpdate = {
                        $set: {
                            paid: true
                        }
                    }
                    if(payload.status == 'ONETIME'){
                        crt = {campaignId: CampaignData._id,
                            _id: payload.donationId,
                                recurringDonation: false}
                    }
                    else{
                        crt = {campaignId: CampaignData._id,
                            _id: payload.donationId,
                            recurringDonation: true}
                    }
                    Service.AdminService.updateCampaignDonations(crt, dataToUpdate, {lean: true}, function (err, campaignAry) {
                        if (err) {
                            cb(err)
                        } else {
                            if (campaignAry == null) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                            if (campaignAry.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                            cb()
                        }
                    })
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

var makeFeatured = function (payload, userData, callback) {
    console.log(payload.campaignId)
    if (!userData || !userData.id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        var campaignData;
        async.series([
            function (cb) {
                var criteria= {_id: payload.campaignId},
                    options = {lean: true},
                    projection ={};

                Service.DonorService.getCharityCampaign(criteria, projection, options, function (err, res) {
                    if (err) {
                        cb(err)
                    } else {
                        if (res.length == 0) return cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
                        campaignData = res[0];
                        cb();
                    }
                });
            },
            function (cb) {
                var onQuery = {
                    _id: campaignData._id
                };
                    Service.CharityService.updateCharityCampaign(onQuery, {feature: payload.status}, {lean: true}, function (err, charityDataFromDB) {
                        if(err) cb(err);
                        cb();
                    });
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


module.exports = {
    adminLogin: adminLogin,
    adminLogout: adminLogout,
    getAllCharity: getAllCharity,
    getAllCampaign: getAllCampaign,
    approveCharity: approveCharity,
    getAllCampaignDonation: getAllCampaignDonation,
    getAllDonors: getAllDonors,
    getAllCharityDonation: getAllCharityDonation,
    getCharityRecurring: getCharityRecurring,
    getCampaignRecurring: getCampaignRecurring,
    charityPayment: charityPayment,
    paymentStatus: paymentStatus,
    CampaignPayment: CampaignPayment,
    payCharityById: payCharityById,
    payCampaignById: payCampaignById,
    changeCampaignRecurring: changeCampaignRecurring,
    changeCharityRecurring: changeCharityRecurring,
    editDonor: editDonor,
    deleteDonor: deleteDonor,
    addAdminMargin: addAdminMargin,
    makeFeatured: makeFeatured
};