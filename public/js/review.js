/* eslint-disable */
import axios from 'axios';
//--------------------------------------------------------

//-------------Creating Review-----------------------------
export const createReview = async (tourId, review, rating) => {
  try {
    // console.log(tourId, review, rating);
    const res = await axios({
      method: 'POST',
      url: `http://localhost:5000/api/v1/tours/${tourId}/reviews`,
      data: {
        review,
        rating,
      },
    });
    if (res.data.status === 'success') {
      //forcing to reload the current page from server so that when browser recieves new 'jwt' cookie with normal text other than token  it fails to login and then server renders the homepage
      location.reload(true); //truue reload from the server  which sends fresh page//and then moving to homepage
    }
  } catch (err) {
    console.log(err);
  }
};
