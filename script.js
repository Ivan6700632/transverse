const DEFAULT_ADMINS = {
    "Pipin": { password: "SecurePipin456", isSuper: true, avatar: null },
    "Robnais": { password: "AdminPass123", isSuper: false, avatar: null },
    "Admin3": { password: "TransVerseAdmin789", isSuper: false, avatar: null }
};

let adminsDb = JSON.parse(localStorage.getItem('transverse_admins_db'));
if (!adminsDb) {
    adminsDb = DEFAULT_ADMINS;
    localStorage.setItem('transverse_admins_db', JSON.stringify(adminsDb));
}

let bannedUsernames = JSON.parse(localStorage.getItem('transverse_banned_users')) || [];
let deletedAccountsHistory = JSON.parse(localStorage.getItem('transverse_deleted_accounts_history')) || [];

let booksData = JSON.parse(localStorage.getItem('transverse_books_db')) || [
    {
        id: 1,
        title: "Таємничий ліс (The Secret Forest)",
        authorName: "Артур",
        authorSurname: "Конан",
        originalLang: "Англійська → Українська",
        genre: "Fantasy",
        cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
        description: "Історія про магічний ліс, де кожне дерево зберігає спогади стародавніх магів.",
        ratings: [5],
        likes: [],
        comments: [],
        addedBy: "Admin",
        chapters: [
            { title: "Пролог: Пробудження весни", content: "Стародавній, густий ліс прокидався від зимового сну...", ratings: [5] },
            { title: "Глава 1: Звук сопілки", content: "Мандрівник дістав сопілку, і як тільки мелодія полинула...", ratings: [5] }
        ]
    },
    {
        id: 2,
        title: "Тінь Сеула",
        authorName: "Пак",
        authorSurname: "Су Чжин",
        originalLang: "Корейська → Українська",
        genre: "Manhwa",
        cover: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=400&q=80",
        description: "Захоплююча манхва про мисливців на ворота у сучасному Сеулі.",
        ratings: [5],
        likes: [],
        comments: [],
        addedBy: "Admin",
        chapters: [
            { title: "Епізод 1", content: "[Сторінка 1] Ворота відкрилися серед центру міста...", ratings: [5] },
            { title: "Епізод 2", content: "[Сторінка 1] Пробудження ранкового світла...", ratings: [5] }
        ]
    },
    {
        id: 3,
        title: "Захар Беркут",
        authorName: "Іван",
        authorSurname: "Франко",
        originalLang: "Оригінал (Українська)",
        genre: "Ukrainian",
        cover: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80",
        description: "Класичний історичний твір про боротьбу карпатської громади проти монгольської навали.",
        ratings: [5],
        likes: [],
        comments: [],
        addedBy: "Admin",
        chapters: [
            { title: "Розділ 1", content: "Тухля лежить у глибокій гірській котловині...", ratings: [5] },
            { title: "Розділ 2", content: "Старий Захар Беркут був духовним лідером громади...", ratings: [5] }
        ]
    }
];

booksData = booksData.filter(b => b && typeof b === 'object' && Array.isArray(b.chapters) && b.chapters.length > 0);
localStorage.setItem('transverse_books_db', JSON.stringify(booksData));

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
if (Object.keys(savedRatings).length > 0) {
    booksData.forEach(book => {
        if (savedRatings[book.id]) {
            book.ratings = savedRatings[book.id].bookRatings || book.ratings;
            if (savedRatings[book.id].chapterRatings) {
                book.chapters.forEach((chap, idx) => {
                    if (savedRatings[book.id].chapterRatings[idx]) {
                        chap.ratings = savedRatings[book.id].chapterRatings[idx];
                    }
                });
            }
        }
    });
}

let currentCategory = 'all';
let currentStatusFilter = 'all';
let currentBook = null;
let currentChapterIndex = 0;
let currentFontSize = 18;
let replyingIndex = null;
let selectedRatingGenre = null;
let uploadedLayoutDataUrl = "";

let previewBookObj = null;
let previewChapterIdx = 0;
let previewFontSize = 18;

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

