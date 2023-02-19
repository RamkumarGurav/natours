/* eslint-disable */
// import '@babel/polyfill';it is depricated so use ''core-js/stable'' and 'regenerator-runtime/runtime' these makes the new js feature work in all the browsers
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';
import { displayMap } from './mapbox';
import { showAlert } from './alerts';
import { login, logout } from './login';
import { signup } from './signup';
import { createReview } from './review';
import {
  updateData,
  updateMyPassword,
  updateSettings,
  passwordReset,
  passwordResetEmail,
} from './updateSettings';
import { bookTour } from './stripe';
// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.loginForm');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const updateMyPasswordForm = document.querySelector('.form-update-password');
const signupForm = document.querySelector('.signupForm');
const resetPasswordBtn = document.querySelector('.btnn-reset-password');
const resetLinkBtn = document.querySelector('.btnn-reset-link');
const resetEmailForm = document.querySelector('.forgot-password-email-form');
const forgotPasswordForm = document.querySelector('.forgot-password-form');
const bookTourBtn = document.getElementById('book-tour');
const reviewForm = document.querySelector('.review-form');
const reviewSubmitBtn = document.querySelector('.btnn-review-submit');

//--------------------------------------------------------

//-------------Displaying Map----------------------------------
// DELEGATION
if (mapBox) {
  //if any page that contains mapBox then run this(to avoid errs)
  //getting locations that are present in tour-by storing them in dataset attribute of 'map' div in  'data-locations' and so that we can get in js file
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}
//--------------------------------------------------------

//---------LOGIN-------------------------
if (loginForm) {
  //if any page that contains  loginForm  then run this(to avoid errs)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //always read email and password here only
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
//--------------------------------------------------------

//--------LOGOUT------------------------------------------
if (logOutBtn) {
  //if there is a logoutBtn on the current page
  //then listen to click event on that logoutBtn when it is clicked then call the logout function which reloads page and goes to homepage
  logOutBtn.addEventListener('click', logout);
}

//--------------------------------------------------------

//----upbdating current user data by himself----------------
if (userDataForm) {
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // console.log('hellow from userDataform');
    //showing 'updating...'  after 'save settings' btn is clicked till page gives alert
    document.querySelector('.btnn-save-settings').innerHTML = 'Updating...';
    // The FormData interface provides a way to construct a set of key/value pairs representing form fields and their values, which can be sent using the fetch() or axios() method. It uses the same format a form would use if the encoding type were set to "multipart/form-data".//The content type "multipart/form-data" should be used for submitting forms that contain files, non-ASCII data, and binary data.//
    //multipart data -"one or more different sets of data are combined in a single body". So when photos and music are handled as multipart messages as mentioned in the question, probably there is some plain text metadata associated as well, thus making the request containing different types of data (binary, text), which implies the usage of multipart
    const form = new FormData(); //form object with encoding typeset to "multipart/form-data"(bcz files are multipart data)
    //creating a 'form' object from 'FormData' class that can be sent to the server via ajax call as 'data'
    //here we append(add) key(name of field of Model) and value(data we are uplaoding) of the uploading data
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]); //'.files[0] instead of 'value' is used because uplaaded files store inside the files array -here we uploade a single file -which is fist elemnt of the files array

    await updateData(form);
    // clearing the form after above function executes
    document.getElementById('name').value = ' ';
    document.getElementById('email').value = ' ';
    document.querySelector('.btnn-save-settings').innerHTML = 'save settings';
  });
}
//--------------------------------------------------------

//-----Updating password by Current user-------------------
if (updateMyPasswordForm) {
  updateMyPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    //showing 'updating...'  after 'save settings' btn is clicked till page gives alert
    document.querySelector('.btn-save-password').innerHTML = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateMyPassword(passwordCurrent, password, passwordConfirm);
    // clearing the form after above function executes
    document.getElementById('password-current').value = ' ';
    document.getElementById('password').value = ' ';
    document.getElementById('password-confirm').value = ' ';
    document.querySelector('.btn-save-password').innerHTML = 'save password';
  });
}
//--------------------------------------------------------

