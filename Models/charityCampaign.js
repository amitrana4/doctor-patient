var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var charityCampaignSchema = new Schema({
    //**************************Required Fields**********************************//
    charityId: {
        type: String,
        required: true
    },
    location: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    concludesOn: {
        type: Number,
        required: true,
        default: 0
    },
    featured: {
        type: Boolean,
        required: true,
        default: false
    },
    hasKeyWords: {
        type: Boolean,
        required: true,
        default: false
    },
    //no need to separate information into different schema for amount and unit based data
    //keep all of it in this schema.This will make information retrieval easy.
    //Side effect(which is completely trivial) is that many times either unit based columns or amount based columns will be null
    //
    donationType: {
        type: String,
        trim: true,
        required: true
    },
    targetMonetaryAmount: {
        type: String,
        trim: true,
        required: true
    },
    //**************************Optional**********************************//
    mainImageFileId: {
        type: String,
        trim: true,
        required: true
    },
    monetaryCurrency: {
        type: String,
        trim: true,
        required: false
    },
    costPerUnit: {
        type: Number,
        required: false
    },
    targetUnitCount: {
        type: Number,
        required: false
    },
    monetaryValueRequiredForFeedback: {
        type: Number,
        required: false
    },
    //**************************Must for all Schemas**********************************//
    createdOn: {
        type: Number,
        required: true
    },
    updatedOn: {
        default: Date.now,
        type: Number,
        required: true
    }
});
charityCampaignSchema.index({charityId: 1, name: 1}, {unique: true});
module.exports = mongoose.model('charityCampaignSchema', charityCampaignSchema);