const router = require('express').Router();
const {login,getVandorProfile,updateVandorProfile,updateVandorService,addFood,getFoods,updateVandorCoverImage,GetCurrentOrders,GetOrderDetail,ProcessOrder,AddOffer,GetOffers,EditOfer} = require('../controllers/VandorControllers');
const authenticate = require('../middlewares/authenticate');

const multer = require('multer');
const { AddressInstance } = require('twilio/lib/rest/api/v2010/account/address');

const imageStorage = multer.diskStorage({
     destination : function(req,file,cb) {
          cb(null, 'images');
     },
     filename : function(req,file,cb){
          cb(null, new Date().getTime()+'_'+file.originalname);
     }
});

const images = multer({storage : imageStorage}).array('images',10);



router.post('/login',login);
router.get('/profile',authenticate,getVandorProfile);
router.patch('/profile',authenticate,updateVandorProfile);
router.patch('/services',authenticate,updateVandorService);
router.patch('/coverimage',authenticate,images,updateVandorCoverImage);

router.post('/food',authenticate,images,addFood);
router.get('/foods',authenticate,getFoods);

router.get('/',(req,res)=>{
     res.json('Hello Vandor');
});

/*---------------Orders------------- */

router.get('/orders',authenticate,GetCurrentOrders);
router.put('/order/:id/process',authenticate,ProcessOrder);
router.get('/order/:id',authenticate,GetOrderDetail);

//Offers

router.get('/offers',authenticate,GetOffers);
router.post('/offer', authenticate,AddOffer);
router.put('/offer/:id',authenticate,EditOfer);

//delete offers




module.exports = router;