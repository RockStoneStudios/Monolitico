const {Shopping} = require('../controllers/index');

const router = require('express').Router();

/*-------------------Food Availability ---------------------*/
router.get('/:pincode',Shopping.GetFoodAvailability);

/*------------------------ Top Restaurants ------------------*/
router.get('/top-restaurants/:pincode',Shopping.GetTopRestaurants);

/*--------------------- Food Available in 30 minutes------------- */
router.get('/foods-in30-min/:pincode',Shopping.GetFoodIn30Min);

/*----------------------Search Foods---------------------------- */

router.get('/search/:pincode',Shopping.SearchFoods);

/*----------------------Find Offers--------------------------- */
router.get('/offers/:pincode',Shopping.GetOffers)


/*------------------- Find Restaurant By Id----------------------- */
router.get('/restaurant/:id',Shopping.RestaurantById);

module.exports = router;