var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');


var applicationCommentSchema = new Schema({
    //**************************Required Fields**********************************//
    commenterEntityName: {
        //who commented
        type: String,
        required: true
    },
    commenterEntityId: {
        //who commented
        type: String,
        required: true
    },
    comment: {
        //comment itself
        type: String,
        required: true
    },
    commentedOnEntityName: {
        //Charity or Campaign
        type: String,
        required: true
    },
    commentedOnEntityNameId: {
        //Charity's Id or Campaign's Id or Donor's Id
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

module.exports = mongoose.model('applicationCommentSchema', applicationCommentSchema);