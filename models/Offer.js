const {model, Schema} = require('mongoose');

const OfferSchema = new Schema({
    offerType : {type : String, required : true},
    vandors : [
        { type : Schema.Types.ObjectId , ref : 'vandor'}
    ],
    title : {type : String , required : true},
    description : {type : String},
    minValue : {type : Number, required : true},
    offerAmount : {type : Number, required: true},
    startValidity : {type : Date},
    endValidity : {type : Date},
    promocode : {type : String, required : true},
    promoType : {type : String, required : true},
    bank : [
        {type : String}
    ],
     bins : [{type : Number}],
     pincode : {type : String, required : true},
     isActive : Boolean
 
},{
    toJSON :{
        transform(doc,ret){
            delete ret.__v
        }
    },
    timestamps : true
});


module.exports = model('offer',OfferSchema);