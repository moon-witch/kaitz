export type NewsItem = {
    id: number | string;
    title: string;
    slug: string;
    content?: string | null;
    featured?: boolean | null;
    date_created?: string | null;
    date_updated?: string | null;
};

export function useNews() {
    return useAsyncData<NewsItem[]>("news", () => $fetch("/api/news"));
}
