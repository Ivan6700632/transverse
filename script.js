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

let favorites = JSON.parse(localStorage.getItem('transverse_favs')) || [];
let bookmarks = JSON.parse(localStorage.getItem('transverse_bookmarks_v3')) || {};
let registeredUsers = JSON.parse(localStorage.getItem('transverse_registered_users')) || {};
let userProfile = JSON.parse(localStorage.getItem('transverse_user')) || null;
let submissions = JSON.parse(localStorage.getItem('transverse_submissions')) || [];
let adminHistory = JSON.parse(localStorage.getItem('transverse_admin_history')) || [];
let deletedHistory = JSON.parse(localStorage.getItem('transverse_deleted_history')) || [];
let userNotifications = JSON.parse(localStorage.getItem('transverse_notifications')) || {};
let bookStatuses = JSON.parse(localStorage.getItem('transverse_book_statuses')) || {}; // { bookId: 'reading' | 'willRead' | 'read' }

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

        if (userProfile.isAdmin) {
            adminPanelBtn.classList.remove('hidden');
            deleteBookBtn.classList.remove('hidden');
            deleteAccountBtn.classList.add('hidden');
            adminNotice.classList.remove('hidden');

            if (userProfile.isSuperAdmin) {
                adminNotice.textContent = 'Статус: Головний адміністратор 👑';
                adminTabAdminsBtn.classList.remove('hidden');
                adminTabDeletedBtn.classList.remove('hidden');
            } else {
                adminNotice.textContent = 'Статус: Адміністратор 🛡️';
                adminTabAdminsBtn.classList.add('hidden');
                adminTabDeletedBtn.classList.add('hidden');
            }
        } else {
            adminPanelBtn.classList.add('hidden');
            deleteBookBtn.classList.add('hidden');
            deleteAccountBtn.classList.remove('hidden');
            adminNotice.classList.add('hidden');
            adminTabAdminsBtn.classList.add('hidden');
            adminTabDeletedBtn.classList.add('hidden');
        }
    } else {
        profileBtn.innerHTML = `👤 Увійти`;
        adminPanelBtn.classList.add('hidden');
        notificationsBtn.classList.remove('hidden'); // Доступно і для незареєстрованих/гостей
        updateNotificationsCount();
        deleteBookBtn.classList.add('hidden');
        deleteAccountBtn.classList.add('hidden');
        adminTabAdminsBtn.classList.add('hidden');
        adminTabDeletedBtn.classList.add('hidden');

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

// Постійне оновлення лічильника поштової скриньки в реальному часі
function updateNotificationsCount() {
    let key = userProfile ? userProfile.username : 'guest';
    const inbox = userNotifications[key] || [];
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
        
        // Фільтрація за статусами читання (кнопка 3 смужки)
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
    currentBook = booksData.find(b => b.id === id);
    if (!currentBook) return;

    document.getElementById('modalCover').src = currentBook.cover;
    document.getElementById('modalTitle').textContent = currentBook.title;
    document.getElementById('modalMeta').textContent = `${currentBook.genre} • ${currentBook.originalLang} • ${currentBook.authorName} ${currentBook.authorSurname}`;
    document.getElementById('modalDesc').textContent = currentBook.description;

    // Встановлюємо статус у випадаючому списку
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
        option.textContent = chap.title + isSaved;
        chapterSelect.appendChild(option);
    });

    const bookBookmarks = bookmarks[currentBook.id] || [];
    const startChapter = bookBookmarks.length > 0 ? bookBookmarks[bookBookmarks.length - 1] : 0;
    
    loadChapter(startChapter, true);
    readerModal.classList.remove('hidden');
};

// Зміна статусу читання з вікна книги
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

// Кнопка 3 смужки
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
        date: new Date().toLocaleDateString()
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
            <label style="font-size: 0.85rem; margin-bottom: 2px;">Текст твору:</label>
            <textarea class="rec-chap-content" rows="6" placeholder="Введіть текст глави..." required></textarea>
        </div>
    `;

    newGroup.querySelector('.remove-chapter-btn').addEventListener('click', () => {
        newGroup.remove();
        updateChapterNumbers();
    });

    container.appendChild(newGroup);
    updateChapterNumbers();
    container.scrollTop = container.scrollHeight;
});

// Рейтинг
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
        alert('Будь ласка, увійдіть в акаунт, щоб поставити лайк!');
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
            return `
                <div style="background: var(--bg-color); padding: 10px; border-radius: 6px; border: 1px solid var(--border);">
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
        date: new Date().toLocaleDateString()
    });

    localStorage.setItem('transverse_books_db', JSON.stringify(booksData));
    document.getElementById('commentInput').value = '';
    renderComments();
});

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
    if (!chap.ratings) chap.ratings = [5];
    const avg = calculateAverage(chap.ratings);
    document.getElementById('chapterAvgRating').textContent = avg;
    document.getElementById('pureChapterAvgRating').textContent = avg;
}

