export type Series = {
    id: number | string;
    title: string;
    slug: string;
    type?: string | null;
    synopsis?: string | null;
    cover_image?: any;
    sort_order?: number | null;
    date_created?: string | null;
    date_updated?: string | null;
};

export function useSeries() {
    return useAsyncData<Series[]>("series", () => $fetch("/api/series"));
}
