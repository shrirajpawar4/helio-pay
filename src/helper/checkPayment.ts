import axios, { AxiosError } from 'axios';

// Use template literals correctly with backticks
const CHECK_PAYMENT_STATUS_URL = `https://api.dev.hel.io/v1/transactions`;
const SECRET_API_KEY = process.env.SECRET_API_KEY as string;
const PUBLIC_API_KEY = process.env.PUBLIC_API_KEY as string;

interface PaymentStatusError {
  message: string;
  statusCode?: number;
  error?: any;
}

/**
 * Checks the payment status for a given paylinkId
 * @param paylinkId - The ID of the paylink to check
 * @returns Promise containing the payment status response
 * @throws PaymentStatusError if the request fails
 */
async function checkPaymentStatus(paylinkId: string) {
  if (!SECRET_API_KEY || !PUBLIC_API_KEY) {
    throw new Error('API keys are not configured');
  }

  try {
    const response = await axios.get(
      `${CHECK_PAYMENT_STATUS_URL}/${paylinkId}/transactions`,
      {
        headers: {
          'Authorization': `Bearer ${SECRET_API_KEY}`,
          'Content-Type': 'application/json'
        },
        params: {
          apiKey: PUBLIC_API_KEY,
        }
      }
    );

    console.log('Payment status response:', response.data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    const errorResponse: PaymentStatusError = {
      message: 'Failed to check payment status',
      statusCode: axiosError.response?.status,
      error: axiosError.response?.data
    };

    console.error('Error checking payment status:', errorResponse);
    throw errorResponse;
  }
}

export { checkPaymentStatus };