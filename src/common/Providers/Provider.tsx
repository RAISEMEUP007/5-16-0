import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StoreDetailsProvider } from './StoreDetailsProvider/StoreDetailsProvider';
import { CustomerReservationProvider } from './CustomerReservationProvider/CustomerReservationProvider';
import { CustomSnackbarProvider } from './SnackbarProvider/CustomSnackbarProvider';
import { CustomStripeProvider } from './CustomStripeProvider/CustomStripeProvider';

interface Props {
  children: React.ReactNode;
}

const Providers = ({ children }: Props) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <StoreDetailsProvider>
      <CustomerReservationProvider>
        <CustomSnackbarProvider>
          <CustomStripeProvider>
            {children}
          </CustomStripeProvider>
        </CustomSnackbarProvider>
      </CustomerReservationProvider>
    </StoreDetailsProvider>
  </LocalizationProvider>
);

export default Providers;
