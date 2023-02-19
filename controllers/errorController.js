/* eslint-disable arrow-body-style */
/* eslint-disable prefer-const */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable node/no-unsupported-features/es-syntax */

const AppError = require('./../utils/appError');
//--------------------------------------------------------

//-----------sending errors during DEVELOPMENT MODE----------------------
//aim- sending all the details of the error to the developers to see
//if we are development mode then we want to see all the errors in detail thats why for api errors all the error details like status,message,stack,and entire error and for rendered website we render a error page which has the detailed error message
const sendErrorDev = function (err, req, res) {
  //all errors-operational+programming+other unknown errors
  //IMP1)API ERRORS------------------------------------------
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }
  //--------------------------------------------------------
  else {
    //IMP2)RENDERED WEBSITE ERRORS(logging entire error in the console along with rendering the error message)
    // a)loggin entire error-for developers to see in log(not in the browsers console but in the terminal bcz it is nodejs)
    console.error('ERROR 🔥', err); //by logging this -error is loggend in the hosting platforms like heroku so that developers can see the errors
    //b)rendering error in the page
    return res.status(err.statusCode).render('error', {
      title: 'Something went Wrong!', //tittle of the page
      msg: err.message, //message that displays in the error box
    });
  }
};
//--------------------------------------------------------

//-------sending errors during PRODUCTION MODE----------
//aim-NOT leaking the entire error information to users or public only sending error.message and generic message to users
const sendErrorProd = (err, req, res) => {
  //IMP1)API ERRORS
  if (req.originalUrl.startsWith('/api')) {
    //this is Operational error which is trusted - sending this type of error message-operation errors are the known errors which we handled them in this appliction
    //Operational errors are a natural part of an application, and programmer errors are bugs caused by developers
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //---UNKNOWN ERRORS(programming errors or other unknown errors)
    //this is Progamming error or Other unknown error- so we dont want to leak error details to users and clients thats why we send our own generic message instead of error message in this type of error
    else {
      // a)loggin entire error-for developers to see(not in the browsers console but in the terminal bcz it is nodejs)
      console.error('ERROR 🔥', err); //by logging this -error is logged in the hosting platforms like heroku so that developers can see the errors
      //b)rendering error in the page
      // 2)send generic message to users
      return res.status(500).json({
        status: 'fail',
        message: 'Something went very wrong',
      });
    }
  }
  //--------------------------------------------------------
  else {
    //IMP2)RENDERED WEBSITE ERRORS(logging entire error in the console along with rendering the error message)
    //this is Operational error which is trusted - sending this type of error message
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: 'Something went Wrong!', //tittle of the page
        msg: err.message, //message that displays in the error box
      });
    }
    //---UNKNOWN ERRORS(programming errors or other unknown errors)
    //this is Progamming error or Other unknown error- so we dont want to leak error details to users and clients thats why we send our own generic message instead of error message in this type of error
    else {
      //
      // a)loggin entire error-for developers to see(not in the browsers console but in the terminal bcz it is nodejs)
      console.error('ERROR 🔥', err); //by logging this -error is loggend in the hosting platforms like heroku so that developers can see the errors
      //b)rendering GENERIC ERROR MESSAGE in the page so th
      return res.status(500).render('error', {
        title: 'Something went Wrong!', //tittle of the page
        msg: 'Please Try again later.',
      });
    }
  }
};
//--------------------------------------------------------

//--------------------------------------------------------
const handleCastErrorDb = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(message, 400); //400- bad request
};
//--------------------------------------------------------

//--------------------------------------------------------
const handleDuplicateFieldsDb = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0]; //finding value of entered filed which is between quotes in errmsg
  const message = `Duplicate field value:${value} Please use another value!`;
  return new AppError(message, 400); //400- bad request
};
//--------------------------------------------------------

//--------------------------------------------------------
const handleValidationErrorDb = (err) => {
  // const values = err.message;
  const errorsMsg = Object.values(err.errors)
    .map((el) => el.message)
    .join('. ');
  const message = `Invalid input Data. ${errorsMsg}`;
  return new AppError(message, 400); //400- bad request
};
//--------------------------------------------------------

//--------------------------------------------------------
const handleJWTError = () => {
  return new AppError('Invalid token.Please login again', 401);
};
//--------------------------------------------------------

//--------------------------------------------------------
const handleJWTExpiredError = () => {
  return new AppError('Your token has been expired.Please login again', 401);
};

//--------------------------------------------------------

//--------------------------------------------------------
module.exports = function (err, req, res, next) {
  //   console.log(err.stack);
  //when middleware function has 4 arguments with err as first arguement then it recognises as the error handling middleware
  err.statusCode = err.statusCode || 500; //defining default error status code 500 (internal server error)
  err.status = err.status || 'error'; //defining default error status for 500 code- 'error' (for 500 codes status is always 'fail')

  //sending detailed error response to developers to see
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);

    //sending simple error message to understand to users in production environment
  } else {
    //for casterrors where id is not recognised/invalid id
    let prodError = { ...err }; //copying err into prodError due to some reasons error message doesnt copy into prodErro object so we need to exclusively copy err.message into prodError.message
    prodError.message = err.message;

    if (err.name === 'CastError') {
      prodError = handleCastErrorDb(err);
    }
    // //for Mango errors where a alredy existing field (eg-name) is  entered again -duplicate key error
    if (err.code === 11000) {
      prodError = handleDuplicateFieldsDb(err);
    }
    // //for ValidationErrors where validation conditions are not met like giving 6 as ratingsAverage
    if (err.name === 'ValidationError') {
      prodError = handleValidationErrorDb(err);
    }
    if (err.name === 'JsonWebTokenError') {
      //error if token has differen payload (id)
      prodError = handleJWTError(err);
    }
    if (err.name === 'TokenExpiredError') {
      //error if token is expired
      prodError = handleJWTExpiredError(err);
    }

    sendErrorProd(prodError, req, res);
  }
};
