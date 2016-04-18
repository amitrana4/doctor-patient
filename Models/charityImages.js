var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var charityImagesSchema = new Schema({
    images: {
        original: {type: String, default: null},
        thumbnail: {type: String, default: null}
    },
    isDelete:  {type: Boolean, default: false, required: true},
    charityId: {type: Schema.ObjectId,required: true, ref: 'charitySchema'},
    createdOn: {
        type: Date,
        required: true
    },
    updatedOn: {
        default: Date.now,
        type: Number,
        required: true
    }
});
//charityImagesSchema.index({images: 1, charityOwnerId: 1}, {unique: true});
module.exports = mongoose.model('charityImagesSchema', charityImagesSchema);