const DEFAULT_AVATAR_SVG = `<svg viewBox="0 0 24 24" fill="#f1f5f9" width="65%" height="65%"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;

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
                    <div class="book-card" style="max-width: 320px; width: 100%; margin: 0 auto; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                        <div class="cover-wrapper">
                            <img id="prevBookCover" src="" alt="Обкладинка" style="width: 100%; height: 340px; object-fit: cover;">
                        </div>
                        <div class="book-info" style="text-align: left;">
                            <span id="prevBookBadge" class="book-badge"></span>
                            <h3 id="prevBookTitle" style="margin: 8px 0;"></h3>
                            <p id="prevBookAuthor" style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 8px;"></p>
                            <p id="prevBookDesc" style="font-size: 0.85rem; color: var(--text-color); margin-bottom: 14px; background: var(--bg-color); padding: 8px; border-radius: 6px; border: 1px solid var(--border);"></p>
                            <button id="startPreviewReadBtn" class="read-btn" style="width: 100%;">Читати книжку</button>
                        </div>
                    </div>
                </div>

                <div id="adminPreviewReaderStep" class="hidden" style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; background: var(--bg-color); padding: 10px; border-radius: 8px; border: 1px solid var(--border);">
                        <select id="prevChapterSelect" style="padding: 6px 10px; border-radius: 6px; background: var(--card-bg); color: var(--text-color); border: 1px solid var(--border); font-weight: 600; max-width: 65%;"></select>
                        <div style="display: flex; gap: 6px;">
                            <button id="prevFontDec" class="action-btn" style="padding: 5px 10px;">A-</button>
                            <button id="prevFontInc" class="action-btn" style="padding: 5px 10px;">A+</button>
                        </div>
                    </div>

                    <div id="prevChapterText" style="background: var(--bg-color); padding: 20px; border-radius: 8px; border: 1px solid var(--border); white-space: pre-wrap; line-height: 1.7; font-size: 18px; min-height: 280px;"></div>

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
            localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));

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

window.openDirectMsgModal = function(username) {
    window.currentDirectTargetUser = username;
    document.getElementById('targetDirectUserLabel').textContent = `Отримувач: ${username}`;
    document.getElementById('adminDirectText').value = '';
    document.getElementById('adminDirectMsgModal').classList.remove('hidden');
};

function loadPreviewChapter(idx) {
    if (!previewBookObj || !previewBookObj.chapters[idx]) return;
    previewChapterIdx = idx;
    const chap = previewBookObj.chapters[idx];
    document.getElementById('prevChapterSelect').value = idx;
    
    let htmlContent = `<div style="margin-bottom: 15px; line-height: 1.8;">${(chap.content || '').replace(/\n/g, '<br>')}</div>`;
    if (chap.images && Array.isArray(chap.images) && chap.images.length > 0) {
        htmlContent += `<div style="display: flex; flex-direction: column; gap: 20px; margin-top: 20px;">`;
        chap.images.forEach(imgUrl => {
            htmlContent += `<div style="margin: 20px auto; max-width: 100%; text-align: center; padding: 5px;"><img src="${imgUrl}" style="max-width: 100%; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"></div>`;
        });
        htmlContent += `</div>`;
    }
    document.getElementById('prevChapterText').innerHTML = htmlContent;
}

window.openSubmissionInfo = function(index) {
    const sub = submissions[index];
    if (!sub) return;

    if (sub.type === 'book' && sub.book) {
        previewBookObj = sub.book;
        previewChapterIdx = 0;

        document.getElementById('prevBookCover').src = sub.book.cover || '';
        document.getElementById('prevBookBadge').textContent = `${sub.book.genre} • ${sub.book.originalLang || 'Авторський переклад'}`;
        document.getElementById('prevBookTitle').textContent = sub.book.title;
        document.getElementById('prevBookAuthor').textContent = `Автор: ${sub.book.authorName} ${sub.book.authorSurname} (Надіслав: ${sub.author})`;
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
                    <p style="margin-bottom: 8px;"><strong>👤 Від кого надіслано:</strong> ${sub.author}</p>
                    <p style="margin-bottom: 12px;"><strong>📅 Дата надсилання:</strong> ${sub.date}</p>
                    <p style="font-weight: bold; margin-bottom: 6px; color: var(--accent);">📝 Повний текст скарги:</p>
                    <div style="background: var(--card-bg); padding: 12px; border-radius: 6px; border: 1px solid var(--border); white-space: pre-wrap; word-break: break-word;">${sub.text}</div>
                </div>
            `;
        } else if (sub.type === 'statement') {
            titleEl.textContent = '📄 Деталі заяви';
            bodyEl.innerHTML = `
                <div style="background: var(--bg-color); padding: 14px; border-radius: 8px; border: 1px solid var(--border);">
                    <p style="margin-bottom: 8px;"><strong>👤 Хто надіслав:</strong> ${sub.author}</p>
                    <p style="margin-bottom: 8px;"><strong>✍️ Ім'я автора:</strong> ${sub.authorName}</p>
                    <p style="margin-bottom: 8px;"><strong>📚 Назва твору:</strong> ${sub.bookTitle}</p>
                    <p style="margin-bottom: 12px;"><strong>📅 Дата надсилання:</strong> ${sub.date}</p>
                    <p style="font-weight: bold; margin-bottom: 6px; color: var(--accent);">📝 Повний текст заяви:</p>
                    <div style="background: var(--card-bg); padding: 12px; border-radius: 6px; border: 1px solid var(--border); white-space: pre-wrap; word-break: break-word;">${sub.text}</div>
                </div>
            `;
        }

        infoModal.classList.remove('hidden');
    }
};

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
            <p style="margin-bottom: 8px;"><strong>📅 Дата отримання:</strong> ${notif.date}</p>
            <p style="margin-bottom: 12px;"><strong>📌 Тип сповіщення:</strong> ${notif.isBroadcast ? '📢 Загальне оголошення адміністрації' : '📩 Особисте сповіщення'}</p>
            <p style="font-weight: bold; margin-bottom: 6px; color: var(--accent);">📝 Повний зміст:</p>
            <div style="background: var(--card-bg); padding: 12px; border-radius: 6px; border: 1px solid var(--border); white-space: pre-wrap; word-break: break-word; line-height: 1.6;">${notif.text}</div>
        </div>
    `;
    infoModal.classList.remove('hidden');
};

function getUserAvatar(username) {
    if (adminsDb[username] && adminsDb[username].avatar) return adminsDb[username].avatar;
    if (registeredUsers[username] && registeredUsers[username].avatar) return registeredUsers[username].avatar;
    return null;
}

function getAvatarHTML(username, sizeClass = 'avatar-small') {
    const avatarSrc = getUserAvatar(username);
    if (avatarSrc) {
        return `<span class="${sizeClass}"><img src="${avatarSrc}" alt="${username}"></span>`;
    }
    return `<span class="${sizeClass}">${DEFAULT_AVATAR_SVG}</span>`;
}

function updateUIByRole() {
    const authTabs = document.getElementById('authTabs');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loggedInInfo = document.getElementById('loggedInInfo');
    const currentUserDisplay = document.getElementById('currentUserDisplay');
    const adminNotice = document.getElementById('adminNotice');
    const profileAvatarPreview = document.getElementById('profileAvatarPreview');

    if (userProfile && userProfile.isAdmin && !adminsDb[userProfile.username]) {
        localStorage.removeItem('transverse_user');
        userProfile = null;
    }

    if (userProfile) {
        const avatarHtml = getAvatarHTML(userProfile.username, 'avatar-small');
        const crown = userProfile.isAdmin ? '👑 ' : '';
        profileBtn.innerHTML = `${avatarHtml} <span>${crown}${userProfile.username}</span>`;

        const largeAvatarSrc = getUserAvatar(userProfile.username);
        profileAvatarPreview.innerHTML = largeAvatarSrc ? `<img src="${largeAvatarSrc}" alt="Аватар">` : DEFAULT_AVATAR_SVG;

        authTabs.classList.add('hidden');
        loginForm.classList.add('hidden');
        registerForm.classList.add('hidden');
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

        authTabs.classList.remove('hidden');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loggedInInfo.classList.add('hidden');
        document.querySelectorAll('[data-authtab]').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-authtab="login"]').classList.add('active');
    }
}
updateUIByRole();

document.getElementById('avatarUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
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

document.getElementById('removeAvatarBtn').addEventListener('click', () => {
    if (!userProfile) return;
    saveUserAvatar(null);
});

function saveUserAvatar(avatarData) {
    if (userProfile.isAdmin && adminsDb[userProfile.username]) {
        adminsDb[userProfile.username].avatar = avatarData;
        localStorage.setItem('transverse_admins_db', JSON.stringify(adminsDb));
    } else if (registeredUsers[userProfile.username]) {
        registeredUsers[userProfile.username].avatar = avatarData;
        localStorage.setItem('transverse_registered_users', JSON.stringify(registeredUsers));
    }
    updateUIByRole();
    if (!readerModal.classList.contains('hidden') && currentBook) {
        renderComments();
    }
}

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
setInterval(updateNotificationsCount, 1000);

function checkMatch(text, query) {
    if (!query) return true;
    const words = text.toLowerCase().split(/[\s(),.!?;:"'«»-]+/).filter(Boolean);
    return words.some(word => word.startsWith(query));
}

function calculateAverage(arr) {
    if (!arr || arr.length === 0) return '5.0';
    const sum = arr.reduce((a, b) => a + b, 0);
    return (sum / arr.length).toFixed(1);
}

function renderBooks() {
    let query = searchInput.value.toLowerCase().trim();
    booksGrid.innerHTML = '';

    let workingBooks = [...booksData];

    if (selectedRatingGenre) {
        workingBooks = workingBooks.filter(b => b.genre === selectedRatingGenre);
        workingBooks.sort((a, b) => {
            const likesA = (a.likes || []).length;
            const likesB = (b.likes || []).length;
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

        if (currentCategory === 'favorites') {
            return matches && favorites.includes(book.id);
        }
        if (currentCategory === 'all' || selectedRatingGenre) {
            return matches;
        }
        return matches && book.genre === currentCategory;
    });

    if (filtered.length === 0) {
        booksGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">Нічого не знайдено за твоїм запитом.</p>';
        return;
    }

    filtered.forEach(book => {
        const isFav = favorites.includes(book.id);
        const avgRating = calculateAverage(book.ratings);
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <div class="cover-wrapper">
                <img src="${book.cover}" alt="${book.title}">
                <div class="rating-badge">⭐ ${avgRating}</div>
                <button class="fav-btn" onclick="toggleFavorite(${book.id})" title="Улюблене">
                    ${isFav ? '❤️' : '🤍'}
                </button>
            </div>
            <div class="book-info">
                <span class="book-badge">${book.genre} • ${book.originalLang}</span>
                <h3>${book.title}</h3>
                <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">${book.authorName} ${book.authorSurname}</p>
                <button class="read-btn" onclick="openBook(${book.id})">Читати книгу</button>
            </div>
        `;
        booksGrid.appendChild(card);
    });
}

clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    renderBooks();
});
searchInput.addEventListener('input', renderBooks);

window.toggleFavorite = function(id) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(favId => favId !== id);
    } else {
        favorites.push(id);
    }
    localStorage.setItem('transverse_favs', JSON.stringify(favorites));
    renderBooks();
};

window.openBook = function(id) {
    currentBook = booksData.find(b => String(b.id) === String(id));
    if (!currentBook || !Array.isArray(currentBook.chapters) || currentBook.chapters.length === 0) {
        alert('Помилка: не вдалося завантажити глави цієї книги.');
        return;
    }

    document.getElementById('modalCover').src = currentBook.cover || '';
    document.getElementById('modalTitle').textContent = currentBook.title || '';
    document.getElementById('modalMeta').textContent = `${currentBook.genre} • ${currentBook.originalLang} • ${currentBook.authorName} ${currentBook.authorSurname}`;
    document.getElementById('modalDesc').textContent = currentBook.description || '';

    bookStatusSelect.value = bookStatuses[currentBook.id] || "";

    updateBookRatingDisplay();
    updateLikeButton();
    renderComments();

    chapterSelect.innerHTML = '';
    currentBook.chapters.forEach((chap, index) => {
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

readingListMenuBtn.addEventListener('click', () => {
    readingListsModal.classList.remove('hidden');
});
document.getElementById('closeReadingListsModal').addEventListener('click', () => {
    readingListsModal.classList.add('hidden');
});

document.querySelectorAll('[data-statusfilter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        currentStatusFilter = e.target.dataset.statusfilter;
        readingListsModal.classList.add('hidden');
        renderBooks();
    });
});

fullscreenReaderBtn.addEventListener('click', () => {
    readerContentWrapper.classList.toggle('fullscreen-reader');
});

fullscreenRequestBtn.addEventListener('click', () => {
    requestModalContent.classList.toggle('fullscreen-reader');
});

fullscreenAdminBtn.addEventListener('click', () => {
    adminModalContent.classList.toggle('fullscreen-reader');
});

document.getElementById('openPureTextBtn').addEventListener('click', () => {
    if (!currentBook) return;
    pureTextOverlay.classList.remove('hidden');
    syncPureTextOverlay();
});

document.getElementById('closePureTextBtn').addEventListener('click', () => {
    pureTextOverlay.classList.add('hidden');
});

function syncPureTextOverlay() {
    if (!currentBook) return;
    const chap = currentBook.chapters[currentChapterIndex];
    if (!chap) return;
    document.getElementById('pureChapterTitle').textContent = chap.title;
    pureChapterText.textContent = chap.content;
    pureChapterText.style.fontSize = (currentFontSize + 2) + 'px';

    if (!chap.ratings) chap.ratings = [5];
    document.getElementById('pureChapterAvgRating').textContent = calculateAverage(chap.ratings);

    updateLikeButton();
    updateBookmarkButton();
    renderComments();
}

document.getElementById('pureFontInc').addEventListener('click', () => {
    if (currentFontSize < 28) {
        currentFontSize += 2;
        chapterText.style.fontSize = currentFontSize + 'px';
        pureChapterText.style.fontSize = (currentFontSize + 2) + 'px';
    }
});

document.getElementById('pureFontDec').addEventListener('click', () => {
    if (currentFontSize > 14) {
        currentFontSize -= 2;
        chapterText.style.fontSize = currentFontSize + 'px';
        pureChapterText.style.fontSize = (currentFontSize + 2) + 'px';
    }
});

document.getElementById('pureLikeBtn').addEventListener('click', () => {
    handleLikeToggle();
});

document.getElementById('pureSubmitChapterRating').addEventListener('click', () => {
    const val = Number(document.getElementById('pureRateChapterSelect').value);
    const chap = currentBook.chapters[currentChapterIndex];
    if (!chap.ratings) chap.ratings = [5];
    chap.ratings.push(val);
    updateChapterRatingDisplay();
    document.getElementById('pureChapterAvgRating').textContent = calculateAverage(chap.ratings);
    saveAllRatings();
});

pureBookmarkBtn.addEventListener('click', () => {
    toggleBookmarkLogic();
});

document.getElementById('purePrevChapter').addEventListener('click', () => {
    if (currentChapterIndex > 0) {
        loadChapter(currentChapterIndex - 1, true);
        syncPureTextOverlay();
        document.querySelector('.pure-body-scroll').scrollTop = 0;
    }
});

document.getElementById('pureNextChapter').addEventListener('click', () => {
    if (currentChapterIndex < currentBook.chapters.length - 1) {
        loadChapter(currentChapterIndex + 1, true);
        syncPureTextOverlay();
        document.querySelector('.pure-body-scroll').scrollTop = 0;
    }
});

document.getElementById('pureToggleCommentsBtn').addEventListener('click', () => {
    const drawer = document.getElementById('pureCommentsDrawer');
    drawer.classList.toggle('hidden');
    if (!drawer.classList.contains('hidden')) {
        drawer.scrollIntoView({ behavior: 'smooth' });
    }
});

document.getElementById('pureCommentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('pureCommentInput').value.trim();
    if (!text || !userProfile) return;

    if (!currentBook.comments) currentBook.comments = [];
    currentBook.comments.push({
        id: Date.now(),
        author: userProfile.username,
        text: text,
        date: new Date().toLocaleDateString(),
        replies: []
    });

    localStorage.setItem('transverse_books_db', JSON.stringify(booksData));
    document.getElementById('pureCommentInput').value = '';
    renderComments();
});

document.getElementById('openConsentModalBtn').addEventListener('click', (e) => {
    e.preventDefault();
    consentModal.classList.remove('hidden');
});
document.getElementById('closeConsentModal').addEventListener('click', () => {
    consentModal.classList.add('hidden');
});

