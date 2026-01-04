import { directusFetch, publishedFilter } from "../../utils/directus";

export default defineEventHandler(async (event) => {
    try {
        const slug = getRouterParam(event, "slug");
        if (!slug) {
            throw createError({ statusCode: 400, statusMessage: "Missing news slug" });
        }

        const res = await directusFetch<{ data: any[] }>("/items/news", {
            query: {
                ...publishedFilter(),
                "filter[slug][_eq]": slug,
                limit: 1,
                fields: "id,title,slug,content,featured,date_created,date_updated,status",
            },
        });

        const item = res.data?.[0];
        if (!item) {
            throw createError({ statusCode: 404, statusMessage: "News item not found" });
        }

        return item;
    } catch (err: any) {
        if (err?.statusCode) throw err;
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to fetch news item from Directus",
            data: { message: err?.message },
        });
    }
});
