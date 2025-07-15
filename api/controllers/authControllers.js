const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);



const getProfile = (req,res) => {
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
  };


const login = async (req,res) => {
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
  };


const register = async (req,res) => {
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
      res.status(422).json(e);
    }
  };

  const logout = (req,res) => {
    res.cookie('token', '').json(true);
  };      

module.exports = { getProfile, login, register, logout };