const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new Schema({
  name: String,
  email: {type:String, unique:true},
  password: String,
  role : {type:String, required: true},
  status : {type:String, required: true, default: "active"},
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;