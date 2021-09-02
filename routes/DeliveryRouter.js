const {Customer} = require('../controllers/index');
const {Delivery} = require('../controllers/index')
const authenticated = require('../middlewares/authenticate');

const router = require('express').Router();

/*--------------------- SingUp ----------------------------*/
router.post('/signup',Delivery.DeliveryUserSignUp);


/*--------------------Login-------------------------------- */
router.post('/login',Delivery.DeliveryUserLogin);


/*--------------Change Service Status --------------- */
router.put('/change-status',authenticated, Delivery.UpdateDeliveryUserStatus);

/*------------------- Look Profile ----------------------------------*/
router.get('/profile',authenticated,Delivery.GetDeliveryUserProfile);

/*---------------------Edit Profile--------------------------------- */
router.patch('/profile',authenticated, Delivery.EditDeliveryUserProfile);



module.exports = router;