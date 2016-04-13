'use strict';

var Models = require('../Models');

//Get Users from DB
var getDriver = function (criteria, projection, options, callback) {
    Models.Drivers.find(criteria, projection, options, callback);
};

//Insert User in DB
var createDriver = function (objToSave, callback) {
    new Models.Drivers(objToSave).save(callback)
};

//Get All Generated Codes from DB
var getAllGeneratedCodes = function (callback) {
    var criteria = {
        OTPCode : {$ne : null}
    };
    var projection = {
        OTPCode : 1
    };
    var options = {
        lean : true
    };
    Models.Drivers.find(criteria,projection,options, function (err, dataAry) {
        if (err){
            callback(err)
        }else {
            var generatedCodes = [];
            if (dataAry && dataAry.length > 0){
                dataAry.forEach(function (obj) {
                    generatedCodes.push(obj.OTPCode.toString())
                });
            }
            callback(null,generatedCodes);
        }
    })
};

//Update User in DB
var updateDriver = function (criteria, dataToSet, options, callback) {
    Models.Drivers.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Delete User in DB
var deleteDriver= function (criteria, callback) {
    Models.Drivers.findOneAndRemove(criteria, callback);
};

module.exports = {
    getDriver: getDriver,
    getAllGeneratedCodes: getAllGeneratedCodes,
    updateDriver: updateDriver,
    deleteDriver: deleteDriver,
    createDriver: createDriver
};

