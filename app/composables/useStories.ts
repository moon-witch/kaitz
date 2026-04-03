export type Story = {
    id: number | string;
    title: string;
    slug: string;
    synopsis?: string | null;
    featured?: boolean | null;
    sort_order?: number | null;
    date_created?: string | null;
    date_updated?: string | null;
    cover_image?: any;
    theme?: number | string | null;
    series?: number | string | null;
};

export type PaginationParams = {
    page?: number;
    limit?: number;
};

export function useStories(opts?: PaginationParams) {
    const page = opts?.page ?? 1;
    const limit = opts?.limit ?? 20;
    return useAsyncData<Story[]>(
        `stories:p${page}:l${limit}`,
        () => $fetch("/api/stories", { query: { page, limit } })
    );
}
