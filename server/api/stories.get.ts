import { directusFetch, publishedFilter } from "../utils/directus";

export default defineEventHandler(async () => {
    try {
        const res = await directusFetch<{ data: any[] }>("/items/stories", {
            query: {
                ...publishedFilter(),
                sort: "sort_order",
                fields:
                    "id,title,slug,synopsis,featured,sort_order,date_created,date_updated,cover_image,theme,series",
            },
        });

        return res.data;
    } catch (err: any) {
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to fetch stories from Directus",
            data: {
                message: err?.message,
            },
        });
    }
});
