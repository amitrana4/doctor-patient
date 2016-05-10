var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var favouriteCharitySchema = new Schema({
    //**************************Required Fields**********************************//
    charityId: {type: Schema.ObjectId,required: true, ref: 'charitySchema'},
    donorId: {type: Schema.ObjectId,required: true, ref: 'donorSchema'},
    //**************************Must for all Schemas**********************************//
    createdOn: {type: Date, required: true},
    updatedOn: {default: Date.now, type: Date, required: true}
});
favouriteCharitySchema.index({campaignId: 1, donorId: 1}, {unique: true});
module.exports = mongoose.model('favouriteCharitySchema', favouriteCharitySchema);
