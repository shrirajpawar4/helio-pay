import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;

export const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });