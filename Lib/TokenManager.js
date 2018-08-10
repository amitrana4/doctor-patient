'use strict';
/**
 * Created by Amit on 11/7/15.
 */
var Config = require('../Config');
var Jwt = require('jsonwebtoken');
var async = require('async');
var Service = require('../Services');


var getTokenFromDB = function (userId, userType,token, callback) {
    var userData = null;
    var criteria = {
        _id: userId,
        accessToken : token
    };
    async.series([
        function (cb) {
            if (userType == Config.APP_CONSTANTS.DATABASE.USER_ROLES.DOCTOR){
                Service.CustomerService.getCustomer(criteria,{},{lean:true}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry.length > 0){
                            userData = dataAry[0];
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN)
                        }
                    }

                });

            }
            else if (userType == Config.APP_CONSTANTS.DATABASE.USER_ROLES.PATIENT){
                Service.DriverService.getDriver(criteria,{},{lean:true}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry.length > 0){
                            userData = dataAry[0];
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN)
                        }
                    }

                });

            }
            else if (userType == Config.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN){
                Service.AdminService.getAdmin(criteria,{},{lean:true}, function (err, dataAry) {
                    if (err){
                        callback(err)
                    }else {
                        if (dataAry && dataAry.length > 0){
                            userData = dataAry[0];
                            cb();
                        }else {
                            callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN)
                        }
                    }

                });
            }else {
                cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
            }
        }
    ], function (err, result) {
        if (err){
            callback(err)
        }else {
            if (userData && userData._id){
                userData.id = userData._id;
                userData.type = userType;
            }
            callback(null,{userData: userData})
        }

    });
};

var setTokenInDB = function (userId,userType, tokenToSave, callback) {
    var criteria = {
        _id: userId
    };
    var setQuery = {
        accessToken : tokenToSave
    };
    async.series([
        function (cb) {
             if (userType == Config.APP_CONSTANTS.DATABASE.USER_ROLES.DOCTOR){
                Service.DoctorService.updateDoctor(criteria,setQuery,{new:true}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry._id){
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
                        }
                    }
                });

            }
            else if (userType == Config.APP_CONSTANTS.DATABASE.USER_ROLES.PATIENT){
                Service.PatientService.updatePatient(criteria,setQuery,{new:true}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry._id){
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
                        }
                    }

                });

            }
            else if (userType == Config.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN){
                Service.AdminService.updateAdmin(criteria,setQuery,{new:true}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry._id){
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
                        }
                    }

                });
            }else {
                cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
            }
        }
    ], function (err, result) {
        if (err){
            callback(err)
        }else {
            callback()
        }

    });
};

var expireTokenInDB = function (userId,userType, callback) {
    var criteria = {
        _id: userId
    };
    var setQuery = {
        accessToken : null
    };
    var succData = {}
    async.series([
        function (cb) {
            if (userType == Config.APP_CONSTANTS.DATABASE.USER_ROLES.DOCTOR){
                Service.CustomerService.updateCustomer(criteria,setQuery,{new:true}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry.length > 0){
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN)
                        }
                    }
                });

            }
            else if (userType == Config.APP_CONSTANTS.DATABASE.USER_ROLES.PATIENT){
                Service.DriverService.updateDriver(criteria,setQuery,{new:true}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry){
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN)
                        }
                    }

                });

            }
            else if (userType == Config.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN){
                Service.AdminService.updateAdmin(criteria,setQuery,{new:true}, function (err, dataAry) {
                    if (err){
                        callback(err)
                    }else {
                       /* if (dataAry && dataAry.length > 0){
                            cb();
                        }else {
                            callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN)
                        }*/
                        succData = dataAry;
                        cb()
                    }

                });
            }else {
                cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
            }
        }
    ], function (err, result) {
        if (err){
            callback(err)
        }else {
            callback(null, succData)
        }

    });
};


var verifyToken = function (token, callback) {
    var response = {
        valid: false
    };
    Jwt.verify(token, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY, function (err, decoded) {
        if (err) {
            callback(err)
        } else {
            getTokenFromDB(decoded.id, decoded.type,token, callback);
        }
    });
};

var verifyDoctorToken = function (token, callback) {
    var response = {
        valid: false
    };
    Jwt.verify(token, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY, function (err, decoded) {
        if (err) {
            callback(err)
        } else {
            getDoctorTokenFromDB(decoded.id, decoded.type,token, callback);
        }
    });
};

var verifyPatientToken = function (token, callback) {
    var response = {
        valid: false
    };
    Jwt.verify(token, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY, function (err, decoded) {
        if (err) {
            callback(err)
        } else {
            getPatientTokenFromDB(decoded.id, decoded.type,token, callback);
        }
    });
};

var getPatientTokenFromDB = function (userId, userType,token, callback) {
    var userData = null;
    var criteria = {
        _id: userId,
        accessToken : token
    };
    async.series([
        function (cb) {
            if (userType == Config.APP_CONSTANTS.DATABASE.USER_ROLES.PATIENT){
                Service.PatientService.getPatient(criteria,{},{lean:true}, function (err, dataAry) {
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry.length > 0){
                            userData = dataAry[0];
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN)
                        }
                    }

                });

            }else {
                cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
            }
        }
    ], function (err, result) {
        if (err){
            callback(err)
        }else {
            if (userData && userData._id){
                userData.id = userData._id;
                userData.type = userType;
            }
            callback(null,{userData: userData})
        }

    });
};

var getDoctorTokenFromDB = function (userId, userType,token, callback) {
    var userData = null;
    var criteria = {
        _id: userId,
        accessToken : token
    };
    console.log(userType, token, '=====')
    async.series([
        function (cb) {
            if (userType == Config.APP_CONSTANTS.DATABASE.USER_ROLES.DOCTOR){
                Service.DoctorService.getDoctor(criteria,{},{lean:true}, function (err, dataAry) {
                    console.log(err, dataAry, '===============')
                    if (err){
                        cb(err)
                    }else {
                        if (dataAry && dataAry.length > 0){
                            userData = dataAry[0];
                            cb();
                        }else {
                            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN)
                        }
                    }

                });

            }else {
                cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
            }
        }
    ], function (err, result) {
        if (err){
            callback(err)
        }else {
            if (userData && userData._id){
                userData.id = userData._id;
                userData.type = userType;
            }
            callback(null,{userData: userData})
        }

    });
};

var setToken = function (tokenData, callback) {
    if (!tokenData.id || !tokenData.type) {
        callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        var tokenToSend = Jwt.sign(tokenData, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY);
        setTokenInDB(tokenData.id,tokenData.type, tokenToSend, function (err, data) {
            console.log('token>>>>',err,data)
            callback(err, {accessToken: tokenToSend})
        })
    }
};

var expireToken = function (token, callback) {
    Jwt.verify(token, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY, function (err, decoded) {
        if (err) {
            callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN);
        } else {
            expireTokenInDB(decoded.id,decoded.type, function (err, data) {
                callback(err, data)
            });
        }
    });
};

var decodeToken = function (token, callback) {
    Jwt.verify(token, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY, function (err, decodedData) {
        if (err) {
            callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN);
        } else {
            callback(null, decodedData)
        }
    })
};

module.exports = {
    expireToken: expireToken,
    setToken: setToken,
    verifyPatientToken: verifyPatientToken,
    verifyToken: verifyToken,
    verifyDoctorToken: verifyDoctorToken,
    decodeToken: decodeToken
};