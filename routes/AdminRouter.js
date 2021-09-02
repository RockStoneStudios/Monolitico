const router = require('express').Router();

const {AdminController} = require('../controllers/index');

router.post('/vandor',AdminController.createVandor);
router.get('/vandors',AdminController.getVandors);
router.get('/vandor/:id',AdminController.getVandorById);
router.get('/transactions', AdminController.GetTransaction);
router.get('/trasaction/:id',AdminController.GetTransactionById);
router.put('/delivery/verify',AdminController.VerifyDeliveryUser);
router.get('/delivery/users',AdminController.GetsDeliveryUsers);
module.exports = router;