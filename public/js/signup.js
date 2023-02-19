/* eslint-disable */
import axios from 'axios';
import { async } from 'regenerator-runtime';
import { showAlert } from './alerts';
//--------------------------------------------------------

//--------------SIGNUP------------------------------------------
export const signup = async (userData) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:5000/api/v1/users/signup',
      data: userData,
    });

    if (res.data.status === 'success') {
      //if request is successful ie login is successfull then  show alert and then go to home page after 1.5secs
      showAlert('success', 'Account created successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
//--------------------------------------------------------
