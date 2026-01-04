// File: scripts/seed-directus.mjs
//
// Purpose:
// - Seed local dev content into Directus (WYSIWYG/HTML content strings).
// - Also supports deleting everything the script created (reset).
//
// Usage:
//   Seed:   node scripts/seed-directus.mjs
//   Reset:  node scripts/seed-directus.mjs --reset
//
// Requires env vars:
//   DIRECTUS_URL
//   DIRECTUS_ADMIN_TOKEN
//
// Assumptions about your schema:
// - Collections: themes, series, stories, chapters, news, diary_entries, pages, comments
// - WYSIWYG fields store HTML strings (content: string).
// - status enums:
//   - series/stories/chapters/news/diary_entries/pages: draft|published
//   - comments: unchecked|checked (default unchecked)

const DIRECTUS_URL = process.env.DIRECTUS_URL;
const DIRECTUS_ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
const RESET = process.argv.includes("--reset");

if (!DIRECTUS_URL || !DIRECTUS_ADMIN_TOKEN) {
    console.error("Missing DIRECTUS_URL or DIRECTUS_ADMIN_TOKEN.");
    process.exit(1);
}

const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${DIRECTUS_ADMIN_TOKEN}`,
};

async function http(path, init) {
    const res = await fetch(`${DIRECTUS_URL}${path}`, {
        ...init,
        headers: { ...headers, ...(init?.headers || {}) },
    });

    const text = await res.text();
    const json = text ? JSON.parse(text) : null;

    if (!res.ok) {
        console.error(`HTTP ${res.status} ${res.statusText} for ${path}`);
        console.error(JSON.stringify(json, null, 2));
        throw new Error(`Directus request failed: ${path}`);
    }

    return json;
}

function qs(params) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (Array.isArray(v)) v.forEach((vv) => sp.append(k, vv));
        else sp.set(k, v);
    }
    return sp.toString();
}

async function getByUnique(collection, uniqueField, uniqueValue, fields = ["id"]) {
    const query = qs({
        limit: "1",
        "fields[]": fields,
        [`filter[${uniqueField}][_eq]`]: uniqueValue,
    });
    const out = await http(`/items/${collection}?${query}`);
    return out?.data?.[0] ?? null;
}

async function listByIn(collection, field, values, fields = ["id", field]) {
    if (!values.length) return [];
    const query = qs({
        limit: String(Math.min(values.length, 500)),
        "fields[]": fields,
        [`filter[${field}][_in]`]: values.join(","),
    });
    const out = await http(`/items/${collection}?${query}`);
    return out?.data ?? [];
}

async function createItem(collection, data) {
    const out = await http(`/items/${collection}`, {
        method: "POST",
        body: JSON.stringify(data),
    });
    return out.data;
}

async function updateItem(collection, id, data) {
    const out = await http(`/items/${collection}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    return out.data;
}

async function deleteItem(collection, id) {
    await http(`/items/${collection}/${id}`, { method: "DELETE" });
}

async function upsertByUnique(collection, uniqueField, uniqueValue, data, returnFields = ["id", uniqueField]) {
    const existing = await getByUnique(collection, uniqueField, uniqueValue, ["id", uniqueField]);
    if (!existing) {
        await createItem(collection, { ...data, [uniqueField]: uniqueValue });
    } else {
        await updateItem(collection, existing.id, data);
    }
    const fetched = await getByUnique(collection, uniqueField, uniqueValue, returnFields);
    if (!fetched) throw new Error(`Upsert failed to fetch ${collection}.${uniqueField}=${uniqueValue}`);
    return fetched;
}

function nowISO() {
    return new Date().toISOString();
}

