const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      max: 5,
      min: 1,
      default: 1,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    //parent referencing from child review to parents tour and user
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//--------------------------------------------------------

//--------------------------------------------------------
//populating user field of review
reviewSchema.pre(/^find/, function (next) {
  // this.populate({ path: 'user', select: 'name photo' }).populate({
  //   path: 'tour',
  //   select: 'name',
  // });

  //in each review we need only some info like name of the corresponding user But we don't need all the info about the corresponding tour ,tour id is enough- so we only populate user field of the review here
  this.populate({ path: 'user', select: 'name photo' });
  next();
});
//--------------------------------------------------------

//----CALCULATING RATINGSAVERAGE & RATINGSQUANTITY-------
//here we calculate ratingsAverage and ratings quantity whenever a new review is created,updated or deleted
//IMP wHEN A NEW REVIEW IS CREATED
//static methods->static methods are methods/functions that are available on the current Model(here -Review)
//here we calculate
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //"this" keyword in this static method/function points current model which Review
  //here we calculate no.of ratings and avg of ratings whenever a new review is created using aggregage pipeline method to calculate this type of stats
  //why statics method is used -bcz to calculate statics/calculation we need aggegate method which is done on Model and Static methods gives current Model via 'this' keyword
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }, //first we group all the reviews based on given tourIds(tour) till this current review is created
    },
    {
      //then we get avg of ratings and no.of ratings are calculated for the group(collection of reviews which have same given tour id)
      $group: {
        _id: '$tour', //grouping based on 'tour' field of these reviews
        nRatings: { $sum: 1 }, //sum
        avgRatings: { $avg: '$rating' }, //avg of all the reviews till
      },
    },
  ]);
  // console.log(stats);
  //updating ratingsAverage and ratingsQuantity when there is stats array
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRatings,
      ratingsQuantity: stats[0].nRatings,
    });
  } else {
    //when there is no stats array- after all the reviews on that tour deleted -set defualt values like this
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

//calling above function which calculates avg and no of ratings afte a new review is saved(thats' why document post-save method is used)
reviewSchema.post('save', function () {
  //note-all post methods doesnt have next methods(since they willl be the last middleware)
  //here 'this' keyword refers to currently created(after saving to DB) review document
  const currentReviewTourID = this.tour; //getting tour ID to gruop
  //constructor of current document after saved to DB points to its Model(Review Model)
  this.constructor.calcAverageRatings(currentReviewTourID); //wkt //calcAverageRatings function is available on the Review Model(bcz its a statics method only called on Model eg-Review.calcAverageRatings()) but we cant acces before it is defined but we can acces by using 'this.constructor' which points to Review Model
});
//--------------------------------------------------------
//IMP wHEN A REVIEW IS UPDATED OR DELETED
//findByIdAndUpdate(bts-findOneAndUpdate) and findByIdAndDelete(bts-findOneAndDelete...) for these document middlewares is not applicable But Only Query middlewares are applicable
reviewSchema.pre(/^findOneAnd/, async function (next) {
  //using this pre-query middleware we can get the currently updating  or deleting review document,
  //here 'this.findOne()' gives the currently updating  or deleting review document and we stored this document in the query Object so that we can get in the next post-query middleware
  this.updatedOrDeletedReview = await this.findOne().clone(); //here clone is to get rid of 'query is alreday executed' error(use clone() when u get this type of error)
  // console.log('pre-u', this.updatedOrDeletedReview);
  next();
});
//after the current review has updated or deleted now we can calculate the  avg and no of ratings(thats why post-query middleware is used)
reviewSchema.post(/^findOneAnd/, async function () {
  //Note-this.updatedOrDeletedReview = await this.findOne(); Does not work here becasue .in this query has already executed and ducumetn is updated and loaded into the DB ,so we cant execute hereit doesn give the current review document
  //here 'this' keyword is query Object after current review is updated into the DB or  Deleted from the DB//so from this Query Object we can get tour id and calculate the  avg and no of ratings of all the related reviews of that tour
  const currentReviewTourId = this.updatedOrDeletedReview.tour;
  //calcAverageRatings() static method is called on the Model
  //here we used 'this.updatedOrDeletedReview.constructor' insted of 'this.constructor' bcz we stored updatedOrDeletedReview on the query Object ('this)
  // console.log('post-u');

  await this.updatedOrDeletedReview.constructor.calcAverageRatings(
    currentReviewTourId
  ); //here 'this.updatedOrDeletedReview' is the currently saved review document so its constructor points to Review Model
});

//--------------------------------------------------------

//----------UNIQUE COMPOUND INDEX--------------------------------
//---preventing same user postiing more the one review on same Tour------
reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); //this making combined/compound index of tour and user unique we can get uniquer tourId and UserId so that same UserID will be not used on the Same tourId twice
const Review = mongoose.model('Review', reviewSchema);
//--------------------------------------------------------

//--------------------------------------------------------
module.exports = Review;