function updateChapterNumbers() {
    const groups = document.querySelectorAll('.chapter-input-group');
    groups.forEach((group, index) => {
        const numLabel = group.querySelector('.chap-num-label');
        if (numLabel) {
            numLabel.textContent = `Глава ${index + 1}`;
        }
    });
}

function setupChapterInputGroup(groupElement) {
    const fileInput = groupElement.querySelector('.chap-inline-img-file');
    const previewList = groupElement.querySelector('.chap-images-preview-list');
    const grammarBtn = groupElement.querySelector('.check-grammar-btn');
    const textarea = groupElement.querySelector('.rec-chap-content');

    if (fileInput && previewList) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 500;
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

                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

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

    if (grammarBtn && textarea) {
        let isChecked = false;
        let originalPlainContent = "";

        grammarBtn.addEventListener('click', () => {
            if (!isChecked) {
                originalPlainContent = textarea.value;
                if (!originalPlainContent.trim()) {
                    alert('Спочатку введіть текст глави для перевірки граматики!');
                    return;
                }

                let wrapper = textarea.parentElement.querySelector('.grammar-preview-box');
                if (!wrapper) {
                    wrapper = document.createElement('div');
                    wrapper.className = 'grammar-preview-box';
                    wrapper.style.cssText = 'border: 1px solid var(--border); border-radius: 6px; padding: 8px; background: var(--card-bg); min-height: 120px; max-height: 200px; overflow-y: auto; white-space: pre-wrap; word-break: break-word; line-height: 1.6; font-size: 0.95rem; margin-bottom: 6px;';
                    textarea.style.display = 'none';
                    textarea.parentNode.insertBefore(wrapper, textarea);
                } else {
                    wrapper.style.display = 'block';
                    textarea.style.display = 'none';
                }

                const commonTypos = {
                    "шо": "що", "шось": "щось", "щи": "щі", "зробити": "зробити", 
                    "будь ласка": "будь ласка", "теж": "теж", "якщо": "якщо"
                };

                const words = originalPlainContent.split(/(\s+|[.,!?;:«»()"'\n-]+)/);
                const highlightedHTML = words.map(token => {
                    const cleanWord = token.trim().toLowerCase();
                    const isPotentiallyWrong = commonTypos[cleanWord] || (cleanWord.length > 3 && !/[аеєиіїоуьюяaeiouy]/i.test(cleanWord));
                    if (isPotentiallyWrong) {
                        return `<span style="border-bottom: 2px wavy #ef4444; background: rgba(239, 68, 68, 0.1);" title="Можлива орфографічна помилка">${token}</span>`;
                    }
                    return token;
                }).join('');

                wrapper.innerHTML = highlightedHTML;
                grammarBtn.textContent = '✖ Прибрати підкреслення';
                grammarBtn.style.background = '#64748b';
                isChecked = true;
            } else {
                const wrapper = textarea.parentElement.querySelector('.grammar-preview-box');
                if (wrapper) wrapper.style.display = 'none';
                textarea.style.display = 'block';
                grammarBtn.textContent = '📝 Перевірити граматику';
                grammarBtn.style.background = 'var(--accent)';
                isChecked = false;
            }
        });
    }
}

const initialChapterGroup = document.querySelector('.chapter-input-group');
if (initialChapterGroup) {
    setupChapterInputGroup(initialChapterGroup);
    const removeBtn = initialChapterGroup.querySelector('.remove-chapter-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            if (document.querySelectorAll('.chapter-input-group').length > 1) {
                initialChapterGroup.remove();
                updateChapterNumbers();
            } else {
                alert('У творі має бути хоча б одна глава!');
            }
        });
    }
}

