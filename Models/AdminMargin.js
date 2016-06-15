
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Config = require('../Config');


var AdminMargin = new Schema({
    rate: {type: String, trim: true, default: null},
    //**************************Must for all Schemas**********************************//
    createdOn: {type: Date, required: true},
    updatedOn: {default: Date.now, type: Date, required: true}
});

module.exports = mongoose.model('AdminMargin', AdminMargin);