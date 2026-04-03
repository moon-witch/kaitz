import { directusFetch } from "../utils/directus";
import { sanitizeContent } from "../utils/sanitize";

export default defineCachedEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
        const offset = (page - 1) * limit;

        const res = await directusFetch<{ data: any[] }>("/items/diary_entries", {
            query: {
                sort: "-date_created",
                limit,
                offset,
                fields: "id,title,slug,content,featured,date_created",
            },
        });

        return (res.data ?? []).map((entry: any) => ({
            ...entry,
            content: sanitizeContent(entry.content),
        }));
    } catch (err: any) {
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to fetch diary entries from Directus",
            data: { message: err?.message },
        });
    }
}, {
    maxAge: 60 * 5,
    getKey: (event) => {
        const q = getQuery(event);
        return `diary:p${q.page ?? 1}:l${q.limit ?? 20}`;
    },
});