document.getElementById('addChapterFieldBtn').addEventListener('click', () => {
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
                <div style="display: flex; gap: 6px; align-items: center;">
                    <button type="button" class="action-btn check-grammar-btn" style="padding: 2px 8px; font-size: 0.75rem; background: var(--accent); color: white; border: none; border-radius: 4px; cursor: pointer;">📝 Перевірити граматику</button>
                    <label class="action-btn" style="padding: 2px 8px; font-size: 0.75rem; cursor: pointer; background: var(--accent); color: white; display: inline-flex; align-items: center; gap: 4px;">
                        + Додати фото у текст
                        <input type="file" class="chap-inline-img-file" accept="image/*" style="display: none;">
                    </label>
                </div>
            </div>
            <textarea class="rec-chap-content" rows="6" placeholder="Введіть текст глави..." style="margin-bottom: 6px;" required></textarea>
            <div class="chap-images-preview-list" style="display: flex; flex-wrap: wrap; gap: 8px;"></div>
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

ratingModalBtn.addEventListener('click', () => {
    renderRatingGenres();
    ratingModal.classList.remove('hidden');
});
document.getElementById('closeRatingModal').addEventListener('click', () => {
    ratingModal.classList.add('hidden');
});

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

function handleLikeToggle() {
    if (!userProfile) {
        authModal.classList.remove('hidden');
        return;
    }
    if (!currentBook.likes) currentBook.likes = [];
    const idx = currentBook.likes.indexOf(userProfile.username);
    if (idx !== -1) {
        currentBook.likes.splice(idx, 1);
    } else {
        currentBook.likes.push(userProfile.username);
    }
    localStorage.setItem('transverse_books_db', JSON.stringify(booksData));
    updateLikeButton();
}

function updateLikeButton() {
    const likeBtn = document.getElementById('likeBookBtn');
    const likeCountSpan = document.getElementById('likeCount');
    const pureLikeBtn = document.getElementById('pureLikeBtn');
    const pureLikeCountSpan = document.getElementById('pureLikeCount');

    if (!currentBook.likes) currentBook.likes = [];
    const count = currentBook.likes.length;
    const isLiked = userProfile && currentBook.likes.includes(userProfile.username);

    likeCountSpan.textContent = count;
    pureLikeCountSpan.textContent = count;

    likeBtn.style.background = isLiked ? '#e11d48' : '#ec4899';
    pureLikeBtn.style.background = isLiked ? '#e11d48' : '#ec4899';
}

document.getElementById('likeBookBtn').addEventListener('click', handleLikeToggle);

function renderComments() {
    const list = document.getElementById('commentsList');
    const commentForm = document.getElementById('commentForm');
    const commentLoginNotice = document.getElementById('commentLoginNotice');

    const pureList = document.getElementById('pureCommentsList');
    const pureCommentForm = document.getElementById('pureCommentForm');
    const pureCommentLoginNotice = document.getElementById('pureCommentLoginNotice');
    const pureCommentsCount = document.getElementById('pureCommentsCount');

    if (userProfile) {
        commentForm.classList.remove('hidden');
        commentLoginNotice.classList.add('hidden');
        pureCommentForm.classList.remove('hidden');
        pureCommentLoginNotice.classList.add('hidden');
    } else {
        commentForm.classList.add('hidden');
        commentLoginNotice.classList.remove('hidden');
        pureCommentForm.classList.add('hidden');
        pureCommentLoginNotice.classList.remove('hidden');
    }

    const comms = currentBook.comments || [];
    pureCommentsCount.textContent = comms.length;

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
            
            const repliesHtml = (comm.replies || []).map(rep => {
                const repAvatar = getAvatarHTML(rep.author, 'avatar-comment');
                return `
                    <div class="reply-card">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            ${repAvatar}
                            <div>
                                <p style="font-weight: bold; font-size: 0.85rem; color: var(--accent);">${rep.author}</p>
                                <p style="font-size: 0.7rem; color: var(--text-muted);">📅 ${rep.date}</p>
                            </div>
                        </div>
                        <p style="font-size: 0.9rem; padding-left: 38px;">${rep.text}</p>
                    </div>
                `;
            }).join('');

            return `
                <div class="comment-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            ${avatarHtml}
                            <div>
                                <p style="font-weight: bold; font-size: 0.9rem; color: var(--accent);">${comm.author}</p>
                                <p style="font-size: 0.75rem; color: var(--text-muted);">📅 ${comm.date}</p>
                            </div>
                        </div>
                        ${deleteBtnHtml}
                    </div>
                    <p style="font-size: 0.95rem; word-break: break-word; padding-left: 40px;">${comm.text}</p>
                    
                    ${userProfile ? `<div style="margin-left: 40px; margin-top: 6px;"><button onclick="toggleReplyBox(${comm.id})" style="background:none; border:none; color:var(--accent); cursor:pointer; font-size:0.85rem; font-weight:600;">💬 Відповісти</button></div>` : ''}

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
    list.innerHTML = htmlContent;
    pureList.innerHTML = htmlContent;
}

document.getElementById('commentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('commentInput').value.trim();
    if (!text || !userProfile) return;

    if (!currentBook.comments) currentBook.comments = [];
    currentBook.comments.push({
        id: Date.now(),
        author: userProfile.username,
        text: text,
        date: new Date().toLocaleDateString(),
        replies: []
    });

    localStorage.setItem('transverse_books_db', JSON.stringify(booksData));
    document.getElementById('commentInput').value = '';
    renderComments();
});

window.toggleReplyBox = function(commentId) {
    const box = document.getElementById(`replyBox-${commentId}`);
    if (box) box.classList.toggle('hidden');
};

window.submitReply = function(commentId) {
    if (!userProfile) return;
    const input = document.getElementById(`replyInput-${commentId}`);
    const text = input ? input.value.trim() : '';
    if (!text) return;

    const comm = currentBook.comments.find(c => c.id === commentId);
    if (!comm) return;

    if (!comm.replies) comm.replies = [];
    const dateStr = new Date().toLocaleDateString();
    
    comm.replies.push({
        id: Date.now(),
        author: userProfile.username,
        text: text,
        date: dateStr
    });

    localStorage.setItem('transverse_books_db', JSON.stringify(booksData));

    if (comm.author !== userProfile.username) {
        if (!userNotifications[comm.author]) userNotifications[comm.author] = [];
        userNotifications[comm.author].push({
            id: Date.now(),
            text: `💬 Користувач <strong>${userProfile.username}</strong> відповів на ваш коментар до твору "${currentBook.title}": "${text}"`,
            date: dateStr,
            read: false,
            isBroadcast: false
        });
        localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));
    }

    renderComments();
};

window.deleteComment = function(commentId) {
    if (!userProfile || !userProfile.isAdmin) return;
    currentBook.comments = currentBook.comments.filter(c => c.id !== commentId);
    localStorage.setItem('transverse_books_db', JSON.stringify(booksData));
    renderComments();
};

deleteBookBtn.addEventListener('click', () => {
    if (!currentBook || !userProfile || !userProfile.isAdmin) return;
    if (confirm(`Ви впевнені, що хочете видалити твір "${currentBook.title}"?`)) {
        booksData = booksData.filter(b => b.id !== currentBook.id);
        localStorage.setItem('transverse_books_db', JSON.stringify(booksData));
        readerModal.classList.add('hidden');
        renderBooks();
    }
});

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

function updateBookRatingDisplay() {
    document.getElementById('bookAvgRating').textContent = calculateAverage(currentBook.ratings);
}

function updateChapterRatingDisplay() {
    const chap = currentBook.chapters[currentChapterIndex];
    if (!chap) return;
    if (!chap.ratings) chap.ratings = [5];
    const avg = calculateAverage(chap.ratings);
    document.getElementById('chapterAvgRating').textContent = avg;
    document.getElementById('pureChapterAvgRating').textContent = avg;
}

function loadChapter(index, autoBookmark = true) {
    if (!currentBook || !currentBook.chapters[index]) return;
    currentChapterIndex = index;
    const chap = currentBook.chapters[index];

    let htmlContent = `<div style="margin-bottom: 15px; line-height: 1.8;">${(chap.content || '').replace(/\n/g, '<br>')}</div>`;
    if (chap.images && Array.isArray(chap.images) && chap.images.length > 0) {
        htmlContent += `<div style="display: flex; flex-direction: column; gap: 20px; margin-top: 20px;">`;
        chap.images.forEach(imgUrl => {
            htmlContent += `<div style="margin: 20px auto; max-width: 100%; text-align: center; padding: 5px;"><img src="${imgUrl}" style="max-width: 100%; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"></div>`;
        });
        htmlContent += `</div>`;
    }

    chapterText.innerHTML = htmlContent;
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

function updateBookmarkButton() {
    const bookBookmarks = bookmarks[currentBook.id] || [];
    const isSaved = bookBookmarks.includes(currentChapterIndex);
    
    if (isSaved) {
        bookmarkBtn.textContent = '🔖 Главу збережено';
        bookmarkBtn.classList.add('saved');
        pureBookmarkBtn.textContent = '🔖 Главу збережено';
        pureBookmarkBtn.classList.add('saved');
    } else {
        bookmarkBtn.textContent = '🔖 Закладка';
        bookmarkBtn.classList.remove('saved');
        pureBookmarkBtn.textContent = '🔖 Закладка';
        pureBookmarkBtn.classList.remove('saved');
    }
}

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

bookmarkBtn.addEventListener('click', toggleBookmarkLogic);

chapterSelect.addEventListener('change', (e) => loadChapter(Number(e.target.value), true));

document.getElementById('prevChapter').addEventListener('click', () => {
    if (currentChapterIndex > 0) loadChapter(currentChapterIndex - 1, true);
});

document.getElementById('nextChapter').addEventListener('click', () => {
    if (currentChapterIndex < currentBook.chapters.length - 1) loadChapter(currentChapterIndex + 1, true);
});

document.getElementById('increaseFont').addEventListener('click', () => {
    if (currentFontSize < 28) {
        currentFontSize += 2;
        chapterText.style.fontSize = currentFontSize + 'px';
    }
});

document.getElementById('decreaseFont').addEventListener('click', () => {
    if (currentFontSize > 14) {
        currentFontSize -= 2;
        chapterText.style.fontSize = currentFontSize + 'px';
    }
});

document.getElementById('closeModal').addEventListener('click', () => {
    readerContentWrapper.classList.remove('fullscreen-reader');
    pureTextOverlay.classList.add('hidden');
    readerModal.classList.add('hidden');
});

document.getElementById('submitBookRating').addEventListener('click', () => {
    const val = Number(document.getElementById('rateBookSelect').value);
    currentBook.ratings.push(val);
    updateBookRatingDisplay();
    saveAllRatings();
    renderBooks();
});

document.getElementById('submitChapterRating').addEventListener('click', () => {
    const val = Number(document.getElementById('rateChapterSelect').value);
    const chap = currentBook.chapters[currentChapterIndex];
    if (!chap.ratings) chap.ratings = [5];
    chap.ratings.push(val);
    updateChapterRatingDisplay();
    saveAllRatings();
});

function saveAllRatings() {
    savedRatings[currentBook.id] = {
        bookRatings: currentBook.ratings,
        chapterRatings: currentBook.chapters.map(c => c.ratings || [5])
    };
    localStorage.setItem('transverse_ratings_v3', JSON.stringify(savedRatings));
}

profileBtn.addEventListener('click', () => {
    updateUIByRole();
    authModal.classList.remove('hidden');
});

document.getElementById('closeAuthModal').addEventListener('click', () => {
    authModal.classList.add('hidden');
});

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

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (adminsDb[username]) {
        if (adminsDb[username].password === password) {
            userProfile = { 
                username, 
                isAdmin: true, 
                isSuperAdmin: !!adminsDb[username].isSuper 
            };
            localStorage.setItem('transverse_user', JSON.stringify(userProfile));
            updateUIByRole();
            authModal.classList.add('hidden');
            document.getElementById('loginForm').reset();
            return;
        } else {
            alert('Невірний пароль для адміністратора!');
            return;
        }
    }

    if (registeredUsers[username]) {
        if (registeredUsers[username].password === password) {
            userProfile = { username, isAdmin: false, isSuperAdmin: false };
            localStorage.setItem('transverse_user', JSON.stringify(userProfile));
            updateUIByRole();
            authModal.classList.add('hidden');
            document.getElementById('loginForm').reset();
        } else {
            alert('Невірний пароль!');
        }
    } else {
        alert('Користувача з таким нікнеймом не знайдено або акаунт було видалено.');
    }
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const confirm = document.getElementById('regPasswordConfirm').value.trim();

    if (username.length < 1 || username.length > 20) {
        alert('Ім\'я користувача повинно містити від 1 до 20 символів!');
        return;
    }

    if (password.length < 4 || password.length > 20) {
        alert('Пароль повинен містити від 4 до 20 символів!');
        return;
    }

    if (password !== confirm) {
        alert('Паролі не збігаються!');
        return;
    }

    if (bannedUsernames.includes(username.toLowerCase())) {
        alert('Цей нікнейм заблоковано або був видалений адміністрацією. Оберіть інший!');
        return;
    }

    const isTakenByAdmin = Object.keys(adminsDb).some(a => a.toLowerCase() === username.toLowerCase());
    const isTakenByUser = Object.keys(registeredUsers).some(u => u.toLowerCase() === username.toLowerCase());

    if (isTakenByAdmin || isTakenByUser) {
        alert('Цей нікнейм вже зайнятий!');
        return;
    }

    registeredUsers[username] = {
        password: password,
        regDate: new Date().toLocaleDateString(),
        avatar: null
    };
    localStorage.setItem('transverse_registered_users', JSON.stringify(registeredUsers));

    if (!userNotifications[username]) {
        userNotifications[username] = [];
        localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));
    }

    userProfile = { username, isAdmin: false, isSuperAdmin: false };
    localStorage.setItem('transverse_user', JSON.stringify(userProfile));
    updateUIByRole();
    authModal.classList.add('hidden');
    document.getElementById('registerForm').reset();
    alert('Реєстрація успішна!');
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('transverse_user');
    userProfile = null;
    updateUIByRole();
    authModal.classList.add('hidden');
});

deleteAccountBtn.addEventListener('click', () => {
    if (!userProfile || userProfile.isAdmin) return;
    if (confirm('Ви дійсно хочете видалити свій акаунт? Цю дію неможливо скасувати.')) {
        const username = userProfile.username;
        
        // Зберігаємо дані акаунта на випадок відновлення через адмінку
        const userDataBackup = registeredUsers[username] || {
            password: "1234",
            regDate: new Date().toLocaleDateString(),
            avatar: null
        };

        delete registeredUsers[username];
        delete userNotifications[username];
        
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
        localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));
        
        localStorage.removeItem('transverse_user');
        userProfile = null;
        updateUIByRole();
        authModal.classList.add('hidden');
        alert('Ваш акаунт успішно видалено.');
    }
});

requestsBtn.addEventListener('click', () => {
    requestModal.classList.remove('hidden');
});
document.getElementById('closeRequestModal').addEventListener('click', () => {
    requestModalContent.classList.remove('fullscreen-reader');
    requestModal.classList.add('hidden');
});

const fileInputEl = document.getElementById('bookLayoutFile');
if (fileInputEl) {
    const oldSelect = document.getElementById('bookLayoutSelect');
    if (oldSelect) {
        if (oldSelect.previousElementSibling) oldSelect.previousElementSibling.style.display = 'none';
        oldSelect.style.display = 'none';
    }

    fileInputEl.addEventListener('change', (e) => {
        const file = e.target.files[0];
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

const regUserEl = document.getElementById('regUsername');
if (regUserEl) {
    regUserEl.setAttribute('minlength', '1');
    regUserEl.setAttribute('maxlength', '20');
}
regPassInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.setAttribute('minlength', '4');
        el.setAttribute('maxlength', '20');
    }
});

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
        } else if (tab === 'statement') {
            document.getElementById('statementForm').classList.remove('hidden');
        }
    });
});

document.getElementById('complaintForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('complaintText').value.trim();
    const authorName = userProfile ? userProfile.username : 'Гість';
    submissions.push({ 
        type: 'complaint', 
        text, 
        author: authorName, 
        date: new Date().toLocaleDateString() 
    });
    localStorage.setItem('transverse_submissions', JSON.stringify(submissions));

    if (userProfile) {
        if (!userNotifications[userProfile.username]) userNotifications[userProfile.username] = [];
        userNotifications[userProfile.username].push({
            id: Date.now(),
            text: `📝 Ваша скарга успішно надіслана адміністратору.`,
            date: new Date().toLocaleDateString(),
            read: false,
            isBroadcast: false
        });
        localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));
    }

    document.getElementById('complaintText').value = '';
    requestModalContent.classList.remove('fullscreen-reader');
    requestModal.classList.add('hidden');
});

document.getElementById('recommendForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('recTitle').value.trim();
    const authorName = document.getElementById('recName').value.trim();
    const authorSurname = document.getElementById('recSurname').value.trim();
    const genre = document.getElementById('recGenre').value;
    const description = document.getElementById('recDesc').value.trim();

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
                ratings: [5]
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
        id: Date.now(),
        title: title,
        authorName: authorName,
        authorSurname: authorSurname,
        genre: genre,
        description: description,
        cover: finalCover,
        originalLang: "Авторський переклад",
        ratings: [5],
        likes: [],
        comments: [],
        addedBy: userProfile ? userProfile.username : 'Гість',
        chapters: chapters
    };

    submissions.push({ 
        type: 'book', 
        book: newBook, 
        author: userProfile ? userProfile.username : 'Гість', 
        date: new Date().toLocaleDateString() 
    });
    localStorage.setItem('transverse_submissions', JSON.stringify(submissions));

    if (userProfile) {
        if (!userNotifications[userProfile.username]) userNotifications[userProfile.username] = [];
        userNotifications[userProfile.username].push({
            id: Date.now(),
            text: `📚 Твір "${title}" успішно надіслано на розгляд адміністратору.`,
            date: new Date().toLocaleDateString(),
            read: false,
            isBroadcast: false
        });
        localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));
    }

    document.getElementById('recommendForm').reset();
    uploadedLayoutDataUrl = "";
    const prev = document.getElementById('layoutPreviewImg');
    if (prev) prev.classList.add('hidden');

    document.querySelectorAll('.chap-images-preview-list').forEach(list => list.innerHTML = '');
    document.querySelectorAll('.grammar-preview-box').forEach(box => box.remove());
    document.querySelectorAll('.rec-chap-content').forEach(ta => ta.style.display = 'block');

    const allChapGroups = document.querySelectorAll('.chapter-input-group');
    for (let i = 1; i < allChapGroups.length; i++) {
        allChapGroups[i].remove();
    }
    updateChapterNumbers();

    requestModalContent.classList.remove('fullscreen-reader');
    requestModal.classList.add('hidden');
});

document.getElementById('statementForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const authorName = document.getElementById('statAuthorName').value.trim();
    const bookTitle = document.getElementById('statBookTitle').value.trim();
    const text = document.getElementById('statText').value.trim();

    submissions.push({
        type: 'statement',
        authorName,
        bookTitle,
        text,
        author: userProfile ? userProfile.username : 'Гість',
        date: new Date().toLocaleDateString()
    });
    localStorage.setItem('transverse_submissions', JSON.stringify(submissions));

    if (userProfile) {
        if (!userNotifications[userProfile.username]) userNotifications[userProfile.username] = [];
        userNotifications[userProfile.username].push({
            id: Date.now(),
            text: `📄 Вашу заяву щодо твору "${bookTitle}" надіслано адміністрації.`,
            date: new Date().toLocaleDateString(),
            read: false,
            isBroadcast: false
        });
        localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));
    }

    document.getElementById('statementForm').reset();
    requestModalContent.classList.remove('fullscreen-reader');
    requestModal.classList.add('hidden');
});

adminPanelBtn.addEventListener('click', () => {
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
document.getElementById('closeAdminModal').addEventListener('click', () => {
    adminModalContent.classList.remove('fullscreen-reader');
    adminModal.classList.add('hidden');
});

document.querySelectorAll('[data-admintab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
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
            document.getElementById('adminIncomingSection').classList.remove('hidden');
        } else if (tab === 'history') {
            document.getElementById('adminHistorySection').classList.remove('hidden');
            renderAdminHistory();
        } else if (tab === 'users') {
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
                    <p><strong>🚨 Скарга від ${sub.author} (${sub.date}):</strong></p>
                    <p style="margin: 4px 0;">${sub.text}</p>
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
                    <p><strong>📄 Заява від автора ${sub.author} (${sub.date}):</strong></p>
                    <p>Автор: <strong>${sub.authorName}</strong> | Твір: <strong>${sub.bookTitle}</strong></p>
                    <p style="margin: 4px 0;">Суть заяви: ${sub.text}</p>
                    <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
                        <button onclick="openReplyModal(${index})" style="background: var(--accent); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Відповісти</button>
                        <button onclick="deleteSubmission(${index})" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Видалити заяву</button>
                    </div>
                </div>
                ${infoBtnHtml}
            `;
        } else if (sub.book) {
            const chapCount = sub.book.chapters ? sub.book.chapters.length : 0;
            item.innerHTML = `
                <div style="flex: 1;">
                    <p><strong>📚 Заявка на твір від ${sub.author} (${sub.date}):</strong></p>
                    <p>Назва: <strong>${sub.book.title}</strong> | Автор: ${sub.book.authorName} ${sub.book.authorSurname} (${sub.book.genre}) | Глав: ${chapCount}</p>
                    <p style="font-size: 0.9rem; color: var(--text-muted);">${sub.book.description}</p>
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
        const booksListStr = userBooks.length > 0 ? userBooks.map(b => b.title).join(', ') : 'Немає викладених творів';
        const avatarHtml = getAvatarHTML(username, 'avatar-comment');

        const item = document.createElement('div');
        item.style.cssText = 'background: var(--bg-color); padding: 12px; border-radius: 6px; border: 1px solid var(--border);';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${avatarHtml}
                    <div>
                        <p style="font-weight: bold; font-size: 1.05rem; color: var(--accent);">${username}</p>
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">📅 Дата реєстрації: ${uData.regDate || 'Невідомо'}</p>
                        <p style="font-size: 0.9rem; margin-top: 4px;">📚 Викладені твори: <strong>${booksListStr}</strong></p>
                    </div>
                </div>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <button onclick="openDirectMsgModal('${username}')" style="background: var(--accent); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">✉️ Написати</button>
                    <button onclick="adminDeleteUser('${username}')" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">🗑️ Видалити</button>
                </div>
            </div>
        `;
        list.appendChild(item);
    });
}

