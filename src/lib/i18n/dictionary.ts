export type Locale = "uz" | "ru";

export const dictionaries = {
  uz: {
    // Umumiy
    "common.saqlash": "Saqlash",
    "common.saqlanmoqda": "Saqlanmoqda...",
    "common.bekorQilish": "Bekor qilish",
    "common.ochirish": "O'chirish",
    "common.tahrirlash": "Tahrirlash",
    "common.qoshish": "Qo'shish",
    "common.yuklanmoqda": "Yuklanmoqda...",
    "common.xatolikYuzBerdi": "Xatolik yuz berdi.",
    "common.qidirish": "Qidirish",
    "common.tasdiqlash": "Tasdiqlash",
    "common.hamYana": "ta yana...",

    // Navigatsiya (Sidebar)
    "nav.dashboard": "Boshqaruv paneli",
    "nav.kassa": "Sotuv / Kassa",
    "nav.mahsulotlar": "Mahsulotlar",
    "nav.ombor": "Ombor",
    "nav.xarajatlar": "Xarajatlar",
    "nav.hisobotlar": "Hisobotlar",
    "nav.xodimlar": "Xodimlar",
    "nav.sozlamalar": "Sozlamalar",

    // Topbar
    "topbar.xushKelibsiz": "Xush kelibsiz",
    "topbar.chiqish": "Chiqish",
    "topbar.platformaAdmin": "Platforma admin",

    // Admin sidebar
    "admin.nav.foydalanuvchilar": "Foydalanuvchilar",
    "admin.nav.dokonlar": "Do'konlar",
    "admin.nav.mahsulotlar": "Mahsulotlar",
    "admin.nav.dokonPanelgaQaytish": "Do'kon paneliga qaytish",
    "admin.sarlavha": "Platforma Admin",

    // Landing page
    "landing.platformaHaqida": "Platforma haqida",
    "landing.imkoniyatlar": "Imkoniyatlar",
    "landing.narxlar": "Narxlar",
    "landing.savolJavob": "Savol-javob",
    "landing.kirish": "Kirish",
    "landing.dokonOchish": "Do'kon ochish",
    "landing.headline1": "Do'koningizni",
    "landing.headline2": "oson boshqaring",
    "landing.subtitle": "Mahsulotlar, sotuvlar, ombor, xarajatlar va foydani bitta tizimda boshqaring.",

    // Auth
    "auth.royxatdanOtish": "Ro'yxatdan o'tish",
    "auth.royxatdanOtishTavsif": "Yangi hisob yarating va do'koningizni boshqarishni boshlang.",
    "auth.kirishSarlavha": "Tizimga kirish",
    "auth.kirishTavsif": "Hisobingizga kirib do'konlaringizni boshqaring.",
    "auth.ism": "Ism",
    "auth.familiya": "Familiya",
    "auth.email": "Email",
    "auth.telefon": "Telefon raqami",
    "auth.parol": "Parol",
    "auth.parolTasdiqlang": "Parolni tasdiqlang",
    "auth.identifikator": "Email yoki telefon raqami",
    "auth.parolniUnutdingizmi": "Parolni unutdingizmi?",
    "auth.hisobingizBormi": "Hisobingiz bormi?",
    "auth.hisobingizYoqmi": "Hisobingiz yo'qmi?",
    "auth.yuborilmoqda": "Yuborilmoqda...",
    "auth.tekshirilmoqda": "Tekshirilmoqda...",

    // Dashboard home
    "dash.bugungiSavdo": "Bugungi savdo",
    "dash.bugungiFoyda": "Bugungi foyda",
    "dash.bugungiXarajat": "Bugungi xarajat",
    "dash.bugungiSotuvlarSoni": "Bugungi sotuvlar soni",
    "dash.ombordagiMahsulotlar": "Ombordagi mahsulotlar",
    "dash.kamQolganMahsulotlar": "Kam qolgan mahsulotlar",
    "dash.tugaganMahsulotlar": "Tugagan mahsulotlar",
    "dash.songgiSavdo": "So'nggi 30 kunlik savdo va foyda",
    "dash.songgiSotuvlar": "So'nggi sotuvlar",
  },
  ru: {
    // Общие
    "common.saqlash": "Сохранить",
    "common.saqlanmoqda": "Сохранение...",
    "common.bekorQilish": "Отмена",
    "common.ochirish": "Удалить",
    "common.tahrirlash": "Редактировать",
    "common.qoshish": "Добавить",
    "common.yuklanmoqda": "Загрузка...",
    "common.xatolikYuzBerdi": "Произошла ошибка.",
    "common.qidirish": "Поиск",
    "common.tasdiqlash": "Подтвердить",
    "common.hamYana": "ещё...",

    // Навигация (боковое меню)
    "nav.dashboard": "Панель управления",
    "nav.kassa": "Продажа / Касса",
    "nav.mahsulotlar": "Товары",
    "nav.ombor": "Склад",
    "nav.xarajatlar": "Расходы",
    "nav.hisobotlar": "Отчёты",
    "nav.xodimlar": "Сотрудники",
    "nav.sozlamalar": "Настройки",

    // Верхняя панель
    "topbar.xushKelibsiz": "Добро пожаловать",
    "topbar.chiqish": "Выйти",
    "topbar.platformaAdmin": "Админ платформы",

    // Админ панель
    "admin.nav.foydalanuvchilar": "Пользователи",
    "admin.nav.dokonlar": "Магазины",
    "admin.nav.mahsulotlar": "Товары",
    "admin.nav.dokonPanelgaQaytish": "Вернуться в панель магазина",
    "admin.sarlavha": "Админ платформы",

    // Главная страница
    "landing.platformaHaqida": "О платформе",
    "landing.imkoniyatlar": "Возможности",
    "landing.narxlar": "Тарифы",
    "landing.savolJavob": "Вопрос-ответ",
    "landing.kirish": "Войти",
    "landing.dokonOchish": "Открыть магазин",
    "landing.headline1": "Управляйте своим",
    "landing.headline2": "магазином легко",
    "landing.subtitle": "Управляйте товарами, продажами, складом, расходами и прибылью в одной системе.",

    // Авторизация
    "auth.royxatdanOtish": "Регистрация",
    "auth.royxatdanOtishTavsif": "Создайте новый аккаунт и начните управлять своим магазином.",
    "auth.kirishSarlavha": "Вход в систему",
    "auth.kirishTavsif": "Войдите в свой аккаунт и управляйте магазинами.",
    "auth.ism": "Имя",
    "auth.familiya": "Фамилия",
    "auth.email": "Email",
    "auth.telefon": "Номер телефона",
    "auth.parol": "Пароль",
    "auth.parolTasdiqlang": "Подтвердите пароль",
    "auth.identifikator": "Email или номер телефона",
    "auth.parolniUnutdingizmi": "Забыли пароль?",
    "auth.hisobingizBormi": "Уже есть аккаунт?",
    "auth.hisobingizYoqmi": "Нет аккаунта?",
    "auth.yuborilmoqda": "Отправка...",
    "auth.tekshirilmoqda": "Проверка...",

    // Главная панель
    "dash.bugungiSavdo": "Продажи сегодня",
    "dash.bugungiFoyda": "Прибыль сегодня",
    "dash.bugungiXarajat": "Расходы сегодня",
    "dash.bugungiSotuvlarSoni": "Количество продаж сегодня",
    "dash.ombordagiMahsulotlar": "Товары на складе",
    "dash.kamQolganMahsulotlar": "Заканчивающиеся товары",
    "dash.tugaganMahsulotlar": "Закончившиеся товары",
    "dash.songgiSavdo": "Продажи и прибыль за последние 30 дней",
    "dash.songgiSotuvlar": "Последние продажи",
  },
} as const;

export type TranslationKey = keyof typeof dictionaries.uz;
