export const recordTemplates = {
  recipe: {
    uz: (data: {
      patientName: string;
      dentistName: string;
      diagnosis: string;
      recipe?: string;
      suggestions?: string;
      date: string;
    }) => {
      const parts = [
        `🦷 *Tibbiy yozuv*\n\n`,
        `Hurmatli *${data.patientName}*,\n`,
        `*${data.dentistName}* shifokor tomonidan *${data.date}* sanasida belgilangan davolanish bo'yicha ma'lumot:\n\n`,
        `*Tashxis:*\n${data.diagnosis}`
      ];

      if (data.recipe) {
        parts.push(`\n\n*Dori\\-darmonlar:*\n${data.recipe}`);
      }

      if (data.suggestions) {
        parts.push(`\n\n*Tavsiyalar:*\n${data.suggestions}`);
      }

      return parts.join('');
    },
    ru: (data: {
      patientName: string;
      dentistName: string;
      diagnosis: string;
      recipe?: string;
      suggestions?: string;
      date: string;
    }) => {
      const parts = [
        `🦷 *Медицинская запись*\n\n`,
        `Уважаемый\\(ая\\) *${data.patientName}*,\n`,
        `Информация о лечении, назначенном врачом *${data.dentistName}* *${data.date}*:\n\n`,
        `*Диагноз:*\n${data.diagnosis}`
      ];

      if (data.recipe) {
        parts.push(`\n\n*Лекарства:*\n${data.recipe}`);
      }

      if (data.suggestions) {
        parts.push(`\n\n*Рекомендации:*\n${data.suggestions}`);
      }

      return parts.join('');
    }
  }
};