'use strict';

var Models = require('../Models');

//Get Users from DB
var getDonor = function (criteria, projection, options, callback) {
    Models.donor.find(criteria, projection, options, callback);
};

//Insert User in DB
var createDonor = function (objToSave, callback) {
    new Models.donor(objToSave).save(callback)
};

//Update User in DB
var updateDonor = function (criteria, dataToSet, options, callback) {
    Models.donor.findOneAndUpdate(criteria, dataToSet, options, callback);
};


module.exports = {
    getDonor: getDonor,
    createDonor: createDonor,
    updateDonor: updateDonor
};

