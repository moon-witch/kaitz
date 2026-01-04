import type { NitroFetchOptions, NitroFetchRequest } from "nitropack";

type Query = Record<string, string | number | boolean | undefined | null>;

export function getDirectusUrl(): string {
    const config = useRuntimeConfig();
    const url = config.public?.directusUrl;

    if (!url) {
        // This is the most common reason for your 500 in Phase 2
        throw new Error("runtimeConfig.public.directusUrl is missing. Ensure DIRECTUS_URL is set and restart Nuxt.");
    }

    return String(url).replace(/\/+$/, "");
}

function normalizeQuery(query?: Query): Record<string, string> | undefined {
    if (!query) return undefined;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null) continue;
        out[k] = String(v);
    }
    return out;
}

export async function directusFetch<T>(
    path: `/${string}`,
    opts: { query?: Query; options?: NitroFetchOptions<NitroFetchRequest> } = {}
): Promise<T> {
    const url = `${getDirectusUrl()}${path}`;

    return await $fetch<T>(url, {
        ...opts.options,
        query: normalizeQuery(opts.query),
        headers: {
            "Content-Type": "application/json",
            ...(opts.options?.headers as Record<string, string> | undefined),
        },
    });
}

export function publishedFilter() {
    return { "filter[status][_eq]": "published" } as const;
}
