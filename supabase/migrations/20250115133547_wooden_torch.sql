/*
  # Add base categories and services
  
  1. New Data
    - Add service categories in Uzbek and Russian with UUID IDs
    - Add base services for each category
    - Set order for proper display
*/

DO $$ 
DECLARE
  terapiya_id UUID := gen_random_uuid();
  ortopediya_id UUID := gen_random_uuid();
  xirurgiya_id UUID := gen_random_uuid();
  ortodontiya_id UUID := gen_random_uuid();
  gnatologiya_id UUID := gen_random_uuid();
BEGIN
  -- Insert service categories
  INSERT INTO service_categories (id, name_uz, name_ru, color, "order") VALUES
    (terapiya_id, 'TERAPIYA', 'ТЕРАПИЯ', '#4F46E5', 1),
    (ortopediya_id, 'ORTOPEDIYA', 'ОРТОПЕДИЯ', '#059669', 2),
    (xirurgiya_id, 'XIRURGIYA', 'ХИРУРГИЯ', '#DC2626', 3),
    (ortodontiya_id, 'ORTODONTIYA', 'ОРТОДОНТИЯ', '#2563EB', 4),
    (gnatologiya_id, 'GNATOLOGIYA', 'ГНАТОЛОГИЯ', '#7C3AED', 5)
  ON CONFLICT DO NOTHING;

  -- Insert base services
  INSERT INTO base_services (category_id, name_uz, name_ru, "order") VALUES
    -- TERAPIYA / ТЕРАПИЯ
    (terapiya_id, 'Davolanggan tishlarni koplama (koronka)ga tayyorlash', 'Подготовка леченных зубов к коронке', 1),
    (terapiya_id, 'Plomba nuqsonlarini qayta tiklash (pulpit, periodontit)', 'Восстановление дефектов пломбы (пульпит, периодонтит)', 2),
    (terapiya_id, 'Restavratsiya qilish', 'Реставрация', 3),
    (terapiya_id, 'Vaqtinchalik plomba', 'Временная пломба', 4),
    (terapiya_id, 'Tishlarni ZOOM orqali oqartirish', 'Отбеливание зубов с помощью ZOOM', 5),
    (terapiya_id, 'Tish toshlarini professional tozalash va polirovka', 'Профессиональная чистка камней и полировка', 6),

    -- ORTOPEDIYA / ОРТОПЕДИЯ
    (ortopediya_id, 'Koronka (shtampovka, M.K., tsirkoniy, viner)', 'Коронка (штамповка, М.К., цирконий, винер)', 1),
    (ortopediya_id, 'To''liq yoki qisman tishsizlikni protezlash', 'Протезирование при полном или частичном отсутствии зубов', 2),
    (ortopediya_id, 'Implantdan keyin koronka qo''yish', 'Установка коронки на имплант', 3),

    -- XIRURGIYA / ХИРУРГИЯ
    (xirurgiya_id, 'Tish olish', 'Удаление зуба', 1),
    (xirurgiya_id, 'Murakkab olinadigan tishlarni olish', 'Удаление сложных зубов', 2),
    (xirurgiya_id, 'Tish olingandan keyingi nuqsonlarni bartaraf etish', 'Устранение дефектов после удаления зубов', 3),
    (xirurgiya_id, 'Tish implantatsiyasi o''rnatish', 'Установка дентального импланта', 4),

    -- ORTODONTIYA / ОРТОДОНТИЯ
    (ortodontiya_id, 'Breyketlar qo''yish', 'Установка брекетов', 1),

    -- GNATOLOGIYA / ГНАТОЛОГИЯ
    (gnatologiya_id, 'Umumiy', 'Общее', 1)
  ON CONFLICT DO NOTHING;
END $$;