const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    //parent referencing
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!'],
  },
  user: {
    //parent referencing
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a Price!'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

//--------------------------------------------------------

//---Populating Tour and User fields of Booking model----------------------------------
bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({ path: 'tour', select: 'name' }); //populating all the user info and populatin tour with its name only//here 'this' points current query object of booking document
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
