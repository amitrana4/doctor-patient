var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var charityOwnerSchema = new Schema({
    //**************************Required Fields**********************************//
    emailId: {type: String, unique: true, trim: true, required: true},
    accessToken: {type: String, trim: true, index: true, unique: true, sparse: true},
    charityRegistrationNo: {type: String, trim: true, unique: true, required: true},
    phoneNumber: {type: String, trim: true, unique: true, required: true},
    passwordResetToken: {type: String, trim: true, unique: true, index: true, sparse: true},
    passwordHash: {type: String, required: false},
    facebookId: {type: String, required: false},
    charityId: {type: String, required: false},
    /*accountState: {
     type: String,
     trim: true,
     required: true
     },*/
    /*pictures: [{type: Schema.ObjectId, ref: 'charityImages'}],*/
    loggedInOn: {type: Date, required: true},
    failedLogInAttempts: {type: Number, required: false},
    //**************************Optional**********************************//
    passwordChangedOn: {type: Number, required: false},
    //**************************Must for all Schemas**********************************//
    createdOn: {type: Date, required: true},
    updatedOn: {default: Date.now, type: Number, required: true}
});

module.exports = mongoose.model('charityOwnerSchema', charityOwnerSchema);