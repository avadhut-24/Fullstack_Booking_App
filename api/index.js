const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const mongoose = require("mongoose");
// Suppress the deprecation warning for strictQuery
// mongoose.set('strictQuery', false);
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const Place = require('./models/Place.js');
const Booking = require('./models/Booking.js');
const path = require('path');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const {S3Client, GetObjectCommand, PutObjectCommand} = require('@aws-sdk/client-s3');
const multer = require('multer');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner'); 
const fs = require('fs');
const mime = require('mime-types');
const { error } = require('console')
const Razorpay = require('razorpay');

const multerS3 = require('multer-s3');

require('dotenv').config();
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'fasefraw4r5r3wq45wdfgw34twdfg';
const bucket = 'dawid-booking-app';

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname+'/uploads'));
app.use(cors({
  credentials: true,
  origin: 'http://localhost:5173',
}));

//////////////////////////////////////////////////Uplaod AWs//////////////////////////////////


// Initialize the S3 client (AWS SDK v3)
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Initialize multer-s3 storage
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.BUCKET_NAME,
    acl: 'private', // Keep files private
    contentType: (req, file, cb) => {
      // Manually set content type based on file extension
      const extname = path.extname(file.originalname).toLowerCase();
      let mimeType = 'application/octet-stream'; // Default fallback
      
      // Set the mime type based on file extension
      if (extname === '.jpeg' || extname === '.jpg') {
        mimeType = 'image/jpeg';
      } else if (extname === '.png') {
        mimeType = 'image/png';
      } else if (extname === '.gif') {
        mimeType = 'image/gif';
      } else if (extname === '.svg') {
        mimeType = 'image/svg+xml';
      }
      
      cb(null, mimeType); // Set the content type
    },
    key: (req, file, cb) => {
      const fileName = `uploads/${Date.now()}_${file.originalname}`;
      cb(null, fileName);
    }
  })
});

// Function to generate pre-signed URL (for getting objects from S3)
const generatePreSignedUrl = async (bucket, key) => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key
  });
  // Generate the pre-signed URL with a 1-hour expiration time
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return signedUrl;
};

// Express endpoint for file upload
app.post('/api/upload', upload.array('file', 100), async (req, res) => {
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
});

//////////////////////////////////////////////////End AWS Upload/////////////////////////////////


////////////////////////////////////////Fetching Places AWS + Mongodb///////////////////////////
// Set up AWS S3 client (AWS SDK v3)
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

// Route to fetch all places with pre-signed photo URLs
app.get('/api/places', async (req, res) => {
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
});



////////////////////////////////////////////////End of fetching Places///////////////////////////////////


/////////////////////Razorpay//////////////////////////////////////////////////////////////


// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post('/api/create-order', async (req, res) => {
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
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////


  

function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      resolve(userData);
    });
  });
}

app.get('/api/test', (req,res) => {
  // mongoose.connect(process.env.MONGO_URL);
  res.json('test ok');
});

app.post('/api/register', async (req,res) => {
  // mongoose.connect(process.env.MONGO_URL);
  console.log("Connected1");
  const {name,email,password, role} = req.body;

  try {
    const userDoc = await User.create({
      name,
      email,
      password:bcrypt.hashSync(password, bcryptSalt),
      role,
    });
    res.status(200).json(userDoc);
  } catch (e) {
    res.status(422).json("Registration unsuccessful");
  }

});

app.get('/api/customers', async (req,res) => {
  try{
    const customers = await User.find({role : 'Customer'});
    if(customers.length == 0){
     return res.status(404).json({message : "No customer found"});
    }
    return res.status(200).json(customers);
  }
  catch(err){
    console.log(err);
    return res.status(500).json({message : "Internal server error"});
  }
})

app.get('/api/hosts', async (req, res)=>{
  try{
    const hosts = await User.find({role : 'Host'});
    if(hosts.length == 0){
      return res.status(400).json({message : "No user found"});
    }
    else{
      return res.status(200).json(hosts);
    }
  }
  catch(err){
    console.log(error);
     return res.status(500).json({message : "Internal Error"});
  }
})

app.post('/api/login', async (req,res) => {
  // mongoose.connect(process.env.MONGO_URL);
  const {email,password, role} = req.body;
  const userDoc = await User.findOne({email});
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    
    if (passOk && userDoc.role == role) {
      jwt.sign({
        email:userDoc.email,
        id:userDoc._id
      }, jwtSecret, {}, (err,token) => {
        if (err) throw err;
        res.cookie('token', token).json(userDoc);
      });
    } else {
      res.status(422).json('pass not ok');
    }
  } else {
    res.status(422).json('not found');
  }
});

app.get('/api/profile', (req,res) => {
  // mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      if(!userData){
           return res.json("No data found");
          }
      else {
        const {name,email,_id, role} = await User.findById(userData.id);
        return res.json({name,email,_id, role});
      }
    });
  } else {
    return res.json(null);
  }
});

app.post('/api/logout', (req,res) => {
  res.cookie('token', '').json(true);
});


app.post('/api/upload-by-link', async (req,res) => {
  const {link} = req.body;
  console.log(__dirname);
  const newName = 'photo' + Date.now() + '.png';
  await imageDownloader.image({
    url: link,
    dest: __dirname +'/uploads/' + newName,
  });
  res.json(newName);
});

app.post('/api/places', (req,res) => {
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
});

app.get('/api/user-places', (req,res) => {
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
});

app.get('/api/places/:id', async (req,res) => {
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
 
});

app.put('/api/places', async (req,res) => {
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
});




app.post('/api/bookings', async (req, res) => {
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
});


// app.get('/', (req, res) =>{
//   console.log("Hii");
//    res.send("hello!");
   
// })

app.get('/api/bookings', async (req, res) => {
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
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});


app.get('/', (req, res) => {
  res.send("HEre is the resposens!");
})

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params; // Extract ID from the request parameters

  try {
    const result = await User.findByIdAndDelete(id); // Delete user by ID
    if (result) {
      res.status(200).json({ message: 'User deleted successfully', user: result });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});


mongoose.connect(process.env.MONGO_URL, { 
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // ssl: true,  // Ensure SSL is enabled
  // sslValidate: false  // Optional: To avoid SSL validation issues, especially during development
 }).then(()=> app.listen(4000)).then(() => {console.log("db connected")});

// app.listen(4000);