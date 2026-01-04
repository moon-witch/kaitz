export type DiaryEntry = {
    id: number | string;
    title: string;
    slug: string;
    content?: string | null;
    mood_tag?: string | null;
    featured?: boolean | null;
    date_created?: string | null;
    date_updated?: string | null;
};

export function useDiary() {
    return useAsyncData<DiaryEntry[]>("diary", () => $fetch("/api/diary"));
}
