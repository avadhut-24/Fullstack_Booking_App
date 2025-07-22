const express = require('express');
const { createPlace, getUserPlaces, getPlaces, getPlaceById, updatePlace, uploadPhotos, addReview, deleteReview, updateReview } = require('../controllers/placesControllers');
const { upload } = require('../middlewares/upload');




const router = express.Router();

router.post('/', createPlace);
router.get('/user-places', getUserPlaces);
router.get('/', getPlaces);
router.get('/:id', getPlaceById);
router.put('/', updatePlace);
router.post('/upload', upload.array('file', 100), uploadPhotos);
router.post('/reviews/add/:placeId', addReview);
router.delete('/reviews/delete/:placeId/:reviewId', deleteReview);
router.put('/reviews/update/:placeId/:reviewId', updateReview);



module.exports = router;

