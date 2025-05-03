const express = require('express');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

router.get('/', viewsController.home);
router.get('/registerUser', viewsController.registerNewUser);
router.get('/loginUser', viewsController.loginUser);
router.get('/logoutUser', viewsController.logOutUser);
router.get('/bookExchange', viewsController.bookExchangeView);

module.exports = router;


