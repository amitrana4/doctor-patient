'use strict';

var Models = require('../Models');

//Get Users from DB
var getCharityOwner = function (criteria, projection, options, callback) {
    Models.charity.find(criteria, projection, options, callback);
};

//Get Users from DB
var getCharityOwnerId = function (criteria, projection, options, callback) {
    Models.charityOwner.find(criteria, projection, options, callback);
};



//Insert User in DB
var createCharityOwner = function (objToSave, callback) {
    new Models.charity(objToSave).save(callback)
};

//Insert User in DB
var createCharityOwnerId = function (objToSave, callback) {
    new Models.charityOwner(objToSave).save(callback)
};


//Insert User in DB
var createCharityOwnerKeyWord = function (objToSave, callback) {
    new Models.charitykeyWord(objToSave).save(callback)
};

//Update User in DB
var updateCharityOwner = function (criteria, dataToSet, options, callback) {
    Models.charity.findOneAndUpdate(criteria, dataToSet, options, callback);
};

var updateCharityOwnerId = function (criteria, dataToSet, options, callback) {
    Models.charityOwner.findOneAndUpdate(criteria, dataToSet, options, callback);
};

/*//Delete User in DB
var deleteCustomer = function (criteria, callback) {
    Models.Customers.findOneAndRemove(criteria, callback);
};

var addAddress = function (objToSave, callback) {
    new Models.CustomerAddresses(objToSave).save(callback)
};*/

module.exports = {
    createCharityOwner: createCharityOwner,
    updateCharityOwner: updateCharityOwner,
    createCharityOwnerId: createCharityOwnerId,
    updateCharityOwnerId: updateCharityOwnerId,
    createCharityOwnerKeyWord: createCharityOwnerKeyWord,
    getCharityOwnerId: getCharityOwnerId,
    getCharityOwner: getCharityOwner
};

