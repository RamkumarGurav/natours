/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
//--------------------------------------------------------

//--------------------------------------------------------
export const updateData = async (data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updateMe',
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Data Updated Successfully');
      window.setTimeout(() => {
        location.assign('/me');
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};
//--------------------------------------------------------

//--------------------------------------------------------
export const updateMyPassword = async (
  passwordCurrent,
  password,
  passwordConfirm
) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updateMyPassword',
      data: {
        passwordCurrent,
        password,
        passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Password Changed Successfully');
      window.setTimeout(() => {
        location.assign('/me');
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};
//--------------------------------------------------------

//---we can merge above 2 functions----------------------
// export const updateSettings = async (data, type) => {
//   try {
//     const url =
//       type === 'password'
//         ? '/api/v1/users/updateMyPassword'
//         : '/api/v1/users/updateMe';
//     const res = await axios({
//       method: 'PATCH',
//       url: url,
//       data: data,
//     });
//     if (res.data.status === 'success') {
//       showAlert('success', `${type.toUpperCase()} updated Successfully`);
//       window.setTimeout(() => {
//         location.assign('/me');
//       }, 1500);
//     }
//   } catch (err) {
//     console.log(err);
//     showAlert('error', err.response.data.message);
//   }
// };
//--------------------------------------------------------
//---------Generating Reset Pawword Email-------------
export const passwordResetEmail = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/users/forgotPassword`,
      data: {
        email,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Password Reset Link sent to your Email');
      // window.setTimeout(() => {
      //   location.assign('/');
      // }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};
//--------------------------------------------------------

//------------actual PasswordReset----------------------------
export const passwordReset = async (password, passwordConfirm, token) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/resetPassword/${token}`,
      data: {
        password,
        passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Password Reset Successfully');
      window.setTimeout(() => {
        location.assign('/me');
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};
