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


const CustomerSignUp = async(req,res)=>{
    const {email,phone,password} = req.body;
      console.log(req.body);
      if(!email.includes('@') && !email.endsWith('.com')) return res.status(400).json({message : 'Email invalid!!'});
      if(phone.length<1) return res.status(400).json({message : "Phone no Found"});
      if(password.length<8) return res.status(400).json({message : "password must have a minimum of 8 characters!"});
    

       const salt = await encryptpassword.genSalt();
       const Userpassword = await encryptpassword.encryptPassword(password,salt);
  
       const otp= await  GenerateOtp();
       const expiry = await GenerateExpiry();
        
        const existingCustomer = await Customer.findOne({email : email});
        if(existingCustomer) return res.status(400).json({message : "An User with the provide email Id!!"});


      const newCustomer = {
          email,
          phone: phone,
          salt : salt,
          password : Userpassword,
          otp : otp,
          otp_expiry  : expiry,
          firstName : '',
          lastName : '',
          address : '',
          verified : false,
          lat : 0,
          lng : 0,
          orders : []
           
      }
       console.log(newCustomer);

      const result = await Customer.create(newCustomer);

        if(result) {
            console.log(phone);
            await onRequestOTP(otp,phone);

            const signature = generateSignature({
                _id : result._id,
                email : result.email,
                verified : result.verified
            });

            return res.status(201).json({signature : signature, verified : result.verified, email : result.email});

        }
         return res.status(400).json({message : "Error with SignUp"});
}


const CustomerLogin = async(req,res)=>{
   const {email , password} = req.body;
    if(!email.includes('@') && !email.endsWith('.com')) return res.status(400).json({message : "Email invalid!!"});
    if(password.length<8) return res.status(400).json({message : "Password invalid!!"});

    const customer = await Customer.findOne({email : email});
    if(customer){
        const passwordCompare = await encryptpassword.passwordCompare(password,customer.password);
        if(passwordCompare){

            const signature = generateSignature({
                _id : customer._id,
                email : customer.email,
                verified : customer.verified
            });
            res.status(200).json({ signature : signature, email : customer.email, verified : customer.verified});

        } else {
            res.status(400).json({message : " Password do not match"});

        }
    }
    res.status(404).json({message : "login Error"});
   
}

const CustomerVerify = async(req,res)=>{
   const {otp} = req.body;
   const customer = req.user;
    if(customer) {
        const profile = await Customer.findById(customer._id);
        if(profile.otp === parseInt(otp) && profile.otp_expiry>= new Date()){
            profile.verified = true;
            const updateCustomerResponse = await profile.save();
            const signature = generateSignature({
                _id : updateCustomerResponse._id,
                email : updateCustomerResponse.email,
                verified : updateCustomerResponse.verified
            });
            return res.status(201).json({signature : signature, verified : updateCustomerResponse.verified, email : updateCustomerResponse.email });

        }
    }
    return res.status(400).json({message : "Error Otp"});
}


const RequestOtp = async(req,res)=>{
     const customer = req.user;

       if(customer){
           const profile = await Customer.findById(customer._id);
           if(profile){
               
               const  otp = await GenerateOtp();
               const expiry = await GenerateExpiry();
               profile.otp = otp;
               profile.otp_expiry = expiry;

               console.log(profile.otp);
               console.log(profile.otp_expiry);

               await profile.save();

               await onRequestOTP(otp,profile.phone);

               res.status(200).json({message : "OTP send your registred phone number"});
           }
       }

        res.status(400).json({message : "Error with Request OTP"});
}


const GetCustomerProfile = async(req,res)=>{
    const customer = req.user;
     if(customer){
         const profile = await Customer.findById(customer._id);
         if(profile) return res.status(200).json(profile);
     }
}
/*-----------------Delivery Notification------------------------ */

const assignOrderForDelivery = async(orderId, vandorId)=>{
    // find the vendor
      const vendor = await Vandor.findById(vandorId);
      if(vendor) {
          const areaCode = vendor.pincode;
          const vendorLat = vendor.lat;
          const vendorLng = vendor.lng;

          const deliveryPerson = await Delivery.find({pincode : areaCode, verified : true, isAvailable : true});
          if(deliveryPerson){
              const currentOrder = await Order.findById(orderId);

              if(currentOrder){
                   currentOrder.deliveryId = deliveryPerson[0]._id;
                  const response = await currentOrder.save();

                  //Notifu to vendor for received new Order using irebase Push Notificacion
              }
          }
        
      }
    //find available delivery person
      
    //check the nearest delivery and assign the order

    //update deliveryId


}

const validateTransaction = async(txnId)=>{
    const currentTransaction = await Transaction.findById(txnId);
    if(currentTransaction){
        if(currentTransaction.status.toLowerCase() !== "failed"){
            return {status : true, currentTransaction}
        }
    }
    return {status : false , currentTransaction}
}

