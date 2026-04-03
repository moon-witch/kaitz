import { directusFetch, publishedFilter } from "../../../utils/directus";

export default defineCachedEventHandler(async (event) => {
    try {
        const storySlug = getRouterParam(event, "slug");
        if (!storySlug) {
            throw createError({ statusCode: 400, statusMessage: "Missing story slug" });
        }

        const res = await directusFetch<{ data: any[] }>("/items/chapters", {
            query: {
                ...publishedFilter(),
                "filter[story][slug][_eq]": storySlug,
                sort: "chapter_number",
                fields: "id,story,chapter_number,title,slug,status",
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
}, {
    maxAge: 60 * 5,
    getKey: (event) => `chapters:${getRouterParam(event, "slug")}`,
});
