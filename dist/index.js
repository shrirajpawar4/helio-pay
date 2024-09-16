"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
dotenv_1.default.config();
const SECRET_API_KEY = "mevFScoWcQtEdwtNokq8QmE/FaU5PweYWAmIJHj6YPjSWB00RTRqTcOvROs2SyFkFzbuLFyrXRVricVy6IkuLzAAQLFBtGv0dLxnMHZTT5r6P4mJNabKZh/LHtg3OSW3";
const PUBLIC_API_KEY = "psfilL5ygpCdWD8hy7D1FF5SjQClZ.EKgxYPvZ27_cAeWrLGM_cv4~ZqL_hB50ya";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new node_telegram_bot_api_1.default(TELEGRAM_BOT_TOKEN, { polling: true });
function createPaylink(amount) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const payLinkRequest = {
                template: "OTHER",
                name: "Telegram Bot Created Paylink",
                price: Math.round(amount * 1000000).toString(), // Convert USDC to base units (6 decimal places)
                pricingCurrency: "6340313846e4f91b8abc519b", // USDC currency ID
                features: {},
                recipients: [
                    {
                        walletId: "66d189b66df8ec1f2c0696fc", // Change this to your wallet id
                        currencyId: "6340313846e4f91b8abc519b", // USDC currency ID
                    },
                ],
            };
            const result = yield axios_1.default.post(`https://api.hel.io/v1/paylink/create/api-key`, payLinkRequest, {
                headers: {
                    Authorization: `Bearer ${SECRET_API_KEY}`,
                },
                params: {
                    apiKey: PUBLIC_API_KEY,
                },
            });
            return `https://hel.io/pay/${result.data.id}`;
        }
        catch (error) {
            const axiosError = error;
            console.log((_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.data);
            throw new Error("Error creating paylink");
        }
    });
}
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Please provide the USDC amount with /createpaylink:');
});
bot.onText(/\/createpaylink (.+)/, (msg, match) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = msg.chat.id;
    const amount = parseFloat((match === null || match === void 0 ? void 0 : match[1]) || '');
    if (isNaN(amount) || amount <= 0) {
        bot.sendMessage(chatId, 'Please provide a valid positive number for the USDC amount.');
        return;
    }
    try {
        const paylink = yield createPaylink(amount);
        bot.sendMessage(chatId, `Here's your payment link for ${amount} USDC: ${paylink}`);
    }
    catch (error) {
        const err = error;
        bot.sendMessage(chatId, `Error: ${err.message}`);
    }
}));
console.log('Telegram bot is running...');
