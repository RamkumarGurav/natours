const fs = require('fs');
//settings for env before requiring app
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');
// const app = require('../../app');//no need of app

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

//READ  JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//ImPORT DATA INTO tours,users,and reviews COLLeCTION
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false }); //bcz-this data doesnt'have passwordConfirm field it is giving errors-by turning off validations we can load data without any errs //here this data is already validated//also commentout PASSWORD ENCRYPTINNG & REMOVING PASSWORDCONFIRM FIELD-and UPDATING PASSWORDCHANGEDAT middlewares to avoid password encryption bcz in this data passwords are alreadey encrpted (all users pass-pass1234)
    await Review.create(reviews);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit(); //exiting app after one call
};

//DELETE ALL DATA FROM tours,users and reviews COLLeCTION
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully Deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit(); //exiting app after one call
};

// console.log(process.argv); //gives array of instructions that are typed in commandline to execute this file

//importing data into DB(loading data into DB)
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

//IMP how to import data IMP
//(./dev-data/data/import-dev-data.js depends on on which file directory u are executing this command)
// step1->node ./dev-data/data/import-dev-data.js --delete
// step2->node ./dev-data/data/import-dev-data.js --import
