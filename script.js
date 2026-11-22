// ======================================================================
// InkWave — script.js (версія з посиленим захистом)
// Усі функції й дії пронумеровані: «// ── N. опис ──». Старий код збережено.
// ЗМІНИ:
//  1) Віковий фільтр — виправлено логіку в renderBooks().
//  2) Скринька оновлюється сама (опитування бази кожні 4 с) — розділ II.
//  3) Відповіді адміна, відхилення, схвалення й оголошення — у таблиці notifications.
//  4) ЗАХИСТ: вхід і реєстрація через Supabase Auth (паролі — хеші на сервері),
//     права адміна перевіряє база (RLS), екранування тексту проти XSS — розділ XIV.
//  5) НОВЕ: умови/конфіденційність/контакти, кнопки «Поскаржитися»,
//     сортування каталогу, «Поділитися», інструкція для iPhone — розділ XIV.
// ======================================================================
// Підключення до Supabase
const SUPABASE_URL = 'https://gopjdttdgswmgerzkkwa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_d2sl_r7jdKx8v8Vp8EZg8g_5cC0AHDX';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let booksData = [];

// ======================================================================
// РОЗДІЛ I. ПІДКЛЮЧЕННЯ ДО SUPABASE ТА ЗАВАНТАЖЕННЯ ДАНИХ
// ======================================================================

// ── 1. Застосовує збережену тему (світла/темна) при відкритті сторінки ──
// Автоматичне застосування збереженої теми при завантаженні
(function initSavedTheme() {
    const savedTheme = localStorage.getItem('transverse_theme');
    const themeBtn = document.getElementById('themeToggle');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeBtn) themeBtn.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-theme');
        if (themeBtn) themeBtn.textContent = '🌙';
    }
})();

// ── 2. ОНОВЛЕННЯ КНИГИ в базі: зберігає коментарі книги (лайки й оцінки — в окремих таблицях, див. пункти 157–159) ──
// Спеціальна функція для оновлення JSONB полів та розділів у Supabase
async function syncBookToSupabase(book) {
    // Тепер зберігаємо лише коментарі. Лайки й оцінки записуються в окремі таблиці
    // (book_likes, book_ratings, chapter_ratings), де база гарантує один голос від людини.
    if (!Array.isArray(book.comments)) book.comments = [];

    const { error } = await _supabase
        .from('books')
        .update({ comments: book.comments })
        .eq('id', book.id);

    if (error) {
        console.error('❌ ПОМИЛКА SUPABASE UPDATE:', error.message);
        return false;
    }
    return true;
}

// ── 2а. КОМЕНТАРІ в окремій таблиці comments: автора й id користувача ставить БАЗА, а не браузер ──
async function postCommentToDb(text, parentId) {
    const { data, error } = await _supabase
        .from('comments')
        .insert({ book_id: currentBook.id, parent_id: parentId || null, text: text })
        .select('id, author, text, created_at')
        .single();
    if (error) {
        console.error('❌ Помилка коментаря:', error.message);
        alert('Не вдалося надіслати коментар: ' + error.message);
        return null;
    }
    return {
        id: data.id,
        author: data.author,
        text: data.text,
        date: new Date(data.created_at).toLocaleDateString()
    };
}

async function addTopLevelComment(text) {
    const c = await postCommentToDb(text, null);
    if (!c) return false;
    if (!Array.isArray(currentBook.comments)) currentBook.comments = [];
    currentBook.comments.push({ ...c, replies: [] });
    renderComments();
    return true;
}

// ── 3. Завантажує користувачів із таблиці users у локальний список registeredUsers ──
// Завантаження користувачів із таблиці public.users
async function loadUsersFromSupabase() {
    const { data, error } = await _supabase.from('users').select('id, username, reg_date, avatar_url, auth_type, auth_user_id');
    if (error) {
        console.error('Помилка завантаження користувачів:', error.message);
        return;
    }
    if (data) {
        data.forEach(u => {
            if (u.username) {
                const existingPass = registeredUsers[u.username]?.password || u.password || '';
                registeredUsers[u.username] = {
                    id: u.id,
                    password: existingPass,
                    email: null,
                    regDate: u.reg_date ? new Date(u.reg_date).toLocaleDateString() : new Date().toLocaleDateString(),
                    avatar: u.avatar_url || null,
                    authType: u.auth_type || 'local',
                    authUserId: u.auth_user_id || null
                };
            }
        });
        localStorage.setItem('transverse_registered_users', JSON.stringify(registeredUsers));
    }
}

// ── 4. Завантажує заявки зі статусом pending із таблиці submissions (для адміна) ──
// Завантаження заявок із таблиці public.submissions
async function loadSubmissionsFromSupabase() {
    const { data, error } = await _supabase
        .from('submissions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Помилка завантаження заявок із Supabase:', error.message);
        return;
    }

    if (data) {
        submissions = data.map(row => {
            const payload = row.payload || {};
            return {
                dbId: row.id,
                userId: row.user_id,
                type: row.type,
                author: row.author_username || 'Невідомий',
                date: row.created_at ? new Date(row.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
                status: row.status,
                ...payload
            };
        });
        localStorage.setItem('transverse_submissions', JSON.stringify(submissions));
    }
}

// ── 5. Перевіряє вхід через Google і створює запис користувача в таблиці users ──
// Автоматична перевірка входу через Google OAuth при завантаженні сторінки
async function handleGoogleAuthRedirect() {
    const { data: { session } } = await _supabase.auth.getSession();

    // Немає активної сесії Supabase — значить, ніхто не ввійшов (підроблений localStorage не діє)
    if (!session || !session.user) {
        if (userProfile) {
            userProfile = null;
            localStorage.removeItem('transverse_user');
        }
        return;
    }

    // Вхід за нікнеймом і паролем (звичайні користувачі та адміністратори)
    if ((session.user.app_metadata?.provider || 'email') !== 'google') {
        const restored = await applyEmailSession(session.user);
        if (!restored) {
            userProfile = null;
            localStorage.removeItem('transverse_user');
        }
        return;
    }

    // Вхід через Google
    if (session && session.user) {
        const googleUser = session.user;
        const username = googleUser.user_metadata?.full_name || googleUser.email.split('@')[0];
        const avatar = googleUser.user_metadata?.avatar_url || null;

        userProfile = {
            username: username,
            isAdmin: false,
            isSuperAdmin: false,
            email: googleUser.email,
            isGoogleAuth: true,
            authUserId: googleUser.id
        };
        localStorage.setItem('transverse_user', JSON.stringify(userProfile));
        
        const { data: existingUser } = await _supabase
            .from('users')
            .select('id, username')
            .eq('auth_user_id', googleUser.id)
            .maybeSingle();

        if (!existingUser) {
            await _supabase.from('users').insert([{
                username: username,
                email: googleUser.email,
                reg_date: new Date().toISOString(),
                avatar_url: avatar,
                auth_type: 'google',
                auth_user_id: googleUser.id
            }]);
        }

        if (!registeredUsers[username]) {
            registeredUsers[username] = {
                password: 'GOOGLE_OAUTH_USER',
                email: googleUser.email,
                regDate: new Date().toLocaleDateString(),
                avatar: avatar,
                authType: 'google',
                authUserId: googleUser.id
            };
            localStorage.setItem('transverse_registered_users', JSON.stringify(registeredUsers));
        }
    }
}

// ── 6. ЗАВАНТАЖЕННЯ КНИГ із таблиці books, перетворення в локальний формат, малювання каталогу, оновлення відкритої книги ──
// Завантаження книг із бази Supabase
async function loadBooksFromSupabase(isBackground = false) {
    if (!isBackground) {
        await handleGoogleAuthRedirect();
        await loadUsersFromSupabase();
        await loadBannedUsernamesFromSupabase();
        await loadSubmissionsFromSupabase();
        updateUIByRole();
        await loadNotificationsFromSupabase();
    }

    const { data, error } = await _supabase.from('books').select('*');
    if (error) {
        console.error('Помилка завантаження книг:', error);
    } else {
        const rawBooks = data || [];
        
        booksData = rawBooks.map(b => ({
            id: b.id,
            title: b.Заголовок || b.title,
            authorName: b.author_name,
            authorSurname: b.author_surname,
            originalLang: b.original_lang || 'Авторський переклад',
            genre: b.Жанр || b.genre,
            ageMin: b.age_min || 0,
            ageMax: b.age_max || 99,
            cover: b.обкладинка || b.cover,
            description: b.Опис || b.description,
            chapters: Array.isArray(b.Розділи) ? b.Розділи : (Array.isArray(b.chapters) ? b.chapters : []),
            addedBy: b.added_by || 'Admin',
            ratings: Array.isArray(b.ratings) ? b.ratings : [],
            likes: Array.isArray(b.likes) ? b.likes : [],
            comments: Array.isArray(b.comments) ? b.comments : []
        }));

        booksData = booksData.filter(b => b && typeof b === 'object' && Array.isArray(b.chapters) && b.chapters.length > 0);

        // Коментарі беремо з таблиці comments (а не з колонки books.comments)
        const { data: commRows, error: commErr } = await _supabase
            .from('comments')
            .select('id, book_id, parent_id, author, text, created_at')
            .order('id', { ascending: true });
        if (commErr) {
            console.error('Помилка завантаження коментарів:', commErr.message);
        } else {
            const mk = r => ({ id: r.id, author: r.author, text: r.text, date: new Date(r.created_at).toLocaleDateString() });
            const tops = {}, byBook = {};
            (commRows || []).forEach(r => {
                if (r.parent_id == null) {
                    tops[r.id] = { ...mk(r), replies: [] };
                    (byBook[r.book_id] = byBook[r.book_id] || []).push(tops[r.id]);
                }
            });
            (commRows || []).forEach(r => {
                if (r.parent_id != null && tops[r.parent_id]) tops[r.parent_id].replies.push(mk(r));
            });
            booksData.forEach(b => { b.comments = byBook[b.id] || []; });
        }
        booksData.forEach(b => {
            if (b.ageMin === undefined) b.ageMin = 0;
            if (b.ageMax === undefined) b.ageMax = 99;
            b.chapters.forEach(ch => {
                if (!ch.images) ch.images = [];
                if (!Array.isArray(ch.ratings)) ch.ratings = [];
            });
        });

        renderBooks();
        if (!isBackground) openBookFromHash();

        if (currentBook && !readerModal.classList.contains('hidden')) {
            const updatedCurrent = booksData.find(b => String(b.id) === String(currentBook.id));
            if (updatedCurrent) {
                currentBook = updatedCurrent;
                updateBookRatingDisplay();
                updateLikeButton();
                renderComments();
                updateChapterRatingDisplay();
            }
        }
    }
}

// ============================================================
// СПОВІЩЕННЯ ЧЕРЕЗ SUPABASE (таблиця public.notifications)
// Колонки: id, created_at, username, text, read, is_broadcast
// Раніше повідомлення лежали лише в localStorage браузера того, хто їх створив,
// тому відповідь адміна до користувача не доходила. Тепер вони зберігаються в базі.
// ============================================================
// ======================================================================
// РОЗДІЛ II. СПОВІЩЕННЯ ЧЕРЕЗ SUPABASE (НОВИЙ БЛОК — виправлення помилок №2 і №3)
// ======================================================================

// ── 7. Службовий список повідомлень, що зараз відправляються (щоб не було дублів) ──
const sendingNotifs = new WeakSet();

// ── 8. Визначає, чия це скринька: нікнейм користувача або 'guest' ──
function getNotifKey() {
    return userProfile ? userProfile.username : 'guest';
}

// ── 9. НОВЕ: зберігає сповіщення локально й одразу відправляє нові в базу ──
// Зберігає локальний кеш і одразу відправляє нові повідомлення в базу
function saveNotifications() {
    localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));
    flushPendingNotifications();
}

// ── 10. НОВЕ: ВІДПРАВКА нових сповіщень у таблицю notifications (щоб відповідь адміна доходила до користувача) ──
// Відправляє в Supabase усі повідомлення, яких там ще немає (без dbId)
async function flushPendingNotifications() {
    const pending = [];
    Object.keys(userNotifications).forEach(username => {
        const list = userNotifications[username];
        if (!Array.isArray(list)) return;
        list.forEach(item => {
            if (item && !item.dbId && !sendingNotifs.has(item)) pending.push({ username, item });
        });
    });
    if (pending.length === 0) return;

    pending.forEach(p => sendingNotifs.add(p.item));
    const rows = pending.map(p => {
        // id повідомлення = Date.now(), тому використовуємо його як created_at:
        // так адмін потім може точно знайти й видалити це повідомлення в базі
        const ts = Number(p.item.id) > 1e12 ? new Date(Number(p.item.id)) : new Date();
        return {
            username: p.username,
            text: p.item.text,
            read: !!p.item.read,
            is_broadcast: !!p.item.isBroadcast,
            created_at: ts.toISOString()
        };
    });

    const { error } = await _supabase.from('notifications').insert(rows);
    if (error) {
        console.error('❌ Не вдалося відправити сповіщення в Supabase:', error.message);
        pending.forEach(p => sendingNotifs.delete(p.item));
        return;
    }

    pending.forEach(p => {
        const list = userNotifications[p.username];
        if (Array.isArray(list)) {
            const i = list.indexOf(p.item);
            if (i !== -1) list.splice(i, 1);
        }
    });
    localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));
    await loadNotificationsFromSupabase();
}

// ── 11. НОВЕ: ОТРИМАННЯ сповіщень користувача з бази; працює автоматично кожні 4 секунди ──
// Завантажує з бази повідомлення поточного користувача (або гостя)
async function loadNotificationsFromSupabase() {
    const key = getNotifKey();
    const { data, error } = await _supabase
        .from('notifications')
        .select('*')
        .eq('username', key)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(200);

    if (error) {
        console.error('Помилка завантаження сповіщень:', error.message);
        return;
    }
    if (getNotifKey() !== key) return; // користувач встиг змінитися

    const prev = Array.isArray(userNotifications[key]) ? userNotifications[key] : [];
    const prevRead = new Map(prev.filter(m => m.dbId).map(m => [m.dbId, m.read]));

    const dbItems = (data || []).reverse().map(r => ({
        id: r.id,
        dbId: r.id,
        text: r.text,
        date: r.created_at ? new Date(r.created_at).toLocaleDateString() : '',
        read: !!r.read || !!prevRead.get(r.id),
        isBroadcast: !!r.is_broadcast
    }));
    const pendingLocal = prev.filter(m => !m.dbId);

    const next = dbItems.concat(pendingLocal);
    if (JSON.stringify(next) === JSON.stringify(prev)) return; // змін немає

    userNotifications[key] = next;
    localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));
    updateNotificationsCount();

    if (!notificationsModal.classList.contains('hidden')) {
        renderUserNotifications();
        markNotificationsRead();
    }
}

// ── 12. НОВЕ: позначає повідомлення прочитаними (у браузері й у базі) ──
// Позначає всі повідомлення поточного користувача прочитаними (локально й у базі)
function markNotificationsRead() {
    const key = getNotifKey();
    const inbox = userNotifications[key];
    if (!Array.isArray(inbox)) { updateNotificationsCount(); return; }
    const hadUnread = inbox.some(m => !m.read);
    inbox.forEach(m => m.read = true);
    localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));
    if (hadUnread && key !== 'guest') {
        _supabase.from('notifications').update({ read: true }).eq('username', key).eq('read', false)
            .then(({ error }) => { if (error) console.error('Помилка оновлення read:', error.message); });
    }
    updateNotificationsCount();
}

// ── 13. НОВЕ: видаляє в базі повідомлення, яке адмін відкликав з історії ──
// Видаляє в базі повідомлення, яке адмін відкликав з історії відповідей
function deleteNotificationsInSupabase(record) {
    if (!record || !record.msgId || Number(record.msgId) < 1e12) return;
    let q = _supabase.from('notifications').delete().eq('created_at', new Date(Number(record.msgId)).toISOString());
    if (record.isBroadcast) q = q.eq('is_broadcast', true);
    else if (record.targetUser) q = q.eq('username', record.targetUser);
    else return;
    q.then(({ error }) => { if (error) console.error('Помилка видалення сповіщення в базі:', error.message); });
}

// ── 14. Автооновлення кожні 4 секунди: книги та сповіщення (сторінку перезавантажувати не потрібно) ──
// Автооновлення кожні 4 секунди
setInterval(() => {
    loadBooksFromSupabase(true);
    loadNotificationsFromSupabase(); // НОВЕ: скринька оновлюється сама, без перезавантаження сторінки
}, 4000);

// ======================================================================
// РОЗДІЛ III. ГЛОБАЛЬНІ ЗМІННІ, ЕЛЕМЕНТИ СТОРІНКИ, ДОДАТКОВІ ЕЛЕМЕНТИ ІНТЕРФЕЙСУ
// ======================================================================

// ── 15. Глобальні змінні: локальні кеші (localStorage) та поточний стан сайту ──
let adminsDb = JSON.parse(localStorage.getItem('transverse_admins_db')) || {};
let bannedUsernames = JSON.parse(localStorage.getItem('transverse_banned_users')) || [];
let deletedAccountsHistory = JSON.parse(localStorage.getItem('transverse_deleted_accounts_history')) || [];

let favorites = JSON.parse(localStorage.getItem('transverse_favs')) || [];
let bookmarks = JSON.parse(localStorage.getItem('transverse_bookmarks_v3')) || {};
let registeredUsers = JSON.parse(localStorage.getItem('transverse_registered_users')) || {};
let userProfile = JSON.parse(localStorage.getItem('transverse_user')) || null;
let submissions = JSON.parse(localStorage.getItem('transverse_submissions')) || [];
let adminHistory = JSON.parse(localStorage.getItem('transverse_admin_history')) || [];
let deletedHistory = JSON.parse(localStorage.getItem('transverse_deleted_history')) || [];
let userNotifications = JSON.parse(localStorage.getItem('transverse_notifications')) || {};
let bookStatuses = JSON.parse(localStorage.getItem('transverse_book_statuses')) || {};
let savedRatings = JSON.parse(localStorage.getItem('transverse_ratings_v3')) || {};

let currentCategory = 'all';
let currentSort = localStorage.getItem('transverse_sort') || 'new';
let currentStatusFilter = 'all';
let currentAgeFilterMin = 0;
let currentAgeFilterMax = 99;
let currentBook = null;
let currentChapterIndex = 0;
let currentFontSize = 18;
let replyingIndex = null;
let selectedRatingGenre = null;
let uploadedLayoutDataUrl = "";

let previewBookObj = null;
let previewChapterIdx = 0;
let previewFontSize = 18;

