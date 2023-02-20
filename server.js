//settings for env before requiring app
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });
//m---------------------------------------------------m-//
//UNHANDLED SYNCHRONOUS ERRORS(uncaughtException)-handling globally//always place this before app is required in the server file- because it handles all the syncronous errors in the whole application (inside of app file and server file)
//using process.on() event listener -whenever there is synchronous error,   an event called 'uncaughtException' is fired and now we can handle that error
//all the synchronous errors that are not handled anywhere in the applications are called as 'uncaughtExceptiond'
process.on('uncaughtException', (err) => {
  console.log(err);
  console.log('UNCAUGHT EXCEPTION! 🔥 Shutting down...');
  process.exit(1); //exiting the pocess//closing the application
  //Unhandled exceptions inherently mean that an application is in an undefined state...The correct use of 'uncaughtException' is to perform synchronous cleanup of allocated resources (e.g. file descriptors, handles, etc) before shutting down the process. It is not safe to resume normal operation after 'uncaughtException'.
});
//w----------------------------------------------------w//
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose.set('strictQuery', true);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log('Successfully connected to Database'));

// console.log(process.env.NODE_ENV); //ouput=>development if npm run start:prod
const port = process.env.PORT || 8000;//while addin env variables to heroku dont add PORT bcz heroku generates its own port number
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});

//m---------------------------------------------------m-//
//ERRORS OUTSIDE EXPRESS-UNHANDLED PROMISE REJECTION-handling globally- always place it at the bottom of server file
//eg-Server is not connected to Database due to wrong password or server is downn or Database is down
//using process.on() event listener -whenever there is promise rejection   an event called 'unhandledRejection' is fired and now we can handle that rejection
process.on('unhandledRejection', (err) => {
  console.log(err);
  console.log('UNHANDLED REJECTION! 🔥 Shutting down.....');
  //shutting down our application after shutting/closing down the server so that all requests that are pending at the time of error occurred are processed before application is closed
  server.close(() => {
    process.exit(1);
    //process.exit(code);
    //Node normally exits with code 0 when no more async operations are pending.
    //process.exit(1) should be used to exit with a failure code.This will allow us to infer that node didn't close gracefully and was forced to close.
  });
});
//w----------------------------------------------------w//

//-------------handling SIGTERM SIGNALS OF HEROKU----------
//heroku sends sigterm signal to node application after every 24 hrs to shuttdown our app but this makes our app to shutdown abtruptly so we need to shutdown our app gracefully
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM SIGNAL RECIEVED, Shutting down gracefully');
 
  server.close(() => {
console.log('🔥Process terminated!')//here we dont use 'process.exit(1);' bcz heroku's sigterm itself exits the process    
  });
});