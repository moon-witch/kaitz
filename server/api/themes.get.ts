import { directusFetch } from "../utils/directus";

export default defineEventHandler(async () => {
    try {
        const res = await directusFetch<{ data: any[] }>("/items/themes", {
            query: {
                "filter[is_active][_eq]": "true",
                sort: "sort_order",
                fields: "id,name,slug,description,accent_color_hex,rune_icon,sort_order",
            },
        });

        return res.data;
    } catch (err: any) {
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to fetch themes from Directus",
            data: {
                message: err?.message,
            },
        });
    }
});
