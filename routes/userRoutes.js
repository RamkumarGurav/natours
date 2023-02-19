const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const viewsController = require('./../controllers/viewsController');

const router = express.Router();

//user-routes

//sigup router - directly using post method without using route
router.post('/signup', authController.signup);
router.post('/login', authController.login);
//logout router that sends normal text but not the jwt token through cookies
router.get('/logout', authController.logout);

//for forgot and reset password
router.post('/forgotPassword', authController.forgotPassword);
router.get('/resetPassword/:token', viewsController.getResetPasswordForm);
router.patch('/resetPassword/:token', authController.resetPassword);

//--$$$$$$$------protected routes-------$$$$------------------
//For all the below routes User must be logged in ,so we can use 'isRouteProtected' middleware before all the below routes run
router.use(authController.isRouteProtected); // protects all routes after this middleware

//for updating loggedin users password
router.patch('/updateMyPassword', authController.updatePassword);
//getting details of own //here we have used 'getMe' middleware to get loggedin users id from isRouteProtected middleware and set it as req.params.id so that it will work in next getUser middleware
router.get('/me', userController.getMe, userController.getUser);
//for updating loggedin users data
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
//for deleting(actually making inactive) the current user
router.delete('/deleteMe', userController.deleteMe);

//--protected and restricted routes---------------
router.use(authController.restrictTo('admin')); //all routes after this middleware is restricted only to admins(also protected)

router //restricted only to admin(also protected)
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id') //restricted only to admin(also protected)
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
//------------------------------------------
//------------------------------------------

module.exports = router;