window.adminDeleteUser = function(username) {
    if (confirm(`Ви впевнені, що хочете видалити акаунт "${username}"? Його нікнейм буде назавжди заблоковано для повторної реєстрації.`)) {
        const userDataBackup = registeredUsers[username] || {
            password: "1234",
            regDate: new Date().toLocaleDateString(),
            avatar: null
        };

        delete registeredUsers[username];
        delete userNotifications[username];
        
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
        localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));
        renderAdminUsers();
        renderAdminBannedUsers();
        alert(`Акаунт ${username} видалено, а нікнейм заблоковано.`);
    }
};

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
                <p style="font-weight: bold; font-size: 1.05rem; color: var(--accent);">Нікнейм: ${rec.username}</p>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">📅 Дата видалення: ${rec.deletedDate}</p>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button onclick="restoreAccount(${idx})" style="background: var(--success); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">🔄 Повернути</button>
                <button onclick="permanentlyDeleteAccount(${idx})" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">⛔ Видалити назавжди</button>
            </div>
        `;
        list.appendChild(item);
    });
}

// ВИПРАВЛЕНО: Повністю відновлює дані акаунта в базі користувачів і знімає бан з нікнейму
window.restoreAccount = function(index) {
    const rec = deletedAccountsHistory[index];
    if (!rec) return;

    if (confirm(`Ви дійсно хочете відновити акаунт "${rec.username}"? Користувач знову зможе увійти під цим нікнеймом.`)) {
        // Повертаємо дані у словник зареєстрованих користувачів
        registeredUsers[rec.username] = rec.userData || {
            password: "1234",
            regDate: new Date().toLocaleDateString(),
            avatar: null
        };
        localStorage.setItem('transverse_registered_users', JSON.stringify(registeredUsers));

        // Прибираємо нікнейм із чорного списку заблокованих
        bannedUsernames = bannedUsernames.filter(u => u !== rec.username.toLowerCase());
        localStorage.setItem('transverse_banned_users', JSON.stringify(bannedUsernames));

        // Видаляємо запис з історії видалених акаунтів
        deletedAccountsHistory.splice(index, 1);
        localStorage.setItem('transverse_deleted_accounts_history', JSON.stringify(deletedAccountsHistory));

        renderAdminBannedUsers();
        renderAdminUsers();
        alert(`Акаунт та нікнейм "${rec.username}" успішно відновлено!`);
    }
};

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

function renderAdminAdmins() {
    const list = document.getElementById('adminAdminsList');
    list.innerHTML = '';

    Object.keys(adminsDb).forEach(adminName => {
        const aData = adminsDb[adminName];
        const avatarHtml = getAvatarHTML(adminName, 'avatar-comment');
        const isSuper = !!aData.isSuper;

        const item = document.createElement('div');
        item.style.cssText = 'background: var(--bg-color); padding: 12px; border-radius: 6px; border: 1px solid var(--border);';
        
        let actionBtnHtml = '';
        if (isSuper) {
            actionBtnHtml = `<span style="color: #eab308; font-weight: bold; font-size: 0.9rem;">👑 Головний адміністратор</span>`;
        } else {
            actionBtnHtml = `<button onclick="superAdminDeleteAdmin('${adminName}')" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">🗑️ Видалити адміна</button>`;
        }

        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${avatarHtml}
                    <div>
                        <p style="font-weight: bold; font-size: 1.05rem; color: var(--accent);">${adminName}</p>
                        <p style="font-size: 0.85rem; color: var(--text-muted);">${isSuper ? 'Повний доступ до системи' : 'Модератор контенту'}</p>
                    </div>
                </div>
                ${actionBtnHtml}
            </div>
        `;
        list.appendChild(item);
    });
}

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
                <span>Кому: <strong>${rec.targetUser}</strong> | Видалив адмін: ${rec.deletedBy || rec.adminName}</span>
                <span>📅 Видалено: ${rec.deletedDate}</span>
            </div>
            <p style="font-size: 0.9rem; margin-top: 4px; color: var(--accent);">Тема: ${rec.subject}</p>
            <p style="margin: 6px 0; font-style: italic;">Текст: ${rec.replyText}</p>
        `;
        list.appendChild(box);
    });
}

