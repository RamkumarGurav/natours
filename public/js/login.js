/* eslint-disable */
import axios from 'axios';
import { async } from 'regenerator-runtime';
import { showAlert } from './alerts';
//--------------------------------------------------------

//--------------LOGIN------------------------------------------
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login', //IMPwhen u host bothe api and website on same platform with same url we can use this type url which automatically converts to full url '<protoco/>://<host>/api/v1/users/login',// if api and fronten website have diff urls then u have to use full url of api here
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      //if request is successful ie login is successfull then  show alert and then go to home page after 1.5secs
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
//--------------------------------------------------------

//----------------LOGOUt----------------------------------------
export const logout = async () => {
  try {
    //when user hitts logout button it hits the 'logout' route of api which sends a normal jwt cookie with short lifetime and when page is reloaded again bowser send the previously stored cookie to server for verification and fails and gives error and when it gives error we move to next middleware where browser renders differnent page if it doesnt have user data
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    if (res.data.status === 'success') {
      //forcing to reload the current page from server so that when browser recieves new 'jwt' cookie with normal text other than token  it fails to login and then server renders the homepage
      location.reload(true); //truue reload from the server  which sends fresh page//and then moving to homepage
      location.assign('/');
    }
  } catch (err) {
    console.log(err);
    showAlert('err', 'Oops Error while Logging Out! Try again');
  }
};
//--------------------------------------------------------

//--------------------------------------------------------
