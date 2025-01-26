// Helper function to get timezone offset in hours
const getTimezoneOffset = () => {
  return new Date().getTimezoneOffset() / 60;
};

// Format date with timezone consideration
export const formatDate = (date: Date, language: string) => {
  // Adjust for timezone
  const localDate = new Date(date.getTime() - (getTimezoneOffset() * 60 * 60 * 1000));
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC' // Use UTC to prevent double timezone adjustment
  };

  if (language === 'uz') {
    const months = {
      January: 'Yanvar',
      February: 'Fevral',
      March: 'Mart',
      April: 'Aprel',
      May: 'May',
      June: 'Iyun',
      July: 'Iyul',
      August: 'Avgust',
      September: 'Sentabr',
      October: 'Oktabr',
      November: 'Noyabr',
      December: 'Dekabr'
    };

    const weekdays = {
      Monday: 'Dushanba',
      Tuesday: 'Seshanba',
      Wednesday: 'Chorshanba',
      Thursday: 'Payshanba',
      Friday: 'Juma',
      Saturday: 'Shanba',
      Sunday: 'Yakshanba'
    };

    const formatted = new Intl.DateTimeFormat('en-US', options).format(localDate);
    let result = formatted;

    Object.entries(months).forEach(([en, uz]) => {
      result = result.replace(en, uz);
    });

    Object.entries(weekdays).forEach(([en, uz]) => {
      result = result.replace(en, uz);
    });

    return result;
  }

  return new Intl.DateTimeFormat('ru-RU', options).format(localDate);
};

// Format date and time with timezone consideration
export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  // Adjust for timezone
  const localDate = new Date(date.getTime() - (getTimezoneOffset() * 60 * 60 * 1000));
  
  return localDate.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC' // Use UTC to prevent double timezone adjustment
  }).replace(',', '');
};

// Format time with timezone consideration
export const formatTime = (dateString: string, language: string) => {
  const date = new Date(dateString);
  // Adjust for timezone
  const localDate = new Date(date.getTime() - (getTimezoneOffset() * 60 * 60 * 1000));
  
  return localDate.toLocaleTimeString(language === 'uz' ? 'uz-UZ' : 'ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC' // Use UTC to prevent double timezone adjustment
  });
};