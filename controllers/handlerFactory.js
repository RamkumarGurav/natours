/* eslint-disable import/no-useless-path-segments */
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
//--------------------------------------------------------

//--------------------------------------------------------
exports.deleteOne = function (Model) {
  //a function which has arguement Model return another function with arguements req,res,next so return funcion can access all 4 arguements Model,req,res,next
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      //throwing error if similar wrong id is searched in url
      return next(new AppError('No document found with that ID ', 404));
    }

    res.status(204).json({
      //204-no Data
      status: 'success',
      data: null,
    });
  });
};
//--------------------------------------------------------

//--------------------------------------------------------

exports.updateOne = function (Model) {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //it returns modified document rather than original
      runValidators: true, //running validators again during update(because builtin validators only run automatically for create method)
    });

    if (!doc) {
      //throwing error if similar wrong id is search in url
      return next(new AppError('No document found with that ID ', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};
//--------------------------------------------------------

//--------------------------------------------------------
// createOne is Not recommended for Security reasons
exports.createOne = function (Model) {
  return catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      //201-created
      status: 'success',
      data: {
        newDoc,
      },
    });
  });
};
//--------------------------------------------------------

//--------------------------------------------------------
exports.getOne = function (Model, populateOptions) {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const doc = await query; //bts:Tour.findOne({_id:req.params.id})//IMP populating the virtual field named as 'reviews' for getTour route only

    if (!doc) {
      //throwing error if similar wrong id is searched in url
      return next(new AppError('No document found with that ID ', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};
//--------------------------------------------------------

//--------------------------------------------------------
exports.getAll = function (Model) {
  return catchAsync(async (req, res, next) => {
    //---------to allow nested GET reviews on Tour----------------//
    //if there is a tourId then get all the corresponding review of that tour(for tour/:tourId/reveiew ) ,if ther is no tourId then get all the reviews in the DB(for api/v1/reviews)
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }
    //---------------------------//

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // const doc = await features.query.explain();//used for creating indexes
    const doc = await features.query;

    //SENDING RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
};
