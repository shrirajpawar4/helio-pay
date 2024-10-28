import TelegramBot from "node-telegram-bot-api";
import { supabase } from "../config/supabase";

export const startCommand = (bot: TelegramBot) => {
    // Track chats waiting for email
    const awaitingEmail = new Set<number>();

    // Handle /start command
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        awaitingEmail.add(chatId);
        await bot.sendMessage(chatId, "Hello! Please send me your email address.");
    });

    // Handle all messages (for email processing)
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;

        // Only process if we're waiting for an email from this chat
        if (!awaitingEmail.has(chatId) || !msg.text) {
            return;
        }

        const email = msg.text.toLowerCase().trim();

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            await bot.sendMessage(chatId, "Invalid email format. Please try again.");
            return;
        }

        try {
            // Check if email already exists
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('email')
                .eq('email', email)
                .single();

            if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
                console.error('Database check error:', checkError);
                await bot.sendMessage(chatId, "Error checking database. Please try again later.");
                return;
            }

            if (existingUser) {
                awaitingEmail.delete(chatId);
                await bot.sendMessage(chatId, "You have already registered. Proceed to /buy.");
                return;
            }

            // Insert new user
            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    email: email,
                    telegramId: chatId,
                    telegramUsername: msg.from?.username,
                    points: 0
                });

            if (insertError) {
                console.error('Database insert error:', insertError);
                await bot.sendMessage(chatId, "Error registering email. Please try again later.");
                return;
            }

            // Success! Remove from waiting list and send confirmation
            awaitingEmail.delete(chatId);
            await bot.sendMessage(chatId, "Welcome! Procees to /buy");

        } catch (error) {
            console.error('Unexpected error:', error);
            await bot.sendMessage(chatId, "An error occurred. Please try again later.");
            awaitingEmail.delete(chatId);
        }
    });
};