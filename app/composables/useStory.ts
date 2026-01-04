import type { Story } from "./useStories";

export function useStory(slug: string) {
    return useAsyncData<Story>(
        `story:${slug}`,
        () => $fetch(`/api/stories/${encodeURIComponent(slug)}`),
        { watch: [() => slug] }
    );
}
