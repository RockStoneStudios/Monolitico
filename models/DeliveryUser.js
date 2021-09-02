const {model,Schema } = require('mongoose');

const DeliveryUserSchema = new Schema({
     email : {
         type : String,
         required : true
     },
     password: {
         type : String,
         required : true
     },
     salt : {
         type : String,
         required : true
     },
     phone : {
         type : String,
         required : true
     },
      pincode : {type : String},
     address : {
         type : String,
        
     },
     firstName : {
         type : String,
         
     },
     lastName : {
         type : String,
        
     },
     verified : {type : Boolean, required : true},
     lat : Number,
     lng : Number,
     isAvailable : {type : Boolean}
},{
    toJSON : {
         transform(doc,ret){
            delete ret.__v;
            delete ret.salt;
            delete ret.createdAt;
            delete ret.updatedAt;
            delete ret.password;
         }
    },
    timestamps : true
});


module.exports = model('delivery',DeliveryUserSchema);





/*email,phone,password, address, firstName, lastName , pincode */