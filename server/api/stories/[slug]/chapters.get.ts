import { directusFetch, publishedFilter } from "../../../utils/directus";

export default defineEventHandler(async (event) => {
    try {
        const storySlug = getRouterParam(event, "slug");
        if (!storySlug) {
            throw createError({ statusCode: 400, statusMessage: "Missing story slug" });
        }

        // Query chapters by related story.slug
        const res = await directusFetch<{ data: any[] }>("/items/chapters", {
            query: {
                ...publishedFilter(),
                "filter[story][slug][_eq]": storySlug,
                sort: "chapter_number",
                fields: "id,story,chapter_number,title,slug,excerpt,date_created,date_updated,status",
            },
        });

        return res.data;
    } catch (err: any) {
        if (err?.statusCode) throw err;
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to fetch chapters from Directus",
            data: { message: err?.message },
        });
    }
});
