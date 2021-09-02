const Vandor = require('../models/index');
const {encryptPassword,passwordCompare,genSalt,generateSignature}= require('../utility/encryptPassword');
const Transaction = require('../models/Transaction');
const Delivery  = require('../models/DeliveryUser');
  
const findVandor = async(id,email) =>{
     if(email) {
         return await Vandor.vandor.findOne({email : email})
     }
     else {
         return await Vandor.vandor.findById(id);
     }
}

const createVandor = async(req,res)=>{
   const {name,address,pincode,foodType,email,password,ownerName,phone} = req.body;

      const userEmail = await findVandor('',email);
       if(userEmail) return  res.json({message : "A vandor is exist with this email Id"});
     const salt = await genSalt();
     const userPassword = await encryptPassword(password,salt);
    const createVandor = await Vandor.vandor.create({
       name,
       address,
       pincode,
       foodType,
       email,
       password : userPassword,
       salt : salt,
       ownerName,
       phone,
       rating : 0,
       serviceAvailable : false,
       coverImages : [],
       foods : [],
       lat : 0,
       lng : 0
   });

   res.json(createVandor);
}

const getVandors = async(req,res)=>{
  const vandors = await Vandor.vandor.find();
   if(vandors.length<1) return res.json({message : "vandor data not available"});
   res.json(vandors);
}

const getVandorById = async(req,res)=>{
    const vandorId = await findVandor(req.params.id);
     if(vandorId) return res.json(vandorId);
     res.json({message : "Vandor Data not Available"});
}

const GetTransaction = async(req,res) => {
    const transactions = await Transaction.find();
    if(transactions){
        return res.status(200).json(transactions);
    }
    return res.status(400).json({message : "Transaction not available"});
}

const GetTransactionById = async(req,res)=>{
    const id = req.params.id;
    const transaction = await Transaction.findById(id);
    if(transaction) res.status(200).json(transaction);
    return res.status(400).json({message : "Transaction not Available"});
}

const VerifyDeliveryUser = async(req,res)=>{
    const {_id, status}= req.body;
    if(_id){
        const profile = await Delivery.findById(_id);
        if(profile){
            profile.verified = status;
            const result = await profile.save();
            return res.status(200).json(result);
        }
    }
    return res.statusstatus(400).json({message : "Unable to verify Delivery User"});
}


const GetsDeliveryUsers = async(req,res)=>{
    
 
        const deliveryUsers = await Delivery.find();
        if(deliveryUsers){
        
            return res.status(200).json(deliveryUsers);
        }
    
    return res.status(400).json({message : "Unable to Get Delivery User"});
}

module.exports = {
    createVandor,
    getVandors,
    getVandorById,
    findVandor,
    GetTransaction,
    GetTransactionById,
    VerifyDeliveryUser,
    GetsDeliveryUsers
}