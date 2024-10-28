import dotenv from "dotenv";
import { bot } from "../config/bot";
import { handleQuantitySelection } from "../helper/handleQuantity";
import { InlineKeyboardButton, InlineKeyboardMarkup } from 'node-telegram-bot-api';
import { createPaylink } from "../helper/createPaylink";
import TelegramBot from "node-telegram-bot-api";
import { issueGiftCard, buildError } from "../helper/tillo";
import { TilloConfig, GiftCardResponse, GiftCardRequest } from "../types/index.types";
import { checkPaymentStatus } from "../helper/checkPayment";

dotenv.config();

const config: TilloConfig = {
  apiKey: process.env.TILLO_API_KEY as string,
  apiSecret: process.env.TILLO_API_SECRET as string,
  sector: 'crypto-currency'
};


interface PendingTransaction {
  brand: string;
  amount: number;
  chatId: number;
  attempts: number;
}

const pendingTransactions = new Map<string, PendingTransaction>();

const MAX_CHECK_ATTEMPTS = 20;
const CHECK_INTERVAL = 5000;

async function checkPaymentComplete(paylinkId: string, transaction: PendingTransaction, bot: TelegramBot) {
  if (transaction.attempts >= MAX_CHECK_ATTEMPTS) {
    pendingTransactions.delete(paylinkId);
    await bot.sendMessage(transaction.chatId, 'Payment timeout. Please try again.');
    return;
  }

  try {
    const status = await checkPaymentStatus(paylinkId);
    const transactionStatus = status[0]?.meta?.transactionStatus;

    if (transactionStatus === 'SUCCESS') {
      // Process successful payment
      const giftCardRequest: GiftCardRequest = {
        brand: transaction.brand,
        value: transaction.amount,
        currency: 'GBP'
      };

      try {
        const giftCardResponse = await issueGiftCard(config, giftCardRequest);
        await bot.sendMessage(
          transaction.chatId,
          `Payment confirmed! Your gift card has been issued.\n` +
          `Access here: ${giftCardResponse.data.url}`
        );
      } catch (error: any) {
        await bot.sendMessage(
          transaction.chatId,
          `Payment received but gift card issuance failed. Please contact support.\nError: ${error.message}`
        );
      }

      pendingTransactions.delete(paylinkId);
    } else if (transactionStatus === 'FAILED') {
      await bot.sendMessage(transaction.chatId, 'Payment failed. Please try again.');
      pendingTransactions.delete(paylinkId);
    } else {
      // Payment still pending, schedule another check
      transaction.attempts++;
      setTimeout(() => checkPaymentComplete(paylinkId, transaction, bot), CHECK_INTERVAL);
    }
  } catch (error: any) {
    console.error('Error checking payment status:', error);
    // Continue checking despite error
    transaction.attempts++;
    setTimeout(() => checkPaymentComplete(paylinkId, transaction, bot), CHECK_INTERVAL);
  }
}

export const buyCommand = (bot: TelegramBot) => {
  bot.onText(/\/buy/, (msg) => {
    const chatId = msg.chat.id;
    const keyboard = {
      inline_keyboard: [
        [{ text: 'Buy Product', callback_data: 'buy_product' }],
        [{ text: 'Buy Gift Card', callback_data: 'buy_giftcard' }],
      ]
    };
    bot.sendMessage(chatId, 'Welcome! What would you like to do?', {
      reply_markup: keyboard
    });
  });

  bot.on('callback_query', async (query) => {
    if (!query.message) return;

    if (query.data === 'buy_giftcard') {
      const chatId = query.message.chat.id;
      const keyboard = {
        inline_keyboard: [
          [
            { text: 'Amazon', callback_data: 'giftcard_amazon' },
          ],

        ]
      };
      await bot.sendMessage(chatId, 'Select the brand of gift card:', {
        reply_markup: keyboard
      });
    }

    if (query.data?.startsWith('giftcard_')) {
      const brand = query.data.split('_')[1];
      const chatId = query.message.chat.id;
      await bot.sendMessage(chatId, `Please enter the amount for the ${brand} gift card in USDC:`);

      // Store the brand for this chat
      const messageHandler = async (msg: TelegramBot.Message) => {
        const amount = parseFloat(msg.text || '');
        if (isNaN(amount) || amount <= 0) {
          await bot.sendMessage(chatId, 'Please provide a valid positive number for the gift card amount.');
          return;
        }

        try {
          const paylink = await createPaylink(amount);
          if (!paylink.success || !paylink.paylinkId) {
            throw new Error(paylink.error || 'Failed to create payment link');
          }

          await bot.sendMessage(
            chatId,
            `Please complete the payment for your ${amount} GBP ${brand} gift card here:\n${paylink.url}\n\n`
          );

          // Store transaction details and start monitoring
          pendingTransactions.set(paylink.paylinkId, {
            brand,
            amount,
            chatId,
            attempts: 0
          });

          // Start checking payment status
          checkPaymentComplete(paylink.paylinkId, pendingTransactions.get(paylink.paylinkId)!, bot);

          // Remove this message handler
          bot.removeListener('message', messageHandler);
        } catch (error: any) {
          await bot.sendMessage(chatId, `Error creating payment: ${error.message}`);
          bot.removeListener('message', messageHandler);
        }
      };

      bot.on('message', messageHandler);
    }
  });
};