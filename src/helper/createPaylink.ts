import axios, {AxiosError} from "axios";
import { url } from "inspector";

const SECRET_API_KEY = process.env.SECRET_API_KEY as string;
const PUBLIC_API_KEY = process.env.PUBLIC_API_KEY as string;
const API_BASE_URL = "https://api.dev.hel.io/v1";
const PAY_BASE_URL = "https://app.dev.hel.io/pay";

interface PaylinkResult {
  url: string;
  paylinkId: string;
  success: boolean;
  error?: string;
}

/**
 * Creates a paylink for a specified amount
 * @param amount - The amount in standard units (will be converted to base units)
 * @returns Promise containing the paylink URL and ID
 */
export async function createPaylink(amount: number): Promise<PaylinkResult> {
  if (!SECRET_API_KEY || !PUBLIC_API_KEY) {
    return {
      url: "",
      paylinkId: "",
      success: false,
      error: "API keys are not configured"
    };
  }

  try {
    const payload = {
      template: "OTHER",
      name: "api created paylink",
      price: Math.round(amount * 1000000).toString(),
      pricingCurrency: "63430c8348c610068bcdc482",
      features: {},
      recipients: [
        {
          walletId: "66d0d0a01e6233b7ef69fd58",
          currencyId: "63430c8348c610068bcdc482",
        }
      ],
    };

    const response = await axios.post(
      `${API_BASE_URL}/paylink/create/api-key`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${SECRET_API_KEY}`,
          'Content-Type': 'application/json'
        },
        params: {
          apiKey: PUBLIC_API_KEY,
        },
      }
    );

    const paylinkId = response.data.id;
    return {
      url: `${PAY_BASE_URL}/${paylinkId}`,
      paylinkId,
      success: true
    };

  } catch (error) {
    const axiosError = error as AxiosError;
    const errorMessage = axiosError.response?.data as any;

    console.error(
      `${errorMessage?.code} ${errorMessage?.message}`
    );

    return {
      url: "",
      paylinkId: "",
      success: false,
      error: errorMessage?.message || 'Failed to create paylink'
    };
  }
}