// ── 16. Посилання на елементи сторінки (кнопки, вікна, списки) ──
const booksGrid = document.getElementById('booksGrid');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const catButtons = document.querySelectorAll('.cat-btn');
const readerModal = document.getElementById('readerModal');
const readerContentWrapper = document.getElementById('readerContentWrapper');
const pureTextOverlay = document.getElementById('pureTextOverlay');
const authModal = document.getElementById('authModal');
const requestModal = document.getElementById('requestModal');
const requestModalContent = document.getElementById('requestModalContent');
const adminModal = document.getElementById('adminModal');
const adminModalContent = document.getElementById('adminModalContent');
const replyModal = document.getElementById('replyModal');
const broadcastModal = document.getElementById('broadcastModal');
const notificationsModal = document.getElementById('notificationsModal');
const ratingModal = document.getElementById('ratingModal');
const consentModal = document.getElementById('consentModal');
const readingListsModal = document.getElementById('readingListsModal');
const chapterSelect = document.getElementById('chapterSelect');
const chapterText = document.getElementById('chapterText');
const pureChapterText = document.getElementById('pureChapterText');
const bookmarkBtn = document.getElementById('bookmarkBtn');
const pureBookmarkBtn = document.getElementById('pureBookmarkBtn');
const profileBtn = document.getElementById('profileBtn');
const adminPanelBtn = document.getElementById('adminPanelBtn');
const requestsBtn = document.getElementById('requestsBtn');
const notificationsBtn = document.getElementById('notificationsBtn');
const deleteBookBtn = document.getElementById('deleteBookBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const adminTabAdminsBtn = document.getElementById('adminTabAdminsBtn');
const adminTabDeletedBtn = document.getElementById('adminTabDeletedBtn');
const fullscreenReaderBtn = document.getElementById('fullscreenReaderBtn');
const fullscreenRequestBtn = document.getElementById('fullscreenRequestBtn');
const fullscreenAdminBtn = document.getElementById('fullscreenAdminBtn');
const ratingModalBtn = document.getElementById('ratingModalBtn');
const readingListMenuBtn = document.getElementById('readingListMenuBtn');
const bookStatusSelect = document.getElementById('bookStatusSelect');

// ── 17. SVG-іконка аватара за замовчуванням ──
const DEFAULT_AVATAR_SVG = `<svg viewBox="0 0 24 24" fill="#f1f5f9" width="65%" height="65%"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;

// ── 18. Кнопка «Увійти через Google» ──
document.getElementById('googleLoginBtn')?.addEventListener('click', async () => {
    const { error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    });
    if (error) {
        alert('Помилка входу через Google: ' + error.message);
    }
});

// ── 19. Додаткові стилі читалки (A4-листи, мобільна версія), що додаються з JS ──
if (!document.getElementById('enhancedReaderStyles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'enhancedReaderStyles';
    styleEl.innerHTML = `
        .reader-book-container { background: var(--card-bg); border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.12); border: 1px solid var(--border); transition: all 0.3s ease; }
        .reader-toolbar { background: var(--bg-color); padding: 10px 16px; border-radius: 8px; border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
        .chapter-render-box { background: var(--bg-color); padding: 20px; border-radius: 10px; border: 1px solid var(--border); width: 100%; max-width: 750px; margin: 0 auto; box-sizing: border-box; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow-y: auto; display: flex; flex-direction: column; gap: 25px; }
        .a4-page-sheet { background: var(--card-bg); border: 1px solid var(--border); border-radius: 8px; padding: 40px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); width: 100%; max-width: 680px; margin: 0 auto; box-sizing: border-box; display: flex; flex-direction: column; gap: 15px; word-break: break-word; position: relative; }
        .a4-page-sheet::after { content: attr(data-pagenum); position: absolute; bottom: 10px; right: 20px; font-size: 0.8rem; color: var(--text-muted); }
        .chapter-image-item { width: 100%; max-height: 550px; object-fit: contain; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); background: var(--bg-color); display: block; margin: 10px auto; }
        @media screen and (max-width: 768px) {
            body { font-size: 14px; }
            .books-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important; gap: 10px !important; }
            .book-card img { height: 200px !important; }
            .modal-content { width: 98% !important; padding: 12px !important; max-height: 95vh !important; }
            header { flex-direction: column; gap: 8px; align-items: stretch; }
            .categories-container, .search-bar-wrapper { overflow-x: auto; padding-bottom: 4px; }
            .chapter-render-box { padding: 10px; }
            .a4-page-sheet { padding: 20px; }
            .book-details { flex-direction: column; align-items: center; gap: 1rem; }
            #modalCover { width: 100% !important; max-width: 260px; height: auto !important; aspect-ratio: 240 / 340; }
            .book-info-detailed { width: 100%; min-width: 0; }
            .rating-box, .chapter-rating-box { max-width: 100%; }
            .rate-input select, .book-info-detailed .action-btn { max-width: 100%; }
            .modal-content { overflow-x: hidden !important; }
        }
    `;
    document.head.appendChild(styleEl);
}

// ── 20. ВІКОВИЙ ФІЛЬТР: створює поля «від / до» та кнопку «Скинути» у вікні списків читання ──
function injectAgeFilterIntoReadingLists() {
    const listsBody = document.querySelector('#readingListsModal .modal-content') || readingListsModal;
    if (listsBody && !document.getElementById('modalAgeFilterContainer')) {
        const filterBox = document.createElement('div');
        filterBox.id = 'modalAgeFilterContainer';
        filterBox.style.cssText = 'margin-top: 15px; padding-top: 12px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px;';
        filterBox.innerHTML = `
            <span style="font-weight: bold; font-size: 0.95rem; color: var(--accent);">👤 Віковий фільтр книжок:</span>
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <span style="font-size: 0.85rem;">від</span>
                <input type="number" id="readingListAgeMin" min="0" max="99" placeholder="+" style="width: 55px; padding: 4px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-color); color: var(--text-color); text-align: center;">
                <span style="font-size: 0.85rem;">до</span>
                <input type="number" id="readingListAgeMax" min="0" max="99" placeholder="+" style="width: 55px; padding: 4px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-color); color: var(--text-color); text-align: center;">
                <button type="button" id="readingListResetAge" style="background: var(--accent); color: white; border: none; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: bold;">Скинути</button>
            </div>
        `;
        listsBody.appendChild(filterBox);

        const minInp = document.getElementById('readingListAgeMin');
        const maxInp = document.getElementById('readingListAgeMax');
        const resetBtn = document.getElementById('readingListResetAge');

        const applyFilter = () => {
            currentAgeFilterMin = minInp.value === '' ? 0 : Math.max(0, Number(minInp.value));
            currentAgeFilterMax = maxInp.value === '' ? 99 : Math.min(99, Number(maxInp.value));
            renderBooks();
        };

        minInp.addEventListener('input', applyFilter);
        maxInp.addEventListener('input', applyFilter);
        resetBtn.addEventListener('click', () => {
            minInp.value = '';
            maxInp.value = '';
            currentAgeFilterMin = 0;
            currentAgeFilterMax = 99;
            renderBooks();
        });
    }
}
injectAgeFilterIntoReadingLists();

// ── 21. Додає поля «Вік від / до» та кнопку ∞ у форму рекомендації твору ──
const recommendFormEl = document.getElementById('recommendForm');
if (recommendFormEl && !document.getElementById('recAgeMin')) {
    const descGroup = recommendFormEl.querySelector('#recDesc')?.parentElement || recommendFormEl.querySelector('.form-group');
    if (descGroup) {
        const ageGroup = document.createElement('div');
        ageGroup.className = 'form-group';
        ageGroup.style.cssText = 'display: flex; gap: 10px; margin-bottom: 12px;';
        ageGroup.innerHTML = `
            <div style="flex: 1;">
                <label style="font-size: 0.85rem; margin-bottom: 4px; display: block;">Вік від (років):</label>
                <input type="number" id="recAgeMin" min="0" max="99" value="0" style="width: 100%; padding: 8px; border-radius: 6px; background: var(--bg-color); color: var(--text-color); border: 1px solid var(--border);" required>
            </div>
            <div style="flex: 1;">
                <label style="font-size: 0.85rem; margin-bottom: 4px; display: block;">Вік до (років / ∞):</label>
                <div style="display: flex; gap: 6px;">
                    <input type="number" id="recAgeMax" min="0" max="99" value="99" style="flex: 1; padding: 8px; border-radius: 6px; background: var(--bg-color); color: var(--text-color); border: 1px solid var(--border);" required>
                    <button type="button" id="recInfinityAgeBtn" title="Встановити безкінечність (+)" style="background: var(--accent); color: white; border: none; padding: 0 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">∞</button>
                </div>
            </div>
        `;
        descGroup.parentNode.insertBefore(ageGroup, descGroup.nextSibling);

        document.getElementById('recInfinityAgeBtn').addEventListener('click', () => {
            document.getElementById('recAgeMax').value = 99;
            alert('Встановлено безкінечність (будь-який старший вік)!');
        });
    }
}

// ── 22. Додає в адмін-панель вкладку «Видалені акаунти» ──
const adminTabsNav = document.querySelector('.admin-tabs-nav') || document.querySelector('#adminModalContent');
if (adminTabsNav && !document.getElementById('adminTabBannedUsersBtn')) {
    const navContainer = document.querySelector('#adminTabDeletedBtn') ? document.querySelector('#adminTabDeletedBtn').parentElement : null;
    if (navContainer) {
        const bannedTabBtn = document.createElement('button');
        bannedTabBtn.id = 'adminTabBannedUsersBtn';
        bannedTabBtn.className = 'action-btn';
        bannedTabBtn.dataset.admintab = 'bannedusers';
        bannedTabBtn.style.cssText = 'background: var(--card-bg); color: var(--text-color); border: 1px solid var(--border); font-weight: 600;';
        bannedTabBtn.textContent = '🗑️ Видалені акаунти';
        navContainer.appendChild(bannedTabBtn);

        const adminModalBody = document.querySelector('#adminModalContent');
        if (adminModalBody) {
            const bannedSection = document.createElement('div');
            bannedSection.id = 'adminBannedUsersSection';
            bannedSection.className = 'hidden';
            bannedSection.style.cssText = 'margin-top: 15px;';
            bannedSection.innerHTML = `
                <h4 style="margin-bottom: 10px; color: var(--accent);">🗑️ Список видалених користувачів та акаунтів</h4>
                <div id="adminBannedUsersList" style="display: flex; flex-direction: column; gap: 8px; max-height: 55vh; overflow-y: auto;"></div>
            `;
            adminModalBody.appendChild(bannedSection);
        }
    }
}

// ── 23. Створює допоміжні вікна: деталі заявки/повідомлення та особисте повідомлення адміна ──
function initInfoModals() {
    if (!document.getElementById('infoDetailsModal')) {
        const infoModal = document.createElement('div');
        infoModal.id = 'infoDetailsModal';
        infoModal.className = 'modal hidden';
        infoModal.style.zIndex = '2500';
        infoModal.innerHTML = `
            <div class="modal-content" id="infoDetailsContent" style="max-width: 650px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 10px; margin-bottom: 15px;">
                    <h3 id="infoDetailsTitle" style="margin: 0; color: var(--accent);">ℹ️ Детальна інформація</h3>
                    <button id="closeInfoDetailsModal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-color);">✖</button>
                </div>
                <div id="infoDetailsBody" style="line-height: 1.6;"></div>
            </div>
        `;
        document.body.appendChild(infoModal);

        document.getElementById('closeInfoDetailsModal').addEventListener('click', () => {
            infoModal.classList.add('hidden');
        });
    }

    if (!document.getElementById('adminBookPreviewModal')) {
        const previewModal = document.createElement('div');
        previewModal.id = 'adminBookPreviewModal';
        previewModal.className = 'modal hidden';
        previewModal.style.zIndex = '2600';
        previewModal.innerHTML = `
            <div class="modal-content" id="adminPreviewContentWrapper" style="max-width: 850px; width: 95%; max-height: 92vh; overflow-y: auto; display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                    <button id="adminPreviewBackBtn" class="action-btn" style="background: var(--accent); color: white; padding: 6px 14px; font-weight: 600;">← Повернутися назад</button>
                    <span style="font-weight: bold; color: var(--text-muted); font-size: 0.9rem;">👁️ Режим попереднього перегляду модератора</span>
                    <button id="adminPreviewFullscreenBtn" class="action-btn" style="padding: 6px 10px;" title="На весь екран">⛶</button>
                </div>

                <div id="adminPreviewCardStep" style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: 10px;">
                    <div class="book-card" style="max-width: 340px; width: 100%; margin: 0 auto; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                        <div class="cover-wrapper">
                            <img id="prevBookCover" src="" alt="Обкладинка" style="width: 100%; height: 380px; object-fit: cover;">
                        </div>
                        <div class="book-info" style="text-align: left;">
                            <span id="prevBookBadge" class="book-badge"></span>
                            <h3 id="prevBookTitle" style="margin: 8px 0;"></h3>
                            <p id="prevBookAuthor" style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 8px;"></p>
                            <p id="prevBookAge" style="font-size: 0.9rem; font-weight: bold; color: var(--accent); margin-bottom: 6px;"></p>
                            <p id="prevBookDesc" style="font-size: 0.85rem; color: var(--text-color); margin-bottom: 14px; background: var(--bg-color); padding: 8px; border-radius: 6px; border: 1px solid var(--border);"></p>
                            <button id="startPreviewReadBtn" class="read-btn" style="width: 100%;">Читати книжку</button>
                        </div>
                    </div>
                </div>

                <div id="adminPreviewReaderStep" class="hidden" style="display: flex; flex-direction: column; gap: 12px;">
                    <div class="reader-toolbar">
                        <select id="prevChapterSelect" style="padding: 6px 10px; border-radius: 6px; background: var(--card-bg); color: var(--text-color); border: 1px solid var(--border); font-weight: 600; max-width: 65%;"></select>
                        <div style="display: flex; gap: 6px;">
                            <button id="prevFontDec" class="action-btn" style="padding: 5px 10px;">A-</button>
                            <button id="prevFontInc" class="action-btn" style="padding: 5px 10px;">A+</button>
                        </div>
                    </div>

                    <div id="prevChapterText" class="chapter-render-box" style="font-size: 18px;"></div>

                    <div style="display: flex; justify-content: space-between; gap: 10px; margin-top: 6px;">
                        <button id="prevPrevChapterBtn" class="action-btn" style="flex: 1; justify-content: center;">⬅️ Попередня глава</button>
                        <button id="prevNextChapterBtn" class="action-btn" style="flex: 1; justify-content: center;">Наступна глава ➡️</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(previewModal);

        document.getElementById('adminPreviewBackBtn').addEventListener('click', () => {
            const readerStep = document.getElementById('adminPreviewReaderStep');
            const cardStep = document.getElementById('adminPreviewCardStep');
            if (!readerStep.classList.contains('hidden')) {
                readerStep.classList.add('hidden');
                cardStep.classList.remove('hidden');
            } else {
                document.getElementById('adminPreviewContentWrapper').classList.remove('fullscreen-reader');
                previewModal.classList.add('hidden');
            }
        });

        document.getElementById('adminPreviewFullscreenBtn').addEventListener('click', () => {
            document.getElementById('adminPreviewContentWrapper').classList.toggle('fullscreen-reader');
        });

        document.getElementById('startPreviewReadBtn').addEventListener('click', () => {
            if (!previewBookObj) return;
            document.getElementById('adminPreviewCardStep').classList.add('hidden');
            document.getElementById('adminPreviewReaderStep').classList.remove('hidden');
            loadPreviewChapter(0);
        });

        document.getElementById('prevChapterSelect').addEventListener('change', (e) => {
            loadPreviewChapter(Number(e.target.value));
        });

        document.getElementById('prevPrevChapterBtn').addEventListener('click', () => {
            if (previewChapterIdx > 0) loadPreviewChapter(previewChapterIdx - 1);
        });

        document.getElementById('prevNextChapterBtn').addEventListener('click', () => {
            if (previewBookObj && previewChapterIdx < previewBookObj.chapters.length - 1) {
                loadPreviewChapter(previewChapterIdx + 1);
            }
        });

        document.getElementById('prevFontInc').addEventListener('click', () => {
            if (previewFontSize < 28) {
                previewFontSize += 2;
                document.getElementById('prevChapterText').style.fontSize = previewFontSize + 'px';
            }
        });

        document.getElementById('prevFontDec').addEventListener('click', () => {
            if (previewFontSize > 14) {
                previewFontSize -= 2;
                document.getElementById('prevChapterText').style.fontSize = previewFontSize + 'px';
            }
        });
    }

    if (!document.getElementById('adminDirectMsgModal')) {
        const directModal = document.createElement('div');
        directModal.id = 'adminDirectMsgModal';
        directModal.className = 'modal hidden';
        directModal.style.zIndex = '2700';
        directModal.innerHTML = `
            <div class="modal-content" style="max-width: 450px; width: 95%;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 10px; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: var(--accent);">✉️ Написати користувачу</h3>
                    <button id="closeAdminDirectModal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-color);">✖</button>
                </div>
                <form id="adminDirectMsgForm">
                    <p id="targetDirectUserLabel" style="font-weight: bold; margin-bottom: 10px;"></p>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="font-size: 0.9rem; margin-bottom: 4px;">Текст повідомлення:</label>
                        <textarea id="adminDirectText" rows="5" placeholder="Введіть текст повідомлення..." style="width: 100%; padding: 8px; border-radius: 6px; background: var(--bg-color); color: var(--text-color); border: 1px solid var(--border); resize: vertical;" required></textarea>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 8px;">
                        <button type="button" id="cancelDirectModal" class="action-btn" style="background: #64748b; color: white;">Скасувати</button>
                        <button type="submit" class="action-btn" style="background: var(--accent); color: white;">Надіслати</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(directModal);

        document.getElementById('closeAdminDirectModal').addEventListener('click', () => directModal.classList.add('hidden'));
        document.getElementById('cancelDirectModal').addEventListener('click', () => directModal.classList.add('hidden'));

        document.getElementById('adminDirectMsgForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const textVal = document.getElementById('adminDirectText').value.trim();
            if (!textVal || window.currentDirectTargetUser === undefined) return;

            const targetUser = window.currentDirectTargetUser;
            const msgId = Date.now();
            const dateStr = new Date().toLocaleDateString();

            if (!userNotifications[targetUser]) userNotifications[targetUser] = [];
            userNotifications[targetUser].push({
                id: msgId,
                text: `📩 Повідомлення від адміністрації (${dateStr}): ${textVal}`,
                date: dateStr,
                read: false,
                isBroadcast: false
            });
            saveNotifications();

            adminHistory.unshift({
                msgId: msgId,
                targetUser: targetUser,
                subject: 'Особисте повідомлення від адміністратора',
                replyText: textVal,
                statusType: 'replied',
                adminName: userProfile ? userProfile.username : 'Адмін',
                date: dateStr,
                isBroadcast: false
            });
            localStorage.setItem('transverse_admin_history', JSON.stringify(adminHistory));

            directModal.classList.add('hidden');
            alert(`Повідомлення успішно надіслано користувачу ${targetUser}!`);
        });
    }
}
initInfoModals();

// ======================================================================
// РОЗДІЛ IV. ДОПОМІЖНІ ВІКНА, ЧИТАЛКА A4, АВАТАРИ, ІНТЕРФЕЙС ЗА РОЛЛЮ
// ======================================================================

// ── 24. Відкриває вікно особистого повідомлення адміна користувачу ──
window.openDirectMsgModal = function(username) {
    window.currentDirectTargetUser = username;
    document.getElementById('targetDirectUserLabel').textContent = `Отримувач: ${username}`;
    document.getElementById('adminDirectText').value = '';
    document.getElementById('adminDirectMsgModal').classList.remove('hidden');
};

// ── 25. Розбиває текст глави на A4-сторінки та вставляє зображення ──
function renderChapterIntoA4Sheets(chap, targetContainer, fontSizePx) {
    targetContainer.innerHTML = '';
    
    let itemsToPaginate = [];

    if (chap.content && chap.content.trim()) {
        const paragraphs = chap.content.split('\n').filter(p => p.trim() !== '');
        paragraphs.forEach(p => {
            itemsToPaginate.push({ type: 'text', value: p });
        });
    }

    if (chap.images && Array.isArray(chap.images) && chap.images.length > 0) {
        chap.images.forEach(imgUrl => {
            itemsToPaginate.push({ type: 'image', value: imgUrl });
        });
    }

    if (itemsToPaginate.length === 0) {
        itemsToPaginate.push({ type: 'text', value: '(Текст або зображення відсутні у цій главі)' });
    }

    let pageChunks = [];
    let currentChunk = [];
    let currentWeight = 0;

    itemsToPaginate.forEach(item => {
        let weight = item.type === 'image' ? 6 : Math.max(1, Math.ceil(item.value.length / 400));
        if (currentWeight + weight > 5 && currentChunk.length > 0) {
            pageChunks.push(currentChunk);
            currentChunk = [item];
            currentWeight = weight;
        } else {
            currentChunk.push(item);
            currentWeight += weight;
        }
    });
    if (currentChunk.length > 0) {
        pageChunks.push(currentChunk);
    }

    pageChunks.forEach((chunk, pageIndex) => {
        const sheet = document.createElement('div');
        sheet.className = 'a4-page-sheet';
        sheet.setAttribute('data-pagenum', `Сторінка ${pageIndex + 1} з ${pageChunks.length}`);
        sheet.style.fontSize = fontSizePx + 'px';

        if (pageIndex === 0 && chap.title) {
            const h2 = document.createElement('h2');
            h2.style.cssText = 'color: var(--accent); margin-bottom: 10px; font-size: 1.3em; border-bottom: 1px solid var(--border); padding-bottom: 8px;';
            h2.textContent = chap.title;
            sheet.appendChild(h2);
        }

        chunk.forEach(item => {
            if (item.type === 'text') {
                const p = document.createElement('p');
                p.style.cssText = 'line-height: 1.8; margin-bottom: 10px; text-align: justify;';
                p.textContent = item.value;
                sheet.appendChild(p);
            } else if (item.type === 'image') {
                const img = document.createElement('img');
                img.src = item.value;
                img.className = 'chapter-image-item';
                img.alt = 'Сторінка твору';
                sheet.appendChild(img);
            }
        });

        targetContainer.appendChild(sheet);
    });
}

// ── 26. Показує главу в попередньому перегляді заявки (для адміна) ──
function loadPreviewChapter(idx) {
    if (!previewBookObj || !previewBookObj.chapters[idx]) return;
    previewChapterIdx = idx;
    const chap = previewBookObj.chapters[idx];
    document.getElementById('prevChapterSelect').value = idx;
    
    renderChapterIntoA4Sheets(chap, document.getElementById('prevChapterText'), previewFontSize);
}

// ── 27. Вікно деталей заявки (скарга / твір / заява) для адміна ──
window.openSubmissionInfo = function(index) {
    const sub = submissions[index];
    if (!sub) return;

    if (sub.type === 'book' && sub.book) {
        previewBookObj = sub.book;
        previewChapterIdx = 0;

        document.getElementById('prevBookCover').src = sub.book.cover || '';
        document.getElementById('prevBookBadge').textContent = `${sub.book.genre} • ${sub.book.original_lang || sub.book.originalLang || 'Авторський переклад'}`;
        document.getElementById('prevBookTitle').textContent = sub.book.title;
        const aName = sub.book.author_name || sub.book.authorName || '';
        const aSur = sub.book.author_surname || sub.book.authorSurname || '';
        document.getElementById('prevBookAuthor').textContent = `Автор: ${aName} ${aSur} (Надіслав: ${sub.author})`;
        const aMin = sub.book.age_min !== undefined ? sub.book.age_min : (sub.book.ageMin || 0);
        const aMax = sub.book.age_max !== undefined ? sub.book.age_max : (sub.book.ageMax || 99);
        document.getElementById('prevBookAge').textContent = `Вікове обмеження: від ${aMin} до ${aMax >= 99 ? '∞ (без обмежень)' : aMax + ' років'}`;
        document.getElementById('prevBookDesc').textContent = sub.book.description || 'Опис відсутній.';

        const select = document.getElementById('prevChapterSelect');
        select.innerHTML = '';
        (sub.book.chapters || []).forEach((ch, idx) => {
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = ch.title || `Глава ${idx + 1}`;
            select.appendChild(opt);
        });

        document.getElementById('adminPreviewCardStep').classList.remove('hidden');
        document.getElementById('adminPreviewReaderStep').classList.add('hidden');
        document.getElementById('adminBookPreviewModal').classList.remove('hidden');
    } else {
        const infoModal = document.getElementById('infoDetailsModal');
        const titleEl = document.getElementById('infoDetailsTitle');
        const bodyEl = document.getElementById('infoDetailsBody');

        if (sub.type === 'complaint') {
            titleEl.textContent = '🚨 Деталі скарги';
            bodyEl.innerHTML = `
                <div style="background: var(--bg-color); padding: 14px; border-radius: 8px; border: 1px solid var(--border);">
                    <p style="margin-bottom: 8px;"><strong>👤 Від кого надіслано:</strong> ${esc(sub.author)}</p>
                    <p style="margin-bottom: 12px;"><strong>📅 Дата надсилання:</strong> ${esc(sub.date)}</p>
                    <p style="font-weight: bold; margin-bottom: 6px; color: var(--accent);">📝 Повний текст скарги:</p>
                    <div style="background: var(--card-bg); padding: 12px; border-radius: 6px; border: 1px solid var(--border); white-space: pre-wrap; word-break: break-word;">${esc(sub.text)}</div>
                </div>
            `;
        } else if (sub.type === 'statement') {
            titleEl.textContent = '📄 Деталі заяви';
            bodyEl.innerHTML = `
                <div style="background: var(--bg-color); padding: 14px; border-radius: 8px; border: 1px solid var(--border);">
                    <p style="margin-bottom: 8px;"><strong>👤 Хто надіслав:</strong> ${esc(sub.author)}</p>
                    <p style="margin-bottom: 8px;"><strong>✍️ Ім'я автора:</strong> ${esc(sub.authorName)}</p>
                    <p style="margin-bottom: 8px;"><strong>📚 Назва твору:</strong> ${esc(sub.bookTitle)}</p>
                    <p style="margin-bottom: 12px;"><strong>📅 Дата надсилання:</strong> ${esc(sub.date)}</p>
                    <p style="font-weight: bold; margin-bottom: 6px; color: var(--accent);">📝 Повний текст заяви:</p>
                    <div style="background: var(--card-bg); padding: 12px; border-radius: 6px; border: 1px solid var(--border); white-space: pre-wrap; word-break: break-word;">${esc(sub.text)}</div>
                </div>
            `;
        }

        infoModal.classList.remove('hidden');
    }
};

// ── 28. Вікно з повним текстом повідомлення зі скриньки ──
window.openNotificationInfo = function(notifId) {
    let key = userProfile ? userProfile.username : 'guest';
    const inbox = userNotifications[key] || [];
    const notif = inbox.find(n => String(n.id) === String(notifId));
    if (!notif) return;

    const infoModal = document.getElementById('infoDetailsModal');
    const titleEl = document.getElementById('infoDetailsTitle');
    const bodyEl = document.getElementById('infoDetailsBody');

    titleEl.textContent = '✉️ Деталі повідомлення';
    bodyEl.innerHTML = `
        <div style="background: var(--bg-color); padding: 14px; border-radius: 8px; border: 1px solid var(--border);">
            <p style="margin-bottom: 8px;"><strong>📅 Дата отримання:</strong> ${esc(notif.date)}</p>
            <p style="margin-bottom: 12px;"><strong>📌 Тип сповіщення:</strong> ${notif.isBroadcast ? '📢 Загальне оголошення адміністрації' : '📩 Особисте сповіщення'}</p>
            <p style="font-weight: bold; margin-bottom: 6px; color: var(--accent);">📝 Повний зміст:</p>
            <div style="background: var(--card-bg); padding: 12px; border-radius: 6px; border: 1px solid var(--border); white-space: pre-wrap; word-break: break-word; line-height: 1.6;">${safeNotifHtml(notif.text)}</div>
        </div>
    `;
    infoModal.classList.remove('hidden');
};

// ── 29. Повертає аватар користувача ──
function getUserAvatar(username) {
    if (adminsDb[username] && adminsDb[username].avatar) return adminsDb[username].avatar;
    if (registeredUsers[username] && registeredUsers[username].avatar) return registeredUsers[username].avatar;
    return null;
}

// ── 30. Формує HTML аватара (фото або іконка за замовчуванням) ──
function getAvatarHTML(username, sizeClass = 'avatar-small') {
    const avatarSrc = getUserAvatar(username);
    if (avatarSrc) {
        return `<span class="${sizeClass}"><img src="${esc(avatarSrc)}" alt="${esc(username)}"></span>`;
    }
    return `<span class="${sizeClass}">${DEFAULT_AVATAR_SVG}</span>`;
}

// ── 31. Оновлює інтерфейс залежно від ролі: гість / користувач / адмін / суперадмін ──
function updateUIByRole() {
    const authTabs = document.getElementById('authTabs');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loggedInInfo = document.getElementById('loggedInInfo');
    const currentUserDisplay = document.getElementById('currentUserDisplay');
    const adminNotice = document.getElementById('adminNotice');
    const profileAvatarPreview = document.getElementById('profileAvatarPreview');

    if (userProfile) {
        const avatarHtml = getAvatarHTML(userProfile.username, 'avatar-small');
        const crown = userProfile.isAdmin ? '👑 ' : '';
        profileBtn.innerHTML = `${avatarHtml} <span>${crown}${esc(userProfile.username)}</span>`;

        const largeAvatarSrc = getUserAvatar(userProfile.username);
        profileAvatarPreview.innerHTML = largeAvatarSrc ? `<img src="${esc(largeAvatarSrc)}" alt="Аватар">` : DEFAULT_AVATAR_SVG;

        if (authTabs) authTabs.classList.add('hidden');
        if (loginForm) loginForm.classList.add('hidden');
        if (registerForm) registerForm.classList.add('hidden');
        const gLoginBtn = document.getElementById('googleLoginBtn');
        if (gLoginBtn) gLoginBtn.classList.add('hidden');

        loggedInInfo.classList.remove('hidden');
        currentUserDisplay.textContent = `Ви увійшли як: ${userProfile.username}`;

        notificationsBtn.classList.remove('hidden');
        updateNotificationsCount();

        const bannedUsersTabBtn = document.getElementById('adminTabBannedUsersBtn');

        if (userProfile.isAdmin) {
            adminPanelBtn.classList.remove('hidden');
            deleteBookBtn.classList.remove('hidden');
            deleteAccountBtn.classList.add('hidden');
            adminNotice.classList.remove('hidden');

            if (userProfile.isSuperAdmin) {
                adminNotice.textContent = 'Статус: Головний адміністратор 👑';
                adminTabAdminsBtn.classList.remove('hidden');
                adminTabDeletedBtn.classList.remove('hidden');
                if (bannedUsersTabBtn) bannedUsersTabBtn.classList.remove('hidden');
            } else {
                adminNotice.textContent = 'Статус: Адміністратор 🛡️';
                adminTabAdminsBtn.classList.add('hidden');
                adminTabDeletedBtn.classList.add('hidden');
                if (bannedUsersTabBtn) bannedUsersTabBtn.classList.add('hidden');
            }
        } else {
            adminPanelBtn.classList.add('hidden');
            deleteBookBtn.classList.add('hidden');
            deleteAccountBtn.classList.remove('hidden');
            adminNotice.classList.add('hidden');
            adminTabAdminsBtn.classList.add('hidden');
            adminTabDeletedBtn.classList.add('hidden');
            if (bannedUsersTabBtn) bannedUsersTabBtn.classList.add('hidden');
        }
    } else {
        profileBtn.innerHTML = `👤 Увійти`;
        adminPanelBtn.classList.add('hidden');
        notificationsBtn.classList.remove('hidden');
        updateNotificationsCount();
        deleteBookBtn.classList.add('hidden');
        deleteAccountBtn.classList.add('hidden');
        adminTabAdminsBtn.classList.add('hidden');
        adminTabDeletedBtn.classList.add('hidden');
        const bannedUsersTabBtn = document.getElementById('adminTabBannedUsersBtn');
        if (bannedUsersTabBtn) bannedUsersTabBtn.classList.add('hidden');

        if (authTabs) authTabs.classList.remove('hidden');
        if (loginForm) loginForm.classList.remove('hidden');
        if (registerForm) registerForm.classList.add('hidden');
        const gLoginBtn = document.getElementById('googleLoginBtn');
        if (gLoginBtn) gLoginBtn.classList.remove('hidden');

        loggedInInfo.classList.add('hidden');
        document.querySelectorAll('[data-authtab]').forEach(b => b.classList.remove('active'));
        const loginTab = document.querySelector('[data-authtab="login"]');
        if (loginTab) loginTab.classList.add('active');
    }
}
updateUIByRole();

// ── 32. Завантаження нового аватара з файлу ──
document.getElementById('avatarUpload')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && !checkImageFileSize(file, e)) return;
    if (!file || !userProfile) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const size = 120;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            
            const minSide = Math.min(img.width, img.height);
            const sx = (img.width - minSide) / 2;
            const sy = (img.height - minSide) / 2;
            ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

            const base64Avatar = canvas.toDataURL('image/jpeg', 0.85);
            saveUserAvatar(base64Avatar);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
});

// ── 33. Видалення аватара ──
document.getElementById('removeAvatarBtn')?.addEventListener('click', () => {
    if (!userProfile) return;
    saveUserAvatar(null);
});

// ── 34. Збереження аватара (в users або в локальну базу адмінів) ──
async function saveUserAvatar(avatarData) {
    if (userProfile.isAdmin) {
        if (!adminsDb[userProfile.username]) adminsDb[userProfile.username] = {};
        adminsDb[userProfile.username].avatar = avatarData;
        localStorage.setItem('transverse_admins_db', JSON.stringify(adminsDb));
    } else if (registeredUsers[userProfile.username]) {
        registeredUsers[userProfile.username].avatar = avatarData;
        localStorage.setItem('transverse_registered_users', JSON.stringify(registeredUsers));
        await _supabase.from('users').update({ avatar_url: avatarData }).eq('username', userProfile.username);
    }
    updateUIByRole();
    if (!readerModal.classList.contains('hidden') && currentBook) {
        renderComments();
    }
}

// ── 35. Оновлює лічильник і червону позначку на кнопці «Скринька» ──
function updateNotificationsCount() {
    let key = userProfile ? userProfile.username : 'guest';
    const inbox = userNotifications[key] || [];
    const unreadCount = inbox.filter(m => !m.read).length;
    
    const notifBtn = document.getElementById('notificationsBtn');
    let badge = document.getElementById('notifBadgeDot');
    
    if (unreadCount > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'notifBadgeDot';
            badge.className = 'notification-badge-dot';
            badge.textContent = '!';
            notifBtn.style.position = 'relative';
            notifBtn.appendChild(badge);
        }
        badge.classList.remove('hidden');
    } else {
        if (badge) badge.classList.add('hidden');
    }
    document.getElementById('notifCount').textContent = inbox.length;
}

// ======================================================================
// РОЗДІЛ V. КАТАЛОГ КНИГ: ПОШУК, ФІЛЬТРИ (ВІКОВИЙ ФІЛЬТР — помилка №1), КАРТКИ, ВІДКРИТТЯ КНИГИ
// ======================================================================

// ── 36. Перевірка збігу слова пошуку з назвою або іменем автора ──
function checkMatch(text, query) {
    if (!query) return true;
    const words = text.toLowerCase().split(/[\s(),.!?;:"'«»-]+/).filter(Boolean);
    return words.some(word => word.startsWith(query));
}

// ── 37. Рахує середню оцінку ──
function calculateAverage(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return '0.0';
    const sum = arr.reduce((total, item) => {
        const val = typeof item === 'object' && item !== null ? Number(item.rating) : Number(item);
        return total + (isNaN(val) ? 0 : val);
    }, 0);
    return (sum / arr.length).toFixed(1);
}

// ── 38. МАЛЮВАННЯ КАТАЛОГУ: пошук, категорії, статуси читання, ВІКОВИЙ ФІЛЬТР (виправлено), картки книг ──
function renderBooks() {
    let query = searchInput.value.toLowerCase().trim();
    booksGrid.innerHTML = '';

    let workingBooks = sortBooksList([...booksData]);

    if (selectedRatingGenre) {
        workingBooks = workingBooks.filter(b => b.genre === selectedRatingGenre);
        workingBooks.sort((a, b) => {
            const likesA = Array.isArray(a.likes) ? a.likes.length : 0;
            const likesB = Array.isArray(b.likes) ? b.likes.length : 0;
            return likesB - likesA;
        });
    }

    const filtered = workingBooks.filter(book => {
        const fullAuthor = `${book.authorName} ${book.authorSurname}`;
        const matches = checkMatch(book.title, query) || 
                        checkMatch(book.authorName, query) || 
                        checkMatch(book.authorSurname, query) || 
                        checkMatch(fullAuthor, query);
        
        if (currentStatusFilter !== 'all') {
            if (bookStatuses[book.id] !== currentStatusFilter) return false;
        }

        // ВИПРАВЛЕНО: віковий фільтр.
        // "від X"  = вік читача: книга з обмеженням 12+ НЕ показується, якщо X менше 12.
        // "до Y"   = книги, що підходять читачу до Y років: книга 12+ з'являється, коли Y >= 12.
        const bMin = Number(book.ageMin) || 0;
        if (currentAgeFilterMin > 0 && currentAgeFilterMin < bMin) {
            return false;
        }
        if (currentAgeFilterMax < 99 && bMin > currentAgeFilterMax) {
            return false;
        }

        if (currentCategory === 'favorites') {
            return matches && favorites.some(favId => String(favId) === String(book.id));
        }
        if (currentCategory === 'all' || selectedRatingGenre) {
            return matches;
        }
        return matches && book.genre === currentCategory;
    });

    if (filtered.length === 0) {
        booksGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">Нічого не знайдено за твоїм запитом або віковим обмеженням.</p>';
        return;
    }

    filtered.forEach(book => {
        const isFav = favorites.some(favId => String(favId) === String(book.id));
        const avgRating = calculateAverage(book.ratings);
        const ageLabel = `Вік: ${book.ageMin || 0}-${book.ageMax >= 99 ? '∞' : book.ageMax}`;
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <div class="cover-wrapper" style="position: relative;">
                <img src="${esc(book.cover)}" alt="${esc(book.title)}">
                <div class="rating-badge">⭐ ${avgRating}</div>
                <button class="fav-btn" onclick="toggleFavorite('${escJs(book.id)}')" title="Улюблене" style="position: absolute; top: 8px; right: 8px; z-index: 10; background: rgba(0,0,0,0.5); border: none; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
                    ${isFav ? '❤️' : '🤍'}
                </button>
            </div>
            <div class="book-info">
                <span class="book-badge">${esc(book.genre)} • ${esc(book.originalLang)}</span>
                <span style="display: block; font-size: 0.75rem; color: var(--accent); font-weight: bold; margin: 4px 0;">${ageLabel}</span>
                <h3>${esc(book.title)}</h3>
                <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">${esc(book.authorName)} ${esc(book.authorSurname)}</p>
                <button class="read-btn" onclick="openBook('${escJs(book.id)}')">Читати книгу</button>
            </div>
        `;
        booksGrid.appendChild(card);
    });
}

