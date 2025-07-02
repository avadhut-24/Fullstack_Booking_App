const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');
// const getUserDataFromReq = require('../utils/getUserDataFromReq');  
const { error } = require('console')
const Razorpay = require('razorpay');
require('dotenv').config();
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  jwtSecret = process.env.JWT_SECRET;  

function getUserDataFromReq(req) {
    return new Promise((resolve, reject) => {
      const token = req.cookies?.token; // Ensure cookies exist
  
      if (!token) {
        return reject(new Error("No token provided"));
      }
  
      jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) {
          reject(err); // Use reject instead of throw
        } else {
          resolve(userData);
        }
      });
    });
  }

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

const createOrder = async (req, res) => {
    try {
      const { amount } = req.body;
      const currency = req.body.currency || 'INR';
  
      // Create an order on Razorpay
      const options = {
        amount: amount * 100, // Amount in smallest currency unit (paisa for INR)
        currency,
        receipt: `receipt_${Date.now()}`, // Unique receipt ID
      };
  
      const order = await razorpay.orders.create(options);
  
      res.status(200).json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      });
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create Razorpay order',
      });
    }
  }; 

const createBooking = async (req, res) => {
    try {
      const userData = await getUserDataFromReq(req); // Get user data from request (e.g., JWT)
      
      const {
        place,
        checkIn,
        checkOut,
        numberOfGuests,
        name,
        phone,
        price,
        paymentDetails, // assuming this is part of the request for payment info
      } = req.body;
  
      // Validate that all required fields are present
      if (!place || !checkIn || !checkOut || !numberOfGuests || !name || !phone || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      // Create the booking in the database
      const booking = await Booking.create({
        place,
        checkIn,
        checkOut,
        numberOfGuests,
        name,
        phone,
        price,
        user: userData.id,
        paymentDetails, // Save payment info if available
      });
  
      res.status(201).json(booking); // Return the created booking data
  
    } catch (err) {
      console.error(err); // Log the error for debugging purposes
      res.status(500).json({ error: 'Something went wrong while saving the booking. Please try again.' });
    }
  };
  
const getBookings = async (req, res) => {
    console.log("Working");
    // res.status(200).json("Working");
  
    try {
      const userData = await getUserDataFromReq(req);
  
      // Fetch bookings for the user and populate the 'place' field
      const bookings = await Booking.find({ user: userData.id }).populate('place');
  
      // Map over the bookings to add pre-signed URLs for photos in the populated place
      const bookingsWithPreSignedUrls = await Promise.all(
        bookings.map(async (booking) => {
          // Generate pre-signed URLs for the photos in the place
          const preSignedUrls = await Promise.all(
            booking.place.photos.map((photoKey) => getPreSignedUrl(photoKey))
          );
  
          // Return the booking object with the pre-signed URLs added to the place
          return {
            ...booking.toObject(), // Convert booking document to plain object
            place: {
              ...booking.place.toObject(), // Convert place document to plain object
              photosPURLs: preSignedUrls, // Add pre-signed URLs to the place
            },
          };
        })
      );
  
      res.json(bookingsWithPreSignedUrls);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ message: error });
    }
  };



  module.exports = { createBooking, getBookings, createOrder };