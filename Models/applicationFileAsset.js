var Mongoose = require('mongoose');

var Schema = Mongoose.Schema;

var applicationFileAssetSchema = new Schema({
    //**************************Required Fields**********************************//
    filePath: {
        type: String,
        required: true
    },
    ownerEntityName: {
        //Charity or Campaign or Donor
        type: String,
        required: true
    },
    documentType: {
        //regsitrationDocumentCharity, supportDocumentCharity, imageCampaignMain, imageCampaign, videoCampaign
        type: String,
        required: true
    },
    ownerEntityId: {
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
applicationFileAssetSchema.index({filePath: 1, ownerEntityName: 1,ownerEntityId:1}, {unique: true});
module.exports = {
    applicationFileAssetSchema: applicationFileAssetSchema
};
