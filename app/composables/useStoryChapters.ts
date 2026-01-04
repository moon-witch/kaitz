export type ChapterSummary = {
    id: number | string;
    story?: number | string;
    chapter_number: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    date_created?: string | null;
    date_updated?: string | null;
};

export function useStoryChapters(storySlug: string) {
    return useAsyncData<ChapterSummary[]>(
        `chapters:${storySlug}`,
        () => $fetch(`/api/stories/${encodeURIComponent(storySlug)}/chapters`),
        { watch: [() => storySlug] }
    );
}
