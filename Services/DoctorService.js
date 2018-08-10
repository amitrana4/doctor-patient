'use strict';

var Models = require('../Models');

//Get Users from DB
var getDoctor = function (criteria, projection, options, callback) {
    Models.doctor.find(criteria, projection, options, callback);
};

//Insert User in DB
var createDoctor = function (objToSave, callback) {
    new Models.doctor(objToSave).save(callback)
};
//Update User in DB
var updateDoctor = function (criteria, dataToSet, options, callback) {
    Models.doctor.findOneAndUpdate(criteria, dataToSet, options, callback);
};


module.exports = {
    createDoctor: createDoctor,
    getDoctor: getDoctor,
    updateDoctor: updateDoctor
};
