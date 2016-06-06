var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var donationRecurringSchema = new Schema({
    //**************************Required Fields**********************************//

    campaignId: {type: Schema.ObjectId, ref: 'charityCampaignSchema'},
    charityId: {type: Schema.ObjectId, ref: 'charitySchema'},
    donorId: {type: Schema.ObjectId, ref: 'donorSchema'},
    cardId: {type: Schema.ObjectId, ref: 'donorCardsSchema'},
    donation: [{type: Schema.ObjectId, ref: 'donationSchema'}],

    frequency: {type: Number, trim: true, required: true},
    donatedUnit: {type: Number, trim: true, required: true},
    complete: {type: Boolean, required: true, default: false},
    recurringDone: {type: Number, trim: true, required: false},
    LastRecurring: {type: Date, required: false},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    adminAction: {type: Boolean, required: true, default: false},
    adminEndAction: {type: Boolean, required: true, default: false},
    AdminEndDate: {type: Date, required: false},

    //**************************Must for all Schemas**********************************//
    createdOn: {type: Date, required: true},
    updatedOn: {default: Date.now, type: Number, required: true}
});

module.exports = mongoose.model('donationRecurringSchema', donationRecurringSchema);
