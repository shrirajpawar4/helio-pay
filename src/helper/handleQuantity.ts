import { createPaylink } from "./createPaylink";
import { bot } from "../config/bot";

export async function handleQuantitySelection(chatId: number, quantity: number) {
    try {
      const paylink = await createPaylink(quantity);
      bot.sendMessage(chatId, `Please complete your payment of ${quantity} USDC:\n${paylink}`, {
        reply_markup: {
          inline_keyboard: [[{ text: 'Pay Now', url: paylink }]]
        }
      });
    } catch (error) {
      const err = error as Error;
      bot.sendMessage(chatId, `Error: ${err.message}`);
    }
  }