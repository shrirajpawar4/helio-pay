import dotenv from "dotenv";
import { bot } from "./config/bot";
import { startCommand } from "./commands/start";
import { buyCommand } from "./commands/buy";

dotenv.config();

startCommand(bot);
buyCommand(bot);