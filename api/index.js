const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User.js');
const cookieParser = require('cookie-parser');
const { error } = require('console')
const authRoutes = require('./routes/authRoutes');
const placesRoutes = require('./routes/placesRoutes');
const bookingsRoutes = require('./routes/bookingsRoutes');

require('dotenv').config();
const app = express();

const PORT = process.env.PORT || 10000;
// app.use('/uploads', express.static(__dirname+'/uploads'));
app.use((req, res, next) => {
  console.log(`CORS middleware running for ${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allows cookies and credentials
}));


app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204); // Respond with no content
});

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/bookings', bookingsRoutes);

app.get('/api/test', (req,res) => {
  // mongoose.connect(process.env.MONGO_URL);
  res.json('test ok');
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

app.get('/', (req, res) => {
  res.send("Here is the response!");
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
 }).then(()=> app.listen(PORT)).then(() => {console.log("db connected")})
 .then(() => {console.log(`Server is running on port: ${PORT}`)});

// 