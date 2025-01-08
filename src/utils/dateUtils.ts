export const formatDate = (date: Date, language: string) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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

    const formatted = new Intl.DateTimeFormat('en-US', options).format(date);
    let result = formatted;

    Object.entries(months).forEach(([en, uz]) => {
      result = result.replace(en, uz);
    });

    Object.entries(weekdays).forEach(([en, uz]) => {
      result = result.replace(en, uz);
    });

    return result;
  }

  return new Intl.DateTimeFormat('ru-RU', options).format(date);
};

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(',', '');
};

export const formatTime = (dateString: string, language: string) => {
  return new Date(dateString).toLocaleTimeString(language === 'uz' ? 'uz-UZ' : 'ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};