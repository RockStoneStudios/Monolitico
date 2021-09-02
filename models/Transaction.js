const {model, Schema} = require('mongoose');

const TransactionSchema = new Schema({
    customer : {
        type : String,
        required : true
    },
    vandorId : String,
    orderId : String,
    orderValue : String,
    offerUsed : String,
    status : String,
    paymentMode : String,
    paymentResponse : String

},{
    toJSON : {
        transform(doc,ret){
            delete ret.__v
        }
    },
    timestamps : true
});

module.exports = model('transaction',TransactionSchema);