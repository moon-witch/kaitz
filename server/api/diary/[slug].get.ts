import { directusFetch } from "../../utils/directus";
import { sanitizeContent } from "../../utils/sanitize";

export default defineCachedEventHandler(async (event) => {
    try {
        const slug = getRouterParam(event, "slug");
        if (!slug) {
            throw createError({ statusCode: 400, statusMessage: "Missing diary slug" });
        }

        const res = await directusFetch<{ data: any[] }>("/items/diary_entries", {
            query: {
                "filter[slug][_eq]": slug,
                limit: 1,
                fields: "id,title,slug,content,featured,status,date_created",
            },
        });

        const entry = res.data?.[0];
        if (!entry) {
            throw createError({ statusCode: 404, statusMessage: "Diary entry not found" });
        }

        return {
            ...entry,
            content: sanitizeContent(entry.content),
        };
    } catch (err: any) {
        if (err?.statusCode) throw err;
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to fetch diary entry from Directus",
            data: { message: err?.message },
        });
    }
}, {
    maxAge: 60 * 5,
    getKey: (event) => `diary-entry:${getRouterParam(event, "slug")}`,
});
