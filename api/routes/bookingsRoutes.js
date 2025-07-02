const express = require('express');
const { createBooking, getBookings, createOrder } = require('../controllers/bookingsControllers');

const router = express.Router();

router.post('/', createBooking);
router.post('/createOrder', createOrder);
router.get('/', getBookings);

module.exports = router;