import type { PaginationParams } from "./useStories";

export type DiaryEntry = {
    id: number | string;
    title: string;
    slug: string;
    content?: string | null;
    featured?: boolean | null;
    status?: string | null;
    date_created?: string | null;
};

export function useDiary(opts?: PaginationParams) {
    const page = opts?.page ?? 1;
    const limit = opts?.limit ?? 20;
    return useAsyncData<DiaryEntry[]>(
        `diary:p${page}:l${limit}`,
        () => $fetch("/api/diary", { query: { page, limit } })
    );
}
