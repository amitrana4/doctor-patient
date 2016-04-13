var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var campaignkeyWordSchema = new Schema({
    //**************************Required Fields**********************************//
    campaignId: {
        type: String,
        required: true
    },
    keyWord: {
        type: String,
        required: true
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
campaignkeyWordSchema.index({campaignId: 1, keyWord: 1}, {unique: true});

module.exports = mongoose.model('campaignkeyWordSchema', campaignkeyWordSchema);