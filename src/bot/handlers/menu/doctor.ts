import { escape_markdown_v2 } from '../../utils/formatters.js';
import { supabase } from '../../services/supabase.js';

export const handleDoctorInfo = async (bot: any, chatId: number, patient: any, language: 'uz' | 'ru') => {
  console.log('👨‍⚕️ Showing doctor info...');
  
  if (!patient.dentist) {
    console.log('❌ No doctor info found');
    await bot.sendMessage(
      chatId,
      language === 'uz'
        ? 'Shifokor ma\'lumotlari topilmadi'
        : 'Информация о враче не найдена'
    );
    return;
  }

  try {
    // First get base services
    console.log('🔍 Fetching base services...');
    const { data: baseServices, error: baseError } = await supabase
      .from('base_services')
      .select(`
        id,
        name_uz,
        name_ru,
        category:service_categories (
          id,
          name_uz,
          name_ru,
          color
        )
      `)
      .order('order');

    if (baseError) {
      console.error('❌ Error fetching base services:', baseError);
      throw baseError;
    }

    // Then get dentist's services
    console.log('🔍 Fetching dentist services for dentist ID:', patient.dentist.id);
    const { data: dentistServices, error: servicesError } = await supabase
      .from('dentist_services')
      .select('*')
      .eq('dentist_id', patient.dentist.id)
      .order('created_at');

    if (servicesError) {
      console.error('❌ Error fetching dentist services:', servicesError);
      throw servicesError;
    }

    console.log('📊 Found dentist services:', dentistServices?.length || 0);

    // Combine services data
    const services = dentistServices?.map(ds => {
      const baseService = baseServices?.find(bs => bs.id === ds.base_service_id);
      if (!baseService) return null;
      return {
        ...ds,
        base_service: baseService
      };
    }).filter(Boolean);

    console.log('📊 Combined services:', services?.length || 0);

    // Group services by category
    const servicesByCategory = services?.reduce((acc: any, service: any) => {
      const categoryId = service.base_service.category.id;
      if (!acc[categoryId]) {
        acc[categoryId] = {
          category: service.base_service.category,
          services: []
        };
      }
      acc[categoryId].services.push(service);
      return acc;
    }, {});

    // Format services text
    let servicesText = '';
    if (servicesByCategory) {
      servicesText = '\n\n💼 *' + escape_markdown_v2(language === 'uz' ? 'Xizmatlar' : 'Услуги') + '*';
      Object.values(servicesByCategory).forEach((group: any) => {
        servicesText += `\n\n_${escape_markdown_v2(language === 'uz' ? group.category.name_uz : group.category.name_ru)}_`;
        group.services.forEach((service: any) => {
          servicesText += `\n• *${escape_markdown_v2(language === 'uz' ? service.base_service.name_uz : service.base_service.name_ru)}*`;
          servicesText += `\n  💰 *${escape_markdown_v2(service.price.toLocaleString())} UZS*`;
          servicesText += `\n  ⏱ ${escape_markdown_v2(service.duration)}`;
          if (service.warranty) {
            servicesText += `\n  🛡 ${escape_markdown_v2(service.warranty)}`;
          }
          servicesText += '\n';
        });
      });
    }

    // Format clinic info
    const clinicInfo = patient.dentist.clinic
      ? `\n\n🏥 *${escape_markdown_v2(language === 'uz' ? 'Klinika' : 'Клиника')}*\n` +
        `*${escape_markdown_v2(language === 'uz' ? 'Nomi' : 'Название')}:* ${escape_markdown_v2(language === 'uz' ? patient.dentist.clinic.name_uz : patient.dentist.clinic.name_ru)}\n` +
        `*${escape_markdown_v2(language === 'uz' ? 'Manzil' : 'Адрес')}:* ${escape_markdown_v2(language === 'uz' ? patient.dentist.clinic.address_uz : patient.dentist.clinic.address_ru)}` +
        (patient.dentist.clinic.phone_numbers?.length 
          ? `\n*${escape_markdown_v2(language === 'uz' ? 'Telefon' : 'Телефон')}:* ${patient.dentist.clinic.phone_numbers.map(phone => escape_markdown_v2(phone)).join(', ')}` 
          : '') +
        (patient.dentist.clinic.working_hours 
          ? `\n*${escape_markdown_v2(language === 'uz' ? 'Ish vaqti' : 'Рабочее время')}:*\n` +
            Object.entries(patient.dentist.clinic.working_hours)
              .filter(([_, hours]) => hours !== null)
              .map(([day, hours]: [string, any]) => {
                const dayName = {
                  monday: language === 'uz' ? 'Dushanba' : 'Понедельник',
                  tuesday: language === 'uz' ? 'Seshanba' : 'Вторник',
                  wednesday: language === 'uz' ? 'Chorshanba' : 'Среда',
                  thursday: language === 'uz' ? 'Payshanba' : 'Четверг',
                  friday: language === 'uz' ? 'Juma' : 'Пятница',
                  saturday: language === 'uz' ? 'Shanba' : 'Суббота',
                  sunday: language === 'uz' ? 'Yakshanba' : 'Воскресенье'
                }[day];
                return `  ${escape_markdown_v2(dayName)}: ${escape_markdown_v2(hours.open)} \\- ${escape_markdown_v2(hours.close)}`;
              })
              .join('\n')
          : '')
      : '';

    // Format social media links
    const socialMediaText = patient.dentist.social_media?.platforms?.length
      ? '\n\n🔗 *' + escape_markdown_v2(language === 'uz' ? 'Ijtimoiy tarmoqlar' : 'Социальные сети') + '*\n' +
        patient.dentist.social_media.platforms
          .map((platform: any) => 
            `• [${escape_markdown_v2(platform.platform)}](${escape_markdown_v2(platform.url)})`
          )
          .join('\n')
      : '';

    // Send photo if exists
    if (patient.dentist.photo_url) {
      console.log('🖼️ Sending doctor photo with info');
      await bot.sendPhoto(
        chatId,
        patient.dentist.photo_url,
        {
          caption: `👨‍⚕️ *${escape_markdown_v2(language === 'uz' ? 'Shifokor ma\'lumotlari' : 'Информация о враче')}*\n\n` +
            `*${escape_markdown_v2(language === 'uz' ? 'Ism' : 'Имя')}:* ${escape_markdown_v2(patient.dentist.full_name)}` +
            (patient.dentist.phone ? `\n*${escape_markdown_v2(language === 'uz' ? 'Telefon' : 'Телефон')}:* ${escape_markdown_v2(patient.dentist.phone)}` : '') +
            clinicInfo +
            socialMediaText +
            servicesText,
          parse_mode: 'MarkdownV2'
        }
      );
    } else {
      console.log('📝 Sending doctor info without photo');
      await bot.sendMessage(
        chatId,
        `👨‍⚕️ *${escape_markdown_v2(language === 'uz' ? 'Shifokor ma\'lumotlari' : 'Информация о враче')}*\n\n` +
        `*${escape_markdown_v2(language === 'uz' ? 'Ism' : 'Имя')}:* ${escape_markdown_v2(patient.dentist.full_name)}` +
        (patient.dentist.phone ? `\n*${escape_markdown_v2(language === 'uz' ? 'Telefon' : 'Телефон')}:* ${escape_markdown_v2(patient.dentist.phone)}` : '') +
        clinicInfo +
        socialMediaText +
        servicesText,
        { parse_mode: 'MarkdownV2' }
      );
    }
  } catch (error) {
    console.error('❌ Error handling doctor info:', error);
    await bot.sendMessage(
      chatId,
      language === 'uz'
        ? 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
        : 'Произошла ошибка. Пожалуйста, попробуйте позже.'
    );
  }
};