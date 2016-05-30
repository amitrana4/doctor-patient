'use strict';

var Models = require('../Models');

//Get Users from DB
var getAdmin = function (criteria, projection, options, callback) {
    Models.Admins.find(criteria, projection, options, callback);
};

//Insert User in DB
var createAdmin = function (objToSave, callback) {
    new Models.Admins(objToSave).save(callback)
};

//Update User in DB
var updateAdmin = function (criteria, dataToSet, options, callback) {
    Models.Admins.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Update User in DB
var getCampaignRecurringDonation = function (criteria, callback) {
    Models.donation.aggregate(criteria, callback);
};



var getDonationPopulate = function (criteria, project, options,populateModel, callback) {
    Models.donation.find(criteria, project, options).populate(populateModel).exec(function (err, docs) {
        if (err) {
            return callback(err, docs);
        }else{
            callback(null, docs);
        }
    });
};

var getcharityDonationsPopulate = function (criteria, project, options,populateModel, callback) {
    Models.charityDonations.find(criteria, project, options).populate(populateModel).exec(function (err, docs) {
        if (err) {
            return callback(err, docs);
        }else{
            callback(null, docs);
        }
    });
};

var getdonationRecurringCharityPopulate = function (criteria, project, options,populateModel, callback) {
    Models.donationRecurringCharity.find(criteria, project, options).populate(populateModel).exec(function (err, docs) {
        if (err) {
            return callback(err, docs);
        }else{
            callback(null, docs);
        }
    });
};
var getdonationRecurringCampaignPopulate = function (criteria, project, options,populateModel, callback) {
    Models.donationRecurring.find(criteria, project, options).populate(populateModel).exec(function (err, docs) {
        if (err) {
            return callback(err, docs);
        }else{
            callback(null, docs);
        }
    });
};

module.exports = {
    getAdmin: getAdmin,
    createAdmin: createAdmin,
    getDonationPopulate: getDonationPopulate,
    getcharityDonationsPopulate: getcharityDonationsPopulate,
    getdonationRecurringCharityPopulate: getdonationRecurringCharityPopulate,
    getdonationRecurringCampaignPopulate: getdonationRecurringCampaignPopulate,
    getCampaignRecurringDonation: getCampaignRecurringDonation,
    updateAdmin: updateAdmin
};

