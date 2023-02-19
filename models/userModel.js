const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
//--------------------------------------------------------

//--------------------------------------------------------
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide valid email'],
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
  },
  photo: {
    type:String,
    default:'default.jpg'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false, //not visible in the output only visible in DB
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //confirming password
      //custom validator which has this keyword only works on create() and save() methods
      validator: function (val) {
        //here val is passwordConfirm value
        return val === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date, //  date when password is changed/updated
  encryptedPasswordResetToken: String,
  passwordResetTokenExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false, //not visible in the output only visible in DB
  },
});
//-----------------------------------------------------------------

//--------------------------------------------------------
//--PASSWORD ENCRYPTINNG & REMOVING PASSWORDCONFIRM FIELD----------
//encrpting password and removing the passwordconfirm field in database using bcrptjs package Using document pre-save middleware-
//note that when you're using findAndUpdate() method, the pre-save hook/middleware is not triggered
userSchema.pre('save', async function (next) {
  //// Only run this function if password field was actually moddified(during password reset and password update) or created new(initial signup)(also it will  not run when other fields like name and emails are modified)
  //if password is not modified then dont encrypt password, move to next middleware
  //only encrpt passowrd and place undefine in passwordConfirm field When a new password is created or when it is updated
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12); //here 12 is castParameter which is best
  this.passwordConfirm = undefined; //removing the confirm field in database
  next();
});
//-----------------------------------------------------------------

//-----------------------------------------------------------------
//creating a common document method(also called as instance method) on all the documents of user collection-so that we can access isPasswordCorrect method whenever we get any user document
userSchema.methods.isPasswordCorrect = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword); //comparing un encrypted passowrd(candidate password) with encrpted password-in this bcrypt automatically encrypts candidatepassword and compares it with userpassword
};
//-----------------------------------------------------------------

//-----------------------------------------------------------------
userSchema.methods.isPasswordChangedAfterJwt = function (JWTTimestamp) {
  //every common document method(also called as instance method) has access to 'this' which gives the current document in that route
  if (this.passwordChangedAt) {
    const passwordChangedAtInSec = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    ); //converting date string into integer seconds ,bcz JWTTimestamp is always in seconds--parseInt(value,baseValue)
    // console.log(passwordChangedAtInSec, JWTTimestamp);
    //if date value is bigger then it means it is more recent date
    //here true means password is changed ,false meeans not changed
    return JWTTimestamp < passwordChangedAtInSec; //here if the passwordChangedAtInSec is bigger than  JWTTimestamp-means passwordChangedAtInSec is more recent date than JWTTimestamp -which means password is changed but token is still old one (no token generated for new password) so we need to login again//if the passwordChangedAtInSec is smaller than  JWTTimestamp-means passwordChangedAtInSec is more older date than JWTTimestamp -which means no new password is changed or created
  }
  //by default we return false
  //Here false means password is not changed after jwt is created
  return false;
};
//-----------------------------------------------------------------

//-----------------------------------------------------------------
//creating reset token - we store encrypted resetToken inside the database and send plain resetToken to user's email while resetting password we again encrpt users plain resetToken with the already storen encrpted resetToken
userSchema.methods.createPasswordResetToken = function () {
  //plain reset token
  const resetToken = crypto.randomBytes(32).toString('hex'); //creating 32 characters long random toke
  //encrypted reset token
  this.encryptedPasswordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000; //adding 10mins exporation time when resetToken is created//then resetToken is valid for 10mins

  // console.log(resetToken, this.encryptedPasswordResetToken);
  return resetToken; //we use this in forgotpassword middleware
};
//-----------------------------------------------------------------

//---------------------------------------------------------------
//------UPDATING PASSWORDCHANGEDAT---------------------------------
//document pre-save middle for updating passwordChangedAt property before saving the current document
userSchema.pre('save', function (next) {
  //if the password is not modified and entire document is newly created then move to next middleware else update the passwordChangedAt property
  if (!this.isModified('password') || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000; //giving 1sec delay becase jwt token are issued fastly sometimes before the saving of current document to the DB that may give errors thats why we give 1sec delayed time  topasswordChangedAt property
  next();
});
//--------------------------------------------------------

//--------------------------------------------------------
//query-pre-find middleware to allow only active documents to next query middleware(main query)-this makes only documents that are active are shown to users after every/any querying(beacuse this middle is added before all the find querys )
userSchema.pre(/^find/, function (next) {
  //run this code before all the queries which strrts with find word
  this.find({ active: true }); //here 'this'keywoed refers to initial query(current query)(here-User.find() -it runs before all the queries)
  next();
});
//--------------------------------------------------------

//--------------------------------------------------------
const User = mongoose.model('User', userSchema);

module.exports = User;
