/* eslint-disable no-unused-vars */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable no-lone-blocks */
/* eslint-disable node/no-unsupported-features/es-syntax */
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const handlerFactory = require('./handlerFactory');
//--------------------------------------------------------

//--------------------------------------------------------
// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour ID is ${val}`);
//   const id = Number(req.params.id);
//   console.log(typeof id);
//   if (id > tours.length) {
//     // if(!tour){
//     return res.status(404).json({
//       //404-Not Found
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };
//--------------------------------------------------------

//--------------------------------------------------------
exports.aliasTop5CheapTours = (req, res, next) => {
  // http://localhost:3000/api/v1/tours?lilmit=5&sort=-ratingsAverage,price&fields=name,price,ratingsAverage,summary,difficulty ===  http://localhost:3000/api/v1/tours/top-5-cheap
  //setting query on the code itself
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
//--------------------------------------------------------

//--------------------------------------------------------
exports.getAllTours = handlerFactory.getAll(Tour);
//passing orignal getAllTour controller function inside catchAsyn so that it return a promise that can send a error to global error handler middleware
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   //EXECUTING QUERY
//   //passing query and queryString and createing features object which has all the query methods as one query
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   //getting tours using all the methods that are in features object's "query" field
//   const tours = await features.query;

//   //SENDING RESPONSE
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });
//--------------------------------------------------------

//--------------------------------------------------------
exports.getTour = handlerFactory.getOne(Tour, 'reviews');
// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews'); //bts:Tour.findOne({_id:req.params.id})//IMP populating the virtual field named as 'reviews' for getTour route only

//   if (!tour) {
//     //throwing error if similar wrong id is searched in url
//     return next(new AppError('No tour found with that ID ', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });
//--------------------------------------------------------

//--------------------------------------------------------
// use this handlerFactory function carefully for creating new docs--NOT RECOMMENDED
// exports.createTour = handlerFactory.createOne(Tour);
exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    //201-created
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});
//--------------------------------------------------------

//-----------uploadTourImages-------------------------------
//step1)storing uploaded file in buffer instead of file system
const multerStorage = multer.memoryStorage(); //it stores uploaded file on the buffer(req.file.buffer)
//step2)creating multerFilter to allow only images to upload
const multerFilter = (req, file, cb) => {
  //only allowing images to store in the users files
  if (file.mimetype.startsWith('image')) {
    cb(null, true); //allowing only images
  } else {
    //if uploaded file is not an image then generate an error
    cb(new AppError('Not an image!,Please upload only images', 400), false); //400-bad request
  }
};
//step3)passingan  objeect that has multer storage and filter  through multer
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
//step4)setting multer to accept multiple files from multiple fields(bcz in this route we upload multiple files from multiple fields//here 'imageCover' field(tour model) can accept one file and 'images' field(tour model) field can accept maximum of 3 files
// step5 will be using this middleware inside update me route
exports.uploadTourImages = upload.fields([//this stores imagecover and images in the req.files object
  { name: 'imageCover', maxCount: 1 }, //here'name' is name of the allowed field and max count is maximum no.of files that are allowed to that field
  { name: 'images', maxCount: 3 },
]);
//if we had pnly 'images' field in Model schema that accepts multiple files then we can use
//exports.uploadTourImages = upload.array('images',3);//.array(fieldname,maxcount)
//if we had onnly 'imageCove' field in Model schema  that accepts single file  then we can use
////exports.uploadTourImages = upload.single('imageCover')
//--------------------------------------------------------

