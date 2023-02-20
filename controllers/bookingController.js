const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { async } = require('regenerator-runtime');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const handlerFactory = require('./handlerFactory');
//--------------------------------------------------------

//------------Creating and sending Checkout Session---------------------------------------
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //step1)Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  //step2)Create the checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment', //mode of session
    payment_method_types: ['card'], //payment methods
    //---------------dev mod-------------------------------
    success_url: `${req.protocol}://${req.get('host')}/myTours/?tour=${
      req.params.tourId
    }&user=${req.user._id}&price=${tour.price}`, //when payment is successfull browsesr goes to this url //
    //--------------------------------------------------------
    //----------------after deployment---------------------------------
    // success_url: `${req.protocol}://${req.get('host')}/my-tours`,
    //--------------------------------------------------------
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`, //when payment is cancelled browsesr goes to this url
    customer_email: req.user.email, //need customer email in the reciept
    client_reference_id: req.params.tourId, //tourId is requiered to create booking in the data base
    line_items: [
      //list of items that are going to purchased-array(items) of objects(item)//here we purchase only one item//this object contains all the neccassary info about that item//which is required on the purchased recipt
      {
        quantity: 1, //only one tour is purchased
        price_data: {
          currency: 'inr',
          unit_amount: tour.price * 100, //converting in rupee//1 rupee is 100paisa
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary, //product description
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`], //contains array of images//these images must be hosted on internet
          },
        },
      },
    ],
  });

  //step3)send the checkout session in response
  res.status(200).json({
    status: 'success',
    session,
  });
});
//--------------------------------------------------------

//---------------dev MODE------------------------------
//-------create BoookingCheckout in the DB and ----------------------------------------
// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   //this is only TEMPORARY ,because its UNSECURE : everyone can make booking without  paying
//   const { tour, user, price } = req.query;
//   if (!tour && !user && !price) {
//     //if there are no tour,user and price queries mentioned in the url then move to next middleware else create a Booking Checkout document in the DB and again brouwser hits the original homepage url and again come to this middleware this time there will be no queries so it directly moves to next middleware which is 'isLoggedIn()'
//     return next();
//   }
//   await Booking.create({ tour, user, price }); //creating Booking Checkout document in db

//   res.redirect(req.originalUrl.split('?')[0]); //ie-`${req.protocol}://${req.get('host')}/`//again brouwser hits the original homepage url
// });

//--------------------------------------------------------

//------------after deployement----------------------------------
//--------------------------------------------------------
// const createBookingCheckout = async (session) => {
//   const tour = session.client_reference_id;
//   const user = await User.findOne({ email: session.customer_email });
//   user = user.id;
//   const price = session.line_items[0].price_data.unit_amount / 100;

//   await Booking.create({ tour, user, price }); //creating Booking Checkout document in db
// };
//--------------------------------------------------------
// exports.webhookCheckout = async (req, res, next) => {
//     const signature = req.header['stripe-signature'];
//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(
//       //creating an webhook event
//       req.body, //raw body of request//thats why app.post('/webhook-checkout'..) is used befor data is converted to json /parsed
//       signature, //signature that is sent by stripe in headers
//       process.env.STRIPE_WEBHOOK_SECRET //webhook secret key -we get this key after we deploy our website and get our url and create webhook for that url in stripe
//     );
//   } catch (err) {
//     //sending error to stripe
//     return res.status(400).send(`Webhook error:${err.message}`);
//   }

//   if (event.type === 'checkout-session-completed') {
//     createBookingCheckout(event.data.object); //session is in 'event.data.object'
//     res.status(200).json({
//       recieved: true,
//     });
//   }
// };
//--------------------------------------------------------

//--------------------------------------------------------
exports.getAllBookings = handlerFactory.getAll(Booking);
exports.createBooking = handlerFactory.createOne(Booking);
exports.getBooking = handlerFactory.getOne(Booking);
exports.updateBooking = handlerFactory.updateOne(Booking);
exports.deleteBooking = handlerFactory.deleteOne(Booking);
