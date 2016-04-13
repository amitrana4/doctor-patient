var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var charitykeyWordSchema = new Schema({
    //**************************Required Fields**********************************//
    charityId: {
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
charitykeyWordSchema.index({charityId: 1, keyWord: 1}, {unique: true});
module.exports = mongoose.model('charitykeyWordSchema', charitykeyWordSchema);