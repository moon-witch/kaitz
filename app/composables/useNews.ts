import type { PaginationParams } from "./useStories";

export type NewsItem = {
    id: number | string;
    title: string;
    slug: string;
    content?: string | null;
    featured?: boolean | null;
    date_created?: string | null;
    date_updated?: string | null;
};

export function useNews(opts?: PaginationParams) {
    const page = opts?.page ?? 1;
    const limit = opts?.limit ?? 20;
    return useAsyncData<NewsItem[]>(
        `news:p${page}:l${limit}`,
        () => $fetch("/api/news", { query: { page, limit } })
    );
}
