var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var donorSchema = new Schema({
    //**************************Required Fields**********************************//
    firstName: {type: String, trim: true, required: true},
    emailId: {type: String, unique: true, trim: true, required: true},
    passwordHash: {type: String, required: false},
    accessToken: {type: String, trim: true, index: true, unique: true, sparse: true},
    //accountState: {type: String, trim: true, required: true},
    donation: [{type: Schema.ObjectId, ref: 'donationSchema'}],
    //idProvider: {type: String, trim: true, required: true},
    deviceType: {type: String, trim: true, required: true},
    deviceToken: {type: String, trim: true, required: true},
    appVersion: {type: String, trim: true, required: true},
    facebookId: {type: String, trim: true, required: true},
    onceLogin: {type: String, trim: true, required: true, default:false},
    //**************************Optional**********************************//
    lastName: {type: String, trim: true, required: false},
    phoneNumber: {type: String, trim: true, required: false},
    facebookId: {type: String, required: false},
    country: {type: String, trim: true, required: false},
    loggedInOn: {type: Date, required: false},
    passwordChangedOn: {type: Number, required: false},
    failedLogInAttempts: {type: Number, required: false},
    //**************************Must for all Schemas**********************************//
    createdOn: {type: Date, required: true},
    updatedOn: {default: Date.now, type: Number, required: true}
});
module.exports = mongoose.model('donorSchema', donorSchema);