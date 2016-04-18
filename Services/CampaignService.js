'use strict';

var Models = require('../Models');

//Get Users from DB
var getCampaign = function (criteria, projection, options, callback) {
    console.log(criteria)
    Models.charityCampaign.find(criteria, projection, options, callback);
};


module.exports = {
    getCampaign: getCampaign
};

