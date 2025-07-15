const express = require('express');
const bcrypt = require('bcryptjs');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const jwt = require('jsonwebtoken');
const Place = require('../models/Place');
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);
require('dotenv').config();
const {generatePreSignedUrl} = require('../middlewares/uplod');



//////////////////////////////////////////////////Uplaod AWs//////////////////////////////////
  
  // Express endpoint for file upload
  const uploadPhotos = async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
  
    try {
      const bucketName = process.env.BUCKET_NAME;
  
      // Generate pre-signed URLs for uploaded files
      const preSignedUrls = await Promise.all(
        req.files.map(async (file) => {
          // Generate the pre-signed URL for each file
          const signedUrl = await generatePreSignedUrl(bucketName, file.key);
          return { photoKey: file.key, signedUrl }; // Return the file's original name and signed URL
        })
      );
  
      // Send the pre-signed URLs back to the frontend
      res.json({ preSignedUrls });
    } catch (error) {
      console.error('Error generating pre-signed URLs:', error);
      res.status(500).json({ message: 'Error generating pre-signed URLs' });
    }
  };
  
  //////////////////////////////////////////////////End AWS Upload/////////////////////////////////

const s3Client_1 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
// Function to generate a pre-signed URL for an object
const getPreSignedUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
  });

  // Generate the pre-signed URL (valid for 1 hour)
  return getSignedUrl(s3Client_1, command, { expiresIn: 60 * 60 });
};

  
  const createPlace = (req,res) => {
    // mongoose.connect(process.env.MONGO_URL);
    console.log("triggered!");
    const {token} = req.cookies;
    const {
      title,address,addedPhotos,description,price,
      perks,extraInfo,checkIn,checkOut,maxGuests,
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const placeDoc = await Place.create({
        owner:userData.id,price,
        title,address,photos:addedPhotos,description,
        perks,extraInfo,checkIn,checkOut,maxGuests,
      });
      res.json(placeDoc);
    });
  };
  
  const getUserPlaces = (req,res) => {
    // mongoose.connect(process.env.MONGO_URL);
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const {id} = userData;
      const PlacesDoc = await Place.find({owner:id});
     
      
  
      // Map over the places and add pre-signed URLs to the photos array
      const placesWithPreSignedUrls = await Promise.all(
        PlacesDoc.map(async (place) => {
          // Generate pre-signed URLs for each photo key in the photos array
          const preSignedUrls = await Promise.all(
            place.photos.map((photoKey) => getPreSignedUrl(photoKey))
          );
  
          console.log(preSignedUrls);
  
          // Replace the original photos array with pre-signed URLs
          return {
            ...place.toObject(), // Convert Mongoose document to plain object
            photosPURLs: preSignedUrls,
          };
        })
      );
  
      return  res.json( placesWithPreSignedUrls);
    });
  };

  const getPlaces = async (req, res) => {
    try {
      // Fetch all places from MongoDB
      const places = await Place.find();
  
      // Map over the places and add pre-signed URLs to the photos array
      const placesWithPreSignedUrls = await Promise.all(
        places.map(async (place) => {
          // Generate pre-signed URLs for each photo key in the photos array
          const preSignedUrls = await Promise.all(
            place.photos.map((photoKey) => getPreSignedUrl(photoKey))
          );
  
          // Replace the original photos array with pre-signed URLs
          return {
            ...place.toObject(), // Convert Mongoose document to plain object
            photosPURLs: preSignedUrls,
          };
        })
      );
  
      // Send the modified places to the frontend
      res.json(placesWithPreSignedUrls);
    } catch (error) {
      console.error('Error fetching places:', error);
      res.status(500).send('Error fetching places');
    }
  };
  
  const getPlaceById = async (req,res) => {
    // mongoose.connect(process.env.MONGO_URL);
    const {id} = req.params;
    
    
    try {
      
      let place = await Place.findById(id);
  
      const preSignedUrls = await Promise.all(
        place.photos.map((photoKey) => getPreSignedUrl(photoKey))
      );
  
      place = {...place.toObject(), 
                  photosPURLs: preSignedUrls}
      return res.json(place);            
  
    } catch (error) {
      console.error('Error fetching places:', error);
      res.status(500).send('Error fetching places');
    }
   
  };
  
  const updatePlace = async (req,res) => {
    // mongoose.connect(process.env.MONGO_URL);
    console.log("triggered!");
    const {token} = req.cookies;
    const {
      id, title,address,addedPhotos,description,
      perks,extraInfo,checkIn,checkOut,maxGuests,price,
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const placeDoc = await Place.findById(id);
      if (userData.id === placeDoc.owner.toString()) {
        placeDoc.set({
          title,address,photos:addedPhotos,description,
          perks,extraInfo,checkIn,checkOut,maxGuests,price,
        });
        await placeDoc.save();
        res.json('ok');
      }
    });
  };

// Add a review to a place
const addReview = async (req, res) => {
  const { placeId } = req.params;
  const { rating, userName, review } = req.body;
  try {
    const place = await Place.findById(placeId);
    if (!place) return res.status(404).json({ message: 'Place not found' });
    place.reviews.push({ rating, userName, review });
    await place.save();
    res.status(201).json(place.reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error });
  }
};

// Delete a review from a place by review id
const deleteReview = async (req, res) => {
  const { placeId, reviewId } = req.params;
  try {
    const place = await Place.findById(placeId);
    if (!place) return res.status(404).json({ message: 'Place not found' });
    const reviewIndex = place.reviews.findIndex(r => r._id.toString() === reviewId);
    if (reviewIndex === -1) {
      return res.status(400).json({ message: 'Review not found' });
    }
    place.reviews.splice(reviewIndex, 1);
    await place.save();
    res.status(200).json(place.reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error });
  }
};

// Update a review for a place by review id
const updateReview = async (req, res) => {
  const { placeId, reviewId } = req.params;
  const { rating, userName, review } = req.body;
  try {
    const place = await Place.findById(placeId);
    if (!place) return res.status(404).json({ message: 'Place not found' });
    const reviewObj = place.reviews.id(reviewId);
    if (!reviewObj) {
      return res.status(400).json({ message: 'Review not found' });
    }
    if (rating !== undefined) reviewObj.rating = rating;
    if (userName !== undefined) reviewObj.userName = userName;
    if (review !== undefined) reviewObj.review = review;
    await place.save();
    res.status(200).json(reviewObj);
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error });
  }
};

  module.exports = { createPlace, getUserPlaces, getPlaces, getPlaceById, updatePlace, uploadPhotos, addReview, deleteReview, updateReview };