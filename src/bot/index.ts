import TelegramBot from 'node-telegram-bot-api';
import { config } from './config/index.js';
import { handleStart, handleLanguageSelection, handleContact, handleMessage } from './handlers/index.js';
import { supabase } from './services/supabase.js';

// Initialize bot with token
const bot = new TelegramBot(config.telegram.token, { polling: true });

// Handle /start command
bot.onText(/\/start/, (msg) => handleStart(bot, msg));

// Handle language selection
bot.on('callback_query', (query) => {
  if (query.data?.startsWith('language_')) {
    handleLanguageSelection(bot, query);
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

// Subscribe to leads table changes
const leadsSubscription = supabase
  .channel('leads-channel')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'leads'
    },
    async (payload) => {
      const lead = payload.new;
      
      // Format message
      const message = formatLeadMessage(lead);
      
      try {
        // Send notification to the group
        await bot.sendMessage(-4606764266, message, { parse_mode: 'HTML' });
      } catch (error) {
        console.error('Error sending lead notification:', error);
      }
    }
  )
  .subscribe();

// Helper function to format lead message
function formatLeadMessage(lead: any) {
  const referralInfo = lead.referred_by 
    ? '\n<b>Referred by:</b> Dentist ID: ' + lead.referred_by
    : '';

  return `🎯 <b>New Lead</b>

<b>Name:</b> ${lead.full_name}
<b>Phone:</b> ${lead.phone}
<b>Email:</b> ${lead.email || 'Not provided'}${referralInfo}
<b>Status:</b> ${lead.status}
<b>Created at:</b> ${new Date(lead.created_at).toLocaleString('ru-RU')}`;
}

export default bot;