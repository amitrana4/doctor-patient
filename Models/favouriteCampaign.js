var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var favouriteCampaignSchema = new Schema({
    //**************************Required Fields**********************************//
    campaignId: {type: Schema.ObjectId,required: true, ref: 'charityCampaignSchema'},
    donorId: {type: Schema.ObjectId,required: true, ref: 'donorSchema'},
    favourite: {type: Boolean, required: true, default: false},
    //**************************Must for all Schemas**********************************//
    createdOn: {type: Date, required: true},
    updatedOn: {default: Date.now, type: Date, required: true}
});
favouriteCampaignSchema.index({campaignId: 1, donorId: 1}, {unique: true});
module.exports = mongoose.model('favouriteCampaignSchema', favouriteCampaignSchema);
