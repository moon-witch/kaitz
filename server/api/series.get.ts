import { directusFetch, publishedFilter } from "../utils/directus";

export default defineEventHandler(async () => {
    try {
        const res = await directusFetch<{ data: any[] }>("/items/series", {
            query: {
                ...publishedFilter(),
                sort: "sort_order",
                fields: "id,title,slug,type,synopsis,cover_image,sort_order,date_created,date_updated,status",
            },
        });

        return res.data;
    } catch (err: any) {
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to fetch series from Directus",
            data: { message: err?.message },
        });
    }
});
