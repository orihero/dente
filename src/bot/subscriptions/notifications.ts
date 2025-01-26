import { supabase } from '../services/supabase.js';
import { sendSMS } from '../services/sms.js';

export const setupNotificationsSubscription = (bot: any) => {
  console.log('Setting up Realtime subscription for notifications...');

  let retryCount = 0;
  const maxRetries = 3;
  const retryDelay = 5000; // 5 seconds

  const setupSubscription = () => {
    console.log(`Attempt ${retryCount + 1} to subscribe to notifications...`);

    const notificationsChannel = supabase.channel('notifications-channel')
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        async (payload: any) => {
          console.log('Received new notification:', payload.new);
          
          const notification = payload.new;
          
          try {
            // Handle different notification types
            switch (notification.type) {
              case 'sms':
                await handleSMSNotification(notification);
                break;
              case 'telegram':
                await handleTelegramNotification(notification, bot);
                break;
              default:
                console.error('Unknown notification type:', notification.type);
            }
          } catch (error) {
            console.error('Error handling notification:', error);
            
            // Update notification status to failed
            await supabase
              .from('notifications')
              .update({
                status: 'failed',
                error: error.message,
                updated_at: new Date().toISOString()
              })
              .eq('id', notification.id);
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('Error subscribing to notifications channel:', err);
          console.error('Error details:', err.message);
          
          // Try to reconnect if we haven't exceeded max retries
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying in ${retryDelay/1000} seconds...`);
            setTimeout(setupSubscription, retryDelay);
          } else {
            console.error('Max retries exceeded. Please check your Realtime configuration.');
          }
        } else {
          console.log('Successfully subscribed to notifications channel:', status);
          // Reset retry count on successful connection
          retryCount = 0;
        }
      });

    return notificationsChannel;
  };

  return setupSubscription();
};

// Helper function to handle SMS notifications
async function handleSMSNotification(notification: any) {
  try {
    // Send SMS
    await sendSMS({
      phone: notification.recipient,
      text: notification.message
    });

    // Update notification status to sent
    await supabase
      .from('notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', notification.id);
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    throw error;
  }
}

// Helper function to handle Telegram notifications
async function handleTelegramNotification(notification: any, bot: any) {
  try {
    // Send Telegram message with metadata if available
    const messageOptions: any = {
      parse_mode: 'MarkdownV2'
    };

    // Add inline keyboard if metadata exists
    if (notification.metadata && notification.metadata.inline_keyboard) {
      messageOptions.reply_markup = notification.metadata;
    }

    await bot.sendMessage(
      notification.recipient,
      notification.message,
      messageOptions
    );

    // Update notification status to sent
    await supabase
      .from('notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', notification.id);
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    throw error;
  }
}