function loadChapter(index, autoBookmark = true) {
    currentChapterIndex = index;
    chapterText.textContent = currentBook.chapters[index].content;
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

// Авторизація
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
        delete registeredUsers[username];
        delete userNotifications[username];
        localStorage.setItem('transverse_registered_users', JSON.stringify(registeredUsers));
        localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));
        
        localStorage.removeItem('transverse_user');
        userProfile = null;
        updateUIByRole();
        authModal.classList.add('hidden');
        alert('Ваш акаунт успішно видалено.');
    }
});

// Заявки, скарги та заяви
requestsBtn.addEventListener('click', () => {
    requestModal.classList.remove('hidden');
});
document.getElementById('closeRequestModal').addEventListener('click', () => {
    requestModalContent.classList.remove('fullscreen-reader');
    requestModal.classList.add('hidden');
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
    alert('Скаргу надіслано адміністратору!');
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
        if (chapTitle && chapContent) {
            chapters.push({
                title: chapTitle,
                content: chapContent,
                ratings: [5]
            });
        }
    });

    if (chapters.length === 0) {
        alert('Будь ласка, додайте хоча б одну главу!');
        return;
    }

    const newBook = {
        title: title,
        authorName: authorName,
        authorSurname: authorSurname,
        genre: genre,
        description: description,
        cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80",
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
    alert('Твір з усіма главами надіслано на розгляд адміністратору!');
    document.getElementById('recommendForm').reset();
    
    const container = document.getElementById('chaptersContainer');
    container.innerHTML = `
        <div class="chapter-input-group" style="background: var(--bg-color); padding: 12px; border-radius: 8px; border: 1px solid var(--border);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label class="chap-num-label" style="margin: 0; font-weight: bold; color: var(--accent);">Глава 1</label>
            </div>
            <div class="form-group" style="margin-bottom: 8px;">
                <label style="font-size: 0.85rem; margin-bottom: 2px;">Заголовок:</label>
                <input type="text" class="rec-chap-title" placeholder="Наприклад: Пролог або Глава 1" required>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label style="font-size: 0.85rem; margin-bottom: 2px;">Текст твору:</label>
                <textarea class="rec-chap-content" rows="6" placeholder="Введіть повний текст глави тут..." required></textarea>
            </div>
        </div>
    `;

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
    alert('Заяву успішно надіслано адміністрації!');
    document.getElementById('statementForm').reset();
    requestModalContent.classList.remove('fullscreen-reader');
    requestModal.classList.add('hidden');
});

// Адмін панель
adminPanelBtn.addEventListener('click', () => {
    renderAdminSubmissions();
    renderAdminHistory();
    renderAdminUsers();
    if (userProfile && userProfile.isSuperAdmin) {
        renderAdminAdmins();
        renderAdminDeleted();
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
        item.style.cssText = 'background: var(--bg-color); padding: 10px; margin-bottom: 8px; border-radius: 6px; border: 1px solid var(--border);';
        
        if (sub.type === 'complaint') {
            item.innerHTML = `
                <p><strong>🚨 Скарга від ${sub.author} (${sub.date}):</strong></p>
                <p style="margin: 4px 0;">${sub.text}</p>
                <div style="margin-top: 6px; display: flex; gap: 5px;">
                    <button onclick="openReplyModal(${index})" style="background: var(--accent); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Відповісти</button>
                    <button onclick="deleteSubmission(${index})" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Видалити</button>
                </div>
            `;
        } else if (sub.type === 'statement') {
            item.innerHTML = `
                <p><strong>📄 Заява від автора ${sub.author} (${sub.date}):</strong></p>
                <p>Автор: <strong>${sub.authorName}</strong> | Твір: <strong>${sub.bookTitle}</strong></p>
                <p style="margin: 4px 0;">Суть заяви: ${sub.text}</p>
                <div style="margin-top: 6px; display: flex; gap: 5px;">
                    <button onclick="openReplyModal(${index})" style="background: var(--accent); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Відповісти</button>
                    <button onclick="deleteSubmission(${index})" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Видалити заяву</button>
                </div>
            `;
        } else {
            const chapCount = sub.book.chapters ? sub.book.chapters.length : 0;
            item.innerHTML = `
                <p><strong>📚 Заявка на твір від ${sub.author} (${sub.date}):</strong></p>
                <p>Назва: <strong>${sub.book.title}</strong> | Автор: ${sub.book.authorName} ${sub.book.authorSurname} (${sub.book.genre}) | Глав: ${chapCount}</p>
                <p style="font-size: 0.9rem; color: var(--text-muted);">${sub.book.description}</p>
                <div style="margin-top: 6px; display: flex; gap: 5px;">
                    <button onclick="approveBook(${index})" style="background: #10b981; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Затвердити</button>
                    <button onclick="openReplyModal(${index})" style="background: var(--accent); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Відповісти</button>
                    <button onclick="deleteSubmission(${index})" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Відхилити</button>
                </div>
            `;
        }
        list.appendChild(item);
    });
}

