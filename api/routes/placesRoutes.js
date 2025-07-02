const express = require('express');
const { createPlace, getUserPlaces, getPlaces, getPlaceById, updatePlace, uploadPhotos } = require('../controllers/placesControllers');
const { upload } = require('../middlewares/uplod');




const router = express.Router();

router.post('/', createPlace);
router.get('/user-places', getUserPlaces);
router.get('/', getPlaces);
router.get('/:id', getPlaceById);
router.put('/', updatePlace);
router.post('/upload', upload.array('file', 100), uploadPhotos);

module.exports = router;