// ── 39. Кнопка «×» очищення пошуку ──
clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    renderBooks();
});
// ── 40. Пошук під час введення тексту ──
searchInput.addEventListener('input', renderBooks);

// ── 41. Додає або прибирає книгу з улюблених ──
window.toggleFavorite = function(id) {
    const strId = String(id);
    const index = favorites.findIndex(favId => String(favId) === strId);
    if (index !== -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(id);
    }
    localStorage.setItem('transverse_favs', JSON.stringify(favorites));
    renderBooks();
};

// ── 42. ВІДКРИТТЯ КНИГИ: заповнює вікно читалки даними книги ──
window.openBook = function(id) {
    currentBook = booksData.find(b => String(b.id) === String(id));
    if (!currentBook || !Array.isArray(currentBook.chapters) || currentBook.chapters.length === 0) {
        alert('Помилка: не вдалося завантажити глави цієї книги.');
        return;
    }

    if (!Array.isArray(currentBook.ratings)) currentBook.ratings = [];
    if (!Array.isArray(currentBook.likes)) currentBook.likes = [];
    if (!Array.isArray(currentBook.comments)) currentBook.comments = [];

    const modalCoverEl = document.getElementById('modalCover');
    modalCoverEl.src = currentBook.cover || '';
    modalCoverEl.style.width = '240px';
    modalCoverEl.style.height = '340px';
    modalCoverEl.style.objectFit = 'cover';
    modalCoverEl.style.flexShrink = '0';

    document.getElementById('modalTitle').textContent = currentBook.title || '';
    document.getElementById('modalMeta').textContent = `${currentBook.genre} • ${currentBook.originalLang} • ${currentBook.authorName} ${currentBook.authorSurname} • Вік: ${currentBook.ageMin || 0}-${currentBook.ageMax >= 99 ? '∞' : currentBook.ageMax}`;
    document.getElementById('modalDesc').textContent = currentBook.description || '';

    bookStatusSelect.value = bookStatuses[currentBook.id] || "";

    updateBookRatingDisplay();
    updateLikeButton();
    renderComments();

    chapterSelect.innerHTML = '';
    currentBook.chapters.forEach((chap, index) => {
        if (!Array.isArray(chap.ratings)) chap.ratings = [];
        const option = document.createElement('option');
        option.value = index;
        const bookBookmarks = bookmarks[currentBook.id] || [];
        const isSaved = bookBookmarks.includes(index) ? ' 🔖' : '';
        option.textContent = (chap.title || `Глава ${index + 1}`) + isSaved;
        chapterSelect.appendChild(option);
    });

    const bookBookmarks = bookmarks[currentBook.id] || [];
    let startChapter = bookBookmarks.length > 0 ? bookBookmarks[bookBookmarks.length - 1] : 0;
    if (startChapter >= currentBook.chapters.length || startChapter < 0) startChapter = 0;
    
    loadChapter(startChapter, true);
    readerModal.classList.remove('hidden');
};

