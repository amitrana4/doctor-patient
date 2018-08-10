 var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');



var doctorSchema = new Schema({
    //**************************Required Fields**********************************//
    name: {type: String, trim: true, required: false},
    emailId: {type: String, trim: true, unique: true, required: true},
    phoneNumber: {type: Number, required: false},
    deviceType: {type: String, trim: true, required: false},
    accessToken: {type: String, trim: true, index: true, unique: true, sparse: true},
    passwordHash: {type: String, required: false},
    deviceToken: {type: String, trim: true, required: false},
    appVersion: {type: String, trim: true, required: false},
    onceLogin: {type: String, trim: true, required: true, default:false},
    favourite: {type: Boolean, required: true, default: false},

    //**************************Optional**********************************//
    type: {type: String, trim: true, required: false},
    //**************************Must for all Schemas**********************************//
    createdOn: {type: Date, required: true},
    updatedOn: {default: Date.now, type: Date, required: true}
});

doctorSchema.index({emailId:1, phoneNumber:1, name:1}, {unique: true});
module.exports = mongoose.model('doctorSchema', doctorSchema);