//------using merged function to bothe user updating his data &password updating---------------
// if (userDataForm) {
//   userDataForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//      //showing 'updating...'  after 'save settings' btn is clicked till page gives alert
// document.querySelector('.btnn-save-settings').innerHTML = 'Updating...';
// // The FormData interface provides a way to construct a set of key/value pairs representing form fields and their values, which can be sent using the fetch() or XMLHttpRequest.send() method. It uses the same format a form would use if the encoding type were set to "multipart/form-data".
//  const form=new FormData()
//  //creating a 'form' object from 'FormData' class that can be sent to the server via ajax call as 'data'
//  //here we append(add) key(name of field of Model) and value(data we are uplaoding) of the uploading data
//  form.append('name',document.getElementById('name').value)
//  form.append('email',document.getElementById('email').value)
//  form.append('photo',document.getElementById('photo').file)

//  await updateData(form,'data');
//  // clearing the form after above function executes
//  document.getElementById('name').value = ' ';
//  document.getElementById('email').value = ' ';
//  document.querySelector('.btnn-save-settings').innerHTML = 'save settings';
//   });
// }

// if (updateMyPasswordForm) {
//   updateMyPasswordForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const passwordCurrent = document.getElementById('password-current').value;
//     const password = document.getElementById('password').value;
//     const passwordConfirm = document.getElementById('password-confirm').value;
//     updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');
//   });
// }
//--------------------------------------------------------

//-------------SINGUP-------------------------------
if (signupForm) {
  //if any page that contains  signupForm  then run this(to avoid errs)
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btnn-signup').innerHTML = 'submitting...';

    //always read email and password here only
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const role = document.getElementById('role').value;
    const userData = { name, email, password, passwordConfirm, role };
    // console.log(userData);
    signup(userData);
    document.getElementById('name').value = ' ';
    document.getElementById('email').value = ' ';
    document.getElementById('password').value = ' ';
    document.getElementById('password-confirm').value = ' ';
    document.getElementById('role').value = ' ';
    document.querySelector('.btnn-signup').innerHTML = 'submit';
  });
}
//--------------------------------------------------------

//-----------FORGOT PASSWORD---------------------------------------
//---------Generating Reset Password Email-------------

if (resetEmailForm) {
  resetEmailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btnn-reset-link').textContent = 'Sending Email...';
    const email = document.getElementById('email').value;
    await passwordResetEmail(email);
    document.getElementById('email').value = '';
    document.querySelector('.btnn-reset-link').textContent =
      'get password reset link';
  });
}

//------------actual PasswordReset----------------------------

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    resetPasswordBtn.textContent = 'resetting...';
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const token = resetPasswordBtn.dataset.token;
    await passwordReset(password, passwordConfirm, token);
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    resetPasswordBtn.textContent = 'Reset Password';
  });
}
//--------------------------------------------------------

//-------Booking Tour------------------------------------
if (bookTourBtn) {
  bookTourBtn.addEventListener('click', (e) => {
    e.target.textContent = 'processing...';
    // const tourId = bookTourBtn.dataset.tourId;
    const tourId = e.target.dataset.tourId;
    bookTour(tourId);
  });
}

//--------------------------------------------------------

//-------creating a Review------------------------------------------
if (reviewForm) {
  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    reviewSubmitBtn.textContent = 'Submitting...';
    const review = document.getElementById('review').value;
    const rating = document.getElementById('rating').value;
    const tourId = reviewSubmitBtn.dataset.tourId;
    // console.log(tourId);
    await createReview(tourId, review, rating);
    document.getElementById('review').value = '';
    document.getElementById('rating').value = '';
    reviewSubmitBtn.textContent = 'Submit';
  });
}