// ── 43. Зміна статусу читання («Читаю / Буду читати / Прочитано») ──
bookStatusSelect.addEventListener('change', (e) => {
    if (!currentBook) return;
    const val = e.target.value;
    if (val === 'none' || !val) {
        delete bookStatuses[currentBook.id];
    } else {
        bookStatuses[currentBook.id] = val;
    }
    localStorage.setItem('transverse_book_statuses', JSON.stringify(bookStatuses));
    renderBooks();
});

// ── 44. Відкриває вікно списків читання (кнопка ☰) ──
readingListMenuBtn.addEventListener('click', () => {
    readingListsModal.classList.remove('hidden');
});
// ── 45. Закриває вікно списків читання ──
document.getElementById('closeReadingListsModal').addEventListener('click', () => {
    readingListsModal.classList.add('hidden');
});

// ── 46. Фільтр книг за статусом читання ──
document.querySelectorAll('[data-statusfilter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        currentStatusFilter = e.target.dataset.statusfilter;
        readingListsModal.classList.add('hidden');
        renderBooks();
    });
});

// ── 47. Розгортає вікно читалки на весь екран ──
fullscreenReaderBtn.addEventListener('click', () => {
    readerContentWrapper.classList.toggle('fullscreen-reader');
});

// ── 48. Розгортає вікно заявок на весь екран ──
fullscreenRequestBtn.addEventListener('click', () => {
    requestModalContent.classList.toggle('fullscreen-reader');
});

// ── 49. Розгортає адмін-панель на весь екран ──
fullscreenAdminBtn.addEventListener('click', () => {
    adminModalContent.classList.toggle('fullscreen-reader');
});

// ======================================================================
// РОЗДІЛ VI. ПОВНОЕКРАННА ЧИТАЛКА (чистий текст)
// ======================================================================

// ── 50. Відкриває повноекранний режим «чистий текст» ──
document.getElementById('openPureTextBtn').addEventListener('click', () => {
    if (!currentBook) return;
    pureTextOverlay.classList.remove('hidden');
    syncPureTextOverlay();
});

// ── 51. Закриває повноекранний режим ──
document.getElementById('closePureTextBtn').addEventListener('click', () => {
    pureTextOverlay.classList.add('hidden');
});

// ── 52. Заповнює повноекранну читалку: глава, оцінка, лайки, коментарі ──
function syncPureTextOverlay() {
    if (!currentBook) return;
    const chap = currentBook.chapters[currentChapterIndex];
    if (!chap) return;
    document.getElementById('pureChapterTitle').textContent = chap.title;
    
    renderChapterIntoA4Sheets(chap, pureChapterText, currentFontSize + 2);

    if (!Array.isArray(chap.ratings)) chap.ratings = [];
    document.getElementById('pureChapterAvgRating').textContent = calculateAverage(chap.ratings);

    updateLikeButton();
    updateBookmarkButton();
    renderComments();
}

// ── 53. Збільшує шрифт у повноекранній читалці ──
document.getElementById('pureFontInc').addEventListener('click', () => {
    if (currentFontSize < 28) {
        currentFontSize += 2;
        renderChapterIntoA4Sheets(currentBook.chapters[currentChapterIndex], chapterText, currentFontSize);
        renderChapterIntoA4Sheets(currentBook.chapters[currentChapterIndex], pureChapterText, currentFontSize + 2);
    }
});

// ── 54. Зменшує шрифт у повноекранній читалці ──
document.getElementById('pureFontDec').addEventListener('click', () => {
    if (currentFontSize > 14) {
        currentFontSize -= 2;
        renderChapterIntoA4Sheets(currentBook.chapters[currentChapterIndex], chapterText, currentFontSize);
        renderChapterIntoA4Sheets(currentBook.chapters[currentChapterIndex], pureChapterText, currentFontSize + 2);
    }
});

// ── 55. Лайк книги з повноекранної читалки ──
document.getElementById('pureLikeBtn')?.addEventListener('click', () => {
    handleLikeToggle();
});

// ── 56. Оцінка глави з повноекранної читалки ──
// Оцінка глави у повноекранній читалці (Pure Text)
document.getElementById('pureSubmitChapterRating')?.addEventListener('click', async () => {
    if (!userProfile) {
        authModal.classList.remove('hidden');
        alert('Будь ласка, увійдіть або зареєструйтеся, щоб ставити оцінки!');
        return;
    }
    if (!currentBook) return;
    const selectEl = document.getElementById('pureRateChapterSelect');
    if (!selectEl) return;
    const val = Number(selectEl.value);
    const chap = currentBook.chapters[currentChapterIndex];
    if (!chap) return;

    if (!Array.isArray(chap.ratings)) chap.ratings = [];

    const existingIndex = chap.ratings.findIndex(
        item => typeof item === 'object' && item !== null && item.user === userProfile.username
    );

    if (existingIndex !== -1) {
        chap.ratings[existingIndex].rating = val;
    } else {
        chap.ratings.push({ user: userProfile.username, rating: val });
    }

    updateChapterRatingDisplay();
    document.getElementById('pureChapterAvgRating').textContent = calculateAverage(chap.ratings);
    saveAllRatings();
    
    await saveChapterRatingInSupabase(currentBook.id, currentChapterIndex, val);
});

// ── 57. Закладка з повноекранної читалки ──
pureBookmarkBtn?.addEventListener('click', () => {
    toggleBookmarkLogic();
});

// ── 58. Попередня глава в повноекранній читалці ──
document.getElementById('purePrevChapter')?.addEventListener('click', () => {
    if (currentChapterIndex > 0) {
        loadChapter(currentChapterIndex - 1, true);
        syncPureTextOverlay();
        document.querySelector('.pure-body-scroll').scrollTop = 0;
    }
});

// ── 59. Наступна глава в повноекранній читалці ──
document.getElementById('pureNextChapter')?.addEventListener('click', () => {
    if (currentChapterIndex < currentBook.chapters.length - 1) {
        loadChapter(currentChapterIndex + 1, true);
        syncPureTextOverlay();
        document.querySelector('.pure-body-scroll').scrollTop = 0;
    }
});

// ── 60. Показує / ховає коментарі в повноекранній читалці ──
document.getElementById('pureToggleCommentsBtn')?.addEventListener('click', () => {
    const drawer = document.getElementById('pureCommentsDrawer');
    drawer.classList.toggle('hidden');
    if (!drawer.classList.contains('hidden')) {
        drawer.scrollIntoView({ behavior: 'smooth' });
    }
});

// ── 61. Надсилання коментаря з повноекранної читалки ──
document.getElementById('pureCommentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = document.getElementById('pureCommentInput').value.trim();
    if (!text || !userProfile || !currentBook) return;

    const ok = await addTopLevelComment(text);
    if (ok) document.getElementById('pureCommentInput').value = '';
});

// ── 62. Відкриває вікно «Умови публікації та згода» ──
document.getElementById('openConsentModalBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    consentModal.classList.remove('hidden');
});
// ── 63. Закриває вікно згоди ──
document.getElementById('closeConsentModal')?.addEventListener('click', () => {
    consentModal.classList.add('hidden');
});

// ======================================================================
// РОЗДІЛ VII. СТВОРЕННЯ КНИГИ: ПОЛЯ ГЛАВ У ФОРМІ РЕКОМЕНДАЦІЇ
// ======================================================================

// ── 64. СТВОРЕННЯ КНИГИ: перенумеровує глави у формі ──
function updateChapterNumbers() {
    const groups = document.querySelectorAll('.chapter-input-group');
    groups.forEach((group, index) => {
        const numLabel = group.querySelector('.chap-num-label');
        if (numLabel) {
            numLabel.textContent = `Глава ${index + 1}`;
        }
    });
}

// ── 65. СТВОРЕННЯ КНИГИ: налаштовує поле глави (додавання картинок у текст, видалення глави) ──
function setupChapterInputGroup(groupElement) {
    const textarea = groupElement.querySelector('.rec-chap-content');
    if (textarea) {
        textarea.removeAttribute('required');
        textarea.setAttribute('spellcheck', 'true');
        textarea.setAttribute('lang', 'uk');
    }

    if (textarea && !groupElement.querySelector('.chap-inline-img-file')) {
        const wrapperDiv = textarea.parentElement;
        const labelEl = wrapperDiv.querySelector('label');

        const toolbar = document.createElement('div');
        toolbar.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;';

        const titleSpan = document.createElement('span');
        titleSpan.style.cssText = 'font-size: 0.85rem; font-weight: 600;';
        titleSpan.textContent = labelEl ? labelEl.textContent : 'Текст твору:';

        const btnsBox = document.createElement('div');
        btnsBox.style.cssText = 'display: flex; gap: 6px; align-items: center; flex-wrap: wrap;';
        btnsBox.innerHTML = `
            <label class="action-btn" style="padding: 2px 8px; font-size: 0.75rem; cursor: pointer; background: var(--accent); color: white; display: inline-flex; align-items: center; gap: 4px; margin: 0;">
                + Додати фото у текст
                <input type="file" class="chap-inline-img-file" accept="image/*" style="display: none;">
            </label>
            <label class="action-btn" style="padding: 2px 8px; font-size: 0.75rem; cursor: pointer; background: #10b981; color: white; display: inline-flex; align-items: center; gap: 4px; margin: 0;" title="Додати сторінку-картинку на весь екран">
                🖼️ Додати фото на весь екран
                <input type="file" class="chap-fullscreen-img-file" accept="image/*" style="display: none;">
            </label>
        `;

        toolbar.appendChild(titleSpan);
        toolbar.appendChild(btnsBox);

        if (labelEl) {
            labelEl.replaceWith(toolbar);
        } else {
            wrapperDiv.insertBefore(toolbar, textarea);
        }

        const previewDiv = document.createElement('div');
        previewDiv.className = 'chap-images-preview-list';
        previewDiv.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px;';
        wrapperDiv.appendChild(previewDiv);
    }

    const fileInput = groupElement.querySelector('.chap-inline-img-file');
    const fullscreenFileInput = groupElement.querySelector('.chap-fullscreen-img-file');
    const previewList = groupElement.querySelector('.chap-images-preview-list');

    if (fileInput && previewList) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && !checkImageFileSize(file, e)) return;
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    let width = img.width;
                    let height = img.height;
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

                    const imgCard = document.createElement('div');
                    imgCard.style.cssText = 'position: relative; border: 1px solid var(--border); border-radius: 6px; padding: 4px; background: var(--card-bg); width: 80px; height: 80px;';
                    imgCard.innerHTML = `
                        <img src="${dataUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">
                        <button type="button" class="del-inline-img" style="position: absolute; top: -6px; right: -6px; background: #ef4444; color: white; border: none; width: 20px; height: 20px; border-radius: 50%; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">×</button>
                    `;
                    imgCard.querySelector('.del-inline-img').addEventListener('click', () => {
                        imgCard.remove();
                    });
                    previewList.appendChild(imgCard);
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        });
    }

    if (fullscreenFileInput && previewList) {
        fullscreenFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && !checkImageFileSize(file, e)) return;
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    let width = img.width;
                    let height = img.height;
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

                    const imgCard = document.createElement('div');
                    imgCard.style.cssText = 'position: relative; border: 2px solid #10b981; border-radius: 6px; padding: 4px; background: var(--card-bg); width: 110px; height: 80px;';
                    imgCard.innerHTML = `
                        <img src="${dataUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" title="Повноекранне фото">
                        <span style="position: absolute; bottom: 2px; left: 2px; background: rgba(16, 185, 129, 0.9); color: white; font-size: 8px; padding: 1px 4px; border-radius: 3px;">А4 фото</span>
                        <button type="button" class="del-inline-img" style="position: absolute; top: -6px; right: -6px; background: #ef4444; color: white; border: none; width: 20px; height: 20px; border-radius: 50%; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">×</button>
                    `;
                    imgCard.querySelector('.del-inline-img').addEventListener('click', () => {
                        imgCard.remove();
                    });
                    previewList.appendChild(imgCard);
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        });
    }
}

// ── 66. Підключає налаштування до вже наявних полів глав ──
document.querySelectorAll('.chapter-input-group').forEach(group => {
    setupChapterInputGroup(group);
});

