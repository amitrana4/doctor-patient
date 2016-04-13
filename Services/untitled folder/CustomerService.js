'use strict';

var Models = require('../Models');

//Get Users from DB
var getCustomer = function (criteria, projection, options, callback) {
    Models.Customers.find(criteria, projection, options, callback);
};

var getAddress = function (criteria, projection, options, callback) {
    Models.CustomerAddresses.find(criteria, projection, options, callback);
};

var updateAddress = function (criteria, dataToSet, options, callback) {
    Models.CustomerAddresses.findOneAndUpdate(criteria, dataToSet, options, callback);
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
    Models.Customers.find(criteria,projection,options, function (err, dataAry) {
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

//Insert User in DB
var createCustomer = function (objToSave, callback) {
    new Models.Customers(objToSave).save(callback)
};

//Update User in DB
var updateCustomer = function (criteria, dataToSet, options, callback) {
    Models.Customers.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Delete User in DB
var deleteCustomer = function (criteria, callback) {
    Models.Customers.findOneAndRemove(criteria, callback);
};

var addAddress = function (objToSave, callback) {
    new Models.CustomerAddresses(objToSave).save(callback)
};

module.exports = {
    getCustomer: getCustomer,
    getAllGeneratedCodes: getAllGeneratedCodes,
    updateCustomer: updateCustomer,
    updateAddress: updateAddress,
    addAddress: addAddress,
    getAddress: getAddress,
    deleteCustomer: deleteCustomer,
    createCustomer: createCustomer
};

