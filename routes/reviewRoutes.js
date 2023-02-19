/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true }); //it makes the params that are in another route can be accessed in this router(here tourId is avialanle on the review router)

router.use(authController.isRouteProtected); //all the routes after this middleware are protected ie user must be loggedin

router
  .route('/') //always place routes without params(regular routes) at the top of routes stack
  .get(reviewController.getAllReviews)
  .post(authController.restrictTo('user'), reviewController.createReview); //only user is allowed to create a review

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    //allowing updating and deleting of review is restricted to users and admins only
    authController.isRouteProtected,
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.isRouteProtected,
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
