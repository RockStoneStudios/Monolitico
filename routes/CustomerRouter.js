const {Customer} = require('../controllers/index');
const authenticated = require('../middlewares/authenticate');

const router = require('express').Router();

/*--------------------- SingUp ----------------------------*/
router.post('/signup',Customer.CustomerSignUp);


/*--------------------Login-------------------------------- */
router.post('/login',Customer.CustomerLogin);


/*---------------------Verify Custommer Account------------- */
router.patch('/verify',authenticated,Customer.CustomerVerify);

/*--------------------OTP----------------------*/
router.get('/otp',authenticated,Customer.RequestOtp);

/*------------------- Look Profile ----------------------------------*/
router.get('/profile',authenticated,Customer.GetCustomerProfile);

/*---------------------Edit Profile--------------------------------- */
router.patch('/profile',authenticated, Customer.EditCustomerProfile);

/*-------------------Cart------------------ */
router.post('/cart',authenticated,Customer.AddtoCart);
router.get('/cart',authenticated,Customer.GetCart);
router.delete('/cart',authenticated,Customer.DeleteCart);


/*--------------------Apply Offers------------------- */
router.get('/offer/verify/:id',authenticated,Customer.verifyOffer)
/*--------------------Payment----------------*/
 router.post('/create-payment',authenticated,Customer.CreatePayment);
/*-----------------------Order---------------*/

router.post('/create-order',authenticated,Customer.CreateOrder);
router.get('/orders',authenticated,Customer.GetOrders);
router.get('/order/:id',authenticated,Customer.GetOrderById);

module.exports = router;