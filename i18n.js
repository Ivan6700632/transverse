/* ======================================================================
 * InkWave — i18n.js : мова інтерфейсу (UA, EN, DE, PL, ES, ZH, HI)
 *
 * Як це працює: сайт написано українською. Цей файл перекладає всі видимі
 * тексти, підказки та повідомлення на обрану мову, не змінюючи решту коду.
 * Нові тексти додаються у словник DICT нижче (ключ — український текст).
 * Тексти, яких немає у словнику (назви книг, коментарі, адмін-панель),
 * залишаються без змін.
 * ====================================================================== */
(function () {
    'use strict';

    const LANGS = [
        { code: 'uk', label: 'UA', name: 'Українська' },
        { code: 'en', label: 'EN', name: 'English' },
        { code: 'de', label: 'DE', name: 'Deutsch' },
        { code: 'pl', label: 'PL', name: 'Polski' },
        { code: 'es', label: 'ES', name: 'Español' },
        { code: 'zh', label: 'ZH', name: '中文' },
        { code: 'hi', label: 'HI', name: 'हिन्दी' }
    ];
    const STORAGE_KEY = 'transverse_lang';

    // ---------------------------------------------------------------- СЛОВНИК
    const DICT = {
 "Пошук (назва, ім'я, прізвище)...": {
  "en": "Search (title, first name, last name)...",
  "de": "Suche (Titel, Vorname, Nachname)...",
  "pl": "Szukaj (tytuł, imię, nazwisko)...",
  "es": "Buscar (título, nombre, apellido)...",
  "zh": "搜索（书名、名、姓）...",
  "hi": "खोजें (शीर्षक, नाम, उपनाम)..."
 },
 "Очистити пошук": {
  "en": "Clear search",
  "de": "Suche löschen",
  "pl": "Wyczyść wyszukiwanie",
  "es": "Borrar búsqueda",
  "zh": "清除搜索",
  "hi": "खोज साफ़ करें"
 },
 "Мої списки читання": {
  "en": "My reading lists",
  "de": "Meine Leselisten",
  "pl": "Moje listy czytelnicze",
  "es": "Mis listas de lectura",
  "zh": "我的阅读列表",
  "hi": "मेरी पठन सूचियाँ"
 },
 "📖 Мої списки читання": {
  "en": "📖 My reading lists",
  "de": "📖 Meine Leselisten",
  "pl": "📖 Moje listy czytelnicze",
  "es": "📖 Mis listas de lectura",
  "zh": "📖 我的阅读列表",
  "hi": "📖 मेरी पठन सूचियाँ"
 },
 "🏆 Рейтинг": {
  "en": "🏆 Ranking",
  "de": "🏆 Rangliste",
  "pl": "🏆 Ranking",
  "es": "🏆 Ranking",
  "zh": "🏆 排行榜",
  "hi": "🏆 रैंकिंग"
 },
 "Рейтинг та топ книг": {
  "en": "Ranking and top books",
  "de": "Rangliste und Top-Bücher",
  "pl": "Ranking i najlepsze książki",
  "es": "Ranking y mejores libros",
  "zh": "排行榜与热门书籍",
  "hi": "रैंकिंग और शीर्ष पुस्तकें"
 },
 "📝 Заявка": {
  "en": "📝 Request",
  "de": "📝 Anfrage",
  "pl": "📝 Zgłoszenie",
  "es": "📝 Solicitud",
  "zh": "📝 申请",
  "hi": "📝 अनुरोध"
 },
 "Скарги та пропозиції": {
  "en": "Complaints and suggestions",
  "de": "Beschwerden und Vorschläge",
  "pl": "Skargi i propozycje",
  "es": "Quejas y sugerencias",
  "zh": "投诉与建议",
  "hi": "शिकायतें और सुझाव"
 },
 "📬 Скринька (": {
  "en": "📬 Mailbox (",
  "de": "📬 Postfach (",
  "pl": "📬 Skrzynka (",
  "es": "📬 Buzón (",
  "zh": "📬 信箱 (",
  "hi": "📬 मेलबॉक्स ("
 },
 "Поштова скринька": {
  "en": "Mailbox",
  "de": "Postfach",
  "pl": "Skrzynka pocztowa",
  "es": "Buzón",
  "zh": "信箱",
  "hi": "मेलबॉक्स"
 },
 "📬 Поштова скринька": {
  "en": "📬 Mailbox",
  "de": "📬 Postfach",
  "pl": "📬 Skrzynka pocztowa",
  "es": "📬 Buzón",
  "zh": "📬 信箱",
  "hi": "📬 मेलबॉक्स"
 },
 "⬇️ Встановити": {
  "en": "⬇️ Install",
  "de": "⬇️ Installieren",
  "pl": "⬇️ Zainstaluj",
  "es": "⬇️ Instalar",
  "zh": "⬇️ 安装",
  "hi": "⬇️ इंस्टॉल करें"
 },
 "Встановити сайт як додаток": {
  "en": "Install the site as an app",
  "de": "Website als App installieren",
  "pl": "Zainstaluj stronę jako aplikację",
  "es": "Instalar el sitio como aplicación",
  "zh": "将网站安装为应用",
  "hi": "साइट को ऐप के रूप में इंस्टॉल करें"
 },
 "Змінити тему": {
  "en": "Change theme",
  "de": "Design wechseln",
  "pl": "Zmień motyw",
  "es": "Cambiar tema",
  "zh": "切换主题",
  "hi": "थीम बदलें"
 },
 "👤 Увійти": {
  "en": "👤 Log in",
  "de": "👤 Anmelden",
  "pl": "👤 Zaloguj się",
  "es": "👤 Iniciar sesión",
  "zh": "👤 登录",
  "hi": "👤 लॉग इन करें"
 },
 "Ви увійшли як: {0}": {
  "en": "Signed in as: {0}",
  "de": "Angemeldet als: {0}",
  "pl": "Zalogowano jako: {0}",
  "es": "Sesión iniciada como: {0}",
  "zh": "当前用户：{0}",
  "hi": "आप इस रूप में लॉग इन हैं: {0}"
 },
 "Усі": {
  "en": "All",
  "de": "Alle",
  "pl": "Wszystkie",
  "es": "Todos",
  "zh": "全部",
  "hi": "सभी"
 },
 "Фентезі": {
  "en": "Fantasy",
  "de": "Fantasy",
  "pl": "Fantasy",
  "es": "Fantasía",
  "zh": "奇幻",
  "hi": "फ़ैंटेसी"
 },
 "Романтика": {
  "en": "Romance",
  "de": "Liebesroman",
  "pl": "Romans",
  "es": "Romance",
  "zh": "言情",
  "hi": "रोमांस"
 },
 "Жахи": {
  "en": "Horror",
  "de": "Horror",
  "pl": "Horror",
  "es": "Terror",
  "zh": "恐怖",
  "hi": "हॉरर"
 },
 "Наукова фантастика": {
  "en": "Science fiction",
  "de": "Science-Fiction",
  "pl": "Science fiction",
  "es": "Ciencia ficción",
  "zh": "科幻",
  "hi": "विज्ञान कथा"
 },
 "Детектив": {
  "en": "Detective",
  "de": "Krimi",
  "pl": "Kryminał",
  "es": "Policíaco",
  "zh": "侦探",
  "hi": "जासूसी"
 },
 "Пригоди": {
  "en": "Adventure",
  "de": "Abenteuer",
  "pl": "Przygodowe",
  "es": "Aventuras",
  "zh": "冒险",
  "hi": "साहसिक"
 },
 "Історичний": {
  "en": "Historical",
  "de": "Historisch",
  "pl": "Historyczne",
  "es": "Histórico",
  "zh": "历史",
  "hi": "ऐतिहासिक"
 },
 "Манґа": {
  "en": "Manga",
  "de": "Manga",
  "pl": "Manga",
  "es": "Manga",
  "zh": "漫画",
  "hi": "मांगा"
 },
 "Манхва": {
  "en": "Manhwa",
  "de": "Manhwa",
  "pl": "Manhwa",
  "es": "Manhwa",
  "zh": "韩漫",
  "hi": "मानह्वा"
 },
 "Українська література": {
  "en": "Ukrainian literature",
  "de": "Ukrainische Literatur",
  "pl": "Literatura ukraińska",
  "es": "Literatura ucraniana",
  "zh": "乌克兰文学",
  "hi": "यूक्रेनी साहित्य"
 },
 "Комікси": {
  "en": "Comics",
  "de": "Comics",
  "pl": "Komiksy",
  "es": "Cómics",
  "zh": "连环画",
  "hi": "कॉमिक्स"
 },
 "❤️ Улюблені": {
  "en": "❤️ Favorites",
  "de": "❤️ Favoriten",
  "pl": "❤️ Ulubione",
  "es": "❤️ Favoritos",
  "zh": "❤️ 收藏",
  "hi": "❤️ पसंदीदा"
 },
 "✨ Усі жанри (загальний топ)": {
  "en": "✨ All genres (overall top)",
  "de": "✨ Alle Genres (Gesamtrangliste)",
  "pl": "✨ Wszystkie gatunki (ranking ogólny)",
  "es": "✨ Todos los géneros (top general)",
  "zh": "✨ 全部类型（总榜）",
  "hi": "✨ सभी शैलियाँ (कुल शीर्ष)"
 },
 "Fantasy": {
  "en": "Fantasy",
  "de": "Fantasy",
  "pl": "Fantasy",
  "es": "Fantasía",
  "zh": "奇幻",
  "hi": "फ़ैंटेसी",
  "uk": "Фентезі"
 },
 "Romance": {
  "en": "Romance",
  "de": "Liebesroman",
  "pl": "Romans",
  "es": "Romance",
  "zh": "言情",
  "hi": "रोमांस",
  "uk": "Романтика"
 },
 "Horror": {
  "en": "Horror",
  "de": "Horror",
  "pl": "Horror",
  "es": "Terror",
  "zh": "恐怖",
  "hi": "हॉरर",
  "uk": "Жахи"
 },
 "Sci-Fi": {
  "en": "Science fiction",
  "de": "Science-Fiction",
  "pl": "Science fiction",
  "es": "Ciencia ficción",
  "zh": "科幻",
  "hi": "विज्ञान कथा",
  "uk": "Наукова фантастика"
 },
 "Detective": {
  "en": "Detective",
  "de": "Krimi",
  "pl": "Kryminał",
  "es": "Policíaco",
  "zh": "侦探",
  "hi": "जासूसी",
  "uk": "Детектив"
 },
 "Adventure": {
  "en": "Adventure",
  "de": "Abenteuer",
  "pl": "Przygodowe",
  "es": "Aventuras",
  "zh": "冒险",
  "hi": "साहसिक",
  "uk": "Пригоди"
 },
 "Historical": {
  "en": "Historical",
  "de": "Historisch",
  "pl": "Historyczne",
  "es": "Histórico",
  "zh": "历史",
  "hi": "ऐतिहासिक",
  "uk": "Історичний"
 },
 "Manga": {
  "en": "Manga",
  "de": "Manga",
  "pl": "Manga",
  "es": "Manga",
  "zh": "漫画",
  "hi": "मांगा",
  "uk": "Манґа"
 },
 "Manhwa": {
  "en": "Manhwa",
  "de": "Manhwa",
  "pl": "Manhwa",
  "es": "Manhwa",
  "zh": "韩漫",
  "hi": "मानह्वा",
  "uk": "Манхва"
 },
 "Ukrainian": {
  "en": "Ukrainian literature",
  "de": "Ukrainische Literatur",
  "pl": "Literatura ukraińska",
  "es": "Literatura ucraniana",
  "zh": "乌克兰文学",
  "hi": "यूक्रेनी साहित्य",
  "uk": "Українська література"
 },
 "Comics": {
  "en": "Comics",
  "de": "Comics",
  "pl": "Komiksy",
  "es": "Cómics",
  "zh": "连环画",
  "hi": "कॉमिक्स",
  "uk": "Комікси"
 },
 "Сортувати:": {
  "en": "Sort by:",
  "de": "Sortieren:",
  "pl": "Sortuj:",
  "es": "Ordenar:",
  "zh": "排序：",
  "hi": "क्रमबद्ध करें:"
 },
 "🆕 Нові": {
  "en": "🆕 Newest",
  "de": "🆕 Neueste",
  "pl": "🆕 Najnowsze",
  "es": "🆕 Más recientes",
  "zh": "🆕 最新",
  "hi": "🆕 नवीनतम"
 },
 "🔥 Популярні (за лайками)": {
  "en": "🔥 Popular (by likes)",
  "de": "🔥 Beliebt (nach Likes)",
  "pl": "🔥 Popularne (wg polubień)",
  "es": "🔥 Populares (por me gusta)",
  "zh": "🔥 热门（按点赞）",
  "hi": "🔥 लोकप्रिय (लाइक के अनुसार)"
 },
 "⭐ За оцінкою": {
  "en": "⭐ By rating",
  "de": "⭐ Nach Bewertung",
  "pl": "⭐ Wg oceny",
  "es": "⭐ Por valoración",
  "zh": "⭐ 按评分",
  "hi": "⭐ रेटिंग के अनुसार"
 },
 "🔤 За назвою (А–Я)": {
  "en": "🔤 By title (A–Z)",
  "de": "🔤 Nach Titel (A–Z)",
  "pl": "🔤 Wg tytułu (A–Z)",
  "es": "🔤 Por título (A–Z)",
  "zh": "🔤 按书名（A–Z）",
  "hi": "🔤 शीर्षक के अनुसार (A–Z)"
 },
 "Умови, конфіденційність, контакти": {
  "en": "Terms, privacy, contacts",
  "de": "Bedingungen, Datenschutz, Kontakt",
  "pl": "Regulamin, prywatność, kontakt",
  "es": "Términos, privacidad, contacto",
  "zh": "条款、隐私、联系方式",
  "hi": "शर्तें, गोपनीयता, संपर्क"
 },
 "📜 Умови, конфіденційність, контакти": {
  "en": "📜 Terms, privacy, contacts",
  "de": "📜 Bedingungen, Datenschutz, Kontakt",
  "pl": "📜 Regulamin, prywatność, kontakt",
  "es": "📜 Términos, privacidad, contacto",
  "zh": "📜 条款、隐私、联系方式",
  "hi": "📜 शर्तें, गोपनीयता, संपर्क"
 },
 "Фільтруйте бібліотеку за вашим статусом читання:": {
  "en": "Filter the library by your reading status:",
  "de": "Filtern Sie die Bibliothek nach Ihrem Lesestatus:",
  "pl": "Filtruj bibliotekę według statusu czytania:",
  "es": "Filtra la biblioteca según tu estado de lectura:",
  "zh": "按您的阅读状态筛选书库：",
  "hi": "अपनी पठन स्थिति के अनुसार लाइब्रेरी फ़िल्टर करें:"
 },
 "📂 Усі книжки бібліотеки": {
  "en": "📂 All library books",
  "de": "📂 Alle Bücher der Bibliothek",
  "pl": "📂 Wszystkie książki w bibliotece",
  "es": "📂 Todos los libros de la biblioteca",
  "zh": "📂 书库中的全部书籍",
  "hi": "📂 लाइब्रेरी की सभी पुस्तकें"
 },
 "📖 Читаю": {
  "en": "📖 Reading",
  "de": "📖 Ich lese",
  "pl": "📖 Czytam",
  "es": "📖 Leyendo",
  "zh": "📖 在读",
  "hi": "📖 पढ़ रहा हूँ"
 },
 "🕒 Буду читати": {
  "en": "🕒 Plan to read",
  "de": "🕒 Möchte ich lesen",
  "pl": "🕒 Chcę przeczytać",
  "es": "🕒 Quiero leer",
  "zh": "🕒 想读",
  "hi": "🕒 पढ़ने की योजना"
 },
 "✅ Прочитано": {
  "en": "✅ Finished",
  "de": "✅ Gelesen",
  "pl": "✅ Przeczytane",
  "es": "✅ Leído",
  "zh": "✅ 已读",
  "hi": "✅ पढ़ लिया"
 },
 "❌ Прибрати статус": {
  "en": "❌ Remove status",
  "de": "❌ Status entfernen",
  "pl": "❌ Usuń status",
  "es": "❌ Quitar estado",
  "zh": "❌ 清除状态",
  "hi": "❌ स्थिति हटाएँ"
 },
 "📖 Статус твору": {
  "en": "📖 Book status",
  "de": "📖 Buchstatus",
  "pl": "📖 Status książki",
  "es": "📖 Estado del libro",
  "zh": "📖 作品状态",
  "hi": "📖 पुस्तक की स्थिति"
 },
 "Статус читання твору": {
  "en": "Reading status",
  "de": "Lesestatus",
  "pl": "Status czytania",
  "es": "Estado de lectura",
  "zh": "阅读状态",
  "hi": "पठन स्थिति"
 },
 "Закрити": {
  "en": "Close",
  "de": "Schließen",
  "pl": "Zamknij",
  "es": "Cerrar",
  "zh": "关闭",
  "hi": "बंद करें"
 },
 "Скасувати": {
  "en": "Cancel",
  "de": "Abbrechen",
  "pl": "Anuluj",
  "es": "Cancelar",
  "zh": "取消",
  "hi": "रद्द करें"
 },
 "Зрозуміло": {
  "en": "Got it",
  "de": "Verstanden",
  "pl": "Rozumiem",
  "es": "Entendido",
  "zh": "知道了",
  "hi": "समझ गया"
 },
 "← Назад до бібліотеки": {
  "en": "← Back to library",
  "de": "← Zurück zur Bibliothek",
  "pl": "← Wróć do biblioteki",
  "es": "← Volver a la biblioteca",
  "zh": "← 返回书库",
  "hi": "← लाइब्रेरी पर वापस"
 },
 "← Назад": {
  "en": "← Back",
  "de": "← Zurück",
  "pl": "← Wstecz",
  "es": "← Atrás",
  "zh": "← 返回",
  "hi": "← वापस"
 },
 "Менший шрифт": {
  "en": "Smaller font",
  "de": "Kleinere Schrift",
  "pl": "Mniejsza czcionka",
  "es": "Fuente más pequeña",
  "zh": "缩小字体",
  "hi": "छोटा फ़ॉन्ट"
 },
 "Більший шрифт": {
  "en": "Larger font",
  "de": "Größere Schrift",
  "pl": "Większa czcionka",
  "es": "Fuente más grande",
  "zh": "放大字体",
  "hi": "बड़ा फ़ॉन्ट"
 },
 "🔖 Закладка": {
  "en": "🔖 Bookmark",
  "de": "🔖 Lesezeichen",
  "pl": "🔖 Zakładka",
  "es": "🔖 Marcador",
  "zh": "🔖 书签",
  "hi": "🔖 बुकमार्क"
 },
 "🔖 Главу збережено": {
  "en": "🔖 Chapter saved",
  "de": "🔖 Kapitel gespeichert",
  "pl": "🔖 Rozdział zapisany",
  "es": "🔖 Capítulo guardado",
  "zh": "🔖 章节已保存",
  "hi": "🔖 अध्याय सहेजा गया"
 },
 "Розгорнути вікно книги": {
  "en": "Expand book window",
  "de": "Buchfenster vergrößern",
  "pl": "Rozwiń okno książki",
  "es": "Ampliar ventana del libro",
  "zh": "展开书籍窗口",
  "hi": "पुस्तक विंडो बड़ी करें"
 },
 "Розгорнути вікно": {
  "en": "Expand window",
  "de": "Fenster vergrößern",
  "pl": "Rozwiń okno",
  "es": "Ampliar ventana",
  "zh": "展开窗口",
  "hi": "विंडो बड़ी करें"
 },
 "🗑️ Видалити твір": {
  "en": "🗑️ Delete book",
  "de": "🗑️ Werk löschen",
  "pl": "🗑️ Usuń utwór",
  "es": "🗑️ Eliminar obra",
  "zh": "🗑️ 删除作品",
  "hi": "🗑️ कृति हटाएँ"
 },
 "Обкладинка": {
  "en": "Cover",
  "de": "Cover",
  "pl": "Okładka",
  "es": "Portada",
  "zh": "封面",
  "hi": "आवरण"
 },
 "Назва": {
  "en": "Title",
  "de": "Titel",
  "pl": "Tytuł",
  "es": "Título",
  "zh": "书名",
  "hi": "शीर्षक"
 },
 "Жанр • Переклад": {
  "en": "Genre • Translation",
  "de": "Genre • Übersetzung",
  "pl": "Gatunek • Tłumaczenie",
  "es": "Género • Traducción",
  "zh": "类型 • 翻译",
  "hi": "शैली • अनुवाद"
 },
 "Опис...": {
  "en": "Description...",
  "de": "Beschreibung...",
  "pl": "Opis...",
  "es": "Descripción...",
  "zh": "简介...",
  "hi": "विवरण..."
 },
 "Опис відсутній.": {
  "en": "No description.",
  "de": "Keine Beschreibung.",
  "pl": "Brak opisu.",
  "es": "Sin descripción.",
  "zh": "暂无简介。",
  "hi": "कोई विवरण नहीं।"
 },
 "Поділитися книгою": {
  "en": "Share the book",
  "de": "Buch teilen",
  "pl": "Udostępnij książkę",
  "es": "Compartir libro",
  "zh": "分享这本书",
  "hi": "पुस्तक साझा करें"
 },
 "🔗 Поділитися": {
  "en": "🔗 Share",
  "de": "🔗 Teilen",
  "pl": "🔗 Udostępnij",
  "es": "🔗 Compartir",
  "zh": "🔗 分享",
  "hi": "🔗 साझा करें"
 },
 "🚩 Поскаржитися": {
  "en": "🚩 Report",
  "de": "🚩 Melden",
  "pl": "🚩 Zgłoś",
  "es": "🚩 Denunciar",
  "zh": "🚩 举报",
  "hi": "🚩 रिपोर्ट करें"
 },
 "Поскаржитися на твір": {
  "en": "Report this book",
  "de": "Werk melden",
  "pl": "Zgłoś utwór",
  "es": "Denunciar la obra",
  "zh": "举报该作品",
  "hi": "इस कृति की रिपोर्ट करें"
 },
 "⭐ Загальна оцінка книги:": {
  "en": "⭐ Overall book rating:",
  "de": "⭐ Gesamtbewertung des Buchs:",
  "pl": "⭐ Ogólna ocena książki:",
  "es": "⭐ Valoración general del libro:",
  "zh": "⭐ 本书总评分：",
  "hi": "⭐ पुस्तक की कुल रेटिंग:"
 },
 "Ваша оцінка:": {
  "en": "Your rating:",
  "de": "Ihre Bewertung:",
  "pl": "Twoja ocena:",
  "es": "Tu valoración:",
  "zh": "您的评分：",
  "hi": "आपकी रेटिंग:"
 },
 "10 - Шедевр": {
  "en": "10 - Masterpiece",
  "de": "10 - Meisterwerk",
  "pl": "10 - Arcydzieło",
  "es": "10 - Obra maestra",
  "zh": "10 - 杰作",
  "hi": "10 - उत्कृष्ट कृति"
 },
 "9 - Чудово": {
  "en": "9 - Excellent",
  "de": "9 - Ausgezeichnet",
  "pl": "9 - Wspaniałe",
  "es": "9 - Excelente",
  "zh": "9 - 精彩",
  "hi": "9 - शानदार"
 },
 "8 - Дуже добре": {
  "en": "8 - Very good",
  "de": "8 - Sehr gut",
  "pl": "8 - Bardzo dobre",
  "es": "8 - Muy bueno",
  "zh": "8 - 很好",
  "hi": "8 - बहुत अच्छा"
 },
 "7 - Добре": {
  "en": "7 - Good",
  "de": "7 - Gut",
  "pl": "7 - Dobre",
  "es": "7 - Bueno",
  "zh": "7 - 好",
  "hi": "7 - अच्छा"
 },
 "6 - Непогано": {
  "en": "6 - Not bad",
  "de": "6 - Nicht schlecht",
  "pl": "6 - Całkiem dobre",
  "es": "6 - Nada mal",
  "zh": "6 - 不错",
  "hi": "6 - ठीक-ठाक"
 },
 "5 - Середньо": {
  "en": "5 - Average",
  "de": "5 - Durchschnittlich",
  "pl": "5 - Średnie",
  "es": "5 - Regular",
  "zh": "5 - 一般",
  "hi": "5 - औसत"
 },
 "4 - Слабо": {
  "en": "4 - Weak",
  "de": "4 - Schwach",
  "pl": "4 - Słabe",
  "es": "4 - Flojo",
  "zh": "4 - 较差",
  "hi": "4 - कमज़ोर"
 },
 "3 - Погано": {
  "en": "3 - Bad",
  "de": "3 - Schlecht",
  "pl": "3 - Złe",
  "es": "3 - Malo",
  "zh": "3 - 差",
  "hi": "3 - खराब"
 },
 "2 - Жахливо": {
  "en": "2 - Terrible",
  "de": "2 - Schrecklich",
  "pl": "2 - Okropne",
  "es": "2 - Terrible",
  "zh": "2 - 糟糕",
  "hi": "2 - भयानक"
 },
 "1 - Жах": {
  "en": "1 - Awful",
  "de": "1 - Furchtbar",
  "pl": "1 - Tragiczne",
  "es": "1 - Pésimo",
  "zh": "1 - 极差",
  "hi": "1 - बहुत बुरा"
 },
 "Оцінити книгу": {
  "en": "Rate book",
  "de": "Buch bewerten",
  "pl": "Oceń książkę",
  "es": "Valorar libro",
  "zh": "给书评分",
  "hi": "पुस्तक को रेट करें"
 },
 "Вибрати главу:": {
  "en": "Choose chapter:",
  "de": "Kapitel wählen:",
  "pl": "Wybierz rozdział:",
  "es": "Elegir capítulo:",
  "zh": "选择章节：",
  "hi": "अध्याय चुनें:"
 },
 "⭐ Оцінка цієї глави:": {
  "en": "⭐ Rating of this chapter:",
  "de": "⭐ Bewertung dieses Kapitels:",
  "pl": "⭐ Ocena tego rozdziału:",
  "es": "⭐ Valoración de este capítulo:",
  "zh": "⭐ 本章评分：",
  "hi": "⭐ इस अध्याय की रेटिंग:"
 },
 "Оцінити главу": {
  "en": "Rate chapter",
  "de": "Kapitel bewerten",
  "pl": "Oceń rozdział",
  "es": "Valorar capítulo",
  "zh": "给本章评分",
  "hi": "अध्याय को रेट करें"
 },
 "Відкрити текст на весь екран": {
  "en": "Open text in full screen",
  "de": "Text im Vollbild öffnen",
  "pl": "Otwórz tekst na pełnym ekranie",
  "es": "Abrir texto a pantalla completa",
  "zh": "全屏打开文本",
  "hi": "पूर्ण स्क्रीन में पाठ खोलें"
 },
 "← Попередня": {
  "en": "← Previous",
  "de": "← Zurück",
  "pl": "← Poprzedni",
  "es": "← Anterior",
  "zh": "← 上一章",
  "hi": "← पिछला"
 },
 "Наступна →": {
  "en": "Next →",
  "de": "Weiter →",
  "pl": "Następny →",
  "es": "Siguiente →",
  "zh": "下一章 →",
  "hi": "अगला →"
 },
 "Глава": {
  "en": "Chapter",
  "de": "Kapitel",
  "pl": "Rozdział",
  "es": "Capítulo",
  "zh": "章节",
  "hi": "अध्याय"
 },
 "Глава {0}": {
  "en": "Chapter {0}",
  "de": "Kapitel {0}",
  "pl": "Rozdział {0}",
  "es": "Capítulo {0}",
  "zh": "第 {0} 章",
  "hi": "अध्याय {0}"
 },
 "Сторінка {0} з {1}": {
  "en": "Page {0} of {1}",
  "de": "Seite {0} von {1}",
  "pl": "Strona {0} z {1}",
  "es": "Página {0} de {1}",
  "zh": "第 {0} 页，共 {1} 页",
  "hi": "पृष्ठ {0} / {1}"
 },
 "Вік: {0}": {
  "en": "Age: {0}",
  "de": "Alter: {0}",
  "pl": "Wiek: {0}",
  "es": "Edad: {0}",
  "zh": "年龄：{0}",
  "hi": "आयु: {0}"
 },
 "Невідомий": {
  "en": "Unknown",
  "de": "Unbekannt",
  "pl": "Nieznany",
  "es": "Desconocido",
  "zh": "未知",
  "hi": "अज्ञात"
 },
 "Невідомо": {
  "en": "Unknown",
  "de": "Unbekannt",
  "pl": "Nieznane",
  "es": "Desconocido",
  "zh": "未知",
  "hi": "अज्ञात"
 },
 "Авторський переклад": {
  "en": "Author's translation",
  "de": "Übersetzung des Autors",
  "pl": "Tłumaczenie autorskie",
  "es": "Traducción del autor",
  "zh": "作者译本",
  "hi": "लेखक का अनुवाद"
 },
 "(Текст або зображення відсутні у цій главі)": {
  "en": "(No text or images in this chapter)",
  "de": "(Kein Text oder Bild in diesem Kapitel)",
  "pl": "(Brak tekstu lub obrazów w tym rozdziale)",
  "es": "(No hay texto ni imágenes en este capítulo)",
  "zh": "（本章没有文字或图片）",
  "hi": "(इस अध्याय में कोई पाठ या चित्र नहीं है)"
 },
 "Нічого не знайдено за твоїм запитом або віковим обмеженням.": {
  "en": "Nothing found for your search or age filter.",
  "de": "Nichts gefunden für Ihre Suche oder den Altersfilter.",
  "pl": "Nic nie znaleziono dla Twojego zapytania lub filtra wieku.",
  "es": "No se encontró nada con tu búsqueda o filtro de edad.",
  "zh": "没有找到符合搜索或年龄限制的内容。",
  "hi": "आपकी खोज या आयु सीमा के लिए कुछ नहीं मिला।"
 },
 "Читати книгу": {
  "en": "Read book",
  "de": "Buch lesen",
  "pl": "Czytaj książkę",
  "es": "Leer libro",
  "zh": "阅读本书",
  "hi": "पुस्तक पढ़ें"
 },
 "🏆 Рейтинг книг за лайками": {
  "en": "🏆 Books ranked by likes",
  "de": "🏆 Bücher nach Likes",
  "pl": "🏆 Ranking książek wg polubień",
  "es": "🏆 Libros por me gusta",
  "zh": "🏆 按点赞数排名的书籍",
  "hi": "🏆 लाइक के अनुसार पुस्तकें"
 },
 "Оберіть жанр, щоб переглянути топ найкращих творів:": {
  "en": "Choose a genre to see the top works:",
  "de": "Wählen Sie ein Genre, um die besten Werke zu sehen:",
  "pl": "Wybierz gatunek, aby zobaczyć najlepsze utwory:",
  "es": "Elige un género para ver las mejores obras:",
  "zh": "选择类型查看最佳作品：",
  "hi": "सर्वश्रेष्ठ कृतियाँ देखने के लिए शैली चुनें:"
 },
 "💬 Коментарі": {
  "en": "💬 Comments",
  "de": "💬 Kommentare",
  "pl": "💬 Komentarze",
  "es": "💬 Comentarios",
  "zh": "💬 评论",
  "hi": "💬 टिप्पणियाँ"
 },
 "💬 Коментарі (": {
  "en": "💬 Comments (",
  "de": "💬 Kommentare (",
  "pl": "💬 Komentarze (",
  "es": "💬 Comentarios (",
  "zh": "💬 评论 (",
  "hi": "💬 टिप्पणियाँ ("
 },
 "💬 Коментарі до твору": {
  "en": "💬 Comments on the book",
  "de": "💬 Kommentare zum Werk",
  "pl": "💬 Komentarze do utworu",
  "es": "💬 Comentarios sobre la obra",
  "zh": "💬 作品评论",
  "hi": "💬 कृति पर टिप्पणियाँ"
 },
 "Напишіть свій коментар...": {
  "en": "Write your comment...",
  "de": "Schreiben Sie Ihren Kommentar...",
  "pl": "Napisz swój komentarz...",
  "es": "Escribe tu comentario...",
  "zh": "写下您的评论...",
  "hi": "अपनी टिप्पणी लिखें..."
 },
 "Надіслати коментар": {
  "en": "Post comment",
  "de": "Kommentar senden",
  "pl": "Wyślij komentarz",
  "es": "Enviar comentario",
  "zh": "发表评论",
  "hi": "टिप्पणी भेजें"
 },
 "Щоб писати коментарі, будь ласка, увійдіть в акаунт.": {
  "en": "To write comments, please log in.",
  "de": "Um Kommentare zu schreiben, melden Sie sich bitte an.",
  "pl": "Aby pisać komentarze, zaloguj się.",
  "es": "Para escribir comentarios, inicia sesión.",
  "zh": "要发表评论，请先登录。",
  "hi": "टिप्पणी लिखने के लिए कृपया लॉग इन करें।"
 },
 "Поки немає коментарів. Будьте першим!": {
  "en": "No comments yet. Be the first!",
  "de": "Noch keine Kommentare. Seien Sie der Erste!",
  "pl": "Na razie brak komentarzy. Bądź pierwszy!",
  "es": "Aún no hay comentarios. ¡Sé el primero!",
  "zh": "暂无评论，来发表第一条吧！",
  "hi": "अभी कोई टिप्पणी नहीं। पहले बनें!"
 },
 "Видалити": {
  "en": "Delete",
  "de": "Löschen",
  "pl": "Usuń",
  "es": "Eliminar",
  "zh": "删除",
  "hi": "हटाएँ"
 },
 "💬 Відповісти": {
  "en": "💬 Reply",
  "de": "💬 Antworten",
  "pl": "💬 Odpowiedz",
  "es": "💬 Responder",
  "zh": "💬 回复",
  "hi": "💬 उत्तर दें"
 },
 "Ваша відповідь...": {
  "en": "Your reply...",
  "de": "Ihre Antwort...",
  "pl": "Twoja odpowiedź...",
  "es": "Tu respuesta...",
  "zh": "您的回复...",
  "hi": "आपका उत्तर..."
 },
 "👤 Акаунт": {
  "en": "👤 Account",
  "de": "👤 Konto",
  "pl": "👤 Konto",
  "es": "👤 Cuenta",
  "zh": "👤 账户",
  "hi": "👤 खाता"
 },
 "Увійти": {
  "en": "Log in",
  "de": "Anmelden",
  "pl": "Zaloguj się",
  "es": "Iniciar sesión",
  "zh": "登录",
  "hi": "लॉग इन"
 },
 "Зареєструватися": {
  "en": "Sign up",
  "de": "Registrieren",
  "pl": "Zarejestruj się",
  "es": "Registrarse",
  "zh": "注册",
  "hi": "साइन अप करें"
 },
 "Увійти через Google": {
  "en": "Sign in with Google",
  "de": "Mit Google anmelden",
  "pl": "Zaloguj się przez Google",
  "es": "Iniciar sesión con Google",
  "zh": "使用 Google 登录",
  "hi": "Google से लॉग इन करें"
 },
 "або за допомогою акаунта": {
  "en": "or with an account",
  "de": "oder mit einem Konto",
  "pl": "lub za pomocą konta",
  "es": "o con una cuenta",
  "zh": "或使用账户",
  "hi": "या खाते के साथ"
 },
 "Нікнейм / Логін:": {
  "en": "Nickname / Login:",
  "de": "Nickname / Login:",
  "pl": "Pseudonim / Login:",
  "es": "Apodo / Usuario:",
  "zh": "昵称 / 用户名：",
  "hi": "उपनाम / लॉगिन:"
 },
 "Введіть нікнейм": {
  "en": "Enter nickname",
  "de": "Nickname eingeben",
  "pl": "Wpisz pseudonim",
  "es": "Introduce el apodo",
  "zh": "输入昵称",
  "hi": "उपनाम दर्ज करें"
 },
 "Пароль:": {
  "en": "Password:",
  "de": "Passwort:",
  "pl": "Hasło:",
  "es": "Contraseña:",
  "zh": "密码：",
  "hi": "पासवर्ड:"
 },
 "Введіть пароль": {
  "en": "Enter password",
  "de": "Passwort eingeben",
  "pl": "Wpisz hasło",
  "es": "Introduce la contraseña",
  "zh": "输入密码",
  "hi": "पासवर्ड दर्ज करें"
 },
 "Придумайте нікнейм:": {
  "en": "Choose a nickname:",
  "de": "Wählen Sie einen Nickname:",
  "pl": "Wymyśl pseudonim:",
  "es": "Elige un apodo:",
  "zh": "设置昵称：",
  "hi": "एक उपनाम चुनें:"
 },
 "Повторіть пароль:": {
  "en": "Repeat password:",
  "de": "Passwort wiederholen:",
  "pl": "Powtórz hasło:",
  "es": "Repite la contraseña:",
  "zh": "重复密码：",
  "hi": "पासवर्ड दोबारा लिखें:"
 },
 "Повторіть пароль": {
  "en": "Repeat password",
  "de": "Passwort wiederholen",
  "pl": "Powtórz hasło",
  "es": "Repite la contraseña",
  "zh": "重复密码",
  "hi": "पासवर्ड दोबारा लिखें"
 },
 "Реєструючись, ви погоджуєтесь з": {
  "en": "By registering, you agree to the",
  "de": "Mit der Registrierung akzeptieren Sie die",
  "pl": "Rejestrując się, akceptujesz",
  "es": "Al registrarte, aceptas los",
  "zh": "注册即表示您同意",
  "hi": "पंजीकरण करके, आप स्वीकार करते हैं:"
 },
 "умовами використання та політикою конфіденційності": {
  "en": "terms of use and privacy policy",
  "de": "Nutzungsbedingungen und Datenschutzerklärung",
  "pl": "regulamin i politykę prywatności",
  "es": "términos de uso y la política de privacidad",
  "zh": "使用条款和隐私政策",
  "hi": "उपयोग की शर्तें और गोपनीयता नीति"
 },
 "📷 Змінити іконку": {
  "en": "📷 Change avatar",
  "de": "📷 Avatar ändern",
  "pl": "📷 Zmień awatar",
  "es": "📷 Cambiar avatar",
  "zh": "📷 更换头像",
  "hi": "📷 अवतार बदलें"
 },
 "Прибрати фото": {
  "en": "Remove photo",
  "de": "Foto entfernen",
  "pl": "Usuń zdjęcie",
  "es": "Quitar foto",
  "zh": "移除照片",
  "hi": "फ़ोटो हटाएँ"
 },
 "Вийти з акаунта": {
  "en": "Log out",
  "de": "Abmelden",
  "pl": "Wyloguj się",
  "es": "Cerrar sesión",
  "zh": "退出登录",
  "hi": "लॉग आउट"
 },
 "🗑️ Видалити мій акаунт": {
  "en": "🗑️ Delete my account",
  "de": "🗑️ Mein Konto löschen",
  "pl": "🗑️ Usuń moje konto",
  "es": "🗑️ Eliminar mi cuenta",
  "zh": "🗑️ 删除我的账户",
  "hi": "🗑️ मेरा खाता हटाएँ"
 },
 "📝 Заявки, скарги та заяви": {
  "en": "📝 Requests, complaints and statements",
  "de": "📝 Anfragen, Beschwerden und Erklärungen",
  "pl": "📝 Zgłoszenia, skargi i oświadczenia",
  "es": "📝 Solicitudes, quejas y declaraciones",
  "zh": "📝 申请、投诉和声明",
  "hi": "📝 अनुरोध, शिकायतें और वक्तव्य"
 },
 "Поскаржитись": {
  "en": "Report",
  "de": "Melden",
  "pl": "Zgłoś skargę",
  "es": "Quejarse",
  "zh": "投诉",
  "hi": "शिकायत करें"
 },
 "Рекомендувати твір": {
  "en": "Recommend a book",
  "de": "Werk empfehlen",
  "pl": "Poleć utwór",
  "es": "Recomendar una obra",
  "zh": "推荐作品",
  "hi": "कृति सुझाएँ"
 },
 "Заява": {
  "en": "Statement",
  "de": "Erklärung",
  "pl": "Oświadczenie",
  "es": "Declaración",
  "zh": "声明",
  "hi": "वक्तव्य"
 },
 "Опишіть вашу скаргу:": {
  "en": "Describe your complaint:",
  "de": "Beschreiben Sie Ihre Beschwerde:",
  "pl": "Opisz swoją skargę:",
  "es": "Describe tu queja:",
  "zh": "请描述您的投诉：",
  "hi": "अपनी शिकायत का वर्णन करें:"
 },
 "Що саме не так...": {
  "en": "What exactly is wrong...",
  "de": "Was genau stimmt nicht...",
  "pl": "Co dokładnie jest nie tak...",
  "es": "Qué es lo que falla...",
  "zh": "具体有什么问题...",
  "hi": "ठीक क्या गलत है..."
 },
 "Надіслати скаргу": {
  "en": "Submit complaint",
  "de": "Beschwerde senden",
  "pl": "Wyślij skargę",
  "es": "Enviar queja",
  "zh": "提交投诉",
  "hi": "शिकायत भेजें"
 },
 "Назва твору:": {
  "en": "Title of the work:",
  "de": "Titel des Werks:",
  "pl": "Tytuł utworu:",
  "es": "Título de la obra:",
  "zh": "作品名称：",
  "hi": "कृति का शीर्षक:"
 },
 "Ім'я автора:": {
  "en": "Author's first name:",
  "de": "Vorname des Autors:",
  "pl": "Imię autora:",
  "es": "Nombre del autor:",
  "zh": "作者名：",
  "hi": "लेखक का नाम:"
 },
 "Прізвище автора:": {
  "en": "Author's last name:",
  "de": "Nachname des Autors:",
  "pl": "Nazwisko autora:",
  "es": "Apellido del autor:",
  "zh": "作者姓：",
  "hi": "लेखक का उपनाम:"
 },
 "Жанр:": {
  "en": "Genre:",
  "de": "Genre:",
  "pl": "Gatunek:",
  "es": "Género:",
  "zh": "类型：",
  "hi": "शैली:"
 },
 "Короткий опис:": {
  "en": "Short description:",
  "de": "Kurzbeschreibung:",
  "pl": "Krótki opis:",
  "es": "Descripción breve:",
  "zh": "简短介绍：",
  "hi": "संक्षिप्त विवरण:"
 },
 "Макет сторінки (оформлення твору):": {
  "en": "Page layout (book design):",
  "de": "Seitenlayout (Gestaltung des Werks):",
  "pl": "Układ strony (wygląd utworu):",
  "es": "Diseño de página (presentación de la obra):",
  "zh": "页面版式（作品外观）：",
  "hi": "पृष्ठ लेआउट (कृति की सजावट):"
 },
 "Класичний макет (Обкладинка зліва)": {
  "en": "Classic layout (cover on the left)",
  "de": "Klassisches Layout (Cover links)",
  "pl": "Układ klasyczny (okładka po lewej)",
  "es": "Diseño clásico (portada a la izquierda)",
  "zh": "经典版式（封面在左）",
  "hi": "क्लासिक लेआउट (आवरण बाईं ओर)"
 },
 "Широкий банер (Обкладинка зверху)": {
  "en": "Wide banner (cover on top)",
  "de": "Breites Banner (Cover oben)",
  "pl": "Szeroki baner (okładka u góry)",
  "es": "Banner ancho (portada arriba)",
  "zh": "宽幅横幅（封面在上）",
  "hi": "चौड़ा बैनर (आवरण ऊपर)"
 },
 "Картковий стиль (Центрована обкладинка)": {
  "en": "Card style (centered cover)",
  "de": "Kartenstil (zentriertes Cover)",
  "pl": "Styl karty (wyśrodkowana okładka)",
  "es": "Estilo tarjeta (portada centrada)",
  "zh": "卡片样式（封面居中）",
  "hi": "कार्ड शैली (केंद्रित आवरण)"
 },
 "Завантажити власний макет/обкладинку:": {
  "en": "Upload your own layout/cover:",
  "de": "Eigenes Layout/Cover hochladen:",
  "pl": "Prześlij własny układ/okładkę:",
  "es": "Sube tu propio diseño/portada:",
  "zh": "上传自定义版式/封面：",
  "hi": "अपना लेआउट/आवरण अपलोड करें:"
 },
 "Попередній перегляд": {
  "en": "Preview",
  "de": "Vorschau",
  "pl": "Podgląd",
  "es": "Vista previa",
  "zh": "预览",
  "hi": "पूर्वावलोकन"
 },
 "Глави та заголовки твору:": {
  "en": "Chapters and titles of the work:",
  "de": "Kapitel und Überschriften des Werks:",
  "pl": "Rozdziały i tytuły utworu:",
  "es": "Capítulos y títulos de la obra:",
  "zh": "作品的章节与标题：",
  "hi": "कृति के अध्याय और शीर्षक:"
 },
 "+ Додати главу": {
  "en": "+ Add chapter",
  "de": "+ Kapitel hinzufügen",
  "pl": "+ Dodaj rozdział",
  "es": "+ Añadir capítulo",
  "zh": "+ 添加章节",
  "hi": "+ अध्याय जोड़ें"
 },
 "Заголовок:": {
  "en": "Heading:",
  "de": "Überschrift:",
  "pl": "Nagłówek:",
  "es": "Encabezado:",
  "zh": "标题：",
  "hi": "शीर्षक:"
 },
 "Наприклад: Пролог або Глава 1": {
  "en": "For example: Prologue or Chapter 1",
  "de": "Zum Beispiel: Prolog oder Kapitel 1",
  "pl": "Na przykład: Prolog lub Rozdział 1",
  "es": "Por ejemplo: Prólogo o Capítulo 1",
  "zh": "例如：序章或第 1 章",
  "hi": "उदाहरण: प्रस्तावना या अध्याय 1"
 },
 "Текст твору:": {
  "en": "Text of the work:",
  "de": "Text des Werks:",
  "pl": "Tekst utworu:",
  "es": "Texto de la obra:",
  "zh": "作品正文：",
  "hi": "कृति का पाठ:"
 },
 "Введіть повний текст глави тут...": {
  "en": "Enter the full text of the chapter here...",
  "de": "Geben Sie hier den vollständigen Text des Kapitels ein...",
  "pl": "Wpisz tutaj pełny tekst rozdziału...",
  "es": "Introduce aquí el texto completo del capítulo...",
  "zh": "在此输入本章全文...",
  "hi": "यहाँ अध्याय का पूरा पाठ दर्ज करें..."
 },
 "Введіть текст глави (можна залишити порожнім)...": {
  "en": "Enter the chapter text (can be left empty)...",
  "de": "Kapiteltext eingeben (darf leer bleiben)...",
  "pl": "Wpisz tekst rozdziału (można zostawić puste)...",
  "es": "Introduce el texto del capítulo (puede quedar vacío)...",
  "zh": "输入章节文字（可留空）...",
  "hi": "अध्याय का पाठ दर्ज करें (खाली छोड़ सकते हैं)..."
 },
 "Я надаю свою": {
  "en": "I give my",
  "de": "Ich erteile meine",
  "pl": "Wyrażam",
  "es": "Doy mi",
  "zh": "我",
  "hi": "मैं इस कृति के प्रकाशन के लिए अपनी"
 },
 "згоду": {
  "en": "consent",
  "de": "Zustimmung",
  "pl": "zgodę",
  "es": "consentimiento",
  "zh": "同意",
  "hi": "सहमति"
 },
 "на публікацію твору.": {
  "en": "to publish the work.",
  "de": "zur Veröffentlichung des Werks.",
  "pl": "na publikację utworu.",
  "es": "para publicar la obra.",
  "zh": "发布该作品。",
  "hi": "प्रदान करता/करती हूँ।"
 },
 "Надіслати на розгляд адміну": {
  "en": "Submit for admin review",
  "de": "Zur Prüfung an den Admin senden",
  "pl": "Wyślij do rozpatrzenia administratorowi",
  "es": "Enviar a revisión del administrador",
  "zh": "提交管理员审核",
  "hi": "व्यवस्थापक की समीक्षा के लिए भेजें"
 },
 "Ім'я автора твору": {
  "en": "Author's name",
  "de": "Name des Autors",
  "pl": "Imię autora utworu",
  "es": "Nombre del autor de la obra",
  "zh": "作品作者姓名",
  "hi": "कृति के लेखक का नाम"
 },
 "Назва вашої книги": {
  "en": "Title of your book",
  "de": "Titel Ihres Buchs",
  "pl": "Tytuł Twojej książki",
  "es": "Título de tu libro",
  "zh": "您的书名",
  "hi": "आपकी पुस्तक का शीर्षक"
 },
 "Опишіть вашу заяву:": {
  "en": "Describe your statement:",
  "de": "Beschreiben Sie Ihre Erklärung:",
  "pl": "Opisz swoje oświadczenie:",
  "es": "Describe tu declaración:",
  "zh": "请描述您的声明：",
  "hi": "अपने वक्तव्य का वर्णन करें:"
 },
 "Наприклад: прошу видалити главу 2 або змінити опис твору на...": {
  "en": "For example: please delete chapter 2 or change the description to...",
  "de": "Zum Beispiel: bitte Kapitel 2 löschen oder die Beschreibung ändern in...",
  "pl": "Na przykład: proszę usunąć rozdział 2 lub zmienić opis utworu na...",
  "es": "Por ejemplo: ruego eliminar el capítulo 2 o cambiar la descripción por...",
  "zh": "例如：请删除第 2 章，或将作品简介改为……",
  "hi": "उदाहरण: कृपया अध्याय 2 हटाएँ या विवरण बदलकर ... करें"
 },
 "Надіслати заяву": {
  "en": "Submit statement",
  "de": "Erklärung senden",
  "pl": "Wyślij oświadczenie",
  "es": "Enviar declaración",
  "zh": "提交声明",
  "hi": "वक्तव्य भेजें"
 },
 "📜 Умови публікації та згода": {
  "en": "📜 Publication terms and consent",
  "de": "📜 Veröffentlichungsbedingungen und Zustimmung",
  "pl": "📜 Warunki publikacji i zgoda",
  "es": "📜 Condiciones de publicación y consentimiento",
  "zh": "📜 发布条款与同意",
  "hi": "📜 प्रकाशन की शर्तें और सहमति"
 },
 "Натискаючи кнопку згоди, ви погоджуєтесь з публікацією вашого твору під нікнеймом, під прізвищем та ім'ям автора, що ви вказали.": {
  "en": "By giving your consent, you agree to the publication of your work under your nickname and the author's first and last name you provided.",
  "de": "Mit Ihrer Zustimmung erklären Sie sich mit der Veröffentlichung Ihres Werks unter Ihrem Nickname sowie dem von Ihnen angegebenen Vor- und Nachnamen des Autors einverstanden.",
  "pl": "Wyrażając zgodę, zgadzasz się na publikację swojego utworu pod swoim pseudonimem oraz podanym imieniem i nazwiskiem autora.",
  "es": "Al dar tu consentimiento, aceptas la publicación de tu obra bajo tu apodo y el nombre y apellido del autor que indicaste.",
  "zh": "点击同意即表示您同意以您的昵称以及您填写的作者姓名发布您的作品。",
  "hi": "सहमति देकर, आप अपने उपनाम और आपके द्वारा बताए गए लेखक के नाम व उपनाम के तहत अपनी कृति के प्रकाशन के लिए सहमत होते हैं।"
 },
 "Якщо ви захочете видалити твір, ви повинні подати заявку в адміністрацію, яка буде переглянута та видалена в рахунок 15 днів.": {
  "en": "If you want to delete the work, you must submit a request to the administration; it will be reviewed and the work removed within 15 days.",
  "de": "Wenn Sie das Werk löschen möchten, müssen Sie einen Antrag bei der Administration stellen; er wird geprüft und das Werk innerhalb von 15 Tagen entfernt.",
  "pl": "Jeśli zechcesz usunąć utwór, musisz złożyć wniosek do administracji; zostanie on rozpatrzony, a utwór usunięty w ciągu 15 dni.",
  "es": "Si deseas eliminar la obra, debes enviar una solicitud a la administración; se revisará y la obra se eliminará en un plazo de 15 días.",
  "zh": "如果您想删除作品，必须向管理员提交申请；申请将在 15 天内审核并删除作品。",
  "hi": "यदि आप कृति हटाना चाहते हैं, तो आपको प्रशासन को आवेदन देना होगा; उसकी समीक्षा की जाएगी और कृति 15 दिनों के भीतर हटा दी जाएगी।"
 },
 "Масове надсилання однакових чи безглуздих коментарів і заявок, а також зловживання скаргами вважаються спамом і можуть призвести до блокування акаунта та нікнейма без попередження.": {
  "en": "Mass-sending identical or meaningless comments and requests, as well as abusing complaints, is considered spam and may lead to your account and nickname being blocked without warning.",
  "de": "Das massenhafte Senden identischer oder sinnloser Kommentare und Anfragen sowie der Missbrauch von Beschwerden gilt als Spam und kann ohne Vorwarnung zur Sperrung von Konto und Nickname führen.",
  "pl": "Masowe wysyłanie identycznych lub bezsensownych komentarzy i zgłoszeń oraz nadużywanie skarg jest uznawane za spam i może prowadzić do zablokowania konta i pseudonimu bez ostrzeżenia.",
  "es": "El envío masivo de comentarios y solicitudes idénticos o sin sentido, así como el abuso de las quejas, se considera spam y puede provocar el bloqueo de la cuenta y del apodo sin previo aviso.",
  "zh": "大量发送相同或无意义的评论和申请，以及滥用投诉均视为垃圾信息，可能导致账户和昵称被无预警封禁。",
  "hi": "एक जैसी या अर्थहीन टिप्पणियों और अनुरोधों को बड़ी संख्या में भेजना, तथा शिकायतों का दुरुपयोग करना स्पैम माना जाता है और इससे बिना चेतावनी के खाता और उपनाम ब्लॉक हो सकता है।"
 },
 "Умови використання": {
  "en": "Terms of use",
  "de": "Nutzungsbedingungen",
  "pl": "Regulamin",
  "es": "Términos de uso",
  "zh": "使用条款",
  "hi": "उपयोग की शर्तें"
 },
 "InkWave — безкоштовна бібліотека творів українською мовою. Користуючись сайтом, ви погоджуєтесь з цими умовами.": {
  "en": "InkWave is a free library of works in Ukrainian. By using the site, you agree to these terms.",
  "de": "InkWave ist eine kostenlose Bibliothek mit Werken in ukrainischer Sprache. Durch die Nutzung der Seite stimmen Sie diesen Bedingungen zu.",
  "pl": "InkWave to bezpłatna biblioteka utworów w języku ukraińskim. Korzystając z serwisu, akceptujesz niniejszy regulamin.",
  "es": "InkWave es una biblioteca gratuita de obras en ucraniano. Al usar el sitio, aceptas estos términos.",
  "zh": "InkWave 是一个免费的乌克兰语作品库。使用本网站即表示您同意这些条款。",
  "hi": "InkWave यूक्रेनी भाषा की कृतियों की एक निःशुल्क लाइब्रेरी है। साइट का उपयोग करके आप इन शर्तों से सहमत होते हैं।"
 },
 "Надсилаючи твір, ви підтверджуєте, що є його автором або маєте право на його поширення, і погоджуєтесь на публікацію під вказаним ім'ям автора та вашим нікнеймом.": {
  "en": "By submitting a work, you confirm that you are its author or have the right to distribute it, and you agree to its publication under the author name you provided and your nickname.",
  "de": "Mit dem Einsenden eines Werks bestätigen Sie, dass Sie dessen Autor sind oder das Recht zur Verbreitung haben, und stimmen der Veröffentlichung unter dem angegebenen Autorennamen und Ihrem Nickname zu.",
  "pl": "Przesyłając utwór, potwierdzasz, że jesteś jego autorem lub masz prawo do jego rozpowszechniania, i zgadzasz się na publikację pod podanym imieniem autora oraz Twoim pseudonimem.",
  "es": "Al enviar una obra, confirmas que eres su autor o que tienes derecho a distribuirla, y aceptas su publicación con el nombre de autor indicado y tu apodo.",
  "zh": "提交作品即表示您确认自己是作者或拥有传播该作品的权利，并同意以您填写的作者姓名和您的昵称发布。",
  "hi": "कृति भेजकर आप पुष्टि करते हैं कि आप उसके लेखक हैं या उसे वितरित करने का अधिकार रखते हैं, और आपके द्वारा बताए गए लेखक के नाम तथा आपके उपनाम के तहत प्रकाशन के लिए सहमत होते हैं।"
 },
 "Заборонено публікувати твори й коментарі, що порушують чужі авторські права, містять незаконний, образливий чи дискримінаційний вміст, а також спам. Адміністрація може відхилити або видалити твір, коментар чи акаунт, що порушують ці умови.": {
  "en": "It is forbidden to publish works and comments that infringe others' copyright, contain illegal, offensive or discriminatory content, or constitute spam. The administration may reject or delete a work, comment or account that violates these terms.",
  "de": "Es ist verboten, Werke und Kommentare zu veröffentlichen, die fremde Urheberrechte verletzen, illegale, beleidigende oder diskriminierende Inhalte enthalten oder Spam darstellen. Die Administration kann Werke, Kommentare oder Konten, die gegen diese Bedingungen verstoßen, ablehnen oder löschen.",
  "pl": "Zabronione jest publikowanie utworów i komentarzy naruszających cudze prawa autorskie, zawierających treści nielegalne, obraźliwe lub dyskryminujące oraz spamu. Administracja może odrzucić lub usunąć utwór, komentarz albo konto naruszające te zasady.",
  "es": "Está prohibido publicar obras y comentarios que infrinjan derechos de autor ajenos, contengan contenido ilegal, ofensivo o discriminatorio, o sean spam. La administración puede rechazar o eliminar obras, comentarios o cuentas que incumplan estos términos.",
  "zh": "禁止发布侵犯他人著作权、包含非法、冒犯或歧视性内容的作品和评论，以及垃圾信息。管理员可以拒绝或删除违反这些条款的作品、评论或账户。",
  "hi": "दूसरों के कॉपीराइट का उल्लंघन करने वाली, अवैध, आपत्तिजनक या भेदभावपूर्ण सामग्री वाली कृतियाँ और टिप्पणियाँ तथा स्पैम प्रकाशित करना प्रतिबंधित है। प्रशासन इन शर्तों का उल्लंघन करने वाली कृति, टिप्पणी या खाते को अस्वीकार या हटा सकता है।"
 },
 "Конфіденційність": {
  "en": "Privacy",
  "de": "Datenschutz",
  "pl": "Prywatność",
  "es": "Privacidad",
  "zh": "隐私",
  "hi": "गोपनीयता"
 },
 "Ми зберігаємо: нікнейм, дату реєстрації та аватар; при вході через Google — також e-mail та ім'я з вашого профілю Google. Пароль зберігається лише у захищеному (хешованому) вигляді сервісом автентифікації.": {
  "en": "We store: your nickname, registration date and avatar; when you sign in with Google, also the e-mail and name from your Google profile. Your password is stored only in a protected (hashed) form by the authentication service.",
  "de": "Wir speichern: Nickname, Registrierungsdatum und Avatar; bei Anmeldung über Google zusätzlich E-Mail und Name aus Ihrem Google-Profil. Das Passwort wird vom Authentifizierungsdienst ausschließlich in geschützter (gehashter) Form gespeichert.",
  "pl": "Przechowujemy: pseudonim, datę rejestracji i awatar; przy logowaniu przez Google także e-mail i imię z Twojego profilu Google. Hasło jest przechowywane wyłącznie w zabezpieczonej (zahaszowanej) postaci przez usługę uwierzytelniania.",
  "es": "Almacenamos: apodo, fecha de registro y avatar; si inicias sesión con Google, también el correo y el nombre de tu perfil de Google. La contraseña la guarda el servicio de autenticación únicamente de forma protegida (cifrada con hash).",
  "zh": "我们保存：昵称、注册日期和头像；使用 Google 登录时，还包括您 Google 资料中的邮箱和姓名。密码仅由认证服务以受保护的（哈希）形式保存。",
  "hi": "हम संग्रहीत करते हैं: उपनाम, पंजीकरण की तारीख और अवतार; Google से लॉग इन करने पर आपकी Google प्रोफ़ाइल का ई-मेल और नाम भी। पासवर्ड को प्रमाणीकरण सेवा केवल सुरक्षित (हैश किए गए) रूप में रखती है।"
 },
 "У вашому браузері зберігаються налаштування: тема, улюблені книги, закладки, статуси читання та оцінки.": {
  "en": "Your browser stores settings: theme, favorite books, bookmarks, reading statuses and ratings.",
  "de": "In Ihrem Browser werden Einstellungen gespeichert: Design, Lieblingsbücher, Lesezeichen, Lesestatus und Bewertungen.",
  "pl": "W Twojej przeglądarce zapisywane są ustawienia: motyw, ulubione książki, zakładki, statusy czytania i oceny.",
  "es": "Tu navegador guarda ajustes: tema, libros favoritos, marcadores, estados de lectura y valoraciones.",
  "zh": "您的浏览器会保存设置：主题、收藏的书、书签、阅读状态和评分。",
  "hi": "आपके ब्राउज़र में सेटिंग्स सहेजी जाती हैं: थीम, पसंदीदा पुस्तकें, बुकमार्क, पठन स्थिति और रेटिंग।"
 },
 "Дані зберігаються на сервісах Supabase (база даних) і Vercel (хостинг). Ми не продаємо та не передаємо ваші дані третім особам.": {
  "en": "Data is stored on the Supabase (database) and Vercel (hosting) services. We do not sell or share your data with third parties.",
  "de": "Die Daten werden bei den Diensten Supabase (Datenbank) und Vercel (Hosting) gespeichert. Wir verkaufen Ihre Daten nicht und geben sie nicht an Dritte weiter.",
  "pl": "Dane są przechowywane w usługach Supabase (baza danych) i Vercel (hosting). Nie sprzedajemy ani nie przekazujemy Twoich danych osobom trzecim.",
  "es": "Los datos se almacenan en los servicios Supabase (base de datos) y Vercel (alojamiento). No vendemos ni compartimos tus datos con terceros.",
  "zh": "数据存储在 Supabase（数据库）和 Vercel（托管）服务上。我们不会出售或向第三方提供您的数据。",
  "hi": "डेटा Supabase (डेटाबेस) और Vercel (होस्टिंग) सेवाओं पर संग्रहीत होता है। हम आपका डेटा न बेचते हैं और न तीसरे पक्ष को देते हैं।"
 },
 "Ви можете видалити акаунт у вікні профілю кнопкою «Видалити мій акаунт». Залишені коментарі можуть зберігатися — для їх видалення зверніться до нас.": {
  "en": "You can delete your account in the profile window with the “Delete my account” button. Comments you left may remain — contact us to have them removed.",
  "de": "Sie können Ihr Konto im Profilfenster mit der Schaltfläche „Mein Konto löschen“ löschen. Hinterlassene Kommentare können erhalten bleiben – wenden Sie sich zur Löschung an uns.",
  "pl": "Konto możesz usunąć w oknie profilu przyciskiem „Usuń moje konto”. Pozostawione komentarze mogą zostać zachowane — aby je usunąć, skontaktuj się z nami.",
  "es": "Puedes eliminar tu cuenta en la ventana de perfil con el botón «Eliminar mi cuenta». Los comentarios que dejaste pueden conservarse; contáctanos para eliminarlos.",
  "zh": "您可以在个人资料窗口通过“删除我的账户”按钮删除账户。您留下的评论可能会保留，如需删除请联系我们。",
  "hi": "आप प्रोफ़ाइल विंडो में «मेरा खाता हटाएँ» बटन से अपना खाता हटा सकते हैं। छोड़ी गई टिप्पणियाँ बनी रह सकती हैं — उन्हें हटाने के लिए हमसे संपर्क करें।"
 },
 "Авторські права та контакти": {
  "en": "Copyright and contacts",
  "de": "Urheberrecht und Kontakt",
  "pl": "Prawa autorskie i kontakt",
  "es": "Derechos de autor y contacto",
  "zh": "版权与联系方式",
  "hi": "कॉपीराइट और संपर्क"
 },
 "Якщо ви правовласник і вважаєте, що твір розміщено без вашого дозволу, надішліть звернення з назвою твору, посиланням на нього та підтвердженням ваших прав. Ми розглянемо його та за потреби видалимо твір протягом 15 днів.": {
  "en": "If you are a rights holder and believe a work was posted without your permission, send a request with the title of the work, a link to it and proof of your rights. We will review it and, if necessary, remove the work within 15 days.",
  "de": "Wenn Sie Rechteinhaber sind und glauben, dass ein Werk ohne Ihre Erlaubnis veröffentlicht wurde, senden Sie uns eine Meldung mit Titel des Werks, Link und Nachweis Ihrer Rechte. Wir prüfen sie und entfernen das Werk bei Bedarf innerhalb von 15 Tagen.",
  "pl": "Jeśli jesteś właścicielem praw i uważasz, że utwór zamieszczono bez Twojej zgody, wyślij zgłoszenie z tytułem utworu, linkiem do niego i potwierdzeniem Twoich praw. Rozpatrzymy je i w razie potrzeby usuniemy utwór w ciągu 15 dni.",
  "es": "Si eres titular de derechos y crees que una obra se publicó sin tu permiso, envía una solicitud con el título de la obra, el enlace y la prueba de tus derechos. La revisaremos y, si es necesario, eliminaremos la obra en un plazo de 15 días.",
  "zh": "如果您是权利人，认为作品未经您许可发布，请提交申请，注明作品名称、链接及权利证明。我们将审核，并在必要时于 15 天内删除该作品。",
  "hi": "यदि आप अधिकार धारक हैं और मानते हैं कि कोई कृति आपकी अनुमति के बिना प्रकाशित हुई है, तो कृति का शीर्षक, उसका लिंक और अपने अधिकारों का प्रमाण भेजें। हम उसकी समीक्षा करेंगे और आवश्यकता होने पर 15 दिनों के भीतर कृति हटा देंगे।"
 },
 "Напишіть нам через форму «📝 Заявка» → «Заява» на сайті.": {
  "en": "Write to us via the “📝 Request” → “Statement” form on the site.",
  "de": "Schreiben Sie uns über das Formular „📝 Anfrage“ → „Erklärung“ auf der Seite.",
  "pl": "Napisz do nas przez formularz „📝 Zgłoszenie” → „Oświadczenie” na stronie.",
  "es": "Escríbenos mediante el formulario «📝 Solicitud» → «Declaración» del sitio.",
  "zh": "请通过网站上的“📝 申请”→“声明”表单联系我们。",
  "hi": "साइट पर «📝 अनुरोध» → «वक्तव्य» फ़ॉर्म के माध्यम से हमें लिखें।"
 },
 "або через форму «📝 Заявка» → «Заява».": {
  "en": "or via the “📝 Request” → “Statement” form.",
  "de": "oder über das Formular „📝 Anfrage“ → „Erklärung“.",
  "pl": "lub przez formularz „📝 Zgłoszenie” → „Oświadczenie”.",
  "es": "o mediante el formulario «📝 Solicitud» → «Declaración».",
  "zh": "或通过“📝 申请”→“声明”表单。",
  "hi": "या «📝 अनुरोध» → «वक्तव्य» फ़ॉर्म के माध्यम से।"
 },
 "Причина:": {
  "en": "Reason:",
  "de": "Grund:",
  "pl": "Powód:",
  "es": "Motivo:",
  "zh": "原因：",
  "hi": "कारण:"
 },
 "Порушення авторських прав": {
  "en": "Copyright infringement",
  "de": "Urheberrechtsverletzung",
  "pl": "Naruszenie praw autorskich",
  "es": "Infracción de derechos de autor",
  "zh": "侵犯著作权",
  "hi": "कॉपीराइट का उल्लंघन"
 },
 "Образливий або незаконний вміст": {
  "en": "Offensive or illegal content",
  "de": "Beleidigender oder illegaler Inhalt",
  "pl": "Treści obraźliwe lub nielegalne",
  "es": "Contenido ofensivo o ilegal",
  "zh": "冒犯性或非法内容",
  "hi": "आपत्तिजनक या अवैध सामग्री"
 },
 "Спам або реклама": {
  "en": "Spam or advertising",
  "de": "Spam oder Werbung",
  "pl": "Spam lub reklama",
  "es": "Spam o publicidad",
  "zh": "垃圾信息或广告",
  "hi": "स्पैम या विज्ञापन"
 },
 "Неправильна інформація": {
  "en": "Incorrect information",
  "de": "Falsche Informationen",
  "pl": "Nieprawidłowe informacje",
  "es": "Información incorrecta",
  "zh": "信息有误",
  "hi": "गलत जानकारी"
 },
 "Інше": {
  "en": "Other",
  "de": "Sonstiges",
  "pl": "Inne",
  "es": "Otro",
  "zh": "其他",
  "hi": "अन्य"
 },
 "Деталі (необов'язково):": {
  "en": "Details (optional):",
  "de": "Details (optional):",
  "pl": "Szczegóły (opcjonalnie):",
  "es": "Detalles (opcional):",
  "zh": "详情（可选）：",
  "hi": "विवरण (वैकल्पिक):"
 },
 "Опишіть, що саме не так...": {
  "en": "Describe what exactly is wrong...",
  "de": "Beschreiben Sie, was genau nicht stimmt...",
  "pl": "Opisz, co dokładnie jest nie tak...",
  "es": "Describe qué es lo que falla...",
  "zh": "请描述具体问题...",
  "hi": "बताएँ कि ठीक क्या गलत है..."
 },
 "📲 Встановлення на iPhone": {
  "en": "📲 Installing on iPhone",
  "de": "📲 Installation auf dem iPhone",
  "pl": "📲 Instalacja na iPhonie",
  "es": "📲 Instalación en iPhone",
  "zh": "📲 在 iPhone 上安装",
  "hi": "📲 iPhone पर इंस्टॉल करना"
 },
 "Відкрийте цей сайт у браузері": {
  "en": "Open this site in the browser",
  "de": "Öffnen Sie diese Seite im Browser",
  "pl": "Otwórz tę stronę w przeglądarce",
  "es": "Abre este sitio en el navegador",
  "zh": "请在以下浏览器中打开本网站：",
  "hi": "इस साइट को ब्राउज़र में खोलें:"
 },
 "Натисніть кнопку": {
  "en": "Tap the button",
  "de": "Tippen Sie auf die Schaltfläche",
  "pl": "Naciśnij przycisk",
  "es": "Pulsa el botón",
  "zh": "点击按钮",
  "hi": "बटन दबाएँ"
 },
 "«Поділитися»": {
  "en": "“Share”",
  "de": "„Teilen“",
  "pl": "„Udostępnij”",
  "es": "«Compartir»",
  "zh": "“分享”",
  "hi": "«साझा करें»"
 },
 "(квадрат зі стрілкою вгору) внизу екрана.": {
  "en": "(square with an up arrow) at the bottom of the screen.",
  "de": "(Quadrat mit Pfeil nach oben) unten auf dem Bildschirm.",
  "pl": "(kwadrat ze strzałką w górę) u dołu ekranu.",
  "es": "(cuadrado con flecha hacia arriba) en la parte inferior de la pantalla.",
  "zh": "（带向上箭头的方框），位于屏幕底部。",
  "hi": "(ऊपर तीर वाला वर्ग), स्क्रीन के नीचे।"
 },
 "Прокрутіть меню й виберіть": {
  "en": "Scroll the menu and choose",
  "de": "Scrollen Sie im Menü und wählen Sie",
  "pl": "Przewiń menu i wybierz",
  "es": "Desplázate por el menú y elige",
  "zh": "滚动菜单并选择",
  "hi": "मेनू स्क्रॉल करें और चुनें"
 },
 "«На початковий екран»": {
  "en": "“Add to Home Screen”",
  "de": "„Zum Home-Bildschirm“",
  "pl": "„Do ekranu początkowego”",
  "es": "«Añadir a pantalla de inicio»",
  "zh": "“添加到主屏幕”",
  "hi": "«होम स्क्रीन पर जोड़ें»"
 },
 "Натисніть": {
  "en": "Tap",
  "de": "Tippen Sie auf",
  "pl": "Naciśnij",
  "es": "Pulsa",
  "zh": "点击",
  "hi": "दबाएँ"
 },
 "«Додати»": {
  "en": "“Add”",
  "de": "„Hinzufügen“",
  "pl": "„Dodaj”",
  "es": "«Añadir»",
  "zh": "“添加”",
  "hi": "«जोड़ें»"
 },
 ". Іконка InkWave з'явиться на екрані телефону.": {
  "en": ". The InkWave icon will appear on your phone screen.",
  "de": ". Das InkWave-Symbol erscheint auf dem Bildschirm Ihres Telefons.",
  "pl": ". Ikona InkWave pojawi się na ekranie telefonu.",
  "es": ". El icono de InkWave aparecerá en la pantalla del teléfono.",
  "zh": "。InkWave 图标将出现在手机屏幕上。",
  "hi": "। InkWave का आइकन आपके फ़ोन की स्क्रीन पर दिखाई देगा।"
 },
 "Порада: у встановленому додатку входьте за нікнеймом і паролем. Вхід через Google на iPhone у такому режимі може не працювати.": {
  "en": "Tip: in the installed app, log in with your nickname and password. Google sign-in may not work on iPhone in this mode.",
  "de": "Tipp: Melden Sie sich in der installierten App mit Nickname und Passwort an. Die Google-Anmeldung funktioniert auf dem iPhone in diesem Modus möglicherweise nicht.",
  "pl": "Wskazówka: w zainstalowanej aplikacji loguj się pseudonimem i hasłem. Logowanie przez Google na iPhonie w tym trybie może nie działać.",
  "es": "Consejo: en la aplicación instalada, inicia sesión con apodo y contraseña. El acceso con Google puede no funcionar en iPhone en este modo.",
  "zh": "提示：在已安装的应用中请使用昵称和密码登录。在 iPhone 的此模式下，Google 登录可能无法使用。",
  "hi": "सुझाव: इंस्टॉल किए गए ऐप में उपनाम और पासवर्ड से लॉग इन करें। इस मोड में iPhone पर Google लॉग इन काम नहीं कर सकता।"
 },
 "Ваша скринька порожня.": {
  "en": "Your mailbox is empty.",
  "de": "Ihr Postfach ist leer.",
  "pl": "Twoja skrzynka jest pusta.",
  "es": "Tu buzón está vacío.",
  "zh": "您的信箱是空的。",
  "hi": "आपका मेलबॉक्स खाली है।"
 },
 "Ваша поштова скринька порожня.": {
  "en": "Your mailbox is empty.",
  "de": "Ihr Postfach ist leer.",
  "pl": "Twoja skrzynka pocztowa jest pusta.",
  "es": "Tu buzón está vacío.",
  "zh": "您的信箱是空的。",
  "hi": "आपका मेलबॉक्स खाली है।"
 },
 "📝 Ваша скарга успішно надіслана адміністратору.": {
  "en": "📝 Your complaint has been sent to the administrator.",
  "de": "📝 Ihre Beschwerde wurde an den Administrator gesendet.",
  "pl": "📝 Twoja skarga została wysłana do administratora.",
  "es": "📝 Tu queja se ha enviado al administrador.",
  "zh": "📝 您的投诉已发送给管理员。",
  "hi": "📝 आपकी शिकायत व्यवस्थापक को भेज दी गई है।"
 },
 "📝 Вашу скаргу надіслано адміністратору.": {
  "en": "📝 Your complaint has been sent to the administrator.",
  "de": "📝 Ihre Beschwerde wurde an den Administrator gesendet.",
  "pl": "📝 Twoja skarga została wysłana do administratora.",
  "es": "📝 Tu queja se ha enviado al administrador.",
  "zh": "📝 您的投诉已发送给管理员。",
  "hi": "📝 आपकी शिकायत व्यवस्थापक को भेज दी गई है।"
 },
 "📚 Твір \"{0}\" успішно надіслано на розгляд адміністратору.": {
  "en": "📚 Your work \"{0}\" has been sent to the administrator for review.",
  "de": "📚 Ihr Werk „{0}“ wurde zur Prüfung an den Administrator gesendet.",
  "pl": "📚 Utwór „{0}” został wysłany administratorowi do rozpatrzenia.",
  "es": "📚 Tu obra «{0}» se ha enviado al administrador para su revisión.",
  "zh": "📚 您的作品《{0}》已提交管理员审核。",
  "hi": "📚 आपकी कृति \"{0}\" समीक्षा के लिए व्यवस्थापक को भेज दी गई है।"
 },
 "📄 Вашу заяву щодо твору \"{0}\" надіслано адміністрації.": {
  "en": "📄 Your statement about the work \"{0}\" has been sent to the administration.",
  "de": "📄 Ihre Erklärung zum Werk „{0}“ wurde an die Administration gesendet.",
  "pl": "📄 Twoje oświadczenie dotyczące utworu „{0}” zostało wysłane do administracji.",
  "es": "📄 Tu declaración sobre la obra «{0}» se ha enviado a la administración.",
  "zh": "📄 您关于作品《{0}》的声明已发送给管理员。",
  "hi": "📄 कृति \"{0}\" के बारे में आपका वक्तव्य प्रशासन को भेज दिया गया है।"
 },
 "Введіть нікнейм і пароль!": {
  "en": "Enter your nickname and password!",
  "de": "Geben Sie Nickname und Passwort ein!",
  "pl": "Wpisz pseudonim i hasło!",
  "es": "¡Introduce tu apodo y contraseña!",
  "zh": "请输入昵称和密码！",
  "hi": "उपनाम और पासवर्ड दर्ज करें!"
 },
 "Невірний нікнейм або пароль!": {
  "en": "Incorrect nickname or password!",
  "de": "Falscher Nickname oder falsches Passwort!",
  "pl": "Nieprawidłowy pseudonim lub hasło!",
  "es": "¡Apodo o contraseña incorrectos!",
  "zh": "昵称或密码错误！",
  "hi": "उपनाम या पासवर्ड गलत है!"
 },
 "Ім'я користувача повинно містити від 1 до 20 символів!": {
  "en": "The nickname must be 1 to 20 characters long!",
  "de": "Der Nickname muss 1 bis 20 Zeichen lang sein!",
  "pl": "Pseudonim musi mieć od 1 do 20 znaków!",
  "es": "¡El apodo debe tener entre 1 y 20 caracteres!",
  "zh": "昵称必须为 1 到 20 个字符！",
  "hi": "उपनाम 1 से 20 अक्षरों का होना चाहिए!"
 },
 "У нікнеймі можна використовувати лише літери, цифри, пробіл та символи _ . -": {
  "en": "A nickname may only contain letters, digits, spaces and the characters _ . -",
  "de": "Im Nickname sind nur Buchstaben, Ziffern, Leerzeichen und die Zeichen _ . - erlaubt",
  "pl": "W pseudonimie można używać tylko liter, cyfr, spacji i znaków _ . -",
  "es": "El apodo solo puede contener letras, números, espacios y los caracteres _ . -",
  "zh": "昵称只能包含字母、数字、空格以及 _ . - 字符",
  "hi": "उपनाम में केवल अक्षर, अंक, स्पेस और _ . - चिह्न हो सकते हैं"
 },
 "Пароль повинен містити від 6 до 32 символів!": {
  "en": "The password must be 6 to 32 characters long!",
  "de": "Das Passwort muss 6 bis 32 Zeichen lang sein!",
  "pl": "Hasło musi mieć od 6 do 32 znaków!",
  "es": "¡La contraseña debe tener entre 6 y 32 caracteres!",
  "zh": "密码必须为 6 到 32 个字符！",
  "hi": "पासवर्ड 6 से 32 अक्षरों का होना चाहिए!"
 },
 "Паролі не збігаються!": {
  "en": "Passwords do not match!",
  "de": "Die Passwörter stimmen nicht überein!",
  "pl": "Hasła nie są takie same!",
  "es": "¡Las contraseñas no coinciden!",
  "zh": "两次输入的密码不一致！",
  "hi": "पासवर्ड मेल नहीं खाते!"
 },
 "Цей нікнейм заблоковано або був видалений адміністрацією. Оберіть інший!": {
  "en": "This nickname is blocked or was removed by the administration. Choose another one!",
  "de": "Dieser Nickname ist gesperrt oder wurde von der Administration entfernt. Wählen Sie einen anderen!",
  "pl": "Ten pseudonim jest zablokowany lub został usunięty przez administrację. Wybierz inny!",
  "es": "Este apodo está bloqueado o fue eliminado por la administración. ¡Elige otro!",
  "zh": "该昵称已被封禁或被管理员删除，请选择其他昵称！",
  "hi": "यह उपनाम ब्लॉक है या प्रशासन द्वारा हटाया गया है। कोई दूसरा चुनें!"
 },
 "Цей нікнейм вже зайнятий!": {
  "en": "This nickname is already taken!",
  "de": "Dieser Nickname ist bereits vergeben!",
  "pl": "Ten pseudonim jest już zajęty!",
  "es": "¡Este apodo ya está en uso!",
  "zh": "该昵称已被占用！",
  "hi": "यह उपनाम पहले से लिया जा चुका है!"
 },
 "Помилка реєстрації: ": {
  "en": "Registration error: ",
  "de": "Registrierungsfehler: ",
  "pl": "Błąd rejestracji: ",
  "es": "Error de registro: ",
  "zh": "注册出错：",
  "hi": "पंजीकरण त्रुटि: "
 },
 "Реєстрація успішна!": {
  "en": "Registration successful!",
  "de": "Registrierung erfolgreich!",
  "pl": "Rejestracja zakończona sukcesem!",
  "es": "¡Registro completado!",
  "zh": "注册成功！",
  "hi": "पंजीकरण सफल रहा!"
 },
 "Ви дійсно хочете видалити свій акаунт? Цю дію неможливо скасувати.": {
  "en": "Do you really want to delete your account? This action cannot be undone.",
  "de": "Möchten Sie Ihr Konto wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
  "pl": "Czy na pewno chcesz usunąć swoje konto? Tej czynności nie można cofnąć.",
  "es": "¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.",
  "zh": "确定要删除您的账户吗？此操作无法撤销。",
  "hi": "क्या आप सच में अपना खाता हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।"
 },
 "Не вдалося видалити акаунт: ": {
  "en": "Could not delete the account: ",
  "de": "Das Konto konnte nicht gelöscht werden: ",
  "pl": "Nie udało się usunąć konta: ",
  "es": "No se pudo eliminar la cuenta: ",
  "zh": "无法删除账户：",
  "hi": "खाता नहीं हटाया जा सका: "
 },
 "Ваш акаунт успішно видалено.": {
  "en": "Your account has been deleted.",
  "de": "Ihr Konto wurde gelöscht.",
  "pl": "Twoje konto zostało usunięte.",
  "es": "Tu cuenta se ha eliminado.",
  "zh": "您的账户已删除。",
  "hi": "आपका खाता हटा दिया गया है।"
 },
 "Для подачі скарги необхідно зареєструватися або увійти в акаунт!": {
  "en": "To submit a complaint you need to sign up or log in!",
  "de": "Um eine Beschwerde einzureichen, müssen Sie sich registrieren oder anmelden!",
  "pl": "Aby złożyć skargę, musisz się zarejestrować lub zalogować!",
  "es": "Para enviar una queja debes registrarte o iniciar sesión.",
  "zh": "提交投诉需要先注册或登录！",
  "hi": "शिकायत दर्ज करने के लिए पंजीकरण या लॉग इन करना आवश्यक है!"
 },
 "Для подачі заявки / рекомендації твору необхідно зареєструватися або увійти в акаунт!": {
  "en": "To submit a request / recommend a book you need to sign up or log in!",
  "de": "Um eine Anfrage einzureichen / ein Werk zu empfehlen, müssen Sie sich registrieren oder anmelden!",
  "pl": "Aby złożyć zgłoszenie / polecić utwór, musisz się zarejestrować lub zalogować!",
  "es": "Para enviar una solicitud o recomendar una obra debes registrarte o iniciar sesión.",
  "zh": "提交申请/推荐作品需要先注册或登录！",
  "hi": "अनुरोध भेजने / कृति सुझाने के लिए पंजीकरण या लॉग इन करना आवश्यक है!"
 },
 "Для подачі заяви необхідно зареєструватися або увійти в акаунт!": {
  "en": "To submit a statement you need to sign up or log in!",
  "de": "Um eine Erklärung einzureichen, müssen Sie sich registrieren oder anmelden!",
  "pl": "Aby złożyć oświadczenie, musisz się zarejestrować lub zalogować!",
  "es": "Para enviar una declaración debes registrarte o iniciar sesión.",
  "zh": "提交声明需要先注册或登录！",
  "hi": "वक्तव्य भेजने के लिए पंजीकरण या लॉग इन करना आवश्यक है!"
 },
 "Будь ласка, додайте хоча б одну главу!": {
  "en": "Please add at least one chapter!",
  "de": "Bitte fügen Sie mindestens ein Kapitel hinzu!",
  "pl": "Dodaj co najmniej jeden rozdział!",
  "es": "¡Añade al menos un capítulo!",
  "zh": "请至少添加一个章节！",
  "hi": "कृपया कम से कम एक अध्याय जोड़ें!"
 },
 "Будь ласка, увійдіть або зареєструйтеся, щоб ставити оцінки!": {
  "en": "Please log in or sign up to rate!",
  "de": "Bitte melden Sie sich an oder registrieren Sie sich, um zu bewerten!",
  "pl": "Zaloguj się lub zarejestruj, aby oceniać!",
  "es": "Inicia sesión o regístrate para valorar.",
  "zh": "请登录或注册后再评分！",
  "hi": "रेटिंग देने के लिए कृपया लॉग इन या साइन अप करें!"
 },
 "Не вдалося зберегти лайк. Спробуйте ще раз.": {
  "en": "Could not save the like. Please try again.",
  "de": "Der Like konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.",
  "pl": "Nie udało się zapisać polubienia. Spróbuj ponownie.",
  "es": "No se pudo guardar el me gusta. Inténtalo de nuevo.",
  "zh": "无法保存点赞，请重试。",
  "hi": "लाइक सहेजा नहीं जा सका। कृपया पुनः प्रयास करें।"
 },
 "Не вдалося зберегти оцінку. Спробуйте ще раз.": {
  "en": "Could not save the rating. Please try again.",
  "de": "Die Bewertung konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.",
  "pl": "Nie udało się zapisać oceny. Spróbuj ponownie.",
  "es": "No se pudo guardar la valoración. Inténtalo de nuevo.",
  "zh": "无法保存评分，请重试。",
  "hi": "रेटिंग सहेजी नहीं जा सकी। कृपया पुनः प्रयास करें।"
 },
 "Помилка: не вдалося завантажити глави цієї книги.": {
  "en": "Error: could not load the chapters of this book.",
  "de": "Fehler: Die Kapitel dieses Buchs konnten nicht geladen werden.",
  "pl": "Błąd: nie udało się załadować rozdziałów tej książki.",
  "es": "Error: no se pudieron cargar los capítulos de este libro.",
  "zh": "错误：无法加载这本书的章节。",
  "hi": "त्रुटि: इस पुस्तक के अध्याय लोड नहीं हो सके।"
 },
 "Не вдалося надіслати коментар: ": {
  "en": "Could not post the comment: ",
  "de": "Der Kommentar konnte nicht gesendet werden: ",
  "pl": "Nie udało się wysłać komentarza: ",
  "es": "No se pudo enviar el comentario: ",
  "zh": "无法发表评论：",
  "hi": "टिप्पणी नहीं भेजी जा सकी: "
 },
 "Помилка входу через Google: ": {
  "en": "Google sign-in error: ",
  "de": "Fehler bei der Google-Anmeldung: ",
  "pl": "Błąd logowania przez Google: ",
  "es": "Error al iniciar sesión con Google: ",
  "zh": "Google 登录出错：",
  "hi": "Google लॉग इन त्रुटि: "
 },
 "Помилка надсилання скарги в Supabase: ": {
  "en": "Error sending the complaint: ",
  "de": "Fehler beim Senden der Beschwerde: ",
  "pl": "Błąd wysyłania skargi: ",
  "es": "Error al enviar la queja: ",
  "zh": "发送投诉时出错：",
  "hi": "शिकायत भेजने में त्रुटि: "
 },
 "Помилка надсилання скарги: ": {
  "en": "Error sending the complaint: ",
  "de": "Fehler beim Senden der Beschwerde: ",
  "pl": "Błąd wysyłania skargi: ",
  "es": "Error al enviar la queja: ",
  "zh": "发送投诉时出错：",
  "hi": "शिकायत भेजने में त्रुटि: "
 },
 "Помилка надсилання заяви в Supabase: ": {
  "en": "Error sending the statement: ",
  "de": "Fehler beim Senden der Erklärung: ",
  "pl": "Błąd wysyłania oświadczenia: ",
  "es": "Error al enviar la declaración: ",
  "zh": "发送声明时出错：",
  "hi": "वक्तव्य भेजने में त्रुटि: "
 },
 "Помилка надсилання твору на модерацію: ": {
  "en": "Error sending the work for moderation: ",
  "de": "Fehler beim Senden des Werks zur Prüfung: ",
  "pl": "Błąd wysyłania utworu do moderacji: ",
  "es": "Error al enviar la obra a moderación: ",
  "zh": "提交作品审核时出错：",
  "hi": "कृति को मॉडरेशन के लिए भेजने में त्रुटि: "
 },
 "Щоб встановити InkWave: відкрийте сайт у Chrome, натисніть меню ⋮ (три крапки) угорі й виберіть «Встановити додаток» або «Додати на головний екран».": {
  "en": "To install InkWave: open the site in Chrome, tap the ⋮ menu (three dots) at the top and choose “Install app” or “Add to Home screen”.",
  "de": "So installieren Sie InkWave: Öffnen Sie die Seite in Chrome, tippen Sie oben auf das Menü ⋮ (drei Punkte) und wählen Sie „App installieren“ oder „Zum Startbildschirm hinzufügen“.",
  "pl": "Aby zainstalować InkWave: otwórz stronę w Chrome, dotknij menu ⋮ (trzy kropki) u góry i wybierz „Zainstaluj aplikację” lub „Dodaj do ekranu głównego”.",
  "es": "Para instalar InkWave: abre el sitio en Chrome, toca el menú ⋮ (tres puntos) en la parte superior y elige «Instalar aplicación» o «Añadir a la pantalla de inicio».",
  "zh": "安装 InkWave：请在 Chrome 中打开网站，点击顶部的 ⋮ 菜单（三个点），选择“安装应用”或“添加到主屏幕”。",
  "hi": "InkWave इंस्टॉल करने के लिए: साइट को Chrome में खोलें, ऊपर ⋮ मेनू (तीन बिंदु) दबाएँ और «ऐप इंस्टॉल करें» या «होम स्क्रीन पर जोड़ें» चुनें।"
 },
 "Встановлення доступне в Chrome або Edge: натисніть значок встановлення в правому краї адресного рядка.": {
  "en": "Installation is available in Chrome or Edge: click the install icon at the right end of the address bar.",
  "de": "Die Installation ist in Chrome oder Edge möglich: Klicken Sie auf das Installationssymbol am rechten Rand der Adressleiste.",
  "pl": "Instalacja jest dostępna w Chrome lub Edge: kliknij ikonę instalacji po prawej stronie paska adresu.",
  "es": "La instalación está disponible en Chrome o Edge: haz clic en el icono de instalación al final de la barra de direcciones.",
  "zh": "可在 Chrome 或 Edge 中安装：点击地址栏右侧的安装图标。",
  "hi": "इंस्टॉलेशन Chrome या Edge में उपलब्ध है: एड्रेस बार के दाएँ किनारे पर इंस्टॉल आइकन दबाएँ।"
 },
 "Файл завеликий (максимум {0} МБ). Оберіть менше зображення.": {
  "en": "The file is too large (maximum {0} MB). Choose a smaller image.",
  "de": "Die Datei ist zu groß (maximal {0} MB). Wählen Sie ein kleineres Bild.",
  "pl": "Plik jest za duży (maksymalnie {0} MB). Wybierz mniejszy obraz.",
  "es": "El archivo es demasiado grande (máximo {0} MB). Elige una imagen más pequeña.",
  "zh": "文件过大（最大 {0} MB），请选择更小的图片。",
  "hi": "फ़ाइल बहुत बड़ी है (अधिकतम {0} MB)। छोटी छवि चुनें।"
 },
 "Щоб поскаржитися, увійдіть в акаунт.": {
  "en": "To report, please log in.",
  "de": "Um etwas zu melden, melden Sie sich bitte an.",
  "pl": "Aby zgłosić, zaloguj się.",
  "es": "Para denunciar, inicia sesión.",
  "zh": "举报前请先登录。",
  "hi": "रिपोर्ट करने के लिए कृपया लॉग इन करें।"
 },
 "Коментар уже не існує.": {
  "en": "The comment no longer exists.",
  "de": "Der Kommentar existiert nicht mehr.",
  "pl": "Komentarz już nie istnieje.",
  "es": "El comentario ya no existe.",
  "zh": "该评论已不存在。",
  "hi": "यह टिप्पणी अब मौजूद नहीं है।"
 },
 "Дякуємо! Скаргу надіслано адміністрації.": {
  "en": "Thank you! Your report has been sent to the administration.",
  "de": "Danke! Ihre Meldung wurde an die Administration gesendet.",
  "pl": "Dziękujemy! Zgłoszenie wysłano do administracji.",
  "es": "¡Gracias! Tu denuncia se ha enviado a la administración.",
  "zh": "谢谢！举报已发送给管理员。",
  "hi": "धन्यवाद! आपकी रिपोर्ट प्रशासन को भेज दी गई है।"
 },
 "Посилання скопійовано:": {
  "en": "Link copied:",
  "de": "Link kopiert:",
  "pl": "Skopiowano link:",
  "es": "Enlace copiado:",
  "zh": "链接已复制：",
  "hi": "लिंक कॉपी किया गया:"
 },
 "Скопіюйте посилання:": {
  "en": "Copy the link:",
  "de": "Kopieren Sie den Link:",
  "pl": "Skopiuj link:",
  "es": "Copia el enlace:",
  "zh": "请复制链接：",
  "hi": "लिंक कॉपी करें:"
 },
 "Цю книгу не знайдено — можливо, її видалено.": {
  "en": "This book was not found — it may have been deleted.",
  "de": "Dieses Buch wurde nicht gefunden – möglicherweise wurde es gelöscht.",
  "pl": "Nie znaleziono tej książki — być może została usunięta.",
  "es": "No se encontró este libro; quizá se haya eliminado.",
  "zh": "未找到这本书，可能已被删除。",
  "hi": "यह पुस्तक नहीं मिली — हो सकता है इसे हटा दिया गया हो।"
 },
 "Цей акаунт створено через Google — скористайтесь кнопкою «Увійти через Google».": {
  "en": "This account was created with Google — use the “Sign in with Google” button.",
  "de": "Dieses Konto wurde über Google erstellt – verwenden Sie die Schaltfläche „Mit Google anmelden“.",
  "pl": "To konto utworzono przez Google — użyj przycisku „Zaloguj się przez Google”.",
  "es": "Esta cuenta se creó con Google: usa el botón «Iniciar sesión con Google».",
  "zh": "该账户通过 Google 创建，请使用“使用 Google 登录”按钮。",
  "hi": "यह खाता Google से बनाया गया था — «Google से लॉग इन करें» बटन का उपयोग करें।"
 },
 "Цей акаунт створено за старою системою. Увійдіть з того пристрою й браузера, де ви реєструвались, — пароль перенесеться автоматично. Якщо такого доступу немає — напишіть адміністрації.": {
  "en": "This account was created under the old system. Log in from the device and browser where you registered — the password will be transferred automatically. If you no longer have access, contact the administration.",
  "de": "Dieses Konto wurde im alten System erstellt. Melden Sie sich auf dem Gerät und im Browser an, mit dem Sie sich registriert haben – das Passwort wird automatisch übertragen. Falls Sie keinen Zugriff mehr haben, wenden Sie sich an die Administration.",
  "pl": "To konto utworzono w starym systemie. Zaloguj się z urządzenia i przeglądarki, na których się rejestrowałeś — hasło zostanie przeniesione automatycznie. Jeśli nie masz do nich dostępu, napisz do administracji.",
  "es": "Esta cuenta se creó con el sistema anterior. Inicia sesión desde el dispositivo y el navegador con los que te registraste: la contraseña se transferirá automáticamente. Si ya no tienes acceso, escribe a la administración.",
  "zh": "该账户是在旧系统中创建的。请在您注册时使用的设备和浏览器上登录，密码会自动迁移。如果无法访问，请联系管理员。",
  "hi": "यह खाता पुरानी प्रणाली में बनाया गया था। जिस डिवाइस और ब्राउज़र से आपने पंजीकरण किया था उससे लॉग इन करें — पासवर्ड अपने आप स्थानांतरित हो जाएगा। यदि वह उपलब्ध नहीं है, तो प्रशासन को लिखें।"
 },
 "Акаунт не знайдено. Зверніться до адміністрації.": {
  "en": "Account not found. Please contact the administration.",
  "de": "Konto nicht gefunden. Wenden Sie sich an die Administration.",
  "pl": "Nie znaleziono konta. Skontaktuj się z administracją.",
  "es": "Cuenta no encontrada. Ponte en contacto con la administración.",
  "zh": "未找到账户，请联系管理员。",
  "hi": "खाता नहीं मिला। कृपया प्रशासन से संपर्क करें।"
 },
 "Ви впевнені, що хочете видалити твір \"{0}\"?": {
  "en": "Are you sure you want to delete the work \"{0}\"?",
  "de": "Sind Sie sicher, dass Sie das Werk „{0}“ löschen möchten?",
  "pl": "Czy na pewno chcesz usunąć utwór „{0}”?",
  "es": "¿Seguro que quieres eliminar la obra «{0}»?",
  "zh": "确定要删除作品《{0}》吗？",
  "hi": "क्या आप सच में कृति \"{0}\" हटाना चाहते हैं?"
 },
 "Разом із ним буде видалено всі його коментарі, лайки й оцінки. Це незворотно.": {
  "en": "All its comments, likes and ratings will be deleted with it. This cannot be undone.",
  "de": "Alle zugehörigen Kommentare, Likes und Bewertungen werden mit gelöscht. Dies kann nicht rückgängig gemacht werden.",
  "pl": "Wraz z nim zostaną usunięte wszystkie komentarze, polubienia i oceny. Tej czynności nie można cofnąć.",
  "es": "Se eliminarán también todos sus comentarios, me gusta y valoraciones. No se puede deshacer.",
  "zh": "其所有评论、点赞和评分也将一并删除，且无法恢复。",
  "hi": "इसके साथ सभी टिप्पणियाँ, लाइक और रेटिंग भी हटा दी जाएँगी। यह वापस नहीं हो सकता।"
 }
};

    // ------------------------------------------------- підготовка словника
    const exact = new Map();
    const templates = [];
    const prefixes = [];
    Object.keys(DICT).forEach(key => {
        if (/\{\d\}/.test(key)) {
            const parts = key.split(/\{(\d)\}/);
            let pattern = '^';
            for (let i = 0; i < parts.length; i++) {
                if (i % 2 === 0) pattern += parts[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                else pattern += '([\\s\\S]+?)';
            }
            templates.push({ key, re: new RegExp(pattern + '$') });
        } else if (/: $/.test(key)) {
            prefixes.push({ key });
        } else {
            exact.set(key, DICT[key]);
        }
    });
    prefixes.sort((a, b) => b.key.length - a.key.length);

    let current = detectLang();

    function detectLang() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved && LANGS.some(l => l.code === saved)) return saved;
        } catch (e) { /* localStorage недоступний */ }
        const list = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || 'uk'];
        for (const l of list) {
            const c = String(l).toLowerCase().split('-')[0];
            if (c === 'ru' || c === 'be') return 'uk';
            if (LANGS.some(x => x.code === c)) return c;
        }
        return 'en';
    }

    // ------------------------------------------------------------- переклад
    function translateCore(core, lang, depth) {
        const hit = exact.get(core);
        if (hit && hit[lang]) return hit[lang];

        for (const t of templates) {
            const m = t.re.exec(core);
            if (m) {
                const tpl = DICT[t.key][lang];
                if (tpl) {
                    return tpl.replace(/\{(\d)\}/g, (_, n) => {
                        const cap = m[Number(n) + 1];
                        return depth < 2 ? translateCore(cap, lang, depth + 1) : cap;
                    });
                }
            }
        }

        if (core.indexOf(' • ') !== -1 && depth < 2) {
            let changed = false;
            const out = core.split(' • ').map(p => {
                const r = translateCore(p, lang, depth + 1);
                if (r !== p) changed = true;
                return r;
            });
            if (changed) return out.join(' • ');
        }

        for (const p of prefixes) {
            if (core.startsWith(p.key) && DICT[p.key][lang]) {
                return DICT[p.key][lang] + core.slice(p.key.length);
            }
        }
        return core;
    }

    function translateText(text, lang) {
        if (!text) return text;
        const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(text);
        const core = m[2];
        if (!core || core.length > 1200) return text;
        if (!/[\u0400-\u04FF]/.test(core) && !exact.has(core) && core.indexOf(' • ') === -1) return text;
        const out = translateCore(core, lang, 0);
        return out === core ? text : m[1] + out + m[3];
    }

    // для alert / confirm / prompt (може бути кілька рядків)
    function translateMessage(msg) {
        const s = String(msg);
        const whole = translateText(s, current);
        if (whole !== s) return whole;
        if (s.indexOf('\n') !== -1) return s.split('\n').map(l => translateText(l, current)).join('\n');
        return s;
    }

    // ------------------------------------------------------------------ DOM
    const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'NOSCRIPT', 'CODE']);
    const ATTRS = ['placeholder', 'title', 'alt', 'aria-label'];
    const origText = new WeakMap();
    const origAttr = new WeakMap();

    function processTextNode(node) {
        const parent = node.parentNode;
        if (!parent || SKIP.has(parent.nodeName)) return;
        const rec = origText.get(node);
        const cur = node.nodeValue;
        const base = (rec && rec.shown === cur) ? rec.orig : cur;
        const next = translateText(base, current);
        if (next !== cur) node.nodeValue = next;
        if (next !== base || rec) origText.set(node, { orig: base, shown: next });
    }

    function processAttr(el, name) {
        const cur = el.getAttribute(name);
        if (cur == null) return;
        let rec = origAttr.get(el);
        if (!rec) { rec = {}; origAttr.set(el, rec); }
        const r = rec[name];
        const base = (r && r.shown === cur) ? r.orig : cur;
        const next = translateText(base, current);
        if (next !== cur) el.setAttribute(name, next);
        if (next !== base || r) rec[name] = { orig: base, shown: next };
    }

    function processTree(root) {
        if (!root) return;
        if (root.nodeType === 3) { processTextNode(root); return; }
        if (root.nodeType !== 1 || SKIP.has(root.nodeName)) return;
        ATTRS.forEach(a => { if (root.hasAttribute(a)) processAttr(root, a); });
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
            acceptNode: n => (n.nodeType === 1 && SKIP.has(n.nodeName)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
        });
        let n;
        while ((n = walker.nextNode())) {
            if (n.nodeType === 3) processTextNode(n);
            else ATTRS.forEach(a => { if (n.hasAttribute(a)) processAttr(n, a); });
        }
    }

    const observer = new MutationObserver(muts => {
        muts.forEach(m => {
            if (m.type === 'childList') m.addedNodes.forEach(processTree);
            else if (m.type === 'characterData') processTextNode(m.target);
            else if (m.type === 'attributes') processAttr(m.target, m.attributeName);
        });
    });

    // --------------------------------------------------------- перемикач мови
    function injectCss() {
        const st = document.createElement('style');
        st.textContent =
            '.lang-wrap{position:relative;display:inline-block}' +
            '#langBtn{display:inline-flex;align-items:center;gap:4px;font-size:.95rem;padding:.45rem .7rem;cursor:pointer}' +
            '.lang-menu{position:absolute;right:0;top:calc(100% + 6px);min-width:190px;max-width:calc(100vw - 24px);background:var(--card-bg);color:var(--text-color);border:1px solid var(--border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.2);padding:6px;z-index:1500}' +
            '.lang-menu button{display:flex;gap:10px;align-items:center;width:100%;padding:.5rem .6rem;background:none;border:none;border-radius:6px;color:inherit;cursor:pointer;text-align:left;font-size:.95rem}' +
            '.lang-menu button:hover,.lang-menu button.active{background:var(--bg-color)}' +
            '.lang-menu button b{min-width:2rem;color:var(--accent)}';
        document.head.appendChild(st);
    }

    function buildSwitcher() {
        const host = document.querySelector('.header-right');
        if (!host || document.getElementById('langBtn')) return;
        const wrap = document.createElement('div');
        wrap.className = 'lang-wrap';
        wrap.innerHTML = '<button type="button" id="langBtn" class="icon-btn" aria-haspopup="true" aria-expanded="false" aria-label="Language">🌐 <span id="langCode"></span> ▾</button>' +
                         '<div id="langMenu" class="lang-menu hidden" role="menu"></div>';
        const theme = document.getElementById('themeToggle');
        host.insertBefore(wrap, theme || null);

        const btn = wrap.querySelector('#langBtn');
        const menu = wrap.querySelector('#langMenu');
        LANGS.forEach(l => {
            const it = document.createElement('button');
            it.type = 'button';
            it.setAttribute('role', 'menuitem');
            it.dataset.lang = l.code;
            it.innerHTML = '<b></b><span></span>';
            it.firstChild.textContent = l.label;
            it.lastChild.textContent = l.name;
            it.addEventListener('click', () => { setLang(l.code); closeMenu(); });
            menu.appendChild(it);
        });

        function closeMenu() { menu.classList.add('hidden'); btn.setAttribute('aria-expanded', 'false'); }
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const opening = menu.classList.contains('hidden');
            if (!opening) { closeMenu(); return; }
            menu.classList.remove('hidden');
            btn.setAttribute('aria-expanded', 'true');
            // якщо кнопка біля лівого краю — відкриваємо меню вправо
            const r = btn.getBoundingClientRect();
            if (r.right < 200) { menu.style.left = '0'; menu.style.right = 'auto'; }
            else { menu.style.left = 'auto'; menu.style.right = '0'; }
        });
        document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) closeMenu(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
        updateSwitcher();
    }

    function updateSwitcher() {
        const code = document.getElementById('langCode');
        const lang = LANGS.find(l => l.code === current) || LANGS[0];
        if (code) code.textContent = lang.label;
        document.querySelectorAll('#langMenu button').forEach(b => b.classList.toggle('active', b.dataset.lang === current));
    }

    function setLang(code) {
        if (!LANGS.some(l => l.code === code)) return;
        current = code;
        try { localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* ігноруємо */ }
        document.documentElement.lang = code;
        updateSwitcher();
        processTree(document.body);
    }

    // ----------------------------------------- alert / confirm / prompt
    ['alert', 'confirm', 'prompt'].forEach(fn => {
        const original = window[fn].bind(window);
        window[fn] = function (msg, def) {
            if (msg === undefined) return original();
            return fn === 'prompt' ? original(translateMessage(msg), def) : original(translateMessage(msg));
        };
    });

    function init() {
        injectCss();
        buildSwitcher();
        document.documentElement.lang = current;
        processTree(document.body);
        observer.observe(document.body, {
            childList: true, subtree: true, characterData: true,
            attributes: true, attributeFilter: ATTRS
        });
    }

    window.I18N = { getLang: () => current, setLang, t: translateMessage, langs: LANGS };

    if (document.body) init();
    else document.addEventListener('DOMContentLoaded', init);
})();
