/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51McTEySCJPc5Ykk3JHYunC9jtkmPFDskUjxObsW4QLy5rppW2ER1bnsaLaxTZValgL2eWfIZnQEKe7CHHq89AlPc00314PZsTZ'
);//here 'Stripe' has capital S

export const bookTour = async (tourId) => {
  try {
    //step1)Get checkout session from API
    const session = await axios(
      `http://localhost:5000/api/v1/bookings/checkout-session/${tourId}`
    );
    // console.log(session);
    //step2)Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
