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

//Get Users from DB
var getCharityCampaign = function (criteria, projection, options, callback) {
    Models.charityCampaign.find(criteria, projection, options, callback);
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
var createCharityCampaign = function (objToSave, callback) {
    new Models.charityCampaign(objToSave).save(callback)
};


//Insert User in DB
/*
 var createCharityOwnerKeyWord = function (objToSave, callback) {
 new Models.charitykeyWord(objToSave).save(callback)
 };
 */

//Insert User in DB
var createCharityImages = function (objToSave, callback) {
    new Models.charityImages(objToSave).save(callback)
};

//Update User in DB
var updateCharityOwner = function (criteria, dataToSet, options, callback) {
    Models.charity.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Update User in DB
var updateCharityOwnerPopulate = function (criteria, dataToSet, options, populateModel, callback) {
    Models.charity.findOneAndUpdate(criteria, dataToSet, options).populate(populateModel).exec(function (err, docs) {
        if (err) {
            return callback(err, docs);
        }else{
            callback(null, docs);
        }
    });
};


var updateCharityOwnerId = function (criteria, dataToSet, options, callback) {
    Models.charityOwner.findOneAndUpdate(criteria, dataToSet, options, callback);
};

var updateCharityCampaign = function (criteria, dataToSet, options, callback) {
    Models.charityCampaign.findOneAndUpdate(criteria, dataToSet, options, callback);
};


var getCharityPopulate = function (criteria, project, options,populateModel, callback) {
    Models.charity.find(criteria, project, options).populate(populateModel).exec(function (err, docs) {
        if (err) {
            return callback(err, docs);
        }else{
            callback(null, docs);
        }
    });
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
    createCharityImages: createCharityImages,
    createCharityCampaign: createCharityCampaign,
    updateCharityOwner: updateCharityOwner,
    createCharityOwnerId: createCharityOwnerId,
    updateCharityOwnerId: updateCharityOwnerId,
    updateCharityCampaign: updateCharityCampaign,
    getCharityPopulate: getCharityPopulate,
    getCharityCampaign: getCharityCampaign,
    /*createCharityOwnerKeyWord: createCharityOwnerKeyWord,*/
    getCharityOwnerId: getCharityOwnerId,
    getCharityOwner: getCharityOwner,
    updateCharityOwnerPopulate: updateCharityOwnerPopulate
};