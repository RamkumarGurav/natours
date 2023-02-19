/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();
//we want to make most of the tourRoute opetions public so we only restrict certain routes- here we made createTour,deleteTour,getMonthlyPlan routes only allowed to admin and lead-guide (getMonthlyPlan also for guides)

//middleware for tourRoute only
//step3-request passing through param middleware
// router.param('id', tourController.checkID);

//---NESTED ROUTES---------
//this tour router must use review router whenever it encounters "/:tourId/reviews" route like this
//its just like mounting review router on the tour router and saying whenever user hits ''/:tourId/reviews' on the tour router ,then use review router instead of tour router
router.use('/:tourId/reviews', reviewRouter);

//tour router
//step4-request passing through endpoints of tour routes and calling route controllers
//Aliasing-creating separate route for popular url in the website -eg getting top 5 cheap tours
//place at top of tour routes stack- because its important and separate route
router
  .route('/top-5-cheap') //always place routes without params(regular routes) at the top of routes stack
  .get(tourController.aliasTop5CheapTours, tourController.getAllTours); //here aliasTopCheap middleware is added to set query before moving to getAllTours middleware

//route for getting stats of tours using aggragator pipeline method
router.route('/tour-stats').get(tourController.getTourStats);

//route to search for-tours that are within your distance radius
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin); //eg: /tours-within/500/center/20,30/unit/km

//route that gives the all the tours distance from the given location
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/') //always place routes without params(regular routes) at the top of routes stack
  .get(tourController.getAllTours)
  .post(
    authController.isRouteProtected,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id') //always place routes with params at the bottom of routes stack
  .get(tourController.getTour)
  .patch(
    authController.isRouteProtected,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,//uploading images to a buffer storage
    tourController.resizeTourImages,//resizing,storing images in file and uploading filenames in the req.body 
    tourController.updateTour
  )
  .delete(
    authController.isRouteProtected,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

router
  .route('/monthly-plan/:year')
  .get(
    authController.isRouteProtected,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );
//---------------------nested routes-----------------------------------
//POST tours/<tourId>/reviews -for creating a review
//GET tours/<tourId>/reviews - for getting all the reviews
//GET tours/<tourId>/reviews/<reviewId> -for getting a specific reviews

//----------CREATING NEW REVIEW by LOGGEDIN USER(NESTED ROUTE)---------------
//here we want to implement a route for current user for creating a new review for the specific tour
//when logged in user(here we get user id) hits this route whith tourId we can create a review with userId and tourId
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.isRouteProtected, //making sure user is logged in
//     authController.restrictTo('user'), //making sure user is has role of type 'user' only
//     reviewController.createReview
// )
////---GETTING ALL THE REVIEWS OF A SPECIFIC TOUR  by LOGGEDIN USER(NESTED ROUTE)---------------
//here we want to implement a route for current user get all the reviews of of that spicific tour (riviews that are only commented on that tour)
//when logged in user(here we get user id) hits this route whith tourId we can get  tourId and find the all the reviews that that has this tour's ID
//   .get(
//     authController.isRouteProtected, //making sure user is logged in
//     authController.restrictTo('user'), //making sure user is has role of type );
//     reviewController.getAllReviewsOfTour
//   );

// router.route('/:tourId/reviews/:reviewId').get(
//   authController.isRouteProtected, //making sure user is logged in
//   authController.restrictTo('user'), //making sure user is has role of type );
//   reviewController.getReview
// );
module.exports = router;
