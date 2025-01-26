import { supabase } from '../services/supabase.js';
import { defaultTemplates } from './templates/defaultTemplates.js';
import { escape_markdown_v2 } from '../utils/formatters.js';

export const setupLeadsSubscription = (bot: any) => {
  console.log('Setting up Realtime subscription for leads...');

  const leadsChannel = supabase.channel('leads-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'leads'
      },
      async (payload) => {
        console.log('Received new lead:', payload.new);
        
        const lead = payload.new;
        
        try {
          // Get project settings for group chat ID
          const { data: settings, error: settingsError } = await supabase
            .from('project_settings')
            .select('telegram_group_chat_id')
            .single();

          if (settingsError) throw settingsError;

          // Prepare variables with escaped values
          const variables = {
            fullName: escape_markdown_v2(lead.full_name),
            phone: escape_markdown_v2(lead.phone),
            email: lead.email ? escape_markdown_v2(lead.email) : undefined,
            referredBy: lead.referred_by ? escape_markdown_v2(lead.referred_by) : undefined,
            appointmentTime: lead.appointment_time ? 
              escape_markdown_v2(new Date(lead.appointment_time).toLocaleString('ru-RU')) : undefined
          };

          // Send to group chat if configured
          if (settings?.telegram_group_chat_id) {
            try {
              console.log(`Sending notification to group chat (${settings.telegram_group_chat_id})...`);
              
              // Send in both languages
              await bot.sendMessage(
                settings.telegram_group_chat_id, 
                defaultTemplates.leads.newLead.uz(variables),
                { parse_mode: 'MarkdownV2' }
              );

              await bot.sendMessage(
                settings.telegram_group_chat_id, 
                defaultTemplates.leads.newLead.ru(variables),
                { parse_mode: 'MarkdownV2' }
              );

              console.log('Successfully sent notifications to group chat');
            } catch (error) {
              console.error('Error sending notification to group chat:', error);
            }
          }

          // Also send to individual admin chats
          const { data: adminDentists, error: dentistsError } = await supabase
            .from('dentists')
            .select('telegram_bot_chat_id, full_name')
            .eq('type', 'admin')
            .eq('telegram_bot_registered', true)
            .not('telegram_bot_chat_id', 'is', null);

          if (dentistsError) throw dentistsError;

          if (!adminDentists || adminDentists.length === 0) {
            console.log('No admin dentists found with telegram bot enabled');
            return;
          }

          // Send to each admin's private chat
          for (const admin of adminDentists) {
            try {
              console.log(`Sending notification to admin ${admin.full_name} (${admin.telegram_bot_chat_id})...`);
              
              await bot.sendMessage(
                admin.telegram_bot_chat_id, 
                defaultTemplates.leads.newLead.uz(variables),
                { parse_mode: 'MarkdownV2' }
              );
              
              await bot.sendMessage(
                admin.telegram_bot_chat_id, 
                defaultTemplates.leads.newLead.ru(variables),
                { parse_mode: 'MarkdownV2' }
              );

              console.log(`Successfully sent notifications to admin ${admin.full_name}`);
            } catch (error) {
              console.error(`Error sending lead notification to admin ${admin.full_name}:`, error);
            }
          }
        } catch (error) {
          console.error('Error handling lead notification:', error);
        }
      }
    )
    .subscribe();

  return leadsChannel;
};