// ── 67. СТВОРЕННЯ КНИГИ: кнопка «+ Додати главу» ──
document.getElementById('addChapterFieldBtn')?.addEventListener('click', () => {
    const container = document.getElementById('chaptersContainer');
    const newGroup = document.createElement('div');
    newGroup.className = 'chapter-input-group';
    newGroup.style.cssText = 'background: var(--bg-color); padding: 12px; border-radius: 8px; border: 1px solid var(--border);';
    newGroup.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label class="chap-num-label" style="margin: 0; font-weight: bold; color: var(--accent);">Глава</label>
            <button type="button" class="remove-chapter-btn" style="background: #ef4444; color: white; border: none; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Видалити главу</button>
        </div>
        <div class="form-group" style="margin-bottom: 8px;">
            <label style="font-size: 0.85rem; margin-bottom: 2px;">Заголовок:</label>
            <input type="text" class="rec-chap-title" placeholder="Назва заголовку" required>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; flex-wrap: wrap; gap: 6px;">
                <label style="font-size: 0.85rem; margin: 0;">Текст твору:</label>
                <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                    <label class="action-btn" style="padding: 2px 8px; font-size: 0.75rem; cursor: pointer; background: var(--accent); color: white; display: inline-flex; align-items: center; gap: 4px; margin: 0;">
                        + Додати фото у текст
                        <input type="file" class="chap-inline-img-file" accept="image/*" style="display: none;">
                    </label>
                    <label class="action-btn" style="padding: 2px 8px; font-size: 0.75rem; cursor: pointer; background: #10b981; color: white; display: inline-flex; align-items: center; gap: 4px; margin: 0;" title="Додати сторінку-картинку на весь екран">
                        🖼️ Додати фото на весь екран
                        <input type="file" class="chap-fullscreen-img-file" accept="image/*" style="display: none;">
                    </label>
                </div>
            </div>
            <textarea class="rec-chap-content" rows="6" placeholder="Введіть текст глави (можна залишити порожнім)..." style="margin-bottom: 6px;" spellcheck="true" lang="uk"></textarea>
            <div class="chap-images-preview-list" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px;"></div>
        </div>
    `;

    newGroup.querySelector('.remove-chapter-btn').addEventListener('click', () => {
        newGroup.remove();
        updateChapterNumbers();
    });

    container.appendChild(newGroup);
    setupChapterInputGroup(newGroup);
    updateChapterNumbers();
    container.scrollTop = container.scrollHeight;
});

// ======================================================================
// РОЗДІЛ VIII. РЕЙТИНГ, ЛАЙКИ, КОМЕНТАРІ, ВИДАЛЕННЯ КНИГИ
// ======================================================================

// ── 68. Відкриває вікно «Рейтинг книг за лайками» ──
ratingModalBtn?.addEventListener('click', () => {
    renderRatingGenres();
    ratingModal.classList.remove('hidden');
});
// ── 69. Закриває вікно рейтингу ──
document.getElementById('closeRatingModal')?.addEventListener('click', () => {
    ratingModal.classList.add('hidden');
});

// ── 70. Список жанрів у вікні рейтингу ──
function renderRatingGenres() {
    const list = document.getElementById('ratingGenresList');
    list.innerHTML = '';

    const genres = [
        { key: 'all', name: '✨ Усі жанри (загальний топ)' },
        { key: 'Fantasy', name: 'Фентезі' },
        { key: 'Romance', name: 'Романтика' },
        { key: 'Horror', name: 'Жахи' },
        { key: 'Sci-Fi', name: 'Наукова фантастика' },
        { key: 'Detective', name: 'Детектив' },
        { key: 'Adventure', name: 'Пригоди' },
        { key: 'Historical', name: 'Історичний' },
        { key: 'Manga', name: 'Манґа' },
        { key: 'Manhwa', name: 'Манхва' },
        { key: 'Ukrainian', name: 'Українська література' },
        { key: 'Comics', name: 'Комікси' }
    ];

    genres.forEach(g => {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.style.cssText = 'width: 100%; justify-content: center; background: var(--bg-color); color: var(--text-color); border: 1px solid var(--border);';
        btn.textContent = g.name;
        btn.addEventListener('click', () => {
            selectedRatingGenre = g.key === 'all' ? null : g.key;
            ratingModal.classList.add('hidden');
            renderBooks();
        });
        list.appendChild(btn);
    });
}

// ── 71. Постановка / зняття лайка книги (зберігається в базі) ──
async function handleLikeToggle() {
    if (!userProfile) {
        authModal.classList.remove('hidden');
        return;
    }
    if (!currentBook) return;
    if (!Array.isArray(currentBook.likes)) currentBook.likes = [];
    if (likeInFlight) return;
    likeInFlight = true;

    const idx = currentBook.likes.indexOf(userProfile.username);
    const wasLiked = idx !== -1;
    if (wasLiked) {
        currentBook.likes.splice(idx, 1);
    } else {
        currentBook.likes.push(userProfile.username);
    }
    updateLikeButton();

    // запис у базу: один лайк від людини гарантує сама база
    const ok = await setLikeInSupabase(currentBook.id, !wasLiked);
    if (!ok) {
        // не вдалося — повертаємо як було
        const i2 = currentBook.likes.indexOf(userProfile.username);
        if (wasLiked && i2 === -1) currentBook.likes.push(userProfile.username);
        if (!wasLiked && i2 !== -1) currentBook.likes.splice(i2, 1);
        updateLikeButton();
        alert('Не вдалося зберегти лайк. Спробуйте ще раз.');
    }
    likeInFlight = false;
    renderBooks();
}

// ── 72. Оновлює вигляд кнопки лайка ──
function updateLikeButton() {
    const likeBtn = document.getElementById('likeBookBtn');
    const likeCountSpan = document.getElementById('likeCount');
    const pureLikeBtn = document.getElementById('pureLikeBtn');
    const pureLikeCountSpan = document.getElementById('pureLikeCount');

    if (!Array.isArray(currentBook.likes)) currentBook.likes = [];
    const count = currentBook.likes.length;
    const isLiked = userProfile && currentBook.likes.includes(userProfile.username);

    if (likeCountSpan) likeCountSpan.textContent = count;
    if (pureLikeCountSpan) pureLikeCountSpan.textContent = count;

    if (likeBtn) likeBtn.style.background = isLiked ? '#e11d48' : '#ec4899';
    if (pureLikeBtn) pureLikeBtn.style.background = isLiked ? '#e11d48' : '#ec4899';
}

// ── 73. Підключає кнопку лайка ──
document.getElementById('likeBookBtn')?.addEventListener('click', handleLikeToggle);

// ── 74. Малює коментарі та відповіді на них ──
function renderComments() {
    const list = document.getElementById('commentsList');
    const commentForm = document.getElementById('commentForm');
    const commentLoginNotice = document.getElementById('commentLoginNotice');

    const pureList = document.getElementById('pureCommentsList');
    const pureCommentForm = document.getElementById('pureCommentForm');
    const pureCommentLoginNotice = document.getElementById('pureCommentLoginNotice');
    const pureCommentsCount = document.getElementById('pureCommentsCount');

    if (userProfile) {
        if (commentForm) commentForm.classList.remove('hidden');
        if (commentLoginNotice) commentLoginNotice.classList.add('hidden');
        if (pureCommentForm) pureCommentForm.classList.remove('hidden');
        if (pureCommentLoginNotice) pureCommentLoginNotice.classList.add('hidden');
    } else {
        if (commentForm) commentForm.classList.add('hidden');
        if (commentLoginNotice) commentLoginNotice.classList.remove('hidden');
        if (pureCommentForm) pureCommentForm.classList.add('hidden');
        if (pureCommentLoginNotice) pureCommentLoginNotice.classList.remove('hidden');
    }

    const comms = Array.isArray(currentBook.comments) ? currentBook.comments : [];
    if (pureCommentsCount) pureCommentsCount.textContent = comms.length;

    const buildHTML = () => {
        if (comms.length === 0) {
            return '<p style="color: var(--text-muted); font-size: 0.9rem;">Поки немає коментарів. Будьте першим!</p>';
        }
        return comms.map(comm => {
            let deleteBtnHtml = '';
            if (userProfile && userProfile.isAdmin) {
                deleteBtnHtml = `<button onclick="deleteComment(${comm.id})" style="background: #ef4444; color: white; border: none; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Видалити</button>`;
            }
            const avatarHtml = getAvatarHTML(comm.author, 'avatar-comment');
            
            const repliesHtml = (Array.isArray(comm.replies) ? comm.replies : []).map(rep => {
                const repAvatar = getAvatarHTML(rep.author, 'avatar-comment');
                return `
                    <div class="reply-card">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            ${repAvatar}
                            <div>
                                <p style="font-weight: bold; font-size: 0.85rem; color: var(--accent);">${esc(rep.author)}</p>
                                <p style="font-size: 0.7rem; color: var(--text-muted);">📅 ${esc(rep.date)}</p>
                            </div>
                        </div>
                        <p style="font-size: 0.9rem; padding-left: 38px;">${esc(rep.text)}</p>
                    </div>
                `;
            }).join('');

            return `
                <div class="comment-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            ${avatarHtml}
                            <div>
                                <p style="font-weight: bold; font-size: 0.9rem; color: var(--accent);">${esc(comm.author)}</p>
                                <p style="font-size: 0.75rem; color: var(--text-muted);">📅 ${esc(comm.date)}</p>
                            </div>
                        </div>
                        ${deleteBtnHtml}
                    </div>
                    <p style="font-size: 0.95rem; word-break: break-word; padding-left: 40px;">${esc(comm.text)}</p>
                    
                    ${userProfile ? `<div style="margin-left: 40px; margin-top: 6px;"><button onclick="toggleReplyBox(${comm.id})" style="background:none; border:none; color:var(--accent); cursor:pointer; font-size:0.85rem; font-weight:600;">💬 Відповісти</button> <button onclick="openReportModal('comment', ${comm.id})" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:0.8rem;">🚩 Поскаржитися</button></div>` : ''}

                    <div id="replyBox-${comm.id}" class="hidden reply-form-box" style="margin-left: 40px;">
                        <input type="text" id="replyInput-${comm.id}" placeholder="Ваша відповідь..." style="font-size:0.85rem; padding: 0.4rem;">
                        <button onclick="submitReply(${comm.id})" class="action-btn" style="padding: 0.4rem 0.8rem; font-size:0.85rem;">ОК</button>
                    </div>

                    ${repliesHtml ? `<div class="comment-replies-container">${repliesHtml}</div>` : ''}
                </div>
            `;
        }).join('');
    };

    const htmlContent = buildHTML();
    if (list) list.innerHTML = htmlContent;
    if (pureList) pureList.innerHTML = htmlContent;
}

// ── 75. Надсилання нового коментаря ──
document.getElementById('commentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = document.getElementById('commentInput').value.trim();
    if (!text || !userProfile || !currentBook) return;

    const ok = await addTopLevelComment(text);
    if (ok) document.getElementById('commentInput').value = '';
});

// ── 76. Показує / ховає поле відповіді на коментар ──
window.toggleReplyBox = function(commentId) {
    const box = document.getElementById(`replyBox-${commentId}`);
    if (box) box.classList.toggle('hidden');
};

// ── 77. Надсилання відповіді на коментар (автор отримує сповіщення в скриньку) ──
window.submitReply = async function(commentId) {
    if (!userProfile || !currentBook) return;
    const input = document.getElementById(`replyInput-${commentId}`);
    const text = input ? input.value.trim() : '';
    if (!text) return;

    if (!Array.isArray(currentBook.comments)) currentBook.comments = [];
    const comm = currentBook.comments.find(c => c.id === commentId);
    if (!comm) return;

    if (!Array.isArray(comm.replies)) comm.replies = [];
    // Автора відповіді й сповіщення для автора коментаря створює база (тригер)
    const reply = await postCommentToDb(text, commentId);
    if (!reply) return;
    comm.replies.push(reply);
    renderComments();
};

// ── 78. Видалення коментаря (адмін) ──
window.deleteComment = async function(commentId) {
    if (!userProfile || !userProfile.isAdmin || !currentBook) return;
    if (!Array.isArray(currentBook.comments)) currentBook.comments = [];
    const { data, error } = await _supabase.from('comments').delete().eq('id', commentId).select('id');
    if (error) {
        alert('Не вдалося видалити коментар: ' + error.message);
        return;
    }
    if (!data || data.length === 0) {
        alert('Коментар не видалено: база не дозволила видалення. Увійдіть як адміністратор ще раз.');
        return;
    }
    currentBook.comments = currentBook.comments.filter(c => c.id !== commentId);
    renderComments();
};

// ── 79. ВИДАЛЕННЯ КНИГИ з бази (адмін): перевіряє сесію й справжній результат видалення ──
let deleteBookInFlight = false;
deleteBookBtn?.addEventListener('click', async () => {
    if (deleteBookInFlight) return;
    if (!currentBook || !userProfile || !userProfile.isAdmin) return;

    // Потрібна справжня сесія Supabase, а не лише запис у localStorage
    const { data: sessionData } = await _supabase.auth.getSession();
    if (!sessionData || !sessionData.session) {
        alert('Сесію завершено. Увійдіть як адміністратор ще раз.');
        return;
    }

    const bookId = currentBook.id;
    const bookTitle = currentBook.title;
    if (!confirm('Ви впевнені, що хочете видалити твір "' + bookTitle + '"?\nРазом із ним буде видалено всі його коментарі, лайки й оцінки. Це незворотно.')) return;

    deleteBookInFlight = true;
    deleteBookBtn.disabled = true;
    try {
        // Право видаляти має лише адмін — це перевіряє сама база (політика books_delete)
        const { data, error } = await _supabase.from('books').delete().eq('id', bookId).select('id');
        if (error) {
            alert('Помилка при видаленні з бази даних: ' + error.message);
            return;
        }
        if (!data || data.length === 0) {
            alert('Книгу не видалено: база не дозволила видалення. Вийдіть, увійдіть знову як адміністратор і спробуйте ще раз.');
            return;
        }
        booksData = booksData.filter(b => String(b.id) !== String(bookId));
        readerModal.classList.add('hidden');
        renderBooks();
    } finally {
        deleteBookInFlight = false;
        deleteBookBtn.disabled = false;
    }
});

// ======================================================================
// РОЗДІЛ IX. ЧИТАННЯ ГЛАВ, ЗАКЛАДКИ, ОЦІНЮВАННЯ (ОНОВЛЕННЯ КНИГИ)
// ======================================================================

// ── 80. Оновлює список глав у випадаючому меню ──
function updateChapterDropdown() {
    const bookBookmarks = bookmarks[currentBook.id] || [];
    chapterSelect.innerHTML = '';
    currentBook.chapters.forEach((chap, index) => {
        const option = document.createElement('option');
        option.value = index;
        const isSaved = bookBookmarks.includes(index) ? ' 🔖' : '';
        option.textContent = chap.title + isSaved;
        chapterSelect.appendChild(option);
    });
    chapterSelect.value = currentChapterIndex;
}

// ── 81. Показує середню оцінку книги ──
function updateBookRatingDisplay() {
    if (!Array.isArray(currentBook.ratings)) currentBook.ratings = [];
    const el = document.getElementById('bookAvgRating');
    if (el) el.textContent = calculateAverage(currentBook.ratings);
}

// ── 82. Показує середню оцінку глави ──
function updateChapterRatingDisplay() {
    const chap = currentBook.chapters[currentChapterIndex];
    if (!chap) return;
    if (!Array.isArray(chap.ratings)) chap.ratings = [];
    const avg = calculateAverage(chap.ratings);
    const el1 = document.getElementById('chapterAvgRating');
    const el2 = document.getElementById('pureChapterAvgRating');
    if (el1) el1.textContent = avg;
    if (el2) el2.textContent = avg;
}

// ── 83. Показує обрану главу ──
function loadChapter(index, autoBookmark = true) {
    if (!currentBook || !currentBook.chapters[index]) return;
    currentChapterIndex = index;
    const chap = currentBook.chapters[index];

    renderChapterIntoA4Sheets(chap, chapterText, currentFontSize);
    updateChapterRatingDisplay();

    if (autoBookmark) {
        if (!bookmarks[currentBook.id]) bookmarks[currentBook.id] = [];
        if (!bookmarks[currentBook.id].includes(index)) {
            bookmarks[currentBook.id].push(index);
            localStorage.setItem('transverse_bookmarks_v3', JSON.stringify(bookmarks));
        }
    }

    updateChapterDropdown();
    updateBookmarkButton();
}

// ── 84. Оновлює вигляд кнопки закладки ──
function updateBookmarkButton() {
    const bookBookmarks = bookmarks[currentBook.id] || [];
    const isSaved = bookBookmarks.includes(currentChapterIndex);
    
    if (isSaved) {
        if (bookmarkBtn) {
            bookmarkBtn.textContent = '🔖 Главу збережено';
            bookmarkBtn.classList.add('saved');
        }
        if (pureBookmarkBtn) {
            pureBookmarkBtn.textContent = '🔖 Главу збережено';
            pureBookmarkBtn.classList.add('saved');
        }
    } else {
        if (bookmarkBtn) {
            bookmarkBtn.textContent = '🔖 Закладка';
            bookmarkBtn.classList.remove('saved');
        }
        if (pureBookmarkBtn) {
            pureBookmarkBtn.textContent = '🔖 Закладка';
            pureBookmarkBtn.classList.remove('saved');
        }
    }
}

// ── 85. Ставить / знімає закладку ──
function toggleBookmarkLogic() {
    if (!bookmarks[currentBook.id]) bookmarks[currentBook.id] = [];
    const idxPos = bookmarks[currentBook.id].indexOf(currentChapterIndex);

    if (idxPos !== -1) {
        bookmarks[currentBook.id].splice(idxPos, 1);
    } else {
        bookmarks[currentBook.id].push(currentChapterIndex);
    }

    localStorage.setItem('transverse_bookmarks_v3', JSON.stringify(bookmarks));
    updateChapterDropdown();
    updateBookmarkButton();
}

// ── 86. Підключає кнопку закладки ──
bookmarkBtn?.addEventListener('click', toggleBookmarkLogic);
// ── 87. Вибір глави зі списку ──
chapterSelect?.addEventListener('change', (e) => loadChapter(Number(e.target.value), true));

// ── 88. Кнопка «Попередня глава» ──
document.getElementById('prevChapter')?.addEventListener('click', () => {
    if (currentChapterIndex > 0) loadChapter(currentChapterIndex - 1, true);
});

// ── 89. Кнопка «Наступна глава» ──
document.getElementById('nextChapter')?.addEventListener('click', () => {
    if (currentChapterIndex < currentBook.chapters.length - 1) loadChapter(currentChapterIndex + 1, true);
});

// ── 90. Збільшення шрифту (A+) ──
document.getElementById('increaseFont')?.addEventListener('click', () => {
    if (currentFontSize < 28) {
        currentFontSize += 2;
        renderChapterIntoA4Sheets(currentBook.chapters[currentChapterIndex], chapterText, currentFontSize);
    }
});

// ── 91. Зменшення шрифту (A-) ──
document.getElementById('decreaseFont')?.addEventListener('click', () => {
    if (currentFontSize > 14) {
        currentFontSize -= 2;
        renderChapterIntoA4Sheets(currentBook.chapters[currentChapterIndex], chapterText, currentFontSize);
    }
});

// ── 92. Закриття читалки ──
document.getElementById('closeModal')?.addEventListener('click', () => {
    readerContentWrapper.classList.remove('fullscreen-reader');
    pureTextOverlay.classList.add('hidden');
    readerModal.classList.add('hidden');
});

// ── 93. ОНОВЛЕННЯ КНИГИ: оцінка книги користувачем ──
// Загальна оцінка книги (збереження унікального голосу користувача)
document.getElementById('submitBookRating')?.addEventListener('click', async () => {
    if (!userProfile) {
        authModal.classList.remove('hidden');
        alert('Будь ласка, увійдіть або зареєструйтеся, щоб ставити оцінки!');
        return;
    }
    if (!currentBook) return;
    const selectEl = document.getElementById('rateBookSelect');
    if (!selectEl) return;
    const val = Number(selectEl.value);
    
    if (!Array.isArray(currentBook.ratings)) currentBook.ratings = [];

    const existingIndex = currentBook.ratings.findIndex(
        item => typeof item === 'object' && item !== null && item.user === userProfile.username
    );

    if (existingIndex !== -1) {
        currentBook.ratings[existingIndex].rating = val;
    } else {
        currentBook.ratings.push({ user: userProfile.username, rating: val });
    }

    updateBookRatingDisplay();
    saveAllRatings();
    renderBooks();
    
    await saveBookRatingInSupabase(currentBook.id, val);
});

// ── 94. ОНОВЛЕННЯ КНИГИ: оцінка глави користувачем ──
// Оцінка глави у модальному вікні (збереження унікального голосу користувача)
document.getElementById('submitChapterRating')?.addEventListener('click', async () => {
    if (!userProfile) {
        authModal.classList.remove('hidden');
        alert('Будь ласка, увійдіть або зареєструйтеся, щоб ставити оцінки!');
        return;
    }
    if (!currentBook) return;
    const selectEl = document.getElementById('rateChapterSelect');
    if (!selectEl) return;
    const val = Number(selectEl.value);
    const chap = currentBook.chapters[currentChapterIndex];
    if (!chap) return;

    if (!Array.isArray(chap.ratings)) chap.ratings = [];

    const existingIndex = chap.ratings.findIndex(
        item => typeof item === 'object' && item !== null && item.user === userProfile.username
    );

    if (existingIndex !== -1) {
        chap.ratings[existingIndex].rating = val;
    } else {
        chap.ratings.push({ user: userProfile.username, rating: val });
    }

    updateChapterRatingDisplay();
    saveAllRatings();

    await saveChapterRatingInSupabase(currentBook.id, currentChapterIndex, val);
});

// ── 95. Зберігає оцінки користувача в localStorage ──
function saveAllRatings() {
    if (!currentBook) return;
    if (!Array.isArray(currentBook.ratings)) currentBook.ratings = [];
    savedRatings[currentBook.id] = {
        bookRatings: currentBook.ratings,
        chapterRatings: currentBook.chapters.map(c => Array.isArray(c.ratings) ? c.ratings : [])
    };
    localStorage.setItem('transverse_ratings_v3', JSON.stringify(savedRatings));
}

// ======================================================================
// РОЗДІЛ X. АКАУНТИ: ВХІД, РЕЄСТРАЦІЯ, ВИХІД, ВИДАЛЕННЯ
// ======================================================================

// ── 96. Відкриває вікно акаунта ──
profileBtn?.addEventListener('click', () => {
    updateUIByRole();
    authModal.classList.remove('hidden');
});

// ── 97. Закриває вікно акаунта ──
document.getElementById('closeAuthModal')?.addEventListener('click', () => {
    authModal.classList.add('hidden');
});

// ── 98. Перемикання вкладок «Увійти / Зареєструватися» ──
document.querySelectorAll('[data-authtab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-authtab]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const tab = e.target.dataset.authtab;
        if (tab === 'login') {
            document.getElementById('loginForm').classList.remove('hidden');
            document.getElementById('registerForm').classList.add('hidden');
        } else {
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('registerForm').classList.remove('hidden');
        }
    });
});

// ── 99. ВХІД: спочатку перевірка адміна, потім звичайного користувача ──
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const typedName = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!typedName || !password) {
        alert('Введіть нікнейм і пароль!');
        return;
    }

    await loadUsersFromSupabase();
    // Нікнейм без урахування регістру (для адміністраторів — як введено)
    const username = Object.keys(registeredUsers).find(u => u.toLowerCase() === typedName.toLowerCase()) || typedName;

    const result = await loginWithPassword(username, password);
    if (!result.ok) {
        alert(result.message || 'Невірний нікнейм або пароль!');
        return;
    }

    updateUIByRole();
    authModal.classList.add('hidden');
    document.getElementById('loginForm').reset();

    if (userProfile && userProfile.isAdmin) {
        await loadSubmissionsFromSupabase();
    }
    loadNotificationsFromSupabase();
});

// ── 100. РЕЄСТРАЦІЯ нового користувача ──
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const confirm = document.getElementById('regPasswordConfirm').value.trim();

    if (username.length < 1 || username.length > 20) {
        alert('Ім\'я користувача повинно містити від 1 до 20 символів!');
        return;
    }
    if (!/^[\p{L}\p{N}_.\- ]+$/u.test(username)) {
        alert('У нікнеймі можна використовувати лише літери, цифри, пробіл та символи _ . -');
        return;
    }
    if (password.length < 6 || password.length > 32) {
        alert('Пароль повинен містити від 6 до 32 символів!');
        return;
    }
    if (password !== confirm) {
        alert('Паролі не збігаються!');
        return;
    }

    await loadBannedUsernamesFromSupabase();
    if (bannedUsernames.includes(username.toLowerCase())) {
        alert('Цей нікнейм заблоковано або був видалений адміністрацією. Оберіть інший!');
        return;
    }

    await loadUsersFromSupabase();
    const isTakenByUser = Object.keys(registeredUsers).some(u => u.toLowerCase() === username.toLowerCase());
    if (isTakenByUser) {
        alert('Цей нікнейм вже зайнятий!');
        return;
    }
    // Перевірка на сервері (враховує й імена адміністраторів)
    const { data: takenOnServer, error: takenError } = await _supabase.rpc('username_taken', { p_username: username });
    if (takenError) {
        console.error('username_taken недоступна:', takenError.message);
    } else if (takenOnServer) {
        alert('Цей нікнейм вже зайнятий!');
        return;
    }

    // Створення облікового запису в Supabase Auth (пароль зберігається там у вигляді хеша)
    const email = await synthEmail(username);
    let { data: authData, error: signUpError } = await _supabase.auth.signUp({ email, password });
    if (signUpError && /already|registered|exists/i.test(signUpError.message || '')) {
        const retry = await _supabase.auth.signInWithPassword({ email, password });
        if (retry.error) {
            alert('Цей нікнейм вже зайнятий!');
            return;
        }
        authData = retry.data;
    } else if (signUpError) {
        alert('Помилка реєстрації: ' + signUpError.message);
        return;
    }
    if (!authData || !authData.user || !authData.session) {
        alert('Реєстрацію не завершено: у Supabase увімкнено підтвердження e-mail. Вимкніть «Confirm email» (Authentication → Providers → Email).');
        return;
    }

    const { data: insertedUser, error: regError } = await _supabase
        .from('users')
        .insert([{
            username: username,
            reg_date: new Date().toISOString(),
            avatar_url: null,
            auth_type: 'local',
            auth_user_id: authData.user.id
        }])
        .select('id, username');

    if (regError) {
        await _supabase.auth.signOut();
        alert('Помилка збереження користувача в базу даних Supabase: ' + regError.message);
        return;
    }

    registeredUsers[username] = {
        id: insertedUser?.[0]?.id || null,
        password: '',
        regDate: new Date().toLocaleDateString(),
        avatar: null,
        authType: 'local',
        authUserId: authData.user.id
    };
    localStorage.setItem('transverse_registered_users', JSON.stringify(registeredUsers));

    if (!userNotifications[username]) {
        userNotifications[username] = [];
        saveNotifications();
    }

    userProfile = { username, isAdmin: false, isSuperAdmin: false, authUserId: authData.user.id };
    localStorage.setItem('transverse_user', JSON.stringify(userProfile));
    updateUIByRole();
    authModal.classList.add('hidden');
    document.getElementById('registerForm').reset();
    alert('Реєстрація успішна!');
});

// ── 101. Вихід з акаунта ──
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await _supabase.auth.signOut();
    localStorage.removeItem('transverse_user');
    submissions = [];
    localStorage.removeItem('transverse_submissions');
    userProfile = null;
    updateUIByRole();
    authModal.classList.add('hidden');
});

// ── 102. Видалення власного акаунта (тепер разом із його сповіщеннями в базі) ──
deleteAccountBtn?.addEventListener('click', async () => {
    if (!userProfile || userProfile.isAdmin) return;
    if (confirm('Ви дійсно хочете видалити свій акаунт? Цю дію неможливо скасувати.')) {
        const username = userProfile.username;
        const userDataBackup = registeredUsers[username] || {
            password: "1234",
            regDate: new Date().toLocaleDateString(),
            avatar: null
        };

        const { error: delErr } = await _supabase.rpc('delete_my_account');
        if (delErr) {
            alert('Не вдалося видалити акаунт: ' + delErr.message);
            return;
        }
        await _supabase.auth.signOut();

        delete registeredUsers[username];
        delete userNotifications[username];
        await _supabase.from('notifications').delete().eq('username', username);
        
        if (!bannedUsernames.includes(username.toLowerCase())) {
            bannedUsernames.push(username.toLowerCase());
            localStorage.setItem('transverse_banned_users', JSON.stringify(bannedUsernames));
        }

        deletedAccountsHistory.unshift({
            id: Date.now(),
            username: username,
            userData: userDataBackup,
            deletedDate: new Date().toLocaleDateString()
        });
        localStorage.setItem('transverse_deleted_accounts_history', JSON.stringify(deletedAccountsHistory));
        localStorage.setItem('transverse_registered_users', JSON.stringify(registeredUsers));
        saveNotifications();
        
        localStorage.removeItem('transverse_user');
        userProfile = null;
        updateUIByRole();
        authModal.classList.add('hidden');
        alert('Ваш акаунт успішно видалено.');
    }
});

// ======================================================================
// РОЗДІЛ XI. ЗАЯВКИ КОРИСТУВАЧІВ (скарга, рекомендація твору, заява)
// ======================================================================

// ── 103. Відкриває вікно заявок ──
requestsBtn?.addEventListener('click', () => {
    document.querySelectorAll('.chapter-input-group').forEach(group => {
        setupChapterInputGroup(group);
    });
    requestModal.classList.remove('hidden');
});
// ── 104. Закриває вікно заявок ──
document.getElementById('closeRequestModal')?.addEventListener('click', () => {
    requestModalContent.classList.remove('fullscreen-reader');
    requestModal.classList.add('hidden');
});

// ── 105. Завантаження власної обкладинки / макета книги ──
const fileInputEl = document.getElementById('bookLayoutFile');
if (fileInputEl) {
    const oldSelect = document.getElementById('bookLayoutSelect');
    if (oldSelect) {
        if (oldSelect.previousElementSibling) oldSelect.previousElementSibling.style.display = 'none';
        oldSelect.style.display = 'none';
    }

    fileInputEl.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && !checkImageFileSize(file, e)) return;
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 400;
                const MAX_HEIGHT = 600;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                uploadedLayoutDataUrl = canvas.toDataURL('image/jpeg', 0.8);

                const prev = document.getElementById('layoutPreviewImg');
                if (prev) {
                    prev.src = uploadedLayoutDataUrl;
                    prev.classList.remove('hidden');
                }
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// ── 106. Кнопка показу / приховування пароля ──
const passInputEl = document.getElementById('loginPassword');
if (passInputEl && !document.getElementById('togglePasswordBtn')) {
    const wrapper = passInputEl.parentElement;
    wrapper.style.position = 'relative';
    passInputEl.style.paddingRight = '35px';
    
    const eyeBtn = document.createElement('button');
    eyeBtn.type = 'button';
    eyeBtn.id = 'togglePasswordBtn';
    eyeBtn.innerHTML = '👁️';
    eyeBtn.style.cssText = 'position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.1rem;';
    
    eyeBtn.addEventListener('click', () => {
        if (passInputEl.type === 'password') {
            passInputEl.type = 'text';
            eyeBtn.innerHTML = '🔒';
        } else {
            passInputEl.type = 'password';
            eyeBtn.innerHTML = '👁️';
        }
    });
    wrapper.appendChild(eyeBtn);
}

const regPassInputs = ['regPassword', 'regPasswordConfirm'];
regPassInputs.forEach(inputId => {
    const inputEl = document.getElementById(inputId);
    if (inputEl && !inputEl.parentElement.querySelector('.toggle-reg-pass')) {
        const wrapper = inputEl.parentElement;
        wrapper.style.position = 'relative';
        inputEl.style.paddingRight = '35px';

        const eyeBtn = document.createElement('button');
        eyeBtn.type = 'button';
        eyeBtn.className = 'toggle-reg-pass';
        eyeBtn.innerHTML = '👁️';
        eyeBtn.style.cssText = 'position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.1rem;';

        eyeBtn.addEventListener('click', () => {
            if (inputEl.type === 'password') {
                inputEl.type = 'text';
                eyeBtn.innerHTML = '🔒';
            } else {
                inputEl.type = 'password';
                eyeBtn.innerHTML = '👁️';
            }
        });
        wrapper.appendChild(eyeBtn);
    }
});

// ── 107. Перемикання вкладок «Скарга / Рекомендація / Заява» ──
document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const tab = e.target.dataset.tab;
        
        document.getElementById('complaintForm').classList.add('hidden');
        document.getElementById('recommendForm').classList.add('hidden');
        document.getElementById('statementForm').classList.add('hidden');

        if (tab === 'complaint') {
            document.getElementById('complaintForm').classList.remove('hidden');
        } else if (tab === 'recommend') {
            document.getElementById('recommendForm').classList.remove('hidden');
            document.querySelectorAll('.chapter-input-group').forEach(group => {
                setupChapterInputGroup(group);
            });
        } else if (tab === 'statement') {
            document.getElementById('statementForm').classList.remove('hidden');
        }
    });
});

// ── 108. ВІДПРАВКА СКАРГИ: запис у submissions + підтвердження у скриньку користувача ──
document.getElementById('complaintForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!userProfile) {
        authModal.classList.remove('hidden');
        alert('Для подачі скарги необхідно зареєструватися або увійти в акаунт!');
        return;
    }
    const text = document.getElementById('complaintText').value.trim();
    const authorName = userProfile.username;

    const { error } = await _supabase.from('submissions').insert([{
        user_id: userProfile.authUserId || null,
        author_username: authorName,
        type: 'complaint',
        payload: { text: text },
        status: 'pending'
    }]);

    if (error) {
        alert('Помилка надсилання скарги в Supabase: ' + error.message);
        return;
    }

    await loadSubmissionsFromSupabase();

    if (!userNotifications[userProfile.username]) userNotifications[userProfile.username] = [];
    userNotifications[userProfile.username].push({
        id: Date.now(),
        text: `📝 Ваша скарга успішно надіслана адміністратору.`,
        date: new Date().toLocaleDateString(),
        read: false,
        isBroadcast: false
    });
    saveNotifications();

    document.getElementById('complaintText').value = '';
    requestModalContent.classList.remove('fullscreen-reader');
    requestModal.classList.add('hidden');
});

// ── 109. СТВОРЕННЯ КНИГИ: відправка заявки на твір (назва, автор, жанр, вік, глави, обкладинка) адміну ──
document.getElementById('recommendForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!userProfile) {
        authModal.classList.remove('hidden');
        alert('Для подачі заявки / рекомендації твору необхідно зареєструватися або увійти в акаунт!');
        return;
    }

    const title = document.getElementById('recTitle').value.trim();
    const authorName = document.getElementById('recName').value.trim();
    const authorSurname = document.getElementById('recSurname').value.trim();
    const genre = document.getElementById('recGenre').value;
    const description = document.getElementById('recDesc').value.trim();
    const ageMin = Number(document.getElementById('recAgeMin').value) || 0;
    const ageMax = Number(document.getElementById('recAgeMax').value) || 99;

    const chapterGroups = document.querySelectorAll('.chapter-input-group');
    const chapters = [];

    chapterGroups.forEach(group => {
        const chapTitle = group.querySelector('.rec-chap-title').value.trim();
        const chapContent = group.querySelector('.rec-chap-content').value.trim();
        
        const imgCards = group.querySelectorAll('.chap-images-preview-list img');
        const chapterImages = [];
        imgCards.forEach(img => chapterImages.push(img.src));

        if (chapTitle && (chapContent || chapterImages.length > 0)) {
            chapters.push({
                title: chapTitle,
                content: chapContent,
                images: chapterImages,
                ratings: []
            });
        }
    });

    if (chapters.length === 0) {
        alert('Будь ласка, додайте хоча б одну главу!');
        return;
    }

    const finalCover = (uploadedLayoutDataUrl && uploadedLayoutDataUrl.length > 20) 
        ? uploadedLayoutDataUrl 
        : "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80";

    const newBook = {
        title: title,
        author_name: authorName,
        author_surname: authorSurname,
        genre: genre,
        age_min: ageMin,
        age_max: ageMax,
        description: description,
        cover: finalCover,
        original_lang: "Авторський переклад",
        ratings: [],
        likes: [],
        comments: [],
        added_by: userProfile.username,
        chapters: chapters
    };

    const { error: subError } = await _supabase.from('submissions').insert([{
        user_id: userProfile.authUserId || null,
        author_username: userProfile.username,
        type: 'book',
        payload: { book: newBook },
        status: 'pending'
    }]);

    if (subError) {
        alert('Помилка надсилання твору на модерацію: ' + subError.message);
        return;
    }

    await loadSubmissionsFromSupabase();

    if (!userNotifications[userProfile.username]) userNotifications[userProfile.username] = [];
    userNotifications[userProfile.username].push({
        id: Date.now(),
        text: `📚 Твір "${title}" успішно надіслано на розгляд адміністратору.`,
        date: new Date().toLocaleDateString(),
        read: false,
        isBroadcast: false
    });
    saveNotifications();

    document.getElementById('recommendForm').reset();
    uploadedLayoutDataUrl = "";
    const prev = document.getElementById('layoutPreviewImg');
    if (prev) prev.classList.add('hidden');

    document.querySelectorAll('.chap-images-preview-list').forEach(list => list.innerHTML = '');
    document.querySelectorAll('.rec-chap-content').forEach(ta => ta.style.display = 'block');

    const allChapGroups = document.querySelectorAll('.chapter-input-group');
    for (let i = 1; i < allChapGroups.length; i++) {
        allChapGroups[i].remove();
    }
    updateChapterNumbers();

    requestModalContent.classList.remove('fullscreen-reader');
    requestModal.classList.add('hidden');
});

// ── 110. ВІДПРАВКА ЗАЯВИ щодо твору + підтвердження у скриньку ──
document.getElementById('statementForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!userProfile) {
        authModal.classList.remove('hidden');
        alert('Для подачі заяви необхідно зареєструватися або увійти в акаунт!');
        return;
    }
    const authorName = document.getElementById('statAuthorName').value.trim();
    const bookTitle = document.getElementById('statBookTitle').value.trim();
    const text = document.getElementById('statText').value.trim();

    const { error } = await _supabase.from('submissions').insert([{
        user_id: userProfile.authUserId || null,
        author_username: userProfile.username,
        type: 'statement',
        payload: { authorName, bookTitle, text },
        status: 'pending'
    }]);

    if (error) {
        alert('Помилка надсилання заяви в Supabase: ' + error.message);
        return;
    }

    await loadSubmissionsFromSupabase();

    if (!userNotifications[userProfile.username]) userNotifications[userProfile.username] = [];
    userNotifications[userProfile.username].push({
        id: Date.now(),
        text: `📄 Вашу заяву щодо твору "${bookTitle}" надіслано адміністрації.`,
        date: new Date().toLocaleDateString(),
        read: false,
        isBroadcast: false
    });
    saveNotifications();

    document.getElementById('statementForm').reset();
    requestModalContent.classList.remove('fullscreen-reader');
    requestModal.classList.add('hidden');
});

// ======================================================================
// РОЗДІЛ XII. АДМІН-ПАНЕЛЬ: ЗАЯВКИ, КОРИСТУВАЧІ, ВІДПОВІДІ, СХВАЛЕННЯ КНИГ
// ======================================================================

// ── 111. Відкриває адмін-панель ──
adminPanelBtn?.addEventListener('click', async () => {
    await loadSubmissionsFromSupabase();
    await loadUsersFromSupabase();
    renderAdminSubmissions();
    renderAdminHistory();
    renderAdminUsers();
    if (userProfile && userProfile.isSuperAdmin) {
        renderAdminAdmins();
        renderAdminDeleted();
        renderAdminBannedUsers();
    }
    adminModal.classList.remove('hidden');
});
// ── 112. Закриває адмін-панель ──
document.getElementById('closeAdminModal')?.addEventListener('click', () => {
    adminModalContent.classList.remove('fullscreen-reader');
    adminModal.classList.add('hidden');
});

// ── 113. Перемикання вкладок адмін-панелі ──
document.querySelectorAll('[data-admintab]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        document.querySelectorAll('[data-admintab]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const tab = e.target.dataset.admintab;
        
        document.getElementById('adminIncomingSection').classList.add('hidden');
        document.getElementById('adminHistorySection').classList.add('hidden');
        document.getElementById('adminUsersSection').classList.add('hidden');
        document.getElementById('adminAdminsSection').classList.add('hidden');
        document.getElementById('adminDeletedSection').classList.add('hidden');
        const bannedSec = document.getElementById('adminBannedUsersSection');
        if (bannedSec) bannedSec.classList.add('hidden');

        if (tab === 'incoming') {
            await loadSubmissionsFromSupabase();
            document.getElementById('adminIncomingSection').classList.remove('hidden');
            renderAdminSubmissions();
        } else if (tab === 'history') {
            document.getElementById('adminHistorySection').classList.remove('hidden');
            renderAdminHistory();
        } else if (tab === 'users') {
            await loadUsersFromSupabase();
            document.getElementById('adminUsersSection').classList.remove('hidden');
            renderAdminUsers();
        } else if (tab === 'admins' && userProfile && userProfile.isSuperAdmin) {
            document.getElementById('adminAdminsSection').classList.remove('hidden');
            renderAdminAdmins();
        } else if (tab === 'deleted' && userProfile && userProfile.isSuperAdmin) {
            document.getElementById('adminDeletedSection').classList.remove('hidden');
            renderAdminDeleted();
        } else if (tab === 'bannedusers' && userProfile && userProfile.isSuperAdmin) {
            if (bannedSec) bannedSec.classList.remove('hidden');
            renderAdminBannedUsers();
        }
    });
});

// ── 114. Список вхідних заявок в адмін-панелі ──
function renderAdminSubmissions() {
    const list = document.getElementById('adminSubmissionsList');
    list.innerHTML = '';
    if (submissions.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted);">Немає нових заявок.</p>';
        return;
    }

    submissions.forEach((sub, index) => {
        const item = document.createElement('div');
        item.style.cssText = 'background: var(--bg-color); padding: 12px; margin-bottom: 10px; border-radius: 8px; border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;';
        
        const infoBtnHtml = `<button onclick="openSubmissionInfo(${index})" title="Детальна інформація / Попередній перегляд" style="background: #3b82f6; color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-weight: bold; font-family: serif; font-style: italic; font-size: 1.05rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(59,130,246,0.35);">i</button>`;

        if (sub.type === 'complaint') {
            item.innerHTML = `
                <div style="flex: 1;">
                    <p><strong>🚨 Скарга від ${esc(sub.author)} (${esc(sub.date)}):</strong></p>
                    <p style="margin: 4px 0;">${esc(sub.text)}</p>
                    <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
                        <button onclick="openReplyModal(${index})" style="background: var(--accent); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Відповісти</button>
                        <button onclick="deleteSubmission(${index})" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Видалити</button>
                    </div>
                </div>
                ${infoBtnHtml}
            `;
        } else if (sub.type === 'statement') {
            item.innerHTML = `
                <div style="flex: 1;">
                    <p><strong>📄 Заява від автора ${esc(sub.author)} (${esc(sub.date)}):</strong></p>
                    <p>Автор: <strong>${esc(sub.authorName)}</strong> | Твір: <strong>${esc(sub.bookTitle)}</strong></p>
                    <p style="margin: 4px 0;">Суть заяви: ${esc(sub.text)}</p>
                    <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
                        <button onclick="openReplyModal(${index})" style="background: var(--accent); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Відповісти</button>
                        <button onclick="deleteSubmission(${index})" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Видалити заяву</button>
                    </div>
                </div>
                ${infoBtnHtml}
            `;
        } else if (sub.book) {
            const chapCount = sub.book.chapters ? sub.book.chapters.length : 0;
            const ageInfo = `Вік: ${sub.book.age_min || 0}-${sub.book.age_max >= 99 ? '∞' : sub.book.age_max}`;
            item.innerHTML = `
                <div style="flex: 1;">
                    <p><strong>📚 Заявка на твір від ${esc(sub.author)} (${esc(sub.date)}):</strong></p>
                    <p>Назва: <strong>${esc(sub.book.title)}</strong> | Автор: ${esc(sub.book.author_name)} ${esc(sub.book.author_surname)} (${esc(sub.book.genre)}) | ${ageInfo} | Глав: ${chapCount}</p>
                    <p style="font-size: 0.9rem; color: var(--text-muted);">${esc(sub.book.description)}</p>
                    <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
                        <button onclick="approveBook(${index})" style="background: var(--success); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Затвердити</button>
                        <button onclick="openReplyModal(${index})" style="background: var(--accent); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Відповісти</button>
                        <button onclick="rejectBook(${index})" style="background: var(--danger); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Відхилити</button>
                    </div>
                </div>
                ${infoBtnHtml}
            `;
        }
        list.appendChild(item);
    });
}

// ── 115. Додає рядок пошуку у вкладку «База користувачів» ──
const usersSecEl = document.getElementById('adminUsersSection');
if (usersSecEl && !document.getElementById('adminUserSearchInput')) {
    const searchBar = document.createElement('div');
    searchBar.style.cssText = 'margin-bottom: 12px; display: flex; gap: 8px;';
    searchBar.innerHTML = `
        <input type="text" id="adminUserSearchInput" placeholder="🔍 Пошук користувачів за нікнеймом..." style="flex: 1; padding: 8px; border-radius: 6px; background: var(--bg-color); color: var(--text-color); border: 1px solid var(--border);">
    `;
    usersSecEl.insertBefore(searchBar, document.getElementById('adminUsersList'));

    document.getElementById('adminUserSearchInput').addEventListener('input', () => {
        renderAdminUsers();
    });
}

// ── 116. Список користувачів в адмін-панелі ──
function renderAdminUsers() {
    const list = document.getElementById('adminUsersList');
    list.innerHTML = '';
    
    const searchInputEl = document.getElementById('adminUserSearchInput');
    const query = searchInputEl ? searchInputEl.value.toLowerCase().trim() : '';

    let usernames = Object.keys(registeredUsers);
    if (query) {
        usernames = usernames.filter(u => u.toLowerCase().startsWith(query));
    }

    if (usernames.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted);">Немає зареєстрованих користувачів за таким запитом.</p>';
        return;
    }

    usernames.forEach(username => {
        const uData = registeredUsers[username];
        const userBooks = booksData.filter(b => b.addedBy === username);
        const booksListStr = userBooks.length > 0 ? userBooks.map(b => esc(b.title)).join(', ') : 'Немає викладених творів';
        const avatarHtml = getAvatarHTML(username, 'avatar-comment');

        const item = document.createElement('div');
        item.style.cssText = 'background: var(--bg-color); padding: 12px; border-radius: 6px; border: 1px solid var(--border);';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${avatarHtml}
                    <div>
                        <p style="font-weight: bold; font-size: 1.05rem; color: var(--accent);">${esc(username)}</p>
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">📅 Дата реєстрації: ${esc(uData.regDate || 'Невідомо')}</p>
                        <p style="font-size: 0.9rem; margin-top: 4px;">📚 Викладені твори: <strong>${booksListStr}</strong></p>
                    </div>
                </div>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <button onclick="openDirectMsgModal('${escJs(username)}')" style="background: var(--accent); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">✉️ Написати</button>
                    <button onclick="adminDeleteUser('${escJs(username)}')" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">🗑️ Видалити</button>
                </div>
            </div>
        `;
        list.appendChild(item);
    });
}