function stripHtml(html) {
    return String(html || "")
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<\/p>/gi, " ")
        .replace(/<\/h\d>/gi, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Seed identifiers for idempotency and reset.
 * Update these if you change slugs/keys.
 */
const SEED = {
    themes: ["archive-of-mist", "moonlit-codex"],
    series: ["the-three-seals"],
    stories: ["the-archivists-lantern", "ink-and-moonwater"],
    chapters: [
        "the-archivists-lantern--c01-die-tueren-atmen",
        "the-archivists-lantern--c02-marginalien",
        "the-archivists-lantern--c03-das-pergamentfenster",
        "the-archivists-lantern--c04-regal-13",
        "the-archivists-lantern--c05-die-laterne",
        "ink-and-moonwater--c01-mondwasser",
        "ink-and-moonwater--c02-die-glasschrift",
    ],
    news: ["archive-opens", "rune-compass", "chapter-pipeline"],
    diary: ["desk-notes-1", "moon-margin", "library-sound"],
    pages: ["about", "imprint", "privacy"],
};

async function resetAll() {
    console.log("Reset mode: deleting seeded items…");

    // Fetch seeded chapters (for comment cleanup)
    const seededChapters = await listByIn("chapters", "slug", SEED.chapters, ["id", "slug"]);
    const chapterIds = seededChapters.map((c) => c.id);

    // Delete comments linked to seeded chapters (dev cleanup)
    if (chapterIds.length) {
        const query = qs({
            limit: "500",
            "fields[]": ["id"],
            [`filter[chapter][_in]`]: chapterIds.join(","),
        });
        const out = await http(`/items/comments?${query}`);
        const commentIds = (out?.data ?? []).map((c) => c.id);

        for (const id of commentIds) {
            await deleteItem("comments", id);
        }
        console.log(`Deleted comments: ${commentIds.length}`);
    }

    // Delete chapters
    for (const ch of seededChapters) {
        await deleteItem("chapters", ch.id);
    }
    console.log(`Deleted chapters: ${seededChapters.length}`);

    // Delete stories
    const seededStories = await listByIn("stories", "slug", SEED.stories, ["id", "slug"]);
    for (const s of seededStories) {
        await deleteItem("stories", s.id);
    }
    console.log(`Deleted stories: ${seededStories.length}`);

    // Delete series
    const seededSeries = await listByIn("series", "slug", SEED.series, ["id", "slug"]);
    for (const s of seededSeries) {
        await deleteItem("series", s.id);
    }
    console.log(`Deleted series: ${seededSeries.length}`);

    // Delete themes
    const seededThemes = await listByIn("themes", "slug", SEED.themes, ["id", "slug"]);
    for (const t of seededThemes) {
        await deleteItem("themes", t.id);
    }
    console.log(`Deleted themes: ${seededThemes.length}`);

    // Delete news
    const seededNews = await listByIn("news", "slug", SEED.news, ["id", "slug"]);
    for (const n of seededNews) {
        await deleteItem("news", n.id);
    }
    console.log(`Deleted news: ${seededNews.length}`);

    // Delete diary entries
    const seededDiary = await listByIn("diary_entries", "slug", SEED.diary, ["id", "slug"]);
    for (const d of seededDiary) {
        await deleteItem("diary_entries", d.id);
    }
    console.log(`Deleted diary entries: ${seededDiary.length}`);

    // Delete pages (by key)
    const seededPages = await listByIn("pages", "key", SEED.pages, ["id", "key"]);
    for (const p of seededPages) {
        await deleteItem("pages", p.id);
    }
    console.log(`Deleted pages: ${seededPages.length}`);

    console.log("Reset completed.");
}

async function seedAll() {
    console.log("Seeding Directus (WYSIWYG HTML) …");
    console.log(`Directus: ${DIRECTUS_URL}`);

    // THEMES
    const themeArchive = await upsertByUnique("themes", "slug", "archive-of-mist", {
        name: "Archiv des Nebels",
        description: "Ein stilles Regalwerk aus violettem Mondlicht, Staub und Erinnerung.",
        accent_color: "#b042c9",
        sort_order: 10,
        is_active: true,
    });

    const themeMoon = await upsertByUnique("themes", "slug", "moonlit-codex", {
        name: "Mondkodex",
        description: "Kalte Seiten, silbrige Tinte, leise Runen — Geschichten unter dem Mond.",
        accent_color: "#7a3cff",
        sort_order: 20,
        is_active: true,
    });

    // SERIES
    const trilogy = await upsertByUnique("series", "slug", "the-three-seals", {
        title: "Die Drei Siegel",
        type: "trilogy",
        synopsis: "Drei Bände. Drei Siegel. Und ein Archiv, das sich erinnert, bevor du es tust.",
        sort_order: 10,
        status: "published",
        published_at: nowISO(),
    });

    // STORIES
    const storyA = await upsertByUnique("stories", "slug", "the-archivists-lantern", {
        title: "Die Laterne des Archivars",
        theme: themeArchive.id,
        series: trilogy.id,
        synopsis:
            "Eine Laterne brennt ohne Öl. Ein Gang endet ohne Wand. Und jedes Kapitel öffnet eine Tür, die nicht existieren sollte.",
        status: "published",
        featured: true,
        sort_order: 10,
        published_at: nowISO(),
    });

    const storyB = await upsertByUnique("stories", "slug", "ink-and-moonwater", {
        title: "Tinte und Mondwasser",
        theme: themeMoon.id,
        series: null,
        synopsis: "Eine Chronistin, die nur nachts schreiben kann — weil die Worte bei Tageslicht verschwinden.",
        status: "published",
        featured: false,
        sort_order: 20,
        published_at: nowISO(),
    });

    // CHAPTERS (WYSIWYG HTML strings)
    // NOTE:
    // For idempotent seed + reset, this script uses globally-unique slugs (storySlug--chapterSlug) stored in chapters.slug.
    // For frontend routing, prefer:
    // - Route by chapter_number OR
    // - Add an extra field "display_slug" to chapters and store the clean slug there.
    const chapters = [
        {
            storyId: storyA.id,
            slug: `${storyA.slug}--c01-die-tueren-atmen`,
            chapter_number: 1,
            title: "Die Türen atmen",
            html: `<h2>Die Türen atmen</h2>
<p>Der Nebel lag nicht <strong>vor</strong> dem Archiv, sondern <strong>in</strong> ihm — als hätte das Gebäude Lungen.</p>
<blockquote><p>Manche Räume sind älter als ihre eigenen Schlüssel.</p></blockquote>
<p>Ein leises Klicken, dann das Geräusch von Holz, das sich erinnert…</p>`,
            status: "published",
        },
        {
            storyId: storyA.id,
            slug: `${storyA.slug}--c02-marginalien`,
            chapter_number: 2,
            title: "Marginalien",
            html: `<h2>Marginalien</h2>
<p>Am Rand der Seite stand eine Notiz, die gestern noch nicht da gewesen war:</p>
<p><em>„Lies langsamer.“</em></p>
<p>Als ich mich umsah, war niemand im Saal. Nur die Kerze flackerte, als würde sie nicken.</p>`,
            status: "published",
        },
        {
            storyId: storyA.id,
            slug: `${storyA.slug}--c03-das-pergamentfenster`,
            chapter_number: 3,
            title: "Das Pergamentfenster",
            html: `<h2>Das Pergamentfenster</h2>
<p>Ein Fenster aus Pergament, gespannt wie Haut.</p>
<p>Dahinter: der Mond, aber <strong>falsch</strong> — als hätte jemand ihn aus Tinte nachgezogen.</p>`,
            status: "draft",
        },
        {
            storyId: storyA.id,
            slug: `${storyA.slug}--c04-regal-13`,
            chapter_number: 4,
            title: "Regal 13",
            html: `<h2>Regal 13</h2>
<p>Das Regal war leer, bis ich blinzelte.</p>
<p>Dann stand dort ein Buch, das meinen Namen kannte.</p>`,
            status: "draft",
        },
        {
            storyId: storyA.id,
            slug: `${storyA.slug}--c05-die-laterne`,
            chapter_number: 5,
            title: "Die Laterne",
            html: `<h2>Die Laterne</h2>
<p>Die Flamme war violett.</p>
<p>Und sie warf Schatten, die ich nicht besaß.</p>`,
            status: "draft",
        },
        {
            storyId: storyB.id,
            slug: `${storyB.slug}--c01-mondwasser`,
            chapter_number: 1,
            title: "Mondwasser",
            html: `<h2>Mondwasser</h2>
<p>Wenn ich tagsüber schreibe, trocknet die Tinte zu Staub.</p>
<p>Nachts wird sie zu einem Fluss.</p>`,
            status: "published",
        },
        {
            storyId: storyB.id,
            slug: `${storyB.slug}--c02-die-glasschrift`,
            chapter_number: 2,
            title: "Die Glasschrift",
            html: `<h2>Die Glasschrift</h2>
<p>Im Fensterglas stand ein Satz, den niemand eingeritzt hatte.</p>
<p>Er glänzte, als wäre er schon immer dort gewesen.</p>`,
            status: "draft",
        },
    ];

    for (const ch of chapters) {
        await upsertByUnique("chapters", "slug", ch.slug, {
            story: ch.storyId,
            chapter_number: ch.chapter_number,
            title: ch.title,
            content: ch.html,
            excerpt: stripHtml(ch.html).slice(0, 160),
            status: ch.status,
            published_at: ch.status === "published" ? nowISO() : null,
        });
    }

    // NEWS
    const newsItems = [
        {
            slug: "archive-opens",
            title: "Das Archiv öffnet seine Türen",
            html: `<p>Die ersten Regale sind katalogisiert. Die Laternen sind angezündet. Bald folgen neue Kapitel.</p>`,
            featured: true,
            status: "published",
        },
        {
            slug: "rune-compass",
            title: "Runenkompass: Navigation als Sigill",
            html: `<p>Die Navigation wird als arkaner Kompass umgesetzt. Fokus: Tastaturbedienung und reduzierte Bewegung.</p>`,
            featured: false,
            status: "published",
        },
        {
            slug: "chapter-pipeline",
            title: "Kapitel-Pipeline eingerichtet",
            html: `<p>Kapitel werden als eigenständige Artefakte behandelt: SEO, Open Graph, Lesbarkeit zuerst.</p>`,
            featured: false,
            status: "draft",
        },
    ];

    for (const n of newsItems) {
        await upsertByUnique("news", "slug", n.slug, {
            title: n.title,
            content: n.html,
            featured: n.featured,
            status: n.status,
            published_at: n.status === "published" ? nowISO() : null,
        });
    }

    // DIARY
    const diaryItems = [
        {
            slug: "desk-notes-1",
            title: "Notizen am Schreibtisch",
            mood_tag: "fog",
            html: `<p>Heute fühlt sich das Projekt an wie ein Raum, der sich erst beim Betreten entscheidet, wie groß er ist.</p>`,
            featured: true,
            status: "published",
        },
        {
            slug: "moon-margin",
            title: "Randnotiz unter Mondlicht",
            mood_tag: "new_moon",
            html: `<p>Ich möchte, dass die Website nicht nur Inhalte zeigt, sondern eine Stimmung hält — wie ein altes Buch.</p>`,
            featured: false,
            status: "published",
        },
        {
            slug: "library-sound",
            title: "Geräusche der Bibliothek",
            mood_tag: "ink",
            html: `<p>Leises Umblättern, Holzknacken, Stoff. Optionaler Sound später; standardmäßig aus.</p>`,
            featured: false,
            status: "draft",
        },
    ];

    for (const d of diaryItems) {
        await upsertByUnique("diary_entries", "slug", d.slug, {
            title: d.title,
            content: d.html,
            mood_tag: d.mood_tag,
            featured: d.featured,
            status: d.status,
            published_at: d.status === "published" ? nowISO() : null,
        });
    }

    // PAGES
    const pages = [
        { key: "about", title: "Über", status: "published", html: `<p>Kurzprofil des Autors. (Platzhalter)</p>` },
        { key: "imprint", title: "Impressum", status: "draft", html: `<p>Impressum. (Platzhalter)</p>` },
        { key: "privacy", title: "Datenschutz", status: "draft", html: `<p>Datenschutzerklärung. (Platzhalter)</p>` },
    ];

    for (const p of pages) {
        await upsertByUnique("pages", "key", p.key, {
            title: p.title,
            content: p.html,
            status: p.status,
        });
    }

    console.log("Seed completed successfully.");
}

(async () => {
    if (RESET) await resetAll();
    else await seedAll();
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
