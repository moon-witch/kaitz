import type { DiaryEntry } from "./useDiary";

export function useDiaryEntry(slug: string) {
    return useAsyncData<DiaryEntry>(
        `diary:${slug}`,
        () => $fetch(`/api/diary/${encodeURIComponent(slug)}`),
        { watch: [() => slug] }
    );
}
