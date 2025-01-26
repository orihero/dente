import axios from 'axios';
import { config } from '../config/index.js';

interface SMSData {
  phone: string;
  text: string;
}

const SMS_API_URL = 'http://opersms.uz:8083';

export const sendSMS = async (data: SMSData) => {
  try {
    // Check if credentials are configured
    if (!config.sms.login || !config.sms.password) {
      console.error('SMS credentials are not configured');
      return;
    }

    // Normalize phone number - remove all non-digits and ensure it starts with 998
    const normalizedPhone = data.phone.replace(/\D/g, '');
    const phone = normalizedPhone.startsWith('998') ? normalizedPhone : `998${normalizedPhone}`;

    // Construct query parameters
    const params = new URLSearchParams({
      login: config.sms.login,
      password: config.sms.password,
      data: JSON.stringify([{
        phone,
        text: data.text
      }])
    });

    // Make the request
    const response = await axios.get(`${SMS_API_URL}?${params.toString()}`);

    // Log success for debugging
    console.log('SMS sent successfully:', {
      phone,
      result: response.data
    });

    return response.data;
  } catch (error) {
    // Log error but don't throw to prevent breaking the main flow
    console.error('Error sending SMS:', error);
    // Return silently to allow the main flow to continue
    return;
  }
};