const {customer} = require('../models/index');
const encryptpassword = require('../utility/encryptPassword');
const  notificaciones = require('../utility/index');
const {GenerateOtp,GenerateExpiry,onRequestOTP} = require('../utility/Notificaciones');
const {generateSignature} = require('../utility/encryptPassword');
const Customer = require('../models/Customer');
const {passwordCompare} = require('../utility/encryptPassword');
const Food = require('../models/Food');
const Order = require('../models/Order');
const Offer = require('../models/Offer');
const Transaction = require('../models/Transaction');
const Vandor = require('../models/Vandor');
const Delivery = require('../models/DeliveryUser');



const DeliveryUserSignUp = async(req,res)=>{
    const {email,phone,password, address, firstName, lastName , pincode} = req.body;
      console.log(req.body);
      if(!email.includes('@') && !email.endsWith('.com')) return res.status(400).json({message : 'Email invalid!!'});
      if(phone.length<1) return res.status(400).json({message : "Phone no Found"});
      if(password.length<8) return res.status(400).json({message : "password must have a minimum of 8 characters!"});
      if(firstName.length<1) return res.status(400).json({message : "FirstName not Found"});
      if(lastName.length<1) return res.status(400).json({message : "LastName not Found"});
      if(!pincode) return res.status(400).json({message  :"PinCode not Found"});


       const salt = await encryptpassword.genSalt();
       const Userpassword = await encryptpassword.encryptPassword(password,salt);
  
       
        
        const existingDeliveryUser = await Delivery.findOne({email : email});
        if(existingDeliveryUser) return res.status(400).json({message : "An User with the provide email Id!!"});


      const newDeliveryUser = {
          email,
          phone: phone,
          salt : salt,
          password : Userpassword,
          firstName : firstName,
          lastName : lastName,
          address : address,
          pincode : pincode,
          verified : false,
          lat : 0,
          lng : 0,
          orders : []
           
      }
       console.log(newDeliveryUser);

      const result = await Delivery.create(newDeliveryUser);

        if(result) {
          

            const signature = generateSignature({
                _id : result._id,
                email : result.email,
                verified : result.verified
            });

            return res.status(201).json({signature : signature, verified : result.verified, email : result.email});

        }
         return res.status(400).json({message : "Error with SignUp"});
}


const DeliveryUserLogin = async(req,res)=>{
   const {email , password} = req.body;
    if(!email.includes('@') && !email.endsWith('.com')) return res.status(400).json({message : "Email invalid!!"});
    if(password.length<8) return res.status(400).json({message : "Password invalid!!"});

    const deliveryUser = await Delivery.findOne({email : email});
    if(deliveryUser){
        const passwordCompare = await encryptpassword.passwordCompare(password,deliveryUser.password);
        if(passwordCompare){

            const signature = generateSignature({
                _id : deliveryUser._id,
                email : deliveryUser.email,
                verified : deliveryUser.verified
            });
            res.status(200).json({ signature : signature, email : deliveryUser.email, verified : deliveryUser.verified});

        } else {
            res.status(400).json({message : " Password do not match"});

        }
    }
    res.status(404).json({message : "login Error"});
   
}





const GetDeliveryUserProfile = async(req,res)=>{
   const deliveryUser = req.user;
   if(deliveryUser){
       const result = await Delivery.findById(deliveryUser._id);
       return res.status(200).json(result);
   }
   return res.status(400).json({message : "Error with Fetch Profile"});





}
/*-----------------Delivery Notification------------------------ */

const assignOrderForDelivery = async(orderId, vandorId)=>{
    // find the vendor
      const vendor = await Vandor.findById(vandorId);
      if(vendor) {
          const areaCode = vendor.pincode;
          const vendorLat = vendor.lat;
          const vendorLng = vendor.lng;
      }
    //find available delivery person
      
    //check the nearest delivery and assign the order

    //update deliveryId


}










const EditDeliveryUserProfile = async(req,res)=>{
    const deliveryUser = req.user;

    const {firstName, lastName, address} = req.body;
      if(firstName.length<1) return res.status(400).json({message : "FirstName invalid !!"});
      if(lastName.length<1) return res.status(400).json({message : "LastName invalid!!"});
      if(address.length<4) return res.status(400).json({message : "Address Invalid!!"});
  
       if(deliveryUser) {
           const profile = await Delivery.findById(deliveryUser._id);
            if(profile){
                profile.firstName = firstName;
                profile.lastName = lastName;
                profile.address = address;
  
                const result = await profile.save();
                res.status(200).json(result);
            }
       }
       res.status(400).json({message : "Error Edit Profile"});
}


const UpdateDeliveryUserStatus = async(req,res)=>{
    const deliveryUser = req.user;
    if(deliveryUser){
        const {lat , lng} = req.body;

        const profile = await Delivery.findById(deliveryUser._id);
         if(profile){
             if(lat && lng){
                 profile.lat = lat;
                 profile.lng = lng;

             }
             profile.isAvailable = !profile.isAvailable;
             const result = await profile.save();
             return res.status(200).json(result);
         }
    }
    return res.status(400).json({message : "Error with Update Status"});
}
 


    

module.exports = {
    DeliveryUserSignUp,
    DeliveryUserLogin,
    GetDeliveryUserProfile,
    EditDeliveryUserProfile,
    UpdateDeliveryUserStatus
 
}