window.superAdminDeleteAdmin = function(adminName) {
    if (!userProfile || !userProfile.isSuperAdmin) return;
    if (confirm(`Ви дійсно хочете видалити адміністратора "${adminName}"? Його логін та пароль більше не підходитимуть для входу.`)) {
        delete adminsDb[adminName];
        localStorage.setItem('transverse_admins_db', JSON.stringify(adminsDb));
        renderAdminAdmins();
        alert(`Адміністратора ${adminName} видалено з системи.`);
    }
};

window.openReplyModal = function(index) {
    replyingIndex = index;
    document.getElementById('replyText').value = '';
    replyModal.classList.remove('hidden');
};

document.getElementById('closeReplyModal').addEventListener('click', () => {
    replyModal.classList.add('hidden');
});

document.getElementById('replyForm').addEventListener('submit', (e) => {
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
        localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));
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

    submissions.splice(replyingIndex, 1);
    localStorage.setItem('transverse_submissions', JSON.stringify(submissions));

    replyModal.classList.add('hidden');
    renderAdminSubmissions();
    renderAdminHistory();
});

window.deleteSubmission = function(index) {
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
        localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));
    }

    submissions.splice(index, 1);
    localStorage.setItem('transverse_submissions', JSON.stringify(submissions));
    renderAdminSubmissions();
    renderAdminHistory();
};

