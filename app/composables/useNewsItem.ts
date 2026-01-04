import type { NewsItem } from "./useNews";

export function useNewsItem(slug: string) {
    return useAsyncData<NewsItem>(
        `news:${slug}`,
        () => $fetch(`/api/news/${encodeURIComponent(slug)}`),
        { watch: [() => slug] }
    );
}
