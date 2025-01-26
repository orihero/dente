export const leadTemplates = {
  newLead: {
    uz: (data: {
      fullName: string;
      phone: string;
      email?: string;
      referredBy?: string;
      appointmentTime?: string;
    }) => {
      const parts = [
        `🎯 *Yangi so'rov*\n\n`,
        `*Ism:* ${data.fullName}\n`,
        `*Telefon:* ${data.phone}\n`,
        `*Email:* ${data.email || 'Ko\'rsatilmagan'}`
      ];

      if (data.referredBy) {
        parts.push(`\n*Yo'llagan shifokor:* ${data.referredBy}`);
      }

      if (data.appointmentTime) {
        parts.push(`\n*Qo'ng'iroq vaqti:* ${data.appointmentTime}`);
      }

      return parts.join('');
    },
    ru: (data: {
      fullName: string;
      phone: string;
      email?: string;
      referredBy?: string;
      appointmentTime?: string;
    }) => {
      const parts = [
        `🎯 *Новая заявка*\n\n`,
        `*Имя:* ${data.fullName}\n`,
        `*Телефон:* ${data.phone}\n`,
        `*Email:* ${data.email || 'Не указан'}`
      ];

      if (data.referredBy) {
        parts.push(`\n*Направивший врач:* ${data.referredBy}`);
      }

      if (data.appointmentTime) {
        parts.push(`\n*Время звонка:* ${data.appointmentTime}`);
      }

      return parts.join('');
    }
  }
};