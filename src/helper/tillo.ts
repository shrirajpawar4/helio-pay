import axios from 'axios';
import crypto from 'crypto';
import { TilloConfig, GiftCardRequest, GiftCardResponse } from '../types/index.types';
import axiosDebugLog from 'axios-debug-log';

const axiosInstance = axios.create()
axiosDebugLog({
    request: (debug, config) => {
      // You can add your custom logging logic here
      console.log('Request:', config);
    }
  }, );

const DIGITAL_ISSUE_ENDPOINT = 'https://sandbox.tillo.dev/api/v2/digital/issue';

const getAuthSignature = (config: TilloConfig, clientRequestID: string, brand: string, currency: string, value: number, timestamp: string): string => {
  return `${config.apiKey}-POST-digital-issue-${clientRequestID}-${brand}-${currency}-${value}-${timestamp}`;
};

const issueGiftCard = async (config: TilloConfig, request: GiftCardRequest): Promise<GiftCardResponse> => {
  const timestamp = new Date().getTime().toString();
  const clientRequestID = `req_${timestamp}`;

  const authSignature = getAuthSignature(config, clientRequestID, request.brand, request.currency, request.value, timestamp);
  const hashedSignature = crypto.createHmac('sha256', config.apiSecret).update(authSignature).digest('hex');

  const requestBody = {
    client_request_id: clientRequestID,
    brand: request.brand,
    face_value: {
      amount: request.value,
      currency: request.currency
    },
    delivery_method: 'url',
    fulfilment_by: 'partner',
    sector: 'crypto-currency'
  };

  const axiosConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: DIGITAL_ISSUE_ENDPOINT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'API-Key': config.apiKey,
      'Signature': hashedSignature,
      'Timestamp': timestamp
    },
    data: JSON.stringify(requestBody)
  };

  try {
    const response = await axiosInstance(axiosConfig);
    return response.data as GiftCardResponse;
  } catch (error: any) {
    if (error.response) {
      throw new Error(buildError(error.response.data));
    }
    throw error;
  }
};

const buildError = (errorObject: any): string => {
  return `
    ${errorObject.status}:
    code: ${errorObject.code}
    message: ${errorObject.message}
  `;
};

export { issueGiftCard, buildError };