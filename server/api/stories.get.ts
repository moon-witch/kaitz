import { directusFetch, publishedFilter } from "../utils/directus";

export default defineCachedEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
        const offset = (page - 1) * limit;

        const res = await directusFetch<{ data: any[] }>("/items/stories", {
            query: {
                ...publishedFilter(),
                sort: "sort_order",
                limit,
                offset,
                fields:
                    "id,title,slug,synopsis,featured,sort_order,date_created,date_updated,cover_image,theme,series",
            },
        });

        return res.data;
    } catch (err: any) {
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to fetch stories from Directus",
            data: { message: err?.message },
        });
    }
}, {
    maxAge: 60 * 5,
    getKey: (event) => {
        const q = getQuery(event);
        return `stories:p${q.page ?? 1}:l${q.limit ?? 20}`;
    },
});
