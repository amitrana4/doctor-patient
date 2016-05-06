var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var charityDonationSchema = new Schema({
    //**************************Required Fields**********************************//

    charityId: {type: Schema.ObjectId, ref: 'charitySchema'},
    donorId: {type: Schema.ObjectId, ref: 'donorSchema'},
    cardId: {type: Schema.ObjectId, ref: 'donorCardsSchema'},

    donatedAmount: {type: String, trim: true, required: true},

    donatedCurrency: {type: String, trim: true, required: true},
    paymentGatewayTransactionId: {type: String, trim: true, required: true},

    recurringDonation: {type: Boolean, required: true, default: false},
    frequency: {type: String, trim: true, required: false},

    //**************************Must for all Schemas**********************************//
    createdOn: {type: Date, required: true},
    updatedOn: {default: Date.now, type: Number, required: true}
});

module.exports = mongoose.model('charityDonationSchema', charityDonationSchema);
