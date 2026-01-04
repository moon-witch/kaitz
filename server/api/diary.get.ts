import { directusFetch, publishedFilter } from "../utils/directus";

export default defineEventHandler(async () => {
    try {
        const res = await directusFetch<{ data: any[] }>("/items/diary_entries", {
            query: {
                ...publishedFilter(),
                sort: "-date_created",
                limit: 10,
                fields: "id,title,slug,content,featured,date_created",
            },
        });

        return res.data;
    } catch (err: any) {
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to fetch diary entries from Directus",
            data: {
                message: err?.message,
            },
        });
    }
});
