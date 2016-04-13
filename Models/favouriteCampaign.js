var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var favouriteCampaignSchema = new Schema({
    //**************************Required Fields**********************************//
    campaignId: {
        type: String,
        trim: true,
        required: true
    },
    donorId: {
        type: String,
        trim: true,
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
favouriteCampaignSchema.index({campaignId: 1, donorId: 1}, {unique: true});
module.exports = mongoose.model('favouriteCampaignSchema', favouriteCampaignSchema);
