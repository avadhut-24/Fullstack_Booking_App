const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  owner: {type:mongoose.Schema.Types.ObjectId, ref:'User'},
  title: String,
  address: String,
  photos: [String],
  description: String,
  perks: [String],
  extraInfo: String,
  checkIn: Number,
  checkOut: Number,
  maxGuests: Number,
  price: Number,
  reviews: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      rating: Number,
      userName: String,
      review: String
    }
  ]
});

const PlaceModel = mongoose.model('Place', placeSchema);

module.exports = PlaceModel;