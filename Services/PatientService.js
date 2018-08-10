'use strict';

var Models = require('../Models');

//Get Users from DB
var getPatient = function (criteria, projection, options, callback) {
    Models.patient.find(criteria, projection, options, callback);
};

//Insert User in DB
var createPatient = function (objToSave, callback) {
    new Models.patient(objToSave).save(callback)
};
//Update User in DB
var updatePatient = function (criteria, dataToSet, options, callback) {
    Models.patient.findOneAndUpdate(criteria, dataToSet, options, callback);
};

module.exports = {
    createPatient: createPatient,
    getPatient: getPatient,
    updatePatient: updatePatient
};
