const Vandor = require("../models/Vandor");
const Offer = require("../models/Offer");
const GetFoodAvailability = async(req,res)=>{
    const pincode = req.params.pincode;

    const result = await Vandor.find({pincode : pincode},{serviceAvailable : false})
                               .sort([["rating","descending"]])
                               .populate("foods");

     if(result.length>0){
         res.status(200).json(result);
     }                             

     return res.status(400).json({message: "Data no Found"});
}


const GetTopRestaurants = async(req,res)=>{
 
     const pincode = req.params.pincode;
      const result = await Vandor.find({pincode: pincode},{serviceAvailable : false})
                                 .sort([["rating","descending"]])
                                 .limit(10);
                               

         if(result.length> 0) return res.status(200).json(result);
         
         res.status(400).json({message: "Data no Found"});


}

const GetFoodIn30Min = async(req,res)=>{
      const pincode = req.params.pincode;

       const result = await Vandor.find({pincode: pincode},{serviceAvailable : false})
                                   .populate('foods');

        if(result.length>0) {
            const foodsResult = [];
              result.map(vandor =>{
                  const foods = vandor.foods;
                  foodsResult.push(...foods.filter(food=> food.readyTime>=15));
              });
              res.status(200).json(foodsResult);
        }
         res.status(400).json({message : "Data no Found"});                      
}

const SearchFoods = async(req,res)=>{
  const pincode = req.params.pincode;
   const result = await Vandor.find({pincode : pincode},{serviceAvailable : false})
                              .populate('foods');
   if(result){
       const foods = [];
        result.map(item => foods.push(...item.foods))
    res.status(200).json(foods);
   }
   res.status(400).json({message : "Data no Found"});
}

const RestaurantById = async(req,res) =>{
    
    const result = await Vandor.findById(req.params.id).populate('foods');
    if(result) return res.status(200).json(result);
    res.status(400).json({message : "Data no found!!"});
}

const GetOffers = async(req,res)=>{
   const pincode = req.params.pincode;
   const offers = await Offer.find({pincode : pincode, isActive : true});
    if(offers){
        return res.status(200).json(offers);
    }
   return res.status(400).json({message : "Offers not Found!!"});
}

module.exports = {
    GetFoodAvailability,
    GetFoodIn30Min,
    GetTopRestaurants,
    SearchFoods,
    RestaurantById,
    GetOffers
}