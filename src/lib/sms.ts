import axios from 'axios';

interface SMSData {
  phone: string;
  text: string;
}

const SMS_API_URL = 'http://opersms.uz:8083';

export const sendSMS = async (data: SMSData) => {
  try {
    // Check if credentials are configured
    const login = import.meta.env.VITE_OPERSMS_LOGIN;
    const password = import.meta.env.VITE_OPERSMS_PASSWORD;

    if (!login || !password) {
      console.error('SMS credentials are not configured');
      return;
    }

    // Normalize phone number - remove all non-digits and ensure it starts with 998
    const normalizedPhone = data.phone.replace(/\D/g, '');
    const phone = normalizedPhone.startsWith('998') ? normalizedPhone : `998${normalizedPhone}`;

    // Construct data array
    const smsData = [{
      phone,
      text: data.text
    }];

    // Make the request
    const response = await axios.post(SMS_API_URL, {
      login,
      password,
      data: JSON.stringify(smsData)
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

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