// ── 117. Адмін видаляє акаунт користувача (нікнейм блокується) ──
window.adminDeleteUser = async function(username) {
    if (confirm(`Ви впевнені, що хочете видалити акаунт "${username}"? Його нікнейм буде назавжди заблоковано для повторної реєстрації.`)) {
        const userDataBackup = registeredUsers[username] || {
            password: "1234",
            regDate: new Date().toLocaleDateString(),
            avatar: null
        };

        const { error: delErr } = await _supabase.rpc('admin_delete_user', { p_username: username });
        if (delErr) {
            alert('Не вдалося видалити акаунт: ' + delErr.message);
            return;
        }

        delete registeredUsers[username];
        delete userNotifications[username];
        await _supabase.from('notifications').delete().eq('username', username);
        
        if (!bannedUsernames.includes(username.toLowerCase())) {
            bannedUsernames.push(username.toLowerCase());
            localStorage.setItem('transverse_banned_users', JSON.stringify(bannedUsernames));
        }

        deletedAccountsHistory.unshift({
            id: Date.now(),
            username: username,
            userData: userDataBackup,
            deletedDate: new Date().toLocaleDateString()
        });
        localStorage.setItem('transverse_deleted_accounts_history', JSON.stringify(deletedAccountsHistory));

        localStorage.setItem('transverse_registered_users', JSON.stringify(registeredUsers));
        saveNotifications();
        renderAdminUsers();
        renderAdminBannedUsers();
        alert(`Акаунт ${username} видалено, а нікнейм заблоковано.`);
    }
};