function renderAdminUsers() {
    const list = document.getElementById('adminUsersList');
    list.innerHTML = '';
    
    const usernames = Object.keys(registeredUsers);
    if (usernames.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted);">Немає зареєстрованих користувачів.</p>';
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
                <button onclick="adminDeleteUser('${username}')" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">🗑️ Видалити та заблокувати</button>
            </div>
        `;
        list.appendChild(item);
    });
}

window.adminDeleteUser = function(username) {
    if (confirm(`Ви впевнені, що хочете видалити акаунт "${username}"? Його нікнейм буде назавжди заблоковано для повторної реєстрації.`)) {
        delete registeredUsers[username];
        delete userNotifications[username];
        
        if (!bannedUsernames.includes(username.toLowerCase())) {
            bannedUsernames.push(username.toLowerCase());
            localStorage.setItem('transverse_banned_users', JSON.stringify(bannedUsernames));
        }

        localStorage.setItem('transverse_registered_users', JSON.stringify(registeredUsers));
        localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));
        renderAdminUsers();
        alert(`Акаунт ${username} видалено, а нікнейм заблоковано.`);
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
    const msgId = Date.now();
    const dateStr = new Date().toLocaleDateString();
    
    let subject = 'Повідомлення від адміністрації';
    if (sub.type === 'complaint') subject = `Скарга: "${sub.text.slice(0, 30)}..."`;
    else if (sub.type === 'statement') subject = `Заява щодо твору "${sub.bookTitle}"`;
    else subject = `Заявка на твір: "${sub.book.title}"`;

    if (sub && sub.author) {
        let notifKey = sub.author;
        if (!userNotifications[notifKey]) userNotifications[notifKey] = [];
        userNotifications[notifKey].push({
            id: msgId,
            text: `Відповідь на (${subject}): ${replyText}`,
            date: dateStr,
            isBroadcast: false
        });
        localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));
    }

    adminHistory.unshift({
        msgId: msgId,
        targetUser: sub.author,
        subject: subject,
        replyText: replyText,
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
    submissions.splice(index, 1);
    localStorage.setItem('transverse_submissions', JSON.stringify(submissions));
    renderAdminSubmissions();
};

window.approveBook = function(index) {
    const sub = submissions[index];
    sub.book.id = booksData.length + 1;
    booksData.push(sub.book);
    localStorage.setItem('transverse_books_db', JSON.stringify(booksData));
    
    const msgId = Date.now();
    const dateStr = new Date().toLocaleDateString();
    const replyText = `Ваш твір "${sub.book.title}" успішно затверджено адміністратором і додано до бібліотеки разом із главами!`;

    if (sub.author) {
        let notifKey = sub.author;
        if (!userNotifications[notifKey]) userNotifications[notifKey] = [];
        userNotifications[notifKey].push({
            id: msgId,
            text: replyText,
            date: dateStr,
            isBroadcast: false
        });
        localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));
    }

    adminHistory.unshift({
        msgId: msgId,
        targetUser: sub.author,
        subject: `Затвердження твору: "${sub.book.title}"`,
        replyText: replyText,
        adminName: userProfile.username,
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
            isBroadcast: true
        });
    });

    Object.keys(adminsDb).forEach(adminName => {
        if (!userNotifications[adminName]) userNotifications[adminName] = [];
        userNotifications[adminName].push({
            id: msgId,
            text: `📢 Оголошення від адміністрації: ${text}`,
            date: dateStr,
            isBroadcast: true
        });
    });

    // Також для гостей
    if (!userNotifications['guest']) userNotifications['guest'] = [];
    userNotifications['guest'].push({
        id: msgId,
        text: `📢 Оголошення від адміністрації: ${text}`,
        date: dateStr,
        isBroadcast: true
    });

    localStorage.setItem('transverse_notifications', JSON.stringify(userNotifications));

    adminHistory.unshift({
        msgId: msgId,
        targetUser: 'Усім користувачам',
        subject: 'Загальне оголошення',
        replyText: text,
        adminName: userProfile.username,
        date: dateStr,
        isBroadcast: true
    });
    localStorage.setItem('transverse_admin_history', JSON.stringify(adminHistory));

    broadcastModal.classList.add('hidden');
    renderAdminHistory();
    alert('Загальне повідомлення надіслано всім користувачам!');
});

function renderAdminHistory() {
    const historyList = document.getElementById('adminHistoryList');
    historyList.innerHTML = '';

    if (adminHistory.length === 0) {
        historyList.innerHTML = '<p style="color: var(--text-muted);">Історія відповідей порожня.</p>';
        return;
    }

    adminHistory.forEach((record, idx) => {
        const box = document.createElement('div');
        box.style.cssText = 'background: var(--bg-color); padding: 10px; margin-bottom: 8px; border-radius: 6px; border: 1px solid var(--border);';
        box.innerHTML = `
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
                <span>Кому: <strong>${record.targetUser}</strong> | Адмін: ${record.adminName}</span>
                <span>📅 ${record.date}</span>
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
        box.style.cssText = 'background: var(--bg-color); padding: 12px; border-radius: 8px; border: 1px solid var(--border);';
        box.innerHTML = `
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">📅 ${notif.date}</p>
            <p style="line-height: 1.4;">${notif.text}</p>
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