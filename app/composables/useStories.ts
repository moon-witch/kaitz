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

export function useStories() {
    return useAsyncData<Story[]>("stories", () => $fetch("/api/stories"));
}
