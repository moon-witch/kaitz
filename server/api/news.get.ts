import { directusFetch, publishedFilter } from "../utils/directus";

export default defineEventHandler(async () => {
    try {
        const res = await directusFetch<{ data: any[] }>("/items/news", {
            query: {
                ...publishedFilter(),
                sort: "-date_created",
                limit: 10,
                fields: "id,title,slug,content,featured,date_created,date_updated",
            },
        });
        return res.data;
    } catch (err: any) {
        // Surface a readable server error instead of an opaque 500
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to fetch news from Directus",
            data: {
                message: err?.message,
            },
        });
    }
});