const CreateOrder = async(req,res)=>{
    const customer = req.user;
    const {txnId , amount, items} = req.body;
     
    if(customer){

        const {status, currentTransaction} = await validateTransaction(txnId);
        console.log(status, currentTransaction)
        if(!status) {
            return res.status(404).json({message : "Error with Create Order"});
        }
        
        const orderId = Math.floor(Math.random()*89999 +1000);
        const profile = await Customer.findById(customer._id);
        
        let cartItems = Array();

        let metAmount = 0.0;
        let vandorId;
        const foods = await Food.find().where('_id').in(items.map(item=> item._id)).exec();

        foods.map(food=>{
            items.map(({_id, unit})=>{
                if(food._id == _id){
                    vandorId = food.vandorId;
                    metAmount+=(food.price*unit);
                    cartItems.push({food,unit});
                }
            })
        });

        if(cartItems){
            const currentOrder = await Order.create({
                orderId : orderId,
                vandorId : vandorId,
                items : cartItems,
                totalAmount : metAmount,
                paidAmount : amount,
                orderDate : new Date(),
                
                orderStatus : 'Waiting',
                remarks : '',
                deliveryId : '',
                
                readyTime : 45,
            });

                profile.cart = [];
                profile.orders.push(currentOrder);
                 currentTransaction.vandorId = vandorId;
                 currentTransaction.orderId = orderId;
                 currentTransaction.status = "CONFIRMED";

                 await currentTransaction.save();

                 assignOrderForDelivery(currentOrder._id, vandorId);
                 await profile.save();
                return res.status(200).json(profile);
            
        }
  
    }
    res.status(400).json({message : "Error with Create Order"});
 
}


const GetOrders = async(req,res)=>{
   const customer = req.user;
   if(customer){
       const profile = await Customer.findById(customer._id).populate('orders');
       if(profile) return res.status(200).json(profile.orders);

   }
   res.status(400).json({message : "Error with Orders"});

}



const GetOrderById = async(req,res)=>{
     const orderId =   req.params.id;
     console.log(orderId);
     if(orderId) {
         const order = await Order.findById(orderId).populate('items.food');
         res.status(200).json(order);
     }
      return res.status(400).json({message : "Id invalid"});
}


const EditCustomerProfile = async(req,res)=>{
    const customer = req.user;

    const {firstName, lastName, address} = req.body;
      if(firstName.length<1) return res.status(400).json({message : "FirstName invalid !!"});
      if(lastName.length<1) return res.status(400).json({message : "LastName invalid!!"});
      if(address.length<4) return res.status(400).json({message : "Address Invalid!!"});
  
       if(customer) {
           const profile = await Customer.findById(customer._id);
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

 const AddtoCart = async(req,res)=>{
     const customer = req.user;
     if(customer){
        const profile = await Customer.findById(customer._id).populate('cart.food');
        let cartItems = Array();
        const {_id, unit} = req.body;
        const food = await Food.findById(_id);
         if(food){
             if(profile){
                 // Chek for cart items
                 cartItems = profile.cart;
                 if(cartItems.length>0){
                     // Check and Update unit
                     let existFoodItem = cartItems.filter((item)=> item.food._id.toString()=== _id);
                      if(existFoodItem.length>0){
                          const index = cartItems.indexOf(existFoodItem[0]);
                          if(unit>0){
                              cartItems[index] = {food,unit}
                          } else {
                              cartItems.splice(index,1);
                          }
                      } else{
                          cartItems.push({food,unit});
                      }
                 } else {
                     //add new item to cart
                     cartItems.push({food,unit})
                 }
                 if(cartItems){
                     profile.cart = cartItems;
                     const cartResult = await profile.save();
                     return res.status(200).json(cartResult.cart);
                 }
             }
         }
     }
     res.status(400).json({message : "Unable to create Cart!!"})
 }

 const GetCart = async(req,res)=>{
    const customer = req.user;
    if(customer){
        const profile = await Customer.findById(customer._id).populate('cart.food');
        if(profile) return res.status(200).json(profile.cart);
    }
    res.status(400).json({message : "cart is empty"});
 }

 const DeleteCart = async(req,res)=>{
    const customer = req.user;
    if(customer){
        const profile = await Customer.findById(customer._id).populate('cart.food');
        if(profile) {
            profile.cart = [];
            const cartResult = await profile.save();
            return res.status(200).json(cartResult);
        }
      
    }
    res.status(400).json({message : "cart is already empty"});
 }

 const verifyOffer = async(req,res)=>{
     const offerId = req.params.id;
     const customer = req.user;

      if(customer){
          const appliedOffer = await Offer.findById(offerId);

           if(appliedOffer){
               if(appliedOffer.promotype === "USER"){
                       // only can apply once per user
               }else {

                   if(appliedOffer.isActive){
                       return res.status(200).json({message : "Offer is Valid",offer : appliedOffer});
                   }
               }
           }
      }
      return res.status(400).json({message : "Offer is not valid!!"});
 }

 const CreatePayment = async(req,res)=>{
     const customer = req.user;
     const {amount, paymentMode, offerId}= req.body;

     let payableAmount = Number(amount);

     if(offerId){
         const appliedOffer = await Offer.findById(offerId);

          if(appliedOffer){
              if(appliedOffer.isActive){
                  payableAmount = (payableAmount -appliedOffer.offerAmount);
              }
          }
     }

     //Create record on Transaction
     const transaction = await Transaction.create({
         customer : customer._id,
         vandorId : '',
         orderId : '',
         orderValue : payableAmount,
         offerUsed : offerId || "N/A",
         status : 'OPEN',
         paymentMode : paymentMode,
         paymentResponse : "Payment is Cash on Delivery"

     });

     return res.status(200).json(transaction);

 }

module.exports = {
    CustomerSignUp,
    CustomerLogin,
    CustomerVerify,
    GetCustomerProfile,
    RequestOtp,
    EditCustomerProfile,
    CreateOrder,
    GetOrders,
    GetOrderById,
    AddtoCart,
    GetCart,
    DeleteCart,
    verifyOffer,
    CreatePayment
}
