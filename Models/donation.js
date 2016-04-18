var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var donationSchema = new Schema({
    //**************************Required Fields**********************************//
    campaignId: {type: String, trim: true, required: true},
    //donorId: {type: String, trim: true, required: true},
    donatedAmount: {type: String, trim: true, required: true},
    donatedCurrency: {type: String, trim: true, required: true},
    paymentGatewayTransactionId: {type: String, trim: true, required: true},
    donor: [{type: Schema.ObjectId, ref: 'donorSchema'}],
    charityCampaign: [{type: Schema.ObjectId, ref: 'charityCampaignSchema'}],
    //**************************Must for all Schemas**********************************//
    createdOn: {type: Number, required: true},
    updatedOn: {default: Date.now, type: Number, required: true}
});

module.exports = mongoose.model('donationSchema', donationSchema);
