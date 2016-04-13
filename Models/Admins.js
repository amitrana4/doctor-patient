
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Config = require('../Config');

var LoginAttempts = new Schema({
    timestamp: {type: Date, default: Date.now},
    validAttempt: {type: Boolean, required: true},
    ipAddress: {type: String, required: true}
});

var Admins = new Schema({
    name: {type: String, trim: true, index: true, default: null, sparse: true},
    email: {type: String, trim: true, unique: true, index: true},
    accessToken: {type: String, trim: true, index: true, unique: true, sparse: true},
    password: {type: String, required:true},
    passwordResetToken: {type: String, trim: true, unique: true, sparse:true},
    registrationDate: {type: Date, default: Date.now, required: true},
    loginAttempts: [LoginAttempts]
});

module.exports = mongoose.model('Admins', Admins);