export type Page = {
    id: number | string;
    key: string;
    title: string;
    content?: string | null;
    date_created?: string | null;
    date_updated?: string | null;
};

export function usePage(key: string) {
    return useAsyncData<Page>(
        `page:${key}`,
        () => $fetch(`/api/pages/${encodeURIComponent(key)}`),
        { watch: [() => key] }
    );
}
