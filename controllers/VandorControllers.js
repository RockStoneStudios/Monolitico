const {findVandor} = require('./AdminControllers');
const {passwordCompare,generateSignature} = require('../utility/encryptPassword');
const Food = require('../models/index');
const Order = require('../models/Order');
const Offer = require('../models/Offer');

const login = async(req,res)=>{
    const{ email, password} = req.body;

    const vandor = await findVandor('',email);
   
    if(vandor) {
        const confirmPassword = await passwordCompare(password,vandor.password);
        if(confirmPassword){
             const signature =  generateSignature({
                 _id : vandor._id,
                 email : vandor.email,
                 foodType : vandor.foodType,
                 name : vandor.name
             });
                 
             
            res.json(signature);
        } else {
            res.json({message : "password is not Valid!!"});
        }
    } else {
        res.json({message : "Login Credential not Valid!!"});
    }
}

const getVandorProfile = async(req,res)=>{
    const user = req.user;
    console.log(user);
     if(user){
         const existingVandor = await findVandor(user._id);
         console.log(existingVandor);
         res.json(existingVandor);
     }
     res.json({messsage : "Vandor Info not Found"});
}

const updateVandorProfile = async(req,res)=>{
  const {foodType,name,address,phone} = req.body;
  const user = req.user;
   if(user) {
       const existingVandor = await findVandor(user._id);
        if(existingVandor){
            existingVandor.foodType = foodType;
            existingVandor.name = name;
            existingVandor.address = address;
            existingVandor.phone = phone;

           const saveResult =  await existingVandor.save();
           res.json(saveResult);

        }
   }
}

const updateVandorService = async(req,res)=>{
     const user = req.user;
     const {lat,lng} = req.body
     if(user) {
         const existingVandor = await findVandor(user._id);
         if(existingVandor){
             existingVandor.serviceAvailable = !existingVandor.serviceAvailable;
              if(lat && lng){
                  existingVandor.lat = lat;
                  existingVandor.lng = lng;
              }
             const result =  await existingVandor.save();
            res.json(result);
             
         }
     }
}

const updateVandorCoverImage = async(req,res)=>{
    const user = req.user;
    if(user) {
        const vandor = await findVandor(user._id);
         if(vandor){
             const files = req.files;
             const images = files.map(file => file.filename);
             vandor.coverImages.push(...images);
             const result = await vandor.save();
             res.json(result);
         }

    }
}

const addFood = async(req,res)=>{
  const user = req.user;
   if(user) {
       const {name,description,category,foodType,readyTime,price} = req.body;
       console.log(req.body);
       const vandor = await findVandor(user._id);
       console.log(vandor);
        if(vandor){

              const files = req.files;
              console.log(files);
               const images = files.map(file => file.filename);
                const createFood = await Food.food.create({
                vandorId : user._id,
                name : name,
                description :description,
                category : category,
                foodType : foodType,
                images : images,
                readyTime : readyTime,
                price : price,
                rating : 0
            });
            vandor.foods.push(createFood);
            const result = await vandor.save();
            return  res.json(result);
        } else {
            res.json({message : "Not Vandor with Id"});
        }
         
   }
}

const getFoods = async(req,res)=>{
   const user = req.user;
    if(user) {
        const foods = await Food.food.find({vandorId : user._id});
        res.json(foods);
    }else {
      res.json({message : "Foods Info not Found"});
    }
}

const GetCurrentOrders = async(req,res)=>{
   const user = req.user;
   if(user){
        const orders = await Order.find({vandorId : user._id}).populate('items.food');
        if(orders){
            return res.status(200).json(orders);
        }
    }
   return res.status(400).json({message : "Order not found"});
}

const ProcessOrder = async(req,res)=>{
   const orderId = req.params.id;
   const {status,remarks, time } = req.body;
   if(orderId){
       const order = await Order.findById(orderId).populate('food');
       console.log(order);
       order.orderStatus = status;
       order.remarks = remarks;
       if(time){
           order.readyTime = time;
       }

       const orderResult = await order.save();
       if(orderResult){
           return res.status(200).json(orderResult);
       }
   }
   return res.status(400).json({message : "Unable to Process Order"});
}

const GetOrderDetail = async(req,res)=>{
    const orderId = req.params.id;
    if(orderId){
         const order = await Order.findById(orderId).populate('items.food');
         if(order){
             return res.status(200).json(order);
         }
     }
    return res.status(400).json({message : "Order not found"});
}

 const GetOffers = async(req,res)=>{
    const user = req.user;
    if(user){
        const offers = await Offer.find().populate('vandors');
        
        let currentOffers = Array();
          if(offers){

              offers.map(item =>{
                  if(item.vandors){
                      item.vandors.map(vandor=>{
                          if(vandor._id.toString()=== user._id){
                              currentOffers.push(item);
                          }
                      })
                  }
                   if(item.offerType === "GENERIC"){
                       currentOffers.push(item);
                   }
              })
            }
            return res.status(200).json(currentOffers);

    }
    return res.status(400).json({message : "Offers not available"});
 }

 const AddOffer = async(req,res)=>{
   const user = req.user;
   if(user) {
       const {title, description,offerType,offerAmount,pincode, promocode, promoType, startValidity,endValidity,bank,bins,minValue,isActive} = req.body;

       const vandor = await findVandor(user._id);
       if(vandor) {
           const offer = await Offer.create({
               title,
               description,
               offerType,
               offerAmount,
               pincode,
               promocode,
               promoType,
               startValidity,
               endValidity,
               bank,
               bins,
               isActive,
               minValue,
               vandors :[vandor]
           });
          return   res.status(200).json(offer);
       }
   }
   return res.json({message : "Unable to Add Offer"});

 }

  const EditOfer = async(req,res)=>{
    const user = req.user;
    const offerId = req.params.id;
    if(user) {
        const {title, description,offerType,offerAmount,pincode, promocode, promoType, startValidity,endValidity,bank,bins,minValue,isActive} = req.body;
 
        const currentOffer = await Offer.findById(offerId);
        if(currentOffer) {
            const vandor = await findVandor(user._id);
             if(vandor){
                 currentOffer.title = title,
                 currentOffer.description = description,
                 currentOffer.offerType = offerType,
                 currentOffer.offerAmount = offerAmount,
                 currentOffer.pincode = pincode,
                 currentOffer.promocode =  promocode,
                 currentOffer.promoType = promoType,
                 currentOffer.startValidity =  startValidity,
                 currentOffer.endValidity =  endValidity,
                 currentOffer.bank = bank,
                 currentOffer.bins = bins,
                 currentOffer.isActive =  isActive,
                 currentOffer.minValue =  minValue
                    
                 const result = await currentOffer.save();
                 return res.status(201).json(result);
                
             }
           return   res.status(200).json(offer);
        }
    }
    return res.json({message : "Unable to Edit Offer"});
  }
module.exports = {
    login,
    getVandorProfile,
    updateVandorProfile,
    updateVandorService,
    addFood,
    getFoods,
    updateVandorCoverImage,
    GetCurrentOrders,
    ProcessOrder,
    GetOrderDetail,
    GetOffers,
    AddOffer,
    EditOfer
}