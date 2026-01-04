export type Theme = {
    id: number | string;
    name: string;
    slug: string;
    description?: string | null;
    accent_color_hex?: string | null;
    rune_icon?: any;
    sort_order?: number | null;
};

export function useThemes() {
    return useAsyncData<Theme[]>("themes", () => $fetch("/api/themes"));
}
