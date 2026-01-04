import { directusFetch, publishedFilter } from "../../../../utils/directus";

export default defineEventHandler(async (event) => {
    try {
        const storySlug = getRouterParam(event, "slug");
        const numStr = getRouterParam(event, "number");

        if (!storySlug || !numStr) {
            throw createError({ statusCode: 400, statusMessage: "Missing story slug or chapter number" });
        }

        const chapterNumber = Number(numStr);
        if (!Number.isFinite(chapterNumber)) {
            throw createError({ statusCode: 400, statusMessage: "Invalid chapter number" });
        }

        const res = await directusFetch<{ data: any[] }>("/items/chapters", {
            query: {
                ...publishedFilter(),
                "filter[story][slug][_eq]": storySlug,
                "filter[chapter_number][_eq]": chapterNumber,
                limit: 1,
                fields:
                    "id,story,chapter_number,title,slug,content,excerpt,date_created,date_updated,status",
            },
        });

        const chapter = res.data?.[0];
        if (!chapter) {
            throw createError({ statusCode: 404, statusMessage: "Chapter not found" });
        }

        return chapter;
    } catch (err: any) {
        if (err?.statusCode) throw err;
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to fetch chapter from Directus",
            data: { message: err?.message },
        });
    }
});
