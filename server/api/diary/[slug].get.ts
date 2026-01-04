import { directusFetch, publishedFilter } from "../../utils/directus";

export default defineEventHandler(async (event) => {
    try {
        const slug = getRouterParam(event, "slug");
        if (!slug) {
            throw createError({ statusCode: 400, statusMessage: "Missing diary slug" });
        }

        const res = await directusFetch<{ data: any[] }>("/items/diary_entries", {
            query: {
                ...publishedFilter(),
                "filter[slug][_eq]": slug,
                limit: 1,
                fields: "id,title,slug,content,featured,mood_tag,date_created,date_updated,status",
            },
        });

        const entry = res.data?.[0];
        if (!entry) {
            throw createError({ statusCode: 404, statusMessage: "Diary entry not found" });
        }

        return entry;
    } catch (err: any) {
        if (err?.statusCode) throw err;
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to fetch diary entry from Directus",
            data: { message: err?.message },
        });
    }
});
