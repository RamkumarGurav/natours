/* eslint-disable no-unused-vars */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'A tour name must have less or equal than 50 characters'],
      minlength: [
        3,
        'A tour name must have greter   or equal than 3 characters',
      ],
      // validate: [
      //   //custom validator using validator
      //   validator.isLowercase,
      //   'A tour name must only lowercase characters',
      // ],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A must have a difficulty'],
      enum: {
        //accepting only these values
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either:easy ,medium,difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'Ratings must be below 5'],
      min: [1, 'Ratings must be above 1'],
      set: (val) => Math.round(val * 10) / 10, //raounding up value to 1decimal position//using setter function for this type of aplications
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    priceDiscount: {
      type: Number,
      validate: {
        //custom validator which has this keyword only works on create() and save() methods
        validator: function (value) {
          //here value is priceDiscount
          //CUSTOM VALIDATOR- a validator is a function that return true of false based on conditions if true it allows the value else not
          return value < this.price ? true : false; //alternative-return value < this.price
          //in this validator 'this' keyword refers to current document for only creating new document(create method) but doesnt work for update/patch/ methods which uses find insermany methods
        },
        message: 'Discount price({VALUE})must be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //hiding createdAt filed in the output
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'], //only option is point
      },
      coordinates: [Number], //array of numbers([longitude,latitude] in GeoJSON - opposite to normal use in googlemaps where we use latitude,longitude)
      address: String,
      description: String,
    },
    locations: [
      //array of locations //embeding
      {
        //GeoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'], //only option is point
        },
        coordinates: [Number], //array of numbers([longitude,latitude] in GeoJSON - opposite to normal use in googlemaps where we use latitude,longitude)
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array, //embeding documents using pre-save middleware
    //child referencing when there are only few childs
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },

  {
    //making virtual properties availables as JSON and js Objects on output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//virtual properties-virtual properties are not really present on the database but on the ooutput (u cant get these properties using query methods)
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//MONGOOSE MIDDLEWARES
//1)DOCUMENT MIDDLEWARE(pre save middleware)- this runs before .save() and .create() command (only for these mongoose methods NOt for update ,insertmany methods)
//note that when you're using findAndUpdate() method, the pre-save hook/middleware is not triggered
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true }); //creating slug field before saving the document//here 'this' keyword is currently saving document
  next();
});

//--------------------------------------------------------

//--------------------------------------------------------

//2)QUERY MIDDLEWARE(pre/post)-this runs before/after the specified query method(eg-find) run on this schema
//pre find query middleware-here we are making a secret tour document not visible in output even though its in the database
// tourSchema.pre('find', function (next) {//only for 'find' method -thid is not applicable to findById -so it can be solved by using regular expression
//
tourSchema.pre(/^find/, function (next) {
  //'/^find/'-all the strings that starts with 'find' (ALL the query methods that starts with word find)
  this.find({ secretTour: { $ne: true } }); //here 'this' keyword is Query object//filtering  all the tours that doesnt have secretTout field as true before actual query method starts
  next();
});

//post find query middleware-runs after every query that starts with name 'find'//also gives all the result documents after all find query method had been executed
tourSchema.post(/^find/, function (docs, next) {
  next();
});
//--------------------------------------------------------

//--------------------------------------------------------

//3)AGGREGATE MIDDLEWARE
//this -commentedout to solver "$geoNear is only valid as the first stage in a pipeline." error to while calculating tours distance from the given location
// //excluding secret tour in tour-stats and monthly-plan/2021
// //by prepending(addiing) a inital stage of pipeline(array of stages) match to filter out the secret tour
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   //here 'this.pipeline()' gives array of pipeline stages of aggragate
//   next();
// });
// //--------------------------------------------------------

//IMP--------for embedding tourguides inside tours this method is not useful--------------------------------------
// tourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });
//--------------------------------------------------------

//------------Populating for child referencing-----------------------
//populating id fields of references in guides array using query-pre-find middleware(it will works on ouput only not on the DB)
tourSchema.pre(/^find/, function (next) {
  this.populate({ path: 'guides', select: '-__v -passwordChangedAt' }); //in the ouptut of query it will get the document of specified id in the guides array (path:guides)and also it will select __v and passwordChangedAt fields from that user document
  next();
});
//--------------------------------------------------------

//--------------------------------------------------------
//-----virtual population(alternative to child referencing)-------------
//USECASE-when user views a specific tour it must display all the review from other users with review details and user name
//IMP we need all the corresponding reviews of a tour inside that tour -that can be solved by child referencing to reviews(childs)-but since we may get ton of reviews which makes the child referencing unproductable method we can use virtual populate method which does the same operation as child referencing without storing all the coresponding  reviews data inside the DB (virtual populate makes the fields only present in the ouput)(note- to make 'reviews' field visible always remember to populate during query inside route handler,this middleware alone cant show 'reviews' fields in output)
tourSchema.virtual('reviews', {
  //"reviews"-name of the virtual field that will be present on each tour which contians all the corresponding reviews of that tour
  ref: 'Review', //referncing to Model which we want to populate with(Model of childs)
  foreignField: 'tour', //connecting tour model with review -here 'foreignField' refers to the name of  field of this Tour model that is present in the child Model
  localField: '_id', //here 'localField' is the name of the field of this Tour model's id which is mentioned in 'tour' field of  the child review model-ie the id of tour that is mentioned in the each review's tour field is present in this'Tour' model in feild which has the name '_id'
  //IMP we need to enable the populate on this 'reviews' virtual field of the Tour in getTour route only because we don't need all this info about reviews $ users in the getAllTours  route (bcz when user make a review on the specific tour we only need info about reviews details and user's name on that tour )
});
//--------------------------------------------------------

//---------------------------------------------------------
//----USING INDEX FOR SPEED QUERYING------------------------
//types of index-Number,Text,GeoJson(location)
//what are indexex and why we need indexes-> index is collect of documents stored outside of mongodb collections in ascending or descending order based on the specific field of a collection. So if we have index(eg-duration) of certain fields then while querying using that field it only examines very minimum documents(since they are already in ascending(1) or descending(-1)) which makes the query faster otherwise query examines all documents to get results
//INDEXes are created based on how popular(used most) is the query for eg- tours?price[lt]=1000&averageRatings[gt]=4.5 is used most of the times so here we create compound index(combined fields index) of price and averageRatings
tourSchema.index({ price: 1, ratingsAverage: -1 }); //index with collection of tours with ascending price and descending ratingsAverage(low price with high raingsAverage to high price with low ratingsAverage)
//note-ascending or descending order doesnt vary the results not so much(so safer side always use ascending order(1))
//other popular searches/querys(mostly single index)
tourSchema.index({ slug: 1 });
tourSchema.index({ duration: 1 });
tourSchema.index({ difficulty: 1 });
//there are diff types of indexes for text and geoLocation data
//--------------------------------------------------------

//--------------------------------------------------------
//geospatial querying- In order to do geospatial query we have create index of location based on which we are making query here that is 'startLocation' so create a index of startLocation
//since its a geoJson type of index we need to use '2dsphere' instead of regular 1 or -1//it create a 2d earch sphere on which all the startlocations are pinned
tourSchema.index({ startLocation: '2dsphere' });
//--------------------------------------------------------

//--------------------------------------------------------
//run mongose middlewares before creating the models
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
