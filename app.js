/* eslint-disable import/extensions */
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const { urlencoded } = require('body-parser');

//start express app
const app = express();
//--------------------------------------------------------

//--------------------------------------------------------
//setting view engine as pug
app.set('view engine', 'pug');
//setting views to folder that contains views/templates of app
//by this all the templates that are mentioned in the render(eg- res.status(200).render('base))
app.set('views', path.join(__dirname, 'views')); //here path.join(__dirname, 'views') is similar to './views' but its always recomended to use path syntax
//--------------------------------------------------------

//--------------------------------------------------------
//GLOBAL MIDDLEWARES
//step1-request passing through middlewares
//middleware for serving static files in root route
app.use(express.static(path.join(__dirname, 'public')));

//  SETTING SECURITY HTTP HEADERS -USING helmet midlleware(PACKAGE -helmet)
//this
app.use(helmet());

//Development logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //logs details about response
  //middleware for parsing request body - run only in development environment
}

//request-rate-limiting middleware-which prevents from making too many request from same IP to our API(eg-hacking trying to login using many guessed passwords )
//for this -package required is -npm i express-rate-limit
//creating limiter and using it as middleware
const limiter = rateLimit({
  //only allowing 100 request per 1hour from same IP toour api
  max: 100, //maximum allowed requests
  windowMs: 60 * 60 * 1000, //time-limit in milisecond here it is 1hr
  message: 'Too many requests from this IP, Please try again in an hour!', //error message if they exceeds 100 requests wihtin 1 hour
});
app.use('/api', limiter); //appling this middleware to all the route that starts with '/api'

//Body parser middlware
app.use(express.json({ limit: '50mb' })); //middleware for reading data from the body into req.body//here if body contains more than 10kb of data then it will not read

//this middle helps when we want directly submit our data using form to the url using acton and method -this helps in  parsing submitted data so that value is stored with name of 'name'(of input) property
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

//Cookie parser middlware to parse the data in the cookies
app.use(cookieParser());

//use below 2 Data sanitozation middleware after body parser middleware
//Data sanitozation against NOSql query injection(eg-injecting some query in the email field that makes logion)-using express-mongo-sanitize package
app.use(mongoSanitize());

//Data sanitization against XSS attacks (cross site scripting attacks eg-hacker injecting html code vai name field of request body)-using xss-clean package
app.use(xss());

//Prevent Parameter Pollution middleware-this middleware prevents the error when we use parameters 2 times eg-tours/sort=duration&sort=price -normally this gives errors but using this middle ware last parameter of same will be used -here it is sorted based on price
app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'maxGroupSize',
      'difficulty',
      'ratingsAverage',
      'ratingsQuantity',
      'startDates',
    ], //allowing some parameters to run more than one time eg-tours/duration=5&duration=9 -this gives tours which have duration of 5 and 9
  })
);

//Test middleware-for some testing if needed
app.use((req, res, next) => {
  // console.log(req.headers);
  // console.log(req.cookies);
  next();
});
//--------------------------------------------------------

//--------------------------------------------------------
//ROUTES
//

///step2-request passing through tourRouter middlewares and then moves to file tourRoutes.js
app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);
///step2-request passing through useRouter middlewares and then moves to file userRoutes.js
app.use('/api/v1/users', userRouter);

///step2-request passing through reviewRouter middlewares and then moves to file userRoutes.js
app.use('/api/v1/reviews', reviewRouter);


app.use('/api/v1/bookings',bookingRouter)

//HANDLING UNHANDLED ROUTES-alway put this in last order of  routes stack -because this route catches all the urls that are not catched by above routes
app.all('*', (req, res, next) => {
  //'all' is for all the http methods and * is for all the urls
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  //   const err = new Error(`Can't find ${req.originalUrl} on this server`); //creating err object and defining statusCode ,status property on it and then sending this err object to global handling middleware via next()
  //   err.status = 'fail';
  //   err.statusCode = 404;
  // next(err)////if next() has any arguement then its a error object that is sent to upcoming middleware (here Global error handling middleware)
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)); //if next() has any arguement then its a error object ,Here an error object is created using AppError class that is sent to upcoming middleware (here Global error handling middleware)
});

//GLOBAL ERROR HANDLING MIDDLEWARE -always at bottowm of app
app.use(globalErrorHandler); //here globalErrorHandler middleware is called and a response is sent for Error

module.exports = app;
