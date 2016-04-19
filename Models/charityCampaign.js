var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var charityCampaignSchema = new Schema({
    //**************************Required Fields**********************************//
    /*charityOwnerId: {type: String, required: true},*/
    charityOwnerId: {type: Schema.ObjectId, ref: 'charityOwner'},
    name: {type: String, trim: true, required: true},
    lat: {type: String, trim: true, required: true},
    long: {type: String, trim: true, required: true},
    address: {type: String, trim: true, required: true},
    description: {type: String, trim: true, required: true},
    hasKeyWords: {type: Boolean, required: true, default: false},
    mainImageFileId: {type: String, trim: true, required: false},
    unitName: {type: String, trim: true, required: true},
    costPerUnit: {type: Number, required: true},
    targetUnitCount: {type: Number, required: true},
    unitRaised: {type: Number, default: 0, required: true},
    endDate: {type: Date, required: true},
    complete: {default: false, type: String, required: true},
    videoLink: {type: String, trim: true, required: false},
    pictures: {type: String, trim: true, required: false},
    donation: {type: Schema.ObjectId, ref: 'donationSchema'},

    createdOn: {type: Date, required: true},
    updatedOn: {default: Date.now, type: Number, required: true}
});
charityCampaignSchema.index({charityOwnerId: 1, name: 1}, {unique: true});
module.exports = mongoose.model('charityCampaignSchema', charityCampaignSchema);