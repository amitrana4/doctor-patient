var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var donorCardsSchema = new Schema({
    //**************************Required Fields**********************************//

    Digit : {type : String, required:true},
    payPalId : {type: String, unique: true, trim: true, required: true},
    type : {type: String, trim: true, required: true},
    expire_month : {type: String, trim: true, required: true},
    expire_year : {type: String, trim: true, required: true},
    first_name : {type: String, trim: true, required: true},
    last_name : {type: String, trim: true, required: true},
    isDefault: {type: Boolean, required: true, default: false},
    isDeleted : {type : Boolean, required: true, default:false},
    
    //**************************Must for all Schemas**********************************//
    createdOn: {type: Date, required: true},
    updatedOn: {default: Date.now, type: Number, required: true}
});
module.exports = mongoose.model('donorCardsSchema', donorCardsSchema);