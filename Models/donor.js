var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var donorSchema = new Schema({
    //**************************Required Fields**********************************//
    firstName: {
        type: String,
        trim: true,
        required: true
    },
    emailId: {
        type: String,
        trim: true,
        required: true
    },
    phoneNumber: {
        type: String,
        trim: true,
        required: true
    },
    country: {
        type: String,
        trim: true,
        required: true
    },
    passwordHash: {
        //Use bcrypt only
        type: String,
        required: true
    },
    accountState: {
        type: String,
        trim: true,
        required: true
    },
    loggedInOn: {
        type: Number,
        required: true
    },
    idProvider: {
        type: String,
        trim: true,
        required: true
    },
    failedLogInAttempts: {
        type: Number,
        required: true
    },
    //**************************Optional**********************************//
    lastName: {
        type: String,
        trim: true,
        required: false
    },
    passwordChangedOn: {
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
module.exports = mongoose.model('donorSchema', donorSchema);