var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');



var charitySchema = new Schema({
    //**************************Required Fields**********************************//
    charityOwnerId: {type: String, trim: true, required: true},
    profileComplete: {type: String, default: 0, required: true},
    name: {type: String, trim: true, required: true},
    website: {type: String, trim: true, required: true},
    contactPerson: {type: String, trim: true, required: true},
    emailId: {type: String, trim: true, unique: true, required: true},
    countryCode: {type: String, required: true},
    phoneNumber: {type: Number, required: true, unique: true},
    country: {type: String, trim: true, required: true},
    salesRepCode: {type: String, trim: true, required: false},
    taxId: {type: String, trim: true, required: true},
    taxDeductionCode: {type: String, trim: true, required: true},
    registrationProofFileId: {type: String, default: null},
    supportingDocumentFileId: {type: String, default: null},
    hasKeyWords: {type: Boolean, required: true, default: false},
    adminApproval: {type: Boolean, required: true, default: true},
    deviceType: {type: String, trim: true, required: true},
    deviceToken: {type: String, trim: true, required: true},
    appVersion: {type: String, trim: true, required: true},
    onceLogin: {type: String, trim: true, required: true, default:false},
    pictures: [{type: Schema.ObjectId, ref: 'charityImagesSchema'}],
    campaignId: {type: Schema.ObjectId, ref: 'charityCampaignSchema'},

    //**************************Optional**********************************//
    keyWord: {type: String, required: false},
    logoFileId: {type: String, trim: true, required: false},
    foundationDate: {type: Date, required: false},
    type: {type: String, trim: true, required: false},
    description: {type: String, trim: true, required: false},
    officeAddress1: {type: String, trim: true, required: false},
    officeAddress2: {type: String, trim: true, required: false},
    officeCity: {type: String, trim: true, required: false},
    officeState: {type: String, trim: true, required: false},
    officeCountry: {type: String, trim: true, required: false},
    videos: {type: String, trim: true, required: false},
    bankAccountHolderName: {type: String, trim: true, required: false},
    bankAccountHolderPhoneNumber: {type: Number, trim: true, required: false},
    bankAccountNumber: {type: String, trim: true, required: false},
    //**************************Must for all Schemas**********************************//
    createdOn: {type: Date, required: true},
    updatedOn: {default: Date.now, type: Date, required: true}
});

module.exports = mongoose.model('charitySchema', charitySchema);