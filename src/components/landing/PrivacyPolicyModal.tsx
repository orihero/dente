import React from 'react';
import { X } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';

interface PrivacyPolicyModalProps {
  showModal: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  showModal,
  onClose
}) => {
  const { language } = useLanguageStore();

  if (!showModal) return null;

  const content = language === 'uz' ? (
    <>
      <h2 className="text-2xl font-bold mb-6">Maxfiylik siyosati - Dente.uz</h2>
      <div className="space-y-6 text-gray-900">
        <div>
          <p className="text-sm text-gray-500">Amal qilish sanasi: 01.02.2025</p>
          <p className="text-sm text-gray-500">Oxirgi yangilanish: 01.02.2025</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">1. Kirish</h3>
          <p>Dente.uz sayti Empire Soft MChJ (ООО Empire Soft) tomonidan boshqariladi. Sizning maxfiyligingiz biz uchun muhim, shu sababli ushbu siyosat shaxsiy ma'lumotlaringizni qanday yig'ishimiz, ishlatishimiz va himoya qilishimiz haqida tushuntiradi.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">2. Biz qanday ma'lumotlarni yig'amiz?</h3>
          <p>Biz quyidagi ma'lumotlarni yig'amiz (faqat stomatologingiz tomonidan kiritiladi):</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-900">
            <li>Shaxsiy ma'lumotlar: Ism, telefon raqami, tug'ilgan sana, manzil, umumiy avatar.</li>
            <li>Foydalanish ma'lumotlari: Tayinlangan uchrashuvlar va bildirishnomalar bilan bog'liq ma'lumotlar.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">3. Ma'lumotlaringiz qanday ishlatiladi?</h3>
          <p>Siz haqingizdagi ma'lumotlar quyidagi maqsadlarda ishlatiladi:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-900">
            <li>Stomatologik uchrashuvlarni rejalashtirish va boshqarish.</li>
            <li>Uchrashuv va eslatmalar bo'yicha bildirishnomalarni yuborish.</li>
            <li>Stomatologingizdan retsept va tibbiy tavsiyalar olish.</li>
            <li>Tavsiya va sodiqlik dasturlari bo'yicha chegirmalar berish.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">4. Ma'lumotlarni uchinchi tomon bilan ulashish</h3>
          <p>Biz foydalanuvchi ma'lumotlarini hech kimga sotmaymiz va faqat Supabase orqali saqlaymiz.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">5. Ma'lumotlarni himoya qilish</h3>
          <p>Sizning ma'lumotlaringiz Supabase tomonidan himoyalangan va xavfsizlik choralari bilan qo'riqlanadi.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">6. Ma'lumotlarni saqlash va o'chirish</h3>
          <p>Foydalanuvchilar o'z ma'lumotlarini o'chirishni so'rashi mumkin. Buning uchun o'z stomatologiga murojaat qilishlari kerak.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">7. Yosh chegarasi yo'q</h3>
          <p>Dente.uz yosh chegarasiga ega emas. Barcha ma'lumotlar stomatologlar tomonidan kiritiladi, biz foydalanuvchilarning shaxsiy ma'lumotlarini bevosita yig'maymiz.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">8. Foydalanuvchi huquqlari</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-900">
            <li>Foydalanuvchilar o'z ma'lumotlariga kirish, o'zgartirish yoki o'chirish bo'yicha so'rov yuborishi mumkin.</li>
            <li>Bildirishnomalarni olishni bekor qilish stomatolog orqali amalga oshiriladi.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">9. O'zgarishlar</h3>
          <p>Ushbu Maxfiylik siyosati vaqti-vaqti bilan yangilanishi mumkin. O'zgarishlar platforma orqali xabar qilinadi.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">10. Bog'lanish uchun</h3>
          <p>Savollar bo'lsa, biz bilan bog'laning:</p>
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
      <h2 className="text-2xl font-bold mb-6">Политика конфиденциальности - Dente.uz</h2>
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-500">Дата вступления в силу: 01.02.2025</p>
          <p className="text-sm text-gray-500">Последнее обновление: 01.02.2025</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">1. Введение</h3>
          <p>Dente.uz управляется компанией ООО Empire Soft. Мы ценим вашу конфиденциальность и объясняем в этой политике, как мы собираем, используем и защищаем ваши персональные данные.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">2. Какие данные мы собираем?</h3>
          <p>Мы обрабатываем следующие данные (только внесенные вашим стоматологом):</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Персональные данные: Имя, номер телефона, дата рождения, адрес, публичный аватар.</li>
            <li>Данные об использовании: Запланированные приемы и уведомления.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">3. Как мы используем ваши данные?</h3>
          <p>Ваши данные используются для следующих целей:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Планирование и управление стоматологическими приемами.</li>
            <li>Отправка уведомлений о приеме и напоминаний.</li>
            <li>Выдача рецептов и медицинских рекомендаций от стоматолога.</li>
            <li>Скидки по программе лояльности и реферальной системе.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">4. Передача данных третьим лицам</h3>
          <p>Мы не передаем ваши данные третьим лицам, за исключением Supabase (хранение базы данных).</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">5. Защита данных</h3>
          <p>Ваши данные защищены стандартами безопасности Supabase.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">6. Хранение и удаление данных</h3>
          <p>Вы можете запросить удаление ваших данных через вашего стоматолога.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">7. Ограничения по возрасту</h3>
          <p>Dente.uz не имеет возрастных ограничений. Все данные вводятся стоматологами, и мы не собираем персональные данные напрямую.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">8. Права пользователей</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Вы можете запросить доступ, изменение или удаление данных через стоматолога.</li>
            <li>Уведомления можно отключить через стоматолога.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">9. Изменения</h3>
          <p>Мы можем периодически обновлять эту политику. Об изменениях будет сообщено на платформе.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">10. Контакты</h3>
          <p>По вопросам свяжитесь с нами:</p>
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
            {language === 'uz' ? 'Maxfiylik siyosati' : 'Политика конфиденциальности'}
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