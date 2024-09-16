import axios from "axios";
import dotenv from "dotenv";
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const SECRET_API_KEY = process.env.SECRET_API_KEY as string;
const PUBLIC_API_KEY = process.env.PUBLIC_API_KEY as string;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, {polling: true});

export async function createPaylink(amount: number) {
  try {
    const result = await axios.post(
      `https://api.hel.io/v1/paylink/create/api-key`,
      {
        template: "OTHER", // Important that this is capitalized
        name: "api created paylink",
        price: Math.round(amount * 1000000).toString(), /* price is int64 represented by the base units of each currency, e.g. "price": "1000000" = 1 USDC*/
        pricingCurrency: "6340313846e4f91b8abc519b", // To get currency IDs, see the /get-currencies endpoint
        features: {},
        recipients: [
          {
            walletId: "66d189b66df8ec1f2c0696fc", // Change this to your wallet id
            currencyId: "6340313846e4f91b8abc519b", // To get currency IDs, see the /get-currencies endpoint
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${SECRET_API_KEY}`,
        },
        params: {
          apiKey: PUBLIC_API_KEY,
        },
      },
    );

    console.log(`https://hel.io/pay/${result.data.id}`);

    return(`https://hel.io/pay/${result.data.id}`);
  } catch (error: any) {
    console.error(
      `${error.response?.data?.code} ${error.response?.data?.message}`,
    );
  }
}

bot.onText(/\/start/, (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Please provide the USDC amount with /createpaylink:');
})

bot.onText(/\/createpaylink (.+)/, async (msg: TelegramBot.Message, match: RegExpExecArray | null) => {
  const chatId = msg.chat.id;
  const amount = parseFloat(match?.[1] || '');

  if (isNaN(amount) || amount <= 0) {
    bot.sendMessage(chatId, 'Please provide a valid positive number for the USDC amount.');
    return;
  }

  try {
    const paylink = await createPaylink(amount);
    bot.sendMessage(chatId, `Here's your payment link for ${amount} USDC: ${paylink}`);
  } catch (error) {
    const err = error as Error;
    bot.sendMessage(chatId, `Error: ${err.message}`);
  }
});

console.log('Telegram bot is running...');

// TELEGRAM_BOT_TOKEN=7384483226:AAEwpVZh9zgLMkLilCyqaXnha3_kp77_xXY
// PUBLIC_API_KEY=FDAtQCIH0qorOJRhQQFxzaEjE3HUJbSTPEl732WNkjrb5PK8OIjrjpOfFDZu6_pk
// SECRET_API_KEY=EMccjxD0uQqpe+hbGkNamkk2t1akBYVNd72vW9OuQhxZtcJZqXU7wi2zZy3e+tC9HdoRXQVmbvmBXGxvDwsFiIVOqsyChhYz+apiO8mHpDOdGFD5e4qxbG7tIdTV9Xua