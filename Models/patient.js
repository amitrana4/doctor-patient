var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var patientSchema = new Schema({
    //**************************Required Fields**********************************//
    firstName: {type: String, trim: true, required: true},
    emailId: {type: String, trim: true, index: true, unique: true, required: true},
    passwordHash: {type: String, required: false},
    accessToken: {type: String, trim: true, index: true, unique: true, sparse: true},
    //accountState: {type: String, trim: true, required: true},
    //idProvider: {type: String, trim: true, required: true},
    deviceType: {type: String, trim: true, required: true},
    deviceToken: {type: String, trim: true, required: true},
    appVersion: {type: String, trim: true, required: true},
    onceLogin: {type: String, trim: true, required: true, default:false},
    isDefault:{type: String, required: false},
    //**************************Optional**********************************//
    lastName: {type: String, trim: true, required: false},
    phoneNumber: {type: String, unique: true, trim: true, sparse: true},
    loggedInOn: {type: Date, required: false},
    deleteByAdmin: {type: Boolean, required: true, default: false},
    //**************************Must for all Schemas**********************************//
    createdOn: {type: Date, required: true},
    updatedOn: {default: Date.now, type: Number, required: true}
});

patientSchema.index({emailId:1, phoneNumber:1, name:1}, {unique: true});
module.exports = mongoose.model('patientSchema', patientSchema);