'use strict';

var Models = require('../Models');
var async = require('async');

//Get Users from DB
var getDonor = function (criteria, projection, options, callback) {
    Models.donor.find(criteria, projection, options, callback);
};

//Insert User in DB
var createDonor = function (objToSave, callback) {
    new Models.donor(objToSave).save(callback)
};

// /Insert Card in DB
var createCard = function (objToSave, callback) {
    new Models.donorCards(objToSave).save(callback)
};

// /Insert Donation in DB
var createDonation = function (objToSave, callback) {
    new Models.donation(objToSave).save(callback)
};

// /Insert Donation in DB
var createCharityDonation = function (objToSave, callback) {
    new Models.charityDonations(objToSave).save(callback)
};

// /get Donation in DB
var getDonation = function (criteria, projection, options, callback) {
    Models.donation.find(criteria, projection, options, callback);
};

// /Update Donation in DB
var updateDonation = function (criteria, dataToSet, options, callback) {
    Models.donation.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Update User in DB
var updateDonor = function (criteria, dataToSet, options, callback) {
    Models.donor.findOneAndUpdate(criteria, dataToSet, options, callback);
};


//Update User in DB
var updateDonorCards = function (criteria, dataToSet, options, callback) {
    Models.donorCards.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Get Users from DB
var getCharityCampaign = function (criteria, projection, options, callback) {
    Models.charityCampaign.find(criteria, projection, options, callback);
};

var getCampaignPopulate = function (criteria, project, options,populateModel, callback) {
    Models.charityCampaign.find(criteria, project, options).populate(populateModel).exec(function (err, docs) {
        if (err) {
            return callback(err, docs);
        }else{
            callback(null, docs);
        }
    });
};

var getDonorCardPopulate = function (criteria, project, options,populateModel, callback) {
    Models.donor.find(criteria, project, options).populate(populateModel).exec(function (err, docs) {
        if (err) {
            return callback(err, docs);
        }else{
            callback(null, docs);
        }
    });
};

var getDonorPopulate = function (criteria, project, options,populateModel, callback) {

    Models.donor.find(criteria, project, options).populate(populateModel).exec(function (err, docs) {
        if (err) return callback(err, docs);


        if (docs.length == 0) return callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID);
        async.auto([
            function (callback) {
                Models.donor.populate(docs[0].donation, {
                    path: 'donorId',
                    select: 'emailId firstName lastName'
                }, function (err, things) {
                    if (err) return callback(err, things);
                    callback(null, things);
                });
            },
            function (callback) {
                Models.charityCampaign.populate(docs[0].donation, {
                    path: 'campaignId',
                    select: 'campaignName address description costPerUnit targetUnitCount endDate videoLink pictures complete unitRaised'
                }, function (err, things) {
                    if (err) return callback(err, things);
                    callback(null, things);
                });
            },
            function (callback) {
                Models.charity.populate(docs[0].charityDonation, {
                    path: 'charityId',
                    select: 'profileComplete registrationProofFileId supportingDocumentFileId adminApproval pictures logoFileId videos type description' +
                    'officeAddress1 officeAddress2 officeCity officeState officeCountry taxDeductionCode country countryCode emailId phoneNumber contactPerson' +
                    'website name'
                }, function (err, things) {
                    if (err) return callback(err, things);
                    callback(null, things);
                });

            }
        ], function (err, data) {
            if (err) return callback(err, docs);
            callback(null, docs);
        });


    });
};

module.exports = {
    getDonor: getDonor,
    createDonor: createDonor,
    createDonation: createDonation,
    getDonation: getDonation,
    updateDonation: updateDonation,
    createCharityDonation: createCharityDonation,
    createCard: createCard,
    updateDonor: updateDonor,
    updateDonorCards: updateDonorCards,
    getCharityCampaign: getCharityCampaign,
    getDonorCardPopulate: getDonorCardPopulate,
    getDonorPopulate: getDonorPopulate,
    getCampaignPopulate: getCampaignPopulate
};
