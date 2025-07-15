const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  place: {type:mongoose.Schema.Types.ObjectId, required:true, ref:'Place'},
  user: {type:mongoose.Schema.Types.ObjectId, required:true},
  checkIn: {type:Date, required:true},
  checkOut: {type:Date, required:true},
  name: {type:String, required:true},
  phone: {type:String, required:true},
  price: Number,
  paymentDetails: { 
    razorpay_payment_id: { type: String },
    razorpay_order_id: { type: String },
    razorpay_signature: { type: String }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const BookingModel = mongoose.model('Booking', bookingSchema);

module.exports = BookingModel;