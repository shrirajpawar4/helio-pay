export interface User {
    telegramId: number;
    telegramUsername: string;
    email: string;
    points: number;
    purchaseHistory: Purchase[];
  }

export interface Purchase {
    id: string;
    amount: number;
    currency: string;
    timestamp: Date;
    status: 'pending' | 'completed' | 'failed';
}

export interface TilloConfig {
  apiKey: string;
  apiSecret: string;
  sector: string;
}

export interface GiftCardRequest {
  brand: string;
  value: number;
  currency: string;
}

export interface GiftCardResponse {
  code: string;
  status: string;
  message: string;
  data: {
    brand: string;
    url: string;
    face_value: {
      amount: number;
      currency: string;
    };
    cost_value: {
      amount: number;
      currency: string;
    };
    discount: number;
    expiration_date: string;
    reference: string;
    float_balance: {
      amount: number;
      currency: string;
    };
  };
}


