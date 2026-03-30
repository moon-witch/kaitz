export type DiaryEntry = {
    id: number | string;
    title: string;
    slug: string;
    content?: string | null;
    featured?: boolean | null;
    status?: string | null;
    date_created?: string | null;
};

export function useDiary() {
    return useAsyncData<DiaryEntry[]>("diary", () => $fetch("/api/diary"));
}
