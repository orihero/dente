import React from 'react';
import { X } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';

interface TermsOfUseModalProps {
  showModal: boolean;
  onClose: () => void;
}

export const TermsOfUseModal: React.FC<TermsOfUseModalProps> = ({
  showModal,
  onClose
}) => {
  const { language } = useLanguageStore();

  if (!showModal) return null;

  const content = language === 'uz' ? (
    <>
      <h2 className="text-2xl font-bold mb-6">Foydalanish shartlari - Dente.uz</h2>
      <div className="space-y-6 text-gray-900">
        <div>
          <p className="text-sm text-gray-500">Amal qilish sanasi: 01.02.2025</p>
          <p className="text-sm text-gray-500">Oxirgi yangilanish: 01.02.2025</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">1. Kirish</h3>
          <p>Dente.uz faqat stomatologlar uchun mo'ljallangan platformadir. Ushbu xizmatdan foydalanish orqali siz quyidagi shartlarga rozilik bildirasiz.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">2. Ro'yxatdan o'tish</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-900">
            <li>Foydalanuvchilar tizimga faqat stomatolog tomonidan taklif qilingandan so'ng kirishlari mumkin.</li>
            <li>Ro'yxatdan o'tish faqat Telegram bot orqali amalga oshiriladi.</li>
            <li>Ro'yxatdan o'tish uchun quyidagi ma'lumotlar talab qilinadi: Ism, telefon raqami, tug'ilgan sana, manzil.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">3. Xizmatlar</h3>
          <p>Dente.uz quyidagi xizmatlarni taqdim etadi:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-900">
            <li>Uchrashuvlarni rejalashtirish va boshqarish.</li>
            <li>Uchrashuv eslatmalarini yuborish.</li>
            <li>Stomatologik tavsiyalar va retseptlarni taqdim etish.</li>
            <li>Tavsiya va sodiqlik dasturlarini qo'llab-quvvatlash.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">4. To'lovlar va qaytarish</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-900">
            <li>To'lovlar faqat stomatologlarga tegishli.</li>
            <li>Barcha to'lovlar to'liq qaytarilishi mumkin va istalgan vaqtda qo'llab-quvvatlash jamoasiga murojaat qilish orqali amalga oshiriladi.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">5. Hisoblarni yopish</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-900">
            <li>Dente.uz to'lov amalga oshirilmagan yoki noto'g'ri foydalanish holatlarida stomatologning hisobini istalgan vaqtda yopish huquqiga ega.</li>
            <li>Stomatologlar istalgan vaqtda o'z hisoblarini yopish huquqiga ega.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">6. Mas'uliyatni cheklash</h3>
          <p>Dente.uz quyidagilar uchun javobgar emas:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-900">
            <li>Uchrashuvlarni o'tkazib yuborish yoki noto'g'ri ma'lumot kiritish.</li>
            <li>Telegram bot yoki SMS orqali yuborilgan noto'g'ri yoki noqonuniy xabarlar.</li>
            <li>Uchinchi tomon xizmatlarining nosozligi (masalan, Supabase).</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">7. Nizolarni hal qilish</h3>
          <p>Har qanday nizolar dastlab muzokaralar orqali hal qilinishi kerak. Agar kelishuvga erishilmasa, nizolar O'zbekiston qonunlari asosida hal qilinadi.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">8. O'zgarishlar</h3>
          <p>Dente.uz foydalanish shartlarini istalgan vaqtda o'zgartirish huquqiga ega. Foydalanuvchilarning platformadan foydalanishni davom ettirishi yangilangan shartlarga rozilik bildirganligini anglatadi.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">9. Bog'lanish uchun</h3>
          <ul className="mt-2 space-y-1 text-gray-900">
            <li>Email: support@dente.uz</li>
            <li>Telefon: +998 95 062 05 00</li>
            <li>Manzil: Samarqand, Mirzo Ulug'bek ko'chasi 140, O'zbekiston</li>
          </ul>
        </div>
      </div>
    </>
  ) : (
    <>
      <h2 className="text-2xl font-bold mb-6">Условия использования - Dente.uz</h2>
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-500">Дата вступления в силу: 01.02.2025</p>
          <p className="text-sm text-gray-500">Последнее обновление: 01.02.2025</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">1. Введение</h3>
          <p>Dente.uz — это платформа, предназначенная только для стоматологов. Используя данный сервис, вы соглашаетесь соблюдать следующие условия.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">2. Регистрация</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Доступ к системе возможен только по приглашению стоматолога.</li>
            <li>Регистрация возможна только через Telegram-бот.</li>
            <li>Для регистрации необходимо указать следующие данные: Имя, номер телефона, дата рождения, адрес.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">3. Услуги</h3>
          <p>Dente.uz предоставляет следующие услуги:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Планирование и управление стоматологическими приемами.</li>
            <li>Отправка уведомлений о запланированных приемах.</li>
            <li>Рекомендации и рецепты от стоматологов.</li>
            <li>Скидки по реферальной и программе лояльности.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">4. Платежи и возврат</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Платежи предназначены только для стоматологов.</li>
            <li>Все платежи полностью возвращаемые и могут быть возмещены в любое время по запросу в службу поддержки.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">5. Закрытие аккаунта</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Dente.uz оставляет за собой право закрыть аккаунт стоматолога в случае отсутствия платежей или нарушений правил.</li>
            <li>Стоматологи также могут в любое время закрыть свой аккаунт.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">6. Ограничение ответственности</h3>
          <p>Dente.uz не несет ответственности за:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Пропущенные приемы или некорректно введенные данные.</li>
            <li>Злоупотребление Telegram-ботом или SMS-сообщениями, включая отправку мошеннических или оскорбительных сообщений.</li>
            <li>Сбои в работе сторонних сервисов (например, Supabase).</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">7. Разрешение споров</h3>
          <p>Любые споры сначала должны решаться путем переговоров. Если стороны не достигнут соглашения, спор будет решаться в соответствии с законодательством Узбекистана.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">8. Изменения условий</h3>
          <p>Dente.uz оставляет за собой право вносить изменения в условия использования. Продолжение использования платформы означает согласие с обновленными условиями.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">9. Контакты</h3>
          <ul className="mt-2 space-y-1">
            <li>Email: support@dente.uz</li>
            <li>Телефон: +998 95 062 05 00</li>
            <li>Адрес: Самарканд, ул. Мирзо Улугбека 140, Узбекистан</li>
          </ul>
        </div>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {language === 'uz' ? 'Foydalanish shartlari' : 'Условия использования'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {content}
        </div>
      </div>
    </div>
  );
};