var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../Config');

var donorCardsSchema = new Schema({
    //**************************Required Fields**********************************//

    Digit : {type : String, required:true},
    payPalId : {type: String, unique: true, trim: true, required: true},
    
    //**************************Must for all Schemas**********************************//
    createdOn: {type: Date, required: true},
    updatedOn: {default: Date.now, type: Number, required: true}
});
module.exports = mongoose.model('donorCardsSchema', donorCardsSchema);