// ── 118. Список видалених акаунтів ──
function renderAdminBannedUsers() {
    const list = document.getElementById('adminBannedUsersList');
    if (!list) return;
    list.innerHTML = '';

    if (deletedAccountsHistory.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted);">Немає видалених акаунтів.</p>';
        return;
    }

    deletedAccountsHistory.forEach((rec, idx) => {
        const item = document.createElement('div');
        item.style.cssText = 'background: var(--bg-color); padding: 12px; border-radius: 6px; border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;';
        item.innerHTML = `
            <div>
                <p style="font-weight: bold; font-size: 1.05rem; color: var(--accent);">Нікнейм: ${esc(rec.username)}</p>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">📅 Дата видалення: ${esc(rec.deletedDate)}</p>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button onclick="restoreAccount(${idx})" style="background: var(--success); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">🔄 Повернути</button>
                <button onclick="permanentlyDeleteAccount(${idx})" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">⛔ Видалити назавжди</button>
            </div>
        `;
        list.appendChild(item);
    });
}

// ── 119. Відновлення видаленого акаунта ──
window.restoreAccount = async function(index) {
    const rec = deletedAccountsHistory[index];
    if (!rec) return;

    if (confirm(`Ви дійсно хочете відновити акаунт "${rec.username}"? Користувач знову зможе увійти під цим нікнеймом.`)) {
        const uData = rec.userData || {
            password: "1234",
            regDate: new Date().toLocaleDateString(),
            avatar: null
        };

        await _supabase.from('users').insert([{
            username: rec.username,
            reg_date: new Date().toISOString(),
            avatar_url: uData.avatar || null,
            auth_type: 'local'
        }]);

        await _supabase.from('banned_usernames').delete().eq('username', rec.username.toLowerCase());

        registeredUsers[rec.username] = uData;
        localStorage.setItem('transverse_registered_users', JSON.stringify(registeredUsers));

        bannedUsernames = bannedUsernames.filter(u => u !== rec.username.toLowerCase());
        localStorage.setItem('transverse_banned_users', JSON.stringify(bannedUsernames));

        deletedAccountsHistory.splice(index, 1);
        localStorage.setItem('transverse_deleted_accounts_history', JSON.stringify(deletedAccountsHistory));

        renderAdminBannedUsers();
        renderAdminUsers();
        alert(`Акаунт та нікнейм "${rec.username}" успішно відновлено!`);
    }
};

// ── 120. Остаточне видалення акаунта з історії ──
window.permanentlyDeleteAccount = function(index) {
    const rec = deletedAccountsHistory[index];
    if (!rec) return;

    if (confirm(`Ви дійсно хочете остаточно видалити запис про "${rec.username}"? Нікнейм залишиться заблокованим назавжди без можливості повернення звідси.`)) {
        deletedAccountsHistory.splice(index, 1);
        localStorage.setItem('transverse_deleted_accounts_history', JSON.stringify(deletedAccountsHistory));

        renderAdminBannedUsers();
        alert(`Запис про акаунт "${rec.username}" остаточно стерто з історії видалених.`);
    }
};

// ── 121. Список адміністраторів (суперадмін) ──
function renderAdminAdmins() {
    const list = document.getElementById('adminAdminsList');
    list.innerHTML = '';

    const adminKeys = Object.keys(adminsDb);
    if (adminKeys.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted);">Керування адміністраторами здійснюється безпосередньо в базі даних Supabase.</p>';
        return;
    }

    adminKeys.forEach(adminName => {
        const aData = adminsDb[adminName];
        const avatarHtml = getAvatarHTML(adminName, 'avatar-comment');
        const isSuper = !!aData.isSuper;

        const item = document.createElement('div');
        item.style.cssText = 'background: var(--bg-color); padding: 12px; border-radius: 6px; border: 1px solid var(--border);';
        
        let actionBtnHtml = '';
        if (isSuper) {
            actionBtnHtml = `<span style="color: #eab308; font-weight: bold; font-size: 0.9rem;">👑 Головний адміністратор</span>`;
        } else {
            actionBtnHtml = `<button onclick="superAdminDeleteAdmin('${escJs(adminName)}')" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">🗑️ Видалити адміна</button>`;
        }

        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${avatarHtml}
                    <div>
                        <p style="font-weight: bold; font-size: 1.05rem; color: var(--accent);">${esc(adminName)}</p>
                        <p style="font-size: 0.85rem; color: var(--text-muted);">${isSuper ? 'Повний доступ до системи' : 'Модератор контенту'}</p>
                    </div>
                </div>
                ${actionBtnHtml}
            </div>
        `;
        list.appendChild(item);
    });
}

// ── 122. Видалена історія відповідей (суперадмін) ──
function renderAdminDeleted() {
    const list = document.getElementById('adminDeletedList');
    list.innerHTML = '';

    if (deletedHistory.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted);">Видаленої історії поки немає.</p>';
        return;
    }

    deletedHistory.forEach((rec) => {
        const box = document.createElement('div');
        box.style.cssText = 'background: var(--bg-color); padding: 12px; margin-bottom: 8px; border-radius: 6px; border: 1px solid var(--border);';
        box.innerHTML = `
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
                <span>Кому: <strong>${esc(rec.targetUser)}</strong> | Видалив адмін: ${esc(rec.deletedBy || rec.adminName)}</span>
                <span>📅 Видалено: ${esc(rec.deletedDate)}</span>
            </div>
            <p style="font-size: 0.9rem; margin-top: 4px; color: var(--accent);">Тема: ${esc(rec.subject)}</p>
            <p style="margin: 6px 0; font-style: italic;">Текст: ${esc(rec.replyText)}</p>
        `;
        list.appendChild(box);
    });
}

// ── 123. Суперадмін видаляє адміністратора ──
window.superAdminDeleteAdmin = function(adminName) {
    if (!userProfile || !userProfile.isSuperAdmin) return;
    if (confirm(`Ви дійсно хочете видалити адміністратора "${adminName}"?`)) {
        delete adminsDb[adminName];
        localStorage.setItem('transverse_admins_db', JSON.stringify(adminsDb));
        renderAdminAdmins();
        alert(`Адміністратора ${adminName} видалено.`);
    }
};

// ── 124. Відкриває вікно відповіді на заявку ──
window.openReplyModal = function(index) {
    replyingIndex = index;
    document.getElementById('replyText').value = '';
    replyModal.classList.remove('hidden');
};

// ── 125. Закриває вікно відповіді ──
document.getElementById('closeReplyModal')?.addEventListener('click', () => {
    replyModal.classList.add('hidden');
});

// ── 126. ВІДПОВІДЬ АДМІНА НА ЗАЯВКУ: сповіщення користувачу (тепер потрапляє в базу) + історія ──
document.getElementById('replyForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const replyText = document.getElementById('replyText').value.trim();
    const sub = submissions[replyingIndex];
    if (!sub) return;
    const msgId = Date.now();
    const dateStr = new Date().toLocaleDateString();
    
    let subject = 'Повідомлення від адміністрації';
    if (sub.type === 'complaint') subject = `Скарга: "${sub.text.slice(0, 30)}..."`;
    else if (sub.type === 'statement') subject = `Заява щодо твору "${sub.bookTitle}"`;
    else if (sub.book) subject = `Заявка на твір: "${sub.book.title}"`;

    if (sub && sub.author) {
        let notifKey = sub.author;
        if (!userNotifications[notifKey]) userNotifications[notifKey] = [];
        userNotifications[notifKey].push({
            id: msgId,
            text: `💬 <span class="status-replied">Відповідь</span> на (${subject}): ${replyText}`,
            date: dateStr,
            read: false,
            isBroadcast: false
        });
        saveNotifications();
    }

    adminHistory.unshift({
        msgId: msgId,
        targetUser: sub.author,
        subject: subject,
        replyText: replyText,
        statusType: 'replied',
        adminName: userProfile.username,
        date: dateStr,
        isBroadcast: false
    });
    localStorage.setItem('transverse_admin_history', JSON.stringify(adminHistory));

    if (sub.dbId) {
        await _supabase.from('submissions').update({ status: 'replied' }).eq('id', sub.dbId);
    }

    submissions.splice(replyingIndex, 1);
    localStorage.setItem('transverse_submissions', JSON.stringify(submissions));

    replyModal.classList.add('hidden');
    renderAdminSubmissions();
    renderAdminHistory();
});

// ── 127. ВІДХИЛЕННЯ ЗАЯВКИ: статус rejected + сповіщення користувачу ──
window.deleteSubmission = async function(index) {
    const sub = submissions[index];
    if (!sub) return;
    const dateStr = new Date().toLocaleDateString();
    
    let subTitle = '';
    let notifText = '';

    if (sub.type === 'book' && sub.book) {
        subTitle = sub.book.title;
        notifText = `❌ <span class="status-rejected">Відхилено</span> вашу заявку на твір "${subTitle}".`;
    } else if (sub.type === 'statement') {
        subTitle = sub.bookTitle;
        notifText = `❌ <span class="status-rejected">Відхилено</span> вашу заяву щодо твору "${subTitle}".`;
    } else {
        subTitle = sub.text ? sub.text.slice(0, 30) : 'скаргу';
        notifText = `❌ <span class="status-rejected">Відхилено</span> вашу скаргу.`;
    }

    if (sub.dbId) {
        await _supabase.from('submissions').update({ status: 'rejected' }).eq('id', sub.dbId);
    }

    adminHistory.unshift({
        msgId: Date.now(),
        targetUser: sub.author || 'Гість',
        subject: `Відхилено запит: "${subTitle}"`,
        replyText: 'Вашу заявку було відхилено адміністрацією.',
        statusType: 'rejected',
        adminName: userProfile.username,
        date: dateStr,
        isBroadcast: false
    });
    localStorage.setItem('transverse_admin_history', JSON.stringify(adminHistory));

    if (sub.author) {
        if (!userNotifications[sub.author]) userNotifications[sub.author] = [];
        userNotifications[sub.author].push({
            id: Date.now(),
            text: notifText,
            date: dateStr,
            read: false,
            isBroadcast: false
        });
        saveNotifications();
    }

    submissions.splice(index, 1);
    localStorage.setItem('transverse_submissions', JSON.stringify(submissions));
    renderAdminSubmissions();
    renderAdminHistory();
};

// ── 128. Відхилення заявки на книгу (викликає deleteSubmission) ──
window.rejectBook = function(index) {
    window.deleteSubmission(index);
};

// ── 129. СХВАЛЕННЯ КНИГИ: запис книги в базу, статус approved, сповіщення автору ──
window.approveBook = async function(index) {
    const sub = submissions[index];
    if (!sub || !sub.book) return;

    const { data, error } = await _supabase.from('moderation_queue').insert([sub.book]).select();
    
    if (error) {
        alert('Помилка при додаванні книги в базу даних: ' + error.message);
        return;
    }

    if (sub.dbId) {
        await _supabase.from('submissions').update({ status: 'approved' }).eq('id', sub.dbId);
    }

    if (data && data.length > 0) {
        const addedDbBook = data[0];
        booksData.push({
            id: addedDbBook.id,
            title: addedDbBook.Заголовок || addedDbBook.title,
            authorName: addedDbBook.author_name,
            authorSurname: addedDbBook.author_surname,
            originalLang: addedDbBook.original_lang || 'Авторський переклад',
            genre: addedDbBook.Жанр || addedDbBook.genre,
            ageMin: addedDbBook.age_min || 0,
            ageMax: addedDbBook.age_max || 99,
            cover: addedDbBook.обкладинка || addedDbBook.cover,
            description: addedDbBook.Опис || addedDbBook.description,
            chapters: Array.isArray(addedDbBook.Розділи) ? addedDbBook.Розділи : (Array.isArray(addedDbBook.chapters) ? addedDbBook.chapters : []),
            addedBy: addedDbBook.added_by || 'Admin',
            ratings: Array.isArray(addedDbBook.ratings) ? addedDbBook.ratings : [],
            likes: Array.isArray(addedDbBook.likes) ? addedDbBook.likes : [],
            comments: Array.isArray(addedDbBook.comments) ? addedDbBook.comments : []
        });
    }

    const msgId = Date.now();
    const dateStr = new Date().toLocaleDateString();
    const replyText = `Ваш твір "${sub.book.title}" успішно затверджено адміністратором і додано до бібліотеки!`;

    if (sub.author) {
        let notifKey = sub.author;
        if (!userNotifications[notifKey]) userNotifications[notifKey] = [];
        userNotifications[notifKey].push({
            id: msgId,
            text: `✅ <span class="status-approved">Затверджено</span> ваш твір "${sub.book.title}"!`,
            date: dateStr,
            read: false,
            isBroadcast: false
        });
        saveNotifications();
    }

    adminHistory.unshift({
        msgId: msgId,
        targetUser: sub.author,
        subject: `Затвердження твору: "${sub.book.title}"`,
        replyText: replyText,
        statusType: 'approved',
        adminName: userProfile ? userProfile.username : 'Адмін',
        date: dateStr,
        isBroadcast: false
    });
    localStorage.setItem('transverse_admin_history', JSON.stringify(adminHistory));

    submissions.splice(index, 1);
    localStorage.setItem('transverse_submissions', JSON.stringify(submissions));
    renderAdminSubmissions();
    renderAdminHistory();
    renderBooks();
};

// ── 130. Відкриває вікно загального оголошення ──
document.getElementById('openBroadcastBtn')?.addEventListener('click', () => {
    document.getElementById('broadcastText').value = '';
    broadcastModal.classList.remove('hidden');
});
// ── 131. Закриває вікно оголошення ──
document.getElementById('closeBroadcastModal')?.addEventListener('click', () => {
    broadcastModal.classList.add('hidden');
});

// ── 132. ЗАГАЛЬНЕ ОГОЛОШЕННЯ: розсилка всім користувачам, адмінам і гостям ──
document.getElementById('broadcastForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('broadcastText').value.trim();
    const msgId = Date.now();
    const dateStr = new Date().toLocaleDateString();

    Object.keys(registeredUsers).forEach(username => {
        if (!userNotifications[username]) userNotifications[username] = [];
        userNotifications[username].push({
            id: msgId,
            text: `📢 Оголошення від адміністрації: ${text}`,
            date: dateStr,
            read: false,
            isBroadcast: true
        });
    });

    Object.keys(adminsDb).forEach(adminName => {
        if (!userNotifications[adminName]) userNotifications[adminName] = [];
        userNotifications[adminName].push({
            id: msgId,
            text: `📢 Оголошення від адміністрації: ${text}`,
            date: dateStr,
            read: false,
            isBroadcast: true
        });
    });

    if (!userNotifications['guest']) userNotifications['guest'] = [];
    userNotifications['guest'].push({
        id: msgId,
        text: `📢 Оголошення від адміністрації: ${text}`,
        date: dateStr,
        read: false,
        isBroadcast: true
    });

    saveNotifications();

    adminHistory.unshift({
        msgId: msgId,
        targetUser: 'Усім користувачам',
        subject: 'Загальне оголошення',
        replyText: text,
        statusType: 'replied',
        adminName: userProfile.username,
        date: dateStr,
        isBroadcast: true
    });
    localStorage.setItem('transverse_admin_history', JSON.stringify(adminHistory));

    broadcastModal.classList.add('hidden');
    renderAdminHistory();
    alert('Загальне повідомлення надіслано всім користувачам!');
});

// ── 133. Додає панель фільтрів в історію відповідей ──
const historySecEl = document.getElementById('adminHistorySection');
if (historySecEl && !document.getElementById('historyFilterBar')) {
    const filterBar = document.createElement('div');
    filterBar.id = 'historyFilterBar';
    filterBar.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;';
    filterBar.innerHTML = `
        <span style="font-weight: bold; font-size: 0.95rem;">Фільтр історії:</span>
        <select id="adminHistoryFilterSelect" style="padding: 0.4rem; border-radius: 6px; background: var(--bg-color); color: var(--text-color); border: 1px solid var(--border); font-weight: 600;">
            <option value="all">📂 Усі записи</option>
            <option value="approved">✅ Затверджено</option>
            <option value="rejected">❌ Відхилено</option>
            <option value="replied">💬 Відповіді</option>
        </select>
    `;
    historySecEl.insertBefore(filterBar, document.getElementById('adminHistoryList'));

    document.getElementById('adminHistoryFilterSelect').addEventListener('change', () => {
        renderAdminHistory();
    });
}

// ── 134. Список історії відповідей адміна ──
function renderAdminHistory() {
    const historyList = document.getElementById('adminHistoryList');
    historyList.innerHTML = '';

    if (adminHistory.length === 0) {
        historyList.innerHTML = '<p style="color: var(--text-muted);">Історія відповідей порожня.</p>';
        return;
    }

    const filterSelect = document.getElementById('adminHistoryFilterSelect');
    const filterVal = filterSelect ? filterSelect.value : 'all';

    let sortedHistory = [...adminHistory].sort((a, b) => b.msgId - a.msgId);

    if (filterVal !== 'all') {
        sortedHistory = sortedHistory.filter(item => item.statusType === filterVal);
    }

    if (sortedHistory.length === 0) {
        historyList.innerHTML = '<p style="color: var(--text-muted);">Немає записів для вибраного фільтра.</p>';
        return;
    }

    sortedHistory.forEach((record, idx) => {
        let statusHtml = '';
        if (record.statusType === 'approved') statusHtml = '<span class="status-approved">✅ Затверджено</span>';
        else if (record.statusType === 'rejected') statusHtml = '<span class="status-rejected">❌ Відхилено</span>';
        else statusHtml = '<span class="status-replied">💬 Відповідь</span>';

        const box = document.createElement('div');
        box.style.cssText = 'background: var(--bg-color); padding: 10px; margin-bottom: 8px; border-radius: 6px; border: 1px solid var(--border);';
        box.innerHTML = `
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted); align-items: center;">
                <span>Кому: <strong>${esc(record.targetUser)}</strong> | Адмін: ${esc(record.adminName)}</span>
                <span>${statusHtml} | 📅 ${esc(record.date)}</span>
            </div>
            <p style="font-size: 0.9rem; margin-top: 4px; color: var(--accent);">${esc(record.subject)}</p>
            <p style="margin: 6px 0;">${esc(record.replyText)}</p>
            <button onclick="revokeAdminReply(${idx})" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">🗑️ Видалити у користувача</button>
        `;
        historyList.appendChild(box);
    });
}

// ── 135. Відкликання відповіді: видаляється в користувача (локально й у базі) та переноситься у видалену історію ──
window.revokeAdminReply = function(historyIndex) {
    const record = adminHistory[historyIndex];
    if (!record) return;

    if (record.isBroadcast) {
        Object.keys(userNotifications).forEach(username => {
            if (Array.isArray(userNotifications[username])) {
                userNotifications[username] = userNotifications[username].filter(m => m.id !== record.msgId);
            }
        });
        if (userNotifications['guest']) {
            userNotifications['guest'] = userNotifications['guest'].filter(m => m.id !== record.msgId);
        }
    } else if (record.targetUser && userNotifications[record.targetUser]) {
        userNotifications[record.targetUser] = userNotifications[record.targetUser].filter(m => m.id !== record.msgId);
    }

    saveNotifications();
    deleteNotificationsInSupabase(record);
    
    deletedHistory.unshift({
        ...record,
        deletedBy: userProfile ? userProfile.username : 'Адмін',
        deletedDate: new Date().toLocaleDateString()
    });
    localStorage.setItem('transverse_deleted_history', JSON.stringify(deletedHistory));

    adminHistory.splice(historyIndex, 1);
    localStorage.setItem('transverse_admin_history', JSON.stringify(adminHistory));
    renderAdminHistory();
    if (userProfile && userProfile.isSuperAdmin) {
        renderAdminDeleted();
    }
};

// ======================================================================
// РОЗДІЛ XIII. ПОШТОВА СКРИНЬКА КОРИСТУВАЧА ТА ЗАПУСК САЙТУ
// ======================================================================

// ── 136. Відкриття поштової скриньки: показ, позначення прочитаним, оновлення з бази ──
notificationsBtn?.addEventListener('click', () => {
    renderUserNotifications();
    notificationsModal.classList.remove('hidden');
    
    markNotificationsRead();
    loadNotificationsFromSupabase();
});

// ── 137. Закриття поштової скриньки ──
document.getElementById('closeNotificationsModal')?.addEventListener('click', () => {
    notificationsModal.classList.add('hidden');
});

// ── 138. Малює список повідомлень у скриньці ──
function renderUserNotifications() {
    const container = document.getElementById('userNotificationsList');
    container.innerHTML = '';

    let key = userProfile ? userProfile.username : 'guest';
    const inbox = userNotifications[key] || [];
    if (inbox.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">Ваша поштова скринька порожня.</p>';
        return;
    }

    [...inbox].reverse().forEach((notif) => {
        const box = document.createElement('div');
        box.style.cssText = 'background: var(--bg-color); padding: 12px; border-radius: 8px; border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;';
        box.innerHTML = `
            <div style="flex: 1;">
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">📅 ${esc(notif.date)}</p>
                <p style="line-height: 1.4;">${safeNotifHtml(notif.text)}</p>
            </div>
            <button onclick="openNotificationInfo(${notif.id})" title="Детальніше" style="background: #3b82f6; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-weight: bold; font-family: serif; font-style: italic; font-size: 1rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(59,130,246,0.35);">i</button>
        `;
        container.appendChild(box);
    });
}

// ── 139. Кнопки категорій (жанрів) ──
catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        catButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedRatingGenre = null;
        currentCategory = btn.dataset.category;
        renderBooks();
    });
});

// ── 140. Перемикач теми (світла / темна) ──
document.getElementById('themeToggle')?.addEventListener('click', (e) => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    e.target.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('transverse_theme', isDark ? 'dark' : 'light');
});

// ── 141. УСТАНОВЛЕННЯ САЙТУ ЯК ДОДАТКУ (PWA): реєстрація service worker і кнопка «⬇️ Встановити» ──
let deferredInstallPrompt = null;
const installAppBtn = document.getElementById('installAppBtn');
const isStandaloneApp = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const isIOSDevice = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isAndroidDevice = /android/i.test(navigator.userAgent);
const isMobileDevice = isIOSDevice || isAndroidDevice;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(err => console.error('Service worker не зареєстровано:', err));
    });
}

// Chrome / Edge / Android: браузер повідомляє, що сайт можна встановити
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (installAppBtn && !isStandaloneApp()) installAppBtn.classList.remove('hidden');
});

window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    if (installAppBtn) installAppBtn.classList.add('hidden');
});

// Телефони й планшети: кнопка видима завжди (якщо додаток ще не встановлено),
// навіть якщо браузер не надіслав дозвіл на встановлення
if (installAppBtn && isMobileDevice && !isStandaloneApp()) {
    installAppBtn.classList.remove('hidden');
}

installAppBtn?.addEventListener('click', async () => {
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        installAppBtn.classList.add('hidden');
    } else if (isIOSDevice) {
        document.getElementById('iosInstallModal')?.classList.remove('hidden');
    } else if (isAndroidDevice) {
        alert('Щоб встановити InkWave: відкрийте сайт у Chrome, натисніть меню ⋮ (три крапки) угорі й виберіть «Встановити додаток» або «Додати на головний екран».');
    } else {
        alert('Встановлення доступне в Chrome або Edge: натисніть значок встановлення в правому краї адресного рядка.');
    }
});

// Вікно-інструкція для iPhone / iPad
document.getElementById('closeIosInstallModal')?.addEventListener('click', () => {
    document.getElementById('iosInstallModal')?.classList.add('hidden');
});

// ======================================================================
// РОЗДІЛ XIV. ЗАХИСТ ТА ДОДАТКОВІ МОЖЛИВОСТІ (НОВИЙ БЛОК)
// ======================================================================

// ── 142. Налаштування: службова адреса для входу та контактна пошта сайту ──
// AUTH_EMAIL_DOMAIN має збігатися з функцією synth_email у SQL (файл 1_prepare.sql).
// Якщо Supabase відхиляє реєстрацію з помилкою про «invalid email», змініть домен тут І в SQL.
const AUTH_EMAIL_DOMAIN = 'inkwave-users.com';
// ВПИШІТЬ свою контактну пошту для звернень правовласників, наприклад 'mymail@gmail.com'.
// Якщо залишити порожнім — у вікні «Умови» буде вказано зв'язок через форму «Заявка».
const CONTACT_EMAIL = '';

// ── 143. Захист від XSS: екранування тексту перед вставкою в HTML ──
function esc(value) {
    return String(value ?? '').replace(/[&<>"'`]/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;'
    }[ch]));
}

