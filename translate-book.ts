// @ts-nocheck
// ============================================================================
// Supabase Edge Function: translate-book
// Перекладає одну книгу (назва, опис, автор, назви й текст глав) з української
// на ОДНУ мову за виклик і зберігає результат у таблиці book_translations.
// Викликати може лише адміністратор (перевіряється функцією is_admin() у базі).
// Секрет, який потрібно додати в Supabase: GOOGLE_TRANSLATE_API_KEY
// ============================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const LANGS = { en: 'en', de: 'de', pl: 'pl', es: 'es', zh: 'zh-CN', hi: 'hi' };
const LATIN = new Set(['en', 'de', 'pl', 'es']);   // ім'я й прізвище автора транслітеруємо, а не перекладаємо
const MAX_CHARS = 600000;      // страховка від випадково величезних рахунків (на одну мову)
const PIECE_MAX = 4500;        // довші абзаци ріжемо по реченнях
const BATCH_MAX_ITEMS = 100;
const BATCH_MAX_CHARS = 20000;

function json(body, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

// ---- Транслітерація українських імен латиницею (правопис КМУ 2010) ----
const MAP = { 'а':'a','б':'b','в':'v','г':'h','ґ':'g','д':'d','е':'e','є':'ie','ж':'zh','з':'z','и':'y','і':'i','ї':'i','й':'i',
              'к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts',
              'ч':'ch','ш':'sh','щ':'shch','ь':'','ю':'iu','я':'ia' };
const INITIAL = { 'є':'ye','ї':'yi','й':'y','ю':'yu','я':'ya' };
function translit(text) {
    const src = String(text || '');
    let out = '';
    for (let i = 0; i < src.length; i++) {
        const ch = src[i];
        const low = ch.toLowerCase();
        const isUp = ch !== low;
        if (low === "'" || low === '’' || low === 'ʼ') continue;
        if (low === 'г' && i > 0 && src[i - 1].toLowerCase() === 'з') { out += isUp ? 'Gh' : 'gh'; continue; }
        const atStart = i === 0 || !/[\p{L}'’ʼ]/u.test(src[i - 1]);
        let rep = (atStart && INITIAL[low] !== undefined) ? INITIAL[low] : MAP[low];
        if (rep === undefined) { out += ch; continue; }
        if (isUp && rep) rep = rep[0].toUpperCase() + rep.slice(1);
        out += rep;
    }
    return out;
}

// ---- Розбиття надто довгих абзаців по реченнях ----
function splitLong(text) {
    if (text.length <= PIECE_MAX) return [text];
    const parts = [];
    let rest = text;
    while (rest.length > PIECE_MAX) {
        const window = rest.slice(0, PIECE_MAX);
        let cut = Math.max(window.lastIndexOf('. '), window.lastIndexOf('! '), window.lastIndexOf('? '), window.lastIndexOf('… '));
        if (cut < PIECE_MAX * 0.4) cut = window.lastIndexOf(' ');
        cut = cut <= 0 ? PIECE_MAX : cut + 1;
        parts.push(rest.slice(0, cut));
        rest = rest.slice(cut).replace(/^\s+/, '');
    }
    if (rest) parts.push(rest);
    return parts;
}

async function googleTranslate(batch, target, key) {
    for (let attempt = 0; attempt < 3; attempt++) {
        const res = await fetch('https://translation.googleapis.com/language/translate/v2?key=' + encodeURIComponent(key), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: batch, source: 'uk', target, format: 'text' }),
        });
        if (res.ok) {
            const j = await res.json();
            return j.data.translations.map((t) => t.translatedText);
        }
        if (res.status === 429 || res.status >= 500) {
            await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
            continue;
        }
        const t = await res.text();
        throw new Error('Сервіс перекладу відповів ' + res.status + ': ' + t.slice(0, 250));
    }
    throw new Error('Сервіс перекладу тимчасово недоступний, спробуйте пізніше.');
}

