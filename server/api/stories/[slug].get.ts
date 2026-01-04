import { directusFetch, publishedFilter } from "../../utils/directus";

export default defineEventHandler(async (event) => {
    try {
        const slug = getRouterParam(event, "slug");
        if (!slug) {
            throw createError({ statusCode: 400, statusMessage: "Missing story slug" });
        }

        const res = await directusFetch<{ data: any[] }>("/items/stories", {
            query: {
                ...publishedFilter(),
                "filter[slug][_eq]": slug,
                limit: 1,
                fields:
                    "id,title,slug,synopsis,featured,sort_order,date_created,date_updated,cover_image,theme,series,status",
            },
        });

        const story = res.data?.[0];
        if (!story) {
            throw createError({ statusCode: 404, statusMessage: "Story not found" });
        }

        return story;
    } catch (err: any) {
        if (err?.statusCode) throw err;
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to fetch story from Directus",
            data: { message: err?.message },
        });
    }
});
