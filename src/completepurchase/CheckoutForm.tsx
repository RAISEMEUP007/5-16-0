import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import dayjs from "dayjs";
import { useSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';

import { createReservation } from "../api/Product";
import { useCustomStripe } from "../common/Providers/CustomStripeProvider/UseCustomStripe";
import { useCustomerReservation } from "../common/Providers/CustomerReservationProvider/UseCustomerReservation";
import { useStoreDetails } from "../common/Providers/StoreDetailsProvider/UseStoreDetails";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const { enqueueSnackbar } = useSnackbar();
  const { clientSecret } = useCustomStripe();
  const [ isLoading, setIsLoading ] = useState(false);
  const { ReservationItems, ReservationMain } = useCustomerReservation();
  const { storeDetails } = useStoreDetails();
  
  const handleSubmit = async (e:any) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);
    
    if (!clientSecret) return;

    await stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      // console.log(paymentIntent);
      // if(!paymentIntent) return;
      // switch (paymentIntent.status) {
      //   case "succeeded":
      //     setMessage("Payment succeeded!");
      //     break;
      //   case "processing":
      //     setMessage("Your payment is processing.");
      //     break;
      //   case "requires_payment_method":
      //     setMessage("Your payment was not successful, please try again.");
      //     break;
      //   default:
      //     setMessage("Something went wrong.");
      //     break;
      // }
    });

    const forSavingOnDB = {
      start_date : ReservationMain.pickup,
      end_date : ReservationMain.dropoff,
      subtotal : ReservationMain.prices.subtotal,
      tax_rate : storeDetails.sales_tax,
      tax_amount : ReservationMain.prices,
      total_price: ReservationMain.prices.total,
      price_table_id: ReservationMain.price_table_id,
      stage : 2,
      items : ReservationItems,
    };
    await createReservation(forSavingOnDB);

    const currentURL = window.location.href;
    const url = new URL(currentURL);
    const protocol = url.protocol;
    const host = url.host;
    const fullHost = protocol + "//" + host; 

    setStorageValues();

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: fullHost + "/thankyou",
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      enqueueSnackbar(error.message as string, {
        variant: 'error',
        style: { width: '350px' },
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      })
      removeStorageValues();
    } else {
      enqueueSnackbar("An unexpected error occurred.", {
        variant: 'error',
        style: { width: '350px' },
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      })
      removeStorageValues();
    }

    setIsLoading(false);
  };

  const setStorageValues = () =>{
    localStorage.setItem('_r_name', ReservationMain.name);
    localStorage.setItem('_r_email', ReservationMain.email);
    localStorage.setItem('_r_pickup', dayjs(ReservationMain.pickup).format('MMMM DD, YYYY'));
    localStorage.setItem('_r_dropoff', dayjs(ReservationMain.dropoff).format('MMMM DD, YYYY'));
  }

  const removeStorageValues = () =>{
    localStorage.removeItem('_r_name');
    localStorage.removeItem('_r_email');
    localStorage.removeItem('_r_pickup');
    localStorage.removeItem('_r_dropoff');
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element"/>
      <LoadingButton 
        variant="contained"
        disabled={isLoading || !stripe || !elements}
        loading={isLoading}
        sx={{ mt: '20px', float:'right'}}
        onClick={handleSubmit}>
        {"Pay now"}
      </LoadingButton>
    </form>
  );
}