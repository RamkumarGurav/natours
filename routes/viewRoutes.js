/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

//
// router.use(authController.isLoggedIn);
//here we dont need to use 'authController.isLoggedIn' on 'authController.isRouteProtected' since both get user data -it makes querying 2 times -so there is no need to add 'authController.isLoggedIn'  to protected routes (improving performance)

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);

// router.get('/passwordReset/:id',viewsController.getResetPasswordForm);
router.get('/forgotPassword', viewsController.getForgotPasswordEmailForm);

router.get('/me', authController.isRouteProtected, viewsController.getAccount);
router.get(
  '/my-tours',
  authController.isRouteProtected,
  viewsController.getMyTours
);

//--------------------------------------------------------
//use post method only (not patch) when u directly update data from form using action and method
// router.post(
//   '/submit-user-data',
//   authController.isRouteProtected,
//   viewsController.updateUserData
// );

module.exports = router;
