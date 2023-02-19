/* eslint-disable import/no-useless-path-segments */
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { async } = require('regenerator-runtime');
//--------------------------------------------------------

//--------------------------------------------------------
exports.getOverview = catchAsync(async (req, res, next) => {
  //step1)Get tour data from the collection
  const tours = await Tour.find();
  //step2)Buid template
  //step3)Render that template using the tour data from step1
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  }); //just mention the name of the template which needs to be rendered on this url
});
//--------------------------------------------------------

//--------------------------------------------------------
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews', //field which needs to populated
    fields: 'review rating user', //inner fields of 'review' field of tour which needs to be shown
  });

  if (!tour) {
    return next(new AppError('There is No tour with that name', 404));
  }

  res.status(200).render('tour', { title: `${tour.name} Tour`, tour });
});
//--------------------------------------------------------

//--------------------------------------------------------
exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', { title: 'Log into your account' });
});
//--------------------------------------------------------

//--------------------------------------------------------
exports.getSignupForm = catchAsync(async (req, res, next) => {
  res.status(200).render('signup', { title: 'Signup', signupNo: true });
});
//--------------------------------------------------------

//--------------------------------------------------------
exports.getAccount = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .render('account', { title: 'Your Account settings', user: req.user });
});
//--------------------------------------------------------
exports.getForgotPasswordEmailForm = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  res.status(200).render('forgotPasswordEmail', {
    title: 'Reset your Password',
  });
});
//--------------------------------------------------------
//--------------------------------------------------------

//--------------------------------------------------------
exports.getResetPasswordForm = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  res.status(200).render('forgotPassword', {
    title: 'Reset your Password',
    token,
  });
});
//--------------------------------------------------------

//--------------------------------------------------------
// exports.updateUserData = catchAsync(async (req, res, next) => {
//   console.log('Updataing', req.body);
//   const updatedUser = await User.findByIdAndUpdate(
//     req.user._id,
//     { name: req.body.name, email: req.body.email },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );

//   res
//     .status(200)
//     .render('account', { title: 'Your Account', user: updatedUser });
// });
//--------------------------------------------------------

//--------------------------------------------------------
exports.getMyTours = catchAsync(async (req, res, next) => {
  // step1)Gettin all the Bookings of the current user
  const bookings = await Booking.find({ user: req.user._id });

  //step2)Getting All the booked tours of
  // method-1
  // const arryOfTourPromises = bookings.map(async (booking) => {
  //   return await Tour.findById(booking.tour.id);
  // });
  // const bookedTours = await Promise.all(arryOfTourPromises);
  //method-2
  const tourIds = bookings.map((booking) => booking.tour.id); //array of tourIds that are booked by user
  const bookedTours = await Tour.find({ _id: { $in: tourIds } }); //this query finds all the tours with the id that are present in tourIds array

  res.status(200).render('overview', { title: 'My Tours', tours: bookedTours });
});
