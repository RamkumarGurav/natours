/* eslint-disable import/no-useless-path-segments */
// eslint-disable-next-line no-unused-vars
const APIFeatures = require('../utils/apiFeatures');
// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Review = require('./../models/reviewModel');
const handlerFactory = require('./handlerFactory');
//--------------------------------------------------------

//--------------------------------------------------------
exports.getAllReviews = handlerFactory.getAll(Review);
// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   //if there is a tourId then get all the corresponding review of that tour(for tour/:tourId/reveiew ) ,if ther is no tourId then get all the reviews in the DB(for api/v1/reviews)
//   let filter = {};
//   if (req.params.tourId) {
//     filter = { tour: req.params.tourId };
//   }
//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: 'success',
//     results: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });
//--------------------------------------------------------

//--------------------------------------------------------
exports.createReview = catchAsync(async (req, res, next) => {
  //allowing for nested routes
  //when current user is not posted userid and tourid manually -in this sitution we get userID from .isRouteProtected middleware(so here we set req.body.user with  req.user._id;) and we get tourID from the parameter of current url (here  we set req.body.tour with  req.params.tourId;)
  if (!req.body.user) {
    req.body.user = req.user._id;
  }
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }

  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      newReview,
    },
  });
});
//--------------------------------------------------------

//--------------------------------------------------------
exports.getReview = handlerFactory.getOne(Review);
// exports.getReview = catchAsync(async (req, res, next) => {
//   const review = await Review.findById(req.params.id);
//   if (!review) {
//     return next(new AppError('No review found with this ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       review,
//     },
//   });
// });
//--------------------------------------------------------

//--------------UPDATE REVIEW------------------------------------------
exports.updateReview = handlerFactory.updateOne(Review);

//--------------------------------------------------------

//--------------------------------------------------------
exports.deleteReview = handlerFactory.deleteOne(Review);