async function translateAll(pieces, target, key) {
    const result = new Array(pieces.length);
    let i = 0;
    while (i < pieces.length) {
        const batch = [];
        let chars = 0;
        const startIndex = i;
        while (i < pieces.length && batch.length < BATCH_MAX_ITEMS && (batch.length === 0 || chars + pieces[i].length <= BATCH_MAX_CHARS)) {
            batch.push(pieces[i]);
            chars += pieces[i].length;
            i++;
        }
        const out = await googleTranslate(batch, target, key);
        if (out.length !== batch.length) throw new Error('Сервіс перекладу повернув неповну відповідь.');
        out.forEach((t, k) => { result[startIndex + k] = t; });
    }
    return result;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
    try {
        const url = Deno.env.get('SUPABASE_URL');
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const googleKey = Deno.env.get('GOOGLE_TRANSLATE_API_KEY');
        if (!googleKey) return json({ error: 'У Supabase не додано секрет GOOGLE_TRANSLATE_API_KEY (Edge Functions → Secrets).' }, 500);

        // 1. Перевіряємо, що викликає саме адміністратор
        const authHeader = req.headers.get('Authorization') || '';
        const anonKey = req.headers.get('apikey') || Deno.env.get('SUPABASE_ANON_KEY');
        const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
        const { data: isAdmin, error: adminErr } = await userClient.rpc('is_admin');
        if (adminErr || isAdmin !== true) return json({ error: 'Лише для адміністратора.' }, 403);

        // 2. Параметри
        const body = await req.json().catch(() => ({}));
        const bookId = Number(body.book_id);
        const lang = String(body.lang || '');
        if (!Number.isFinite(bookId) || !LANGS[lang]) return json({ error: 'Невірні параметри запиту.' }, 400);

        // 3. Книга (читаємо з повними правами)
        const admin = createClient(url, serviceKey);
        const { data: book, error: bookErr } = await admin
            .from('books')
            .select('id, title, description, author_name, author_surname, chapters')
            .eq('id', bookId)
            .maybeSingle();
        if (bookErr || !book) return json({ error: 'Книгу не знайдено.' }, 404);

        // 4. Збираємо тексти для перекладу
        const items = [];                                   // цілі тексти
        const add = (text) => { items.push(String(text || '')); return items.length - 1; };
        const latin = LATIN.has(lang);

        const idxTitle = add(book.title);
        const idxDesc = add(book.description);
        const idxName = latin ? -1 : add(book.author_name);
        const idxSurname = latin ? -1 : add(book.author_surname);

        const chapters = Array.isArray(book.chapters) ? book.chapters : [];
        const chapPlan = chapters.map((ch) => {
            const lines = String(ch && ch.content || '').split('\n');
            return {
                titleIdx: add(ch && ch.title),
                lines,
                lineIdx: lines.map((l) => (l.trim() ? add(l) : -1)),
            };
        });

        // 5. Ріжемо довгі абзаци й рахуємо обсяг
        const pieces = [];
        const owner = [];
        items.forEach((text, idx) => {
            if (!text.trim()) return;
            splitLong(text).forEach((p) => { pieces.push(p); owner.push(idx); });
        });
        const totalChars = pieces.reduce((s, p) => s + p.length, 0);
        if (totalChars > MAX_CHARS) {
            return json({ error: 'Твір завеликий для автоматичного перекладу (' + totalChars + ' символів, ліміт ' + MAX_CHARS + ').' }, 413);
        }

        // 6. Переклад
        const translatedPieces = await translateAll(pieces, LANGS[lang], googleKey);
        const joined = items.map(() => []);
        translatedPieces.forEach((t, k) => joined[owner[k]].push(t));
        const tr = (idx) => (idx < 0 ? '' : (items[idx].trim() ? joined[idx].join(' ') : items[idx]));

        const row = {
            book_id: bookId,
            lang,
            title: tr(idxTitle),
            description: tr(idxDesc),
            author_name: latin ? translit(book.author_name) : tr(idxName),
            author_surname: latin ? translit(book.author_surname) : tr(idxSurname),
            chapters: chapPlan.map((cp) => ({
                title: tr(cp.titleIdx),
                content: cp.lines.map((l, k) => (cp.lineIdx[k] < 0 ? l : tr(cp.lineIdx[k]))).join('\n'),
            })),
            chars: totalChars,
            translated_at: new Date().toISOString(),
        };

        const { error: saveErr } = await admin.from('book_translations').upsert(row, { onConflict: 'book_id,lang' });
        if (saveErr) return json({ error: 'Не вдалося зберегти переклад: ' + saveErr.message }, 500);

        return json({ ok: true, lang, chars: totalChars });
    } catch (e) {
        return json({ error: String(e && e.message || e) }, 500);
    }
});
