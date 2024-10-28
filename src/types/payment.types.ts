export interface Currency {
    id: string;
    name?: string;
    decimals?: number;
    order?: number;
    mintAddress?: string;
    coinMarketCapId?: number;
    symbol?: string;
    symbolPrefix?: string;
    type?: string;
    iconUrl?: string;
    features?: string[];
    blockchain?: {
        id: string;
        engine: null;
    } | null;
}

export interface Wallet {
    id: string;
    name: string;
    btcProperties: null;
    blockchainEngine?: null;
}

export interface Creator {
    id: string;
    userType: string;
    isDisabled: boolean;
    kycVerified: boolean;
    platformDetails: {
        platform: string;
    };
}

export interface Company {
    id: string;
    escrowFunds: boolean;
    twitterConfirmed: boolean;
    kycVerified: boolean;
    kybVerified: boolean;
}

export interface Recipient {
    currency: Currency;
    wallet: Wallet;
}

export interface Features {
    canChangeQuantity: boolean;
    canChangePrice: boolean;
    requireQuantityLimits: boolean;
    requireCountry: boolean;
    requireEmail: boolean;
    requireDeliveryAddress: boolean;
    requireDiscordUsername: boolean;
    requireDiscordLogin: boolean;
    requireFullName: boolean;
    requirePhoneNumber: boolean;
    requireTwitterUsername: boolean;
    requireProductDetails: boolean;
    requireMaxTransactions: boolean;
    requireNftGate: boolean;
    requireDiscordAuth: boolean;
    requireAccessCode: boolean;
    requireXFollow: boolean;
    requireRaffle: boolean;
    splitRevenue: boolean;
    splitEqually: boolean;
    canSwapTokens: boolean;
    isHelioPlay: boolean;
    isTransparentWallet: boolean;
    nftDropEnabled: boolean;
    showDiscountCode: boolean;
    isEscrowed: boolean;
    requireAllowlist: boolean;
    requireTradingViewUsername: boolean;
    allowAffiliate: boolean;
    requireAirdrop: boolean;
    isEventEnabled: boolean;
    enableCountdown: boolean;
    requireCaptchaValidation: boolean;
    shouldRedirectOnSuccess: boolean;
}

export interface Paylink {
    id: string;
    platform: string;
    template: string;
    disabled: boolean;
    inactive: boolean;
    notifySenderByEmail: boolean;
    notifyReceiverByEmail: boolean;
    addDiscordRole: boolean;
    helioPlayProperties: null;
    features: Features;
    name: string;
    discordAuthDetails: any[];
    dynamic: boolean;
    affiliateDetails: null;
    price: string;
    normalizedPrice: string;
    content: Record<string, any>;
    creator: Creator;
    company: Company;
    currency: Currency;
    wallet: Wallet;
    recipients: Recipient[];
    volume: number;
    sales: string;
    product: null;
    discountCodes: any[];
    discordRoleIds: any[];
    pricingCurrency: Currency;
}

export interface TokenQuote {
    from: string;
    fromAmountDecimal: string;
    to: string;
    toAmountMinimal: string;
}

export interface Meta {
    id: string;
    amount: string;
    senderPK: string;
    recipientPK: string;
    transactionType: string;
    customerDetails: {
        discordUser: null;
    };
    productDetails: null;
    transactionSignature: string;
    transactionStatus: string;
    splitRevenue: boolean;
    remainingAccounts: any[];
    totalAmount: string;
    affiliateAmount: string;
    tokenQuote: TokenQuote;
    shopifyPaymentDetails: null;
    currency: Currency;
}

export interface PaymentResponse {
    id: string;
    paylinkId: string;
    fee: string;
    quantity: number;
    createdAt: string;
    paymentType: string;
    paylink: Paylink;
    meta: Meta;
    paymentRequestCreatorId: string;
    paymentRequestName: string;
    paymentRequestCurrencySymbol: string;
    paymentRequestBlockchain: string;
    refunds: any[];
}