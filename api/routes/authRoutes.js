const express = require('express');
const { register, login, getProfile, logout, updateStatus } = require('../controllers/authControllers');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', getProfile);
router.post('/logout', logout);
router.put('/updateStatus/:id', updateStatus);

module.exports = router;