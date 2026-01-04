import svgLoader from "vite-svg-loader";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    typescript: { strict: true },
    app: {
        head: {
            htmlAttrs: { lang: "de" },
            meta: [
                { name: "viewport", content: "width=device-width, initial-scale=1" },
            ],
        },
    },
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    css: ['~/assets/styles/main.scss'],
    vite: {
        plugins: [
            svgLoader({
                // Ensures `?component` works and preserves IDs
                svgo: false,
            }),
        ],
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `
                        @use "~/assets/styles/_mixins.scss" as *; 
                        @use "~/assets/styles/_variables.scss" as *;
                        `,
                },
            },
        },
    },
    runtimeConfig: {
        // private (server-only)
        directusAdminToken: process.env.DIRECTUS_ADMIN_TOKEN,
        // public (browser + server)
        public: {
            directusUrl: process.env.DIRECTUS_URL,
        },
    },
})
