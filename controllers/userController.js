/* eslint-disable no-unused-vars */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable no-lone-blocks */
/* eslint-disable node/no-unsupported-features/es-syntax */
const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const handlerFactory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
const { async } = require('regenerator-runtime');
//--------------------------------------------------------

//--------------------------------------------------------
exports.getAllUsers = handlerFactory.getAll(User);
// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   //EXECUTING QUERY
//   //passing query and queryString and createing features object which has all the query methods as one query
//   const features = new APIFeatures(User.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   //getting tours using all the methods that are in features object's "query" field
//   const users = await features.query;

//   //SENDING RESPONSE
//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: {
//       users,
//     },
//   });
// });
//--------------------------------------------------------

//--------------------------------------------------------
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This router is not yet defined.Please use Signup instead',
  });
};
//--------------------------------------------------------

//--------------------------------------------------------
//here we have used 'getMe' middleware to get loggedin users id from isRouteProtected middleware and set it as req.params.id so that it will work in next getUser middleware
exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};
exports.getUser = handlerFactory.getOne(User);
// exports.getUser = catchAsync(async (req, res, next) => {
//   const user = await User.findById(req.params.id);

//   if (!user) {
//     //throwing error if similar wrong id is searched in url
//     return next(new AppError('NO user found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       user,
//     },
//   });
// });
//--------------------------------------------------------

//------------------------------------------------------
//----------Multer middleware to store uploaded photo------------------
//step1a)creating multer storage with destination and filename(skip this if u wnat to resize ur photo)
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users'); //here didnt pass any errors we made error null here
//   },
//   filename: (req, file, cb) => {
//     //'user-739581ng18-28436502856'
//     const extentionType = file.mimetype.split('/')[1]; //which is 'jpg'
// A MIME type (now properly called "media type", but also sometimes "content type") is a string sent along with a file indicating the type of the file (describing the content format, for example, a sound file might be labeled audio/ogg , or an image file image/png ).
//     cb(null, `user-${req.user.id}-${Date.now()}.${extentionType}`);
//   },
// });
//step1b)storing uploaded file in buffer instead of file system
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
//step4)allowing multer for only one file in the 'photo' field of User Model//
// step5 will be using this middleware inside update me route
exports.uploadUserPhoto = upload.single('photo');
//--------------------------------------------------------
// step6) resizing and storing uploaded photo
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  //if there is no file on the request then move to next middleware (updateMe)
  if (!req.file) {
    return next();
  } //else below code

  //storing the filename on req.file.filename which is needed in the next updateMe controller
  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer) //passing the file to sharp that is stored on the buffer(temp memroy)
    .resize(500, 500) //width and height
    .toFormat('jpeg') //converting to jpeg format
    .jpeg({ quality: 90 }) //90% quality
    .toFile(`public/img/users/${req.file.filename}`); //saving file to filesystm

  next();
});
//-----------------------------------------------------------------

//--------------------UPDATE ME------------------------------------
//for updating loggedin users data
exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log('body', req.body);
  // console.log('file', req.file);
  //step1)Create error if user POSRTs password related data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates! Please use /updateMyPassword route',
        400
      ) //400-bad request
    );
  }
  //step2)updating the document
  const { name, email } = req.body; //allowing only specified fields to change/update -here only name and email//usign this fields create a filteredObj that only contains these fields
  const filteredBody = { name, email };
  if (req.file) {
    //if there is any file in the request
    filteredBody.photo = req.file.filename; //getting filename from previus uploadUserPhoto middleware
  }

  //AS1 - const filteredBody = filteredObj(req.body,"name","email")
  const modifiedUser = await User.findByIdAndUpdate(
    req.user._id,
    filteredBody,
    {
      new: true, //it returns modified document rather than original
      runValidators: true, //running validators again during update(because builtin validators only run automatically for create method)
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: modifiedUser,
    },
  });
});
//--------------------------------------------------------

//----------UPDATE USER BY ADMIN----------------------------------------------
///do not update passwords with this
exports.updateUser = handlerFactory.updateOne(User);
//--------------------------------------------------------

//----------Deleting user by current user------------------------
//current user deleting his account-actually making his account inactive(not visible to users)

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false }); //just update the active field
  res.status(204).json({
    //204-No content(deleted)
    status: 'success',
    data: null,
  });
});
//--------------------------------------------------------

//-------Deleting user by admin-------------------------------------------------
exports.deleteUser = handlerFactory.deleteOne(User);
// exports.deleteUser = catchAsync(async (req, res, next) => {
//   await User.findByIdAndDelete(req.user._id); //just update the active field
//   res.status(204).json({
//     //204-No content(deleted)
//     status: 'success',
//     data: null,
//   });
// });

//--------------------------------------------------------

//--------------------------------------------------------

//ALTERNATIVE SOULTIONS
//AS1)--------------------------------------------
// const filteredObj = (obj, ...allowedFields) => {
//   const newObj = {};
//   Object.keys(obj).forEach((el) => {
//     if (allowedFields.includes(el)) {
//       newObj[el] = obj[el];
//     }
//   });
//   return newObj;
// };
