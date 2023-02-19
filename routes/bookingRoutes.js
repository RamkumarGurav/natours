/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get(
  '/checkout-session/:tourId',
  authController.isRouteProtected,
  bookingController.getCheckoutSession
);
//--------------------------------------------------------
//---routes that are only allowed to admin and lead-guides  
router.use(authController.isRouteProtected);
router.use(authController.restrictTo('admin', 'lead-guide'));
router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)  
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
