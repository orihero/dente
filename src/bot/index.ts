import TelegramBot from 'node-telegram-bot-api';
import { config } from './config/index.js';
import { handleStart, handleLanguageSelection, handleContact, handleMessage } from './handlers/index.js';
import { handleCallbacks } from './handlers/callbacks.js';
import { setupLeadsSubscription } from './subscriptions/leads.js';
import { setupAppointmentsSubscription } from './subscriptions/appointments.js';
import { setupNotificationsSubscription } from './subscriptions/notifications.js';

// Initialize bot with token
const bot = new TelegramBot(config.telegram.token, { polling: true });

// Handle /start command
bot.onText(/\/start/, (msg) => handleStart(bot, msg));

// Handle language selection
bot.on('callback_query', (query) => {
  if (query.data?.startsWith('language_')) {
    handleLanguageSelection(bot, query);
  } else {
    handleCallbacks(bot, query);
  }
});

// Handle contact sharing
bot.on('contact', (msg) => handleContact(bot, msg));

// Handle text messages
bot.on('message', (msg) => {
  if (msg.text && !msg.text.startsWith('/')) {
    handleMessage(bot, msg);
  }
});

// Log bot startup
console.log('Bot started successfully');
console.log('Bot username:', bot.getMe().then(me => me.username));

// Setup subscriptions
setupLeadsSubscription(bot);
setupAppointmentsSubscription(bot);
setupNotificationsSubscription(bot);

export default bot;