//------------resizeTourImages---------------------------------------
// step6) resizing and storing uploaded photo
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  //since we upload multiple files so on the request these files will be present on 'req.files' rather than req.file(when a single file is uploaded)
  // console.log(req.files); //req.files={imageCover:[{fieldname.....}],images:[{..},{..},{..}]}
  // if there is no file such as imagecover or images on the files object of the request on the request then move to next middleware (updateMe)
  if (!req.files.imageCover || !req.files.images) {
    return next();
  } //else below code

  // 1)Resizing and Saving ImageCover
  //storing the filename on req.body object(req.body.imageCover) which is needed in the next updateTour controller(bzc in in updateOne factory controller we mentioned entire 'req.body' in the upload arguement)
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer) //passing the file to sharp that is stored on the buffer(temp memroy)
    .resize(2000, 1333) //width and height(recommended when medium/large photos used in page)
    .toFormat('jpeg') //converting to jpeg format
    .jpeg({ quality: 90 }) //90% quality
    .toFile(`public/img/tours/${req.body.imageCover}`); //saving file to filesystm

  //2)Resizing and Saving Images
  req.body.images = []; //creating an array of images on the req.bod
  //creating array of promises of the all resized images of images array so that we can simultainously get the results of all 3 promises using await Promise.all(arrayOfPromises) methods
  const arrayOfPromises = req.files.images.map(async (file, i) => {
    const imageFileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

    await sharp(file.buffer) //passing the file to sharp that is stored on the buffer(temp memroy)
      .resize(2000, 1333) //width and height(recommended(2:3 ratio) when medium/large photos used in page)
      .toFormat('jpeg') //converting to jpeg format
      .jpeg({ quality: 90 }) //90% quality
      .toFile(`public/img/tours/${imageFileName}`); //saving file to filesystm
    req.body.images.push(imageFileName); //pushining image file name to the array images
  });
  //waiting for all the promises sumultanuosly
  await Promise.all(arrayOfPromises);

  next();
});
//--------------------------------------------------------

//-------UPDATE A TOUR BY ADMIN-------------------------------
exports.updateTour = handlerFactory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true, //it returns modified document rather than original
//     runValidators: true, //running validators again during update(because builtin validators only run automatically for create method)
//   });

//   if (!tour) {
//     //throwing error if similar wrong id is search in url
//     return next(new AppError('No tour found with that ID ', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });
//--------------------------------------------------------

//--------DELETE TOUR BY ADMIN------------------------------------------------
exports.deleteTour = handlerFactory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     //throwing error if similar wrong id is search in url
//     return next(new AppError('No tour found with that ID ', 404));
//   }

//   res.status(204).json({
//     //204-no Data
//     status: 'success',
//     data: null,
//   });
// });
//--------------------------------------------------------

//--------------------------------------------------------
exports.getTourStats = catchAsync(async (req, res, next) => {
  //aggregate method has array of objects as pipeline stages
  //each stage is normally an object inside an object that is inside another object
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.7 } }, //acts just like filter -it gives all the tours that are >= 4.7 ratings
    },
    {
      $group: {
        //gettigs stats and grouping them
        //use $ sign before the fields
        //_id is for grouping based on what fields//if _id is given as null then all fields of all tours are considered as one group
        // _id: null,
        _id: { $toUpper: '$difficulty' }, //grouping by difficulty with Uppercase of difficulty fields -this gives 3 groups
        // _id: '$ratingsAverage',
        numTours: { $sum: 1 }, //gives total no.of tours
        numRatings: { $sum: '$ratingsQuantity' }, //gives total no.of ratings
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 }, //gourps in ascending order of avgPrice//give 1 for ascending and -1 for descending order
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } }, //this exludees 'EASY' group
    // },
    //above stages gives stats of all the tours whose ratingsAverage is >= 4.7 and grouped based on difficulty of 'DIFFICULT'  "MEDIUM" and 'EASY' (3 groups) with increasing order of avgPrice
  ]);

  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: {
      stats,
    },
  });
});
//--------------------------------------------------------

//--------------------------------------------------------
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //2021
  //aggregate method has array of objects as pipeline stages
  //each stage is normally an object inside an object that is inside another object
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', //for each element in the startDates array a separate document is created -here 3X10=30 documents
    },

    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        }, //all the tours that only started in the year 2021
      },
    },

    {
      $group: {
        //gouping based on months
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 }, //total no.of tours that are started in that month
        tours: { $push: '$name' }, //array of tours name that are started in that month
      },
    },

    {
      $addFields: { month: '$_id' }, //adding a new field called month with the value of _id filed
    },
    {
      $project: {
        _id: 0, //making _id field hidden by giving 0 (give 1 to make it visible)
      },
    },
    {
      $sort: { numTourStarts: -1 }, //sorting result in the increasing order of no.of tours started
    },
    // {
    //   $limit: 1,//gives only one result of 1st element of the results
    // },
    //above all stages gives no.of tours started in the each month of 2021 in descending order of no.of tours started in each month
  ]);

  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan,
    },
  });
});
//--------------------------------------------------------

//--------------------------------------------------------
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  // console.log(distance, lat, lng, unit);

  //radius in terms of radians = distance / radius of earth
  //radius of earth in terms of mile=3963.2 mile
  // radius of earth in terms of km=6378.1 km/
  const raduisInRadians = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide lattitude and longitude in the format lat,lng',
        400
      ) //400-bad request
    );
  }

  //among All the tours we have find locations of the tour that are inside the circle whose center is at lng,lat with radius of raduisInRadians//these are locations within the given given location's radius
  //IMP-in order to do geospatial query  we need to first create/attribute an index to the field where the geospatial data that we are searching for is stored- so create index of startLocation
  //geospatial querying- In order to do geospatial query first we have create a index of geospatial data that is stored in this collection(startLocation)  based on which we are making query- here that is 'startLocation' so create a index of startLocation
  const tours = await Tour.find({
    //based on the startLocations we find all the tours using the geoJSON's $geoWithin operator which use circle defined by  $centerSphere operator which is an array of geoJSON location(array of lng and lat)((as center of circle) and radius in radians
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], raduisInRadians] },
    },
  }); //note in GeoJson location is alway in 'lng,lat' but not usual 'lat,lng'

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});
//--------------------------------------------------------

//---------------------------------------------------
exports.getDistances = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const distanceMultiplierValue = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide lattitude and longitude in the format lat,lng',
        400
      ) //400-bad request
    );
  }

  //using aggregate pipelining method first we calculate distance between each tour and our given location - then stores that value in  the newly created fild in each tour whose name is 'distance'(this is done by giving a name to  distanceField property in geoNear stage) then we limit the fields which we want to display in the output(toursWithDistnaceAndNameOnly),in the $project stage where we specify field names of tour which we only want in output by giving them value 1
  //note-if we use aggregate pipelining then it must have only on pipeline stage that is  $geoNear(excep $project stage -which is not a real pipelinestage it used to manipulate output data) and this $geoNear pipeline stage must be the first stage on that entire Model's aggregate pipiline(here-Tour Model)
  // if u get error as '$geoNear is only valid as the first stage in a pipeline.' then check whether u created a any aggegate pipeline stage in pre-doculment/query middleware on this Model which makes that stage first instead of this geospatial pipeline stage

  const toursWithDistnaceAndNameOnly = await Tour.aggregate([
    {
      $geoNear: {
        key: 'startLocation', //fied of tour to which we want to calculate distance from our given location
        near: {
          //geoJSON of the given location
          type: 'Point',
          coordinates: [lng * 1, lat * 1], //multiplied to convert them in Numbers
        },
        distanceField: 'distance', //gives in meters -we can convert to km or miles using 'distanceMultiplier' option
        distanceMultiplier: distanceMultiplierValue, //distanceMultiplie automatically multiplies the value in the 'distance' field of the tour.so here we multiplied with 0.0001 to convert it in
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    results: toursWithDistnaceAndNameOnly.length,
    data: {
      data: toursWithDistnaceAndNameOnly,
    },
  });
});