// Екранування для рядка всередині onclick="f('...')"
function escJs(value) {
    return esc(String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' '));
}

// Текст сповіщення: дозволені лише службові теги <strong> та <span class="status-...">
function safeNotifHtml(text) {
    return esc(text)
        .replace(/&lt;(\/?)strong&gt;/g, '<$1strong>')
        .replace(/&lt;span class=&quot;(status-(?:replied|approved|rejected))&quot;&gt;/g, '<span class="$1">')
        .replace(/&lt;\/span&gt;/g, '</span>');
}

// ── 144. Службовий e-mail для Supabase Auth: нікнейм → хеш (реальна пошта не потрібна) ──
async function synthEmail(username) {
    const bytes = new TextEncoder().encode(String(username));
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    const hex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
    return 'u' + hex.slice(0, 32) + '@' + AUTH_EMAIL_DOMAIN;
}

// ── 145. Визначає роль після входу (адмін / користувач) і записує userProfile ──
async function applyEmailSession(authUser) {
    const { data: adminRow } = await _supabase
        .from('admins')
        .select('username, is_super')
        .eq('auth_user_id', authUser.id)
        .maybeSingle();

    if (adminRow) {
        userProfile = {
            username: adminRow.username,
            isAdmin: true,
            isSuperAdmin: !!adminRow.is_super,
            authUserId: authUser.id
        };
    } else {
        const { data: userRow } = await _supabase
            .from('users')
            .select('id, username')
            .eq('auth_user_id', authUser.id)
            .maybeSingle();
        if (!userRow) return false;
        userProfile = {
            username: userRow.username,
            isAdmin: false,
            isSuperAdmin: false,
            authUserId: authUser.id
        };
    }
    localStorage.setItem('transverse_user', JSON.stringify(userProfile));
    return true;
}

// ── 146. Перенесення старого акаунта (створеного до переходу на Supabase Auth) ──
async function tryClaimLegacyAccount(username, password) {
    const u = registeredUsers[username];
    if (!u) return { ok: false };
    if (u.authType === 'google') {
        return { ok: false, message: 'Цей акаунт створено через Google — скористайтесь кнопкою «Увійти через Google».' };
    }
    if (u.authUserId) return { ok: false };

    if (!u.password || u.password !== password) {
        return { ok: false, message: 'Цей акаунт створено за старою системою. Увійдіть з того пристрою й браузера, де ви реєструвались, — пароль перенесеться автоматично. Якщо такого доступу немає — напишіть адміністрації.' };
    }

    const email = await synthEmail(username);
    const { data, error } = await _supabase.auth.signUp({ email, password });
    if (error || !data || !data.user) {
        return { ok: false, message: 'Не вдалося перенести акаунт: ' + (error ? error.message : 'невідома помилка') };
    }
    if (!data.session) {
        return { ok: false, message: 'У Supabase увімкнено підтвердження e-mail. Вимкніть «Confirm email» (Authentication → Providers → Email).' };
    }

    const { data: claimed, error: claimError } = await _supabase.rpc('claim_account', { p_username: username });
    if (claimError || !claimed) {
        await _supabase.auth.signOut();
        return { ok: false, message: 'Не вдалося прив\'язати акаунт. Зверніться до адміністрації.' };
    }

    registeredUsers[username].password = '';
    registeredUsers[username].authUserId = data.user.id;
    localStorage.setItem('transverse_registered_users', JSON.stringify(registeredUsers));

    const applied = await applyEmailSession(data.user);
    return applied ? { ok: true } : { ok: false, message: 'Акаунт не знайдено.' };
}

// ── 147. ВХІД за нікнеймом і паролем через Supabase Auth ──
async function loginWithPassword(username, password) {
    const email = await synthEmail(username);
    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });

    if (error) {
        const legacy = await tryClaimLegacyAccount(username, password);
        if (legacy.ok) return { ok: true };
        return { ok: false, message: legacy.message || 'Невірний нікнейм або пароль!' };
    }

    const applied = await applyEmailSession(data.user);
    if (!applied) {
        await _supabase.auth.signOut();
        return { ok: false, message: 'Акаунт не знайдено. Зверніться до адміністрації.' };
    }
    return { ok: true };
}

// ── 148. Список заблокованих нікнеймів із бази (діє на всіх пристроях) ──
async function loadBannedUsernamesFromSupabase() {
    const { data, error } = await _supabase.from('banned_usernames').select('username');
    if (error || !data) return;
    data.forEach(r => {
        const name = String(r.username || '').toLowerCase();
        if (name && !bannedUsernames.includes(name)) bannedUsernames.push(name);
    });
    localStorage.setItem('transverse_banned_users', JSON.stringify(bannedUsernames));
}

// ── 149. Перевірка розміру зображення перед завантаженням (макс. 8 МБ) ──
function checkImageFileSize(file, e) {
    const MAX_MB = 8;
    if (file.size > MAX_MB * 1024 * 1024) {
        alert('Файл завеликий (максимум ' + MAX_MB + ' МБ). Оберіть менше зображення.');
        if (e && e.target) e.target.value = '';
        return false;
    }
    return true;
}

// ── 150. УМОВИ, КОНФІДЕНЦІЙНІСТЬ, КОНТАКТИ: відкриття й закриття вікна ──
const legalModal = document.getElementById('legalModal');

function openLegalModal() {
    const line = document.getElementById('legalContactLine');
    if (line) {
        line.textContent = '';
        if (CONTACT_EMAIL) {
            line.appendChild(document.createTextNode('E-mail: '));
            const a = document.createElement('a');
            a.href = 'mailto:' + CONTACT_EMAIL;
            a.textContent = CONTACT_EMAIL;
            line.appendChild(a);
            line.appendChild(document.createTextNode(' або через форму «📝 Заявка» → «Заява».'));
        } else {
            line.textContent = 'Напишіть нам через форму «📝 Заявка» → «Заява» на сайті.';
        }
    }
    legalModal?.classList.remove('hidden');
}

document.getElementById('openLegalBtn')?.addEventListener('click', (e) => { e.preventDefault(); openLegalModal(); });
document.getElementById('openLegalFromRegister')?.addEventListener('click', (e) => { e.preventDefault(); openLegalModal(); });
document.getElementById('closeLegalModal')?.addEventListener('click', () => legalModal?.classList.add('hidden'));

// ── 151. СКАРГИ: відкриття вікна «Поскаржитися» (на книгу або коментар) ──
let reportContext = null;
const reportModal = document.getElementById('reportModal');

window.openReportModal = function(kind, commentId) {
    if (!userProfile) {
        authModal.classList.remove('hidden');
        alert('Щоб поскаржитися, увійдіть в акаунт.');
        return;
    }
    if (!currentBook) return;

    const label = document.getElementById('reportTargetLabel');
    if (kind === 'comment') {
        const comm = (currentBook.comments || []).find(c => c.id === commentId);
        if (!comm) return;
        label.textContent = 'Коментар користувача ' + comm.author + ' до твору «' + currentBook.title + '»';
    } else {
        label.textContent = 'Твір «' + currentBook.title + '»';
    }

    reportContext = { kind, commentId: commentId ?? null };
    document.getElementById('reportForm').reset();
    reportModal.classList.remove('hidden');
};

// ── 152. СКАРГИ: надсилання скарги адміністрації (потрапляє у «Вхідні заявки») ──
document.getElementById('reportForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!userProfile || !currentBook || !reportContext) return;

    const reason = document.getElementById('reportReason').value;
    const details = document.getElementById('reportDetails').value.trim();
    let text = '';

    if (reportContext.kind === 'comment') {
        const comm = (currentBook.comments || []).find(c => c.id === reportContext.commentId);
        if (!comm) {
            alert('Коментар уже не існує.');
            reportModal.classList.add('hidden');
            return;
        }
        const quoted = String(comm.text || '').slice(0, 300);
        text = '🚩 Скарга на коментар користувача ' + comm.author + ' до твору «' + currentBook.title + '» (id ' + currentBook.id + '): «' + quoted + '». Причина: ' + reason + '.';
    } else {
        text = '🚩 Скарга на твір «' + currentBook.title + '» (id ' + currentBook.id + '). Причина: ' + reason + '.';
    }
    if (details) text += ' Деталі: ' + details;

    const { error } = await _supabase.from('submissions').insert([{
        user_id: userProfile.authUserId || null,
        author_username: userProfile.username,
        type: 'complaint',
        payload: { text: text },
        status: 'pending'
    }]);

    if (error) {
        alert('Помилка надсилання скарги: ' + error.message);
        return;
    }

    if (userProfile.isAdmin) await loadSubmissionsFromSupabase();

    if (!userNotifications[userProfile.username]) userNotifications[userProfile.username] = [];
    userNotifications[userProfile.username].push({
        id: Date.now(),
        text: '📝 Вашу скаргу надіслано адміністратору.',
        date: new Date().toLocaleDateString(),
        read: false,
        isBroadcast: false
    });
    saveNotifications();

    reportContext = null;
    reportModal.classList.add('hidden');
    alert('Дякуємо! Скаргу надіслано адміністрації.');
});

document.getElementById('closeReportModal')?.addEventListener('click', () => {
    reportContext = null;
    reportModal.classList.add('hidden');
});

// ── 153. СКАРГИ: кнопка «🚩 Поскаржитися» на сторінці книги ──
document.getElementById('reportBookBtn')?.addEventListener('click', () => window.openReportModal('book'));

// ── 154. СОРТУВАННЯ КАТАЛОГУ: нові / популярні / за оцінкою / за назвою ──
function sortBooksList(list) {
    const likesOf = b => (Array.isArray(b.likes) ? b.likes.length : 0);
    const ratingOf = b => parseFloat(calculateAverage(b.ratings)) || 0;

    if (currentSort === 'popular') {
        list.sort((a, b) => likesOf(b) - likesOf(a));
    } else if (currentSort === 'rating') {
        list.sort((a, b) => (ratingOf(b) - ratingOf(a)) || (likesOf(b) - likesOf(a)));
    } else if (currentSort === 'title') {
        list.sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), 'uk'));
    } else {
        list.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
    }
    return list;
}

const sortSelectEl = document.getElementById('sortSelect');
if (sortSelectEl) {
    sortSelectEl.value = currentSort;
    sortSelectEl.addEventListener('change', () => {
        currentSort = sortSelectEl.value;
        localStorage.setItem('transverse_sort', currentSort);
        renderBooks();
    });
}

// ── 155. «ПОДІЛИТИСЯ» книгою: системне меню телефону або копіювання посилання ──
document.getElementById('shareBookBtn')?.addEventListener('click', async () => {
    if (!currentBook) return;
    const url = location.origin + '/#book-' + encodeURIComponent(currentBook.id);
    const title = currentBook.title || 'InkWave';
    const text = 'Читай «' + title + '» на InkWave';

    if (navigator.share) {
        try { await navigator.share({ title, text, url }); } catch (err) { /* користувач закрив меню */ }
        return;
    }
    try {
        await navigator.clipboard.writeText(url);
        alert('Посилання скопійовано:\n' + url);
    } catch (err) {
        prompt('Скопіюйте посилання:', url);
    }
});

// ── 156. Відкриває книгу за посиланням виду  сайт/#book-ID  (після «Поділитися») ──
function openBookFromHash() {
    const m = /^#book-(.+)$/.exec(location.hash || '');
    if (!m) return;
    let id = '';
    try { id = decodeURIComponent(m[1]); } catch (err) { return; }
    history.replaceState(null, '', location.pathname + location.search);
    if (booksData.some(b => String(b.id) === id)) {
        window.openBook(id);
    } else {
        alert('Цю книгу не знайдено — можливо, її видалено.');
    }
}

// ── 157. ГОЛОСИ: запис лайка в таблицю book_likes (одна людина — один лайк) ──
let likeInFlight = false;
async function setLikeInSupabase(bookId, liked) {
    if (!userProfile) return false;
    let error;
    if (liked) {
        ({ error } = await _supabase
            .from('book_likes')
            .upsert({ book_id: bookId, username: userProfile.username }, { onConflict: 'book_id,username', ignoreDuplicates: true }));
    } else {
        ({ error } = await _supabase
            .from('book_likes')
            .delete()
            .eq('book_id', bookId)
            .eq('username', userProfile.username));
    }
    if (error) {
        console.error('❌ Не вдалося зберегти лайк:', error.message);
        return false;
    }
    return true;
}

// ── 158. ГОЛОСИ: оцінка книги в таблицю book_ratings (одна оцінка від людини, її можна змінити) ──
async function saveBookRatingInSupabase(bookId, rating) {
    if (!userProfile) return false;
    const { error } = await _supabase
        .from('book_ratings')
        .upsert({ book_id: bookId, username: userProfile.username, rating: rating }, { onConflict: 'book_id,username' });
    if (error) {
        console.error('❌ Не вдалося зберегти оцінку книги:', error.message);
        alert('Не вдалося зберегти оцінку. Спробуйте ще раз.');
        loadBooksFromSupabase(true);
        return false;
    }
    return true;
}

// ── 159. ГОЛОСИ: оцінка глави в таблицю chapter_ratings (одна оцінка від людини на главу) ──
async function saveChapterRatingInSupabase(bookId, chapterIndex, rating) {
    if (!userProfile) return false;
    const { error } = await _supabase
        .from('chapter_ratings')
        .upsert({ book_id: bookId, chapter_index: chapterIndex, username: userProfile.username, rating: rating }, { onConflict: 'book_id,chapter_index,username' });
    if (error) {
        console.error('❌ Не вдалося зберегти оцінку глави:', error.message);
        alert('Не вдалося зберегти оцінку. Спробуйте ще раз.');
        loadBooksFromSupabase(true);
        return false;
    }
    return true;
}

// ── 160. ЗАПУСК САЙТУ: перше завантаження даних ──
loadBooksFromSupabase();