window.rejectBook = function(index) {
    window.deleteSubmission(index);
};

window.approveBook = function(index) {
    const sub = submissions[index];
    if (!sub || !sub.book) return;

    sub.book.id = Date.now();
    booksData.push(sub.book);
    localStorage.setItem('transverse_books_db', JSON.stringify(booksData));
    
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
        localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));
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

document.getElementById('openBroadcastBtn').addEventListener('click', () => {
    document.getElementById('broadcastText').value = '';
    broadcastModal.classList.remove('hidden');
});
document.getElementById('closeBroadcastModal').addEventListener('click', () => {
    broadcastModal.classList.add('hidden');
});

document.getElementById('broadcastForm').addEventListener('submit', (e) => {
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

    localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));

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
                <span>Кому: <strong>${record.targetUser}</strong> | Адмін: ${record.adminName}</span>
                <span>${statusHtml} | 📅 ${record.date}</span>
            </div>
            <p style="font-size: 0.9rem; margin-top: 4px; color: var(--accent);">${record.subject}</p>
            <p style="margin: 6px 0;">${record.replyText}</p>
            <button onclick="revokeAdminReply(${idx})" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">🗑️ Видалити у користувача</button>
        `;
        historyList.appendChild(box);
    });
}

window.revokeAdminReply = function(historyIndex) {
    const record = adminHistory[historyIndex];
    if (!record) return;

    if (record.isBroadcast) {
        Object.keys(userNotifications).forEach(username => {
            userNotifications[username] = userNotifications[username].filter(m => m.id !== record.msgId);
        });
        if (userNotifications['guest']) {
            userNotifications['guest'] = userNotifications['guest'].filter(m => m.id !== record.msgId);
        }
    } else if (record.targetUser && userNotifications[record.targetUser]) {
        userNotifications[record.targetUser] = userNotifications[record.targetUser].filter(m => m.id !== record.msgId);
    }

    localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));
    
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

notificationsBtn.addEventListener('click', () => {
    renderUserNotifications();
    notificationsModal.classList.remove('hidden');
    
    let key = userProfile ? userProfile.username : 'guest';
    if (userNotifications[key]) {
        userNotifications[key].forEach(m => m.read = true);
        localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));
    }
    updateNotificationsCount();
});

document.getElementById('closeNotificationsModal').addEventListener('click', () => {
    notificationsModal.classList.add('hidden');
});

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
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">📅 ${notif.date}</p>
                <p style="line-height: 1.4;">${notif.text}</p>
            </div>
            <button onclick="openNotificationInfo(${notif.id})" title="Детальніше" style="background: #3b82f6; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-weight: bold; font-family: serif; font-style: italic; font-size: 1rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(59,130,246,0.35);">i</button>
        `;
        container.appendChild(box);
    });
}

catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        catButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedRatingGenre = null;
        currentCategory = btn.dataset.category;
        renderBooks();
    });
});

document.getElementById('themeToggle').addEventListener('click', (e) => {
    document.body.classList.toggle('dark-theme');
    e.target.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
});

renderBooks();