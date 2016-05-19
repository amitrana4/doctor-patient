var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var donationSchema = new Schema({
    //**************************Required Fields**********************************//

    campaignId: {type: Schema.ObjectId, ref: 'charityCampaignSchema'},
    charityId: {type: Schema.ObjectId, ref: 'charitySchema'},
    donorId: {type: Schema.ObjectId, ref: 'donorSchema'},
    cardId: {type: Schema.ObjectId, ref: 'donorCardsSchema'},

    donatedAmount: {type: String, trim: true, required: true},
    donatedUnit: {type: String, trim: true, required: true},
    costPerUnit: {type: Number, required: true},

    paymentGatewayTransactionId: {type: String, trim: true, required: true},

    recurringDonation: {type: Boolean, required: true, default: false},
    frequency: {type: String, trim: true, required: false},
    comment: {type: String, trim: true, required: false},
    rating: {type: String, trim: true, required: false},

    //**************************Must for all Schemas**********************************//
    createdOn: {type: Date, required: true},
    updatedOn: {default: Date.now, type: Number, required: true}
});

module.exports = mongoose.model('donationSchema', donationSchema);
