export type Chapter = {
    id: number | string;
    story?: number | string;
    chapter_number: number;
    title: string;
    slug: string;
    content?: string | null; // WYSIWYG HTML
    excerpt?: string | null;
    date_created?: string | null;
    date_updated?: string | null;
};

export function useChapter(storySlug: string, chapterNumber: number) {
    return useAsyncData<Chapter>(
        `chapter:${storySlug}:${chapterNumber}`,
        () =>
            $fetch(
                `/api/stories/${encodeURIComponent(storySlug)}/chapters/${encodeURIComponent(
                    String(chapterNumber)
                )}`
            ),
        { watch: [() => storySlug, () => chapterNumber] }
    );
}
