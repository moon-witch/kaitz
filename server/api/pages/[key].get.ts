import { directusFetch, publishedFilter } from "../../utils/directus";

export default defineEventHandler(async (event) => {
    try {
        const key = getRouterParam(event, "key");
        if (!key) {
            throw createError({ statusCode: 400, statusMessage: "Missing page key" });
        }

        const res = await directusFetch<{ data: any[] }>("/items/pages", {
            query: {
                ...publishedFilter(),
                "filter[key][_eq]": key,
                limit: 1,
                fields: "id,key,title,content,status,date_created,date_updated",
            },
        });

        const page = res.data?.[0];
        if (!page) {
            throw createError({ statusCode: 404, statusMessage: "Page not found" });
        }

        return page;
    } catch (err: any) {
        if (err?.statusCode) throw err;
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to fetch page from Directus",
            data: { message: err?.message },
        });
    }
});
