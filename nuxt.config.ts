// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
	modules: ["@nuxt/eslint", "@nuxtjs/shopify"],
	devtools: { enabled: true },
	css: ["./app/assets/css/main.css"],
	runtimeConfig: {
		shopifyStoreId: process.env.SHOPIFY_STORE_ID,
		shopifyCustomerAccountClientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID,
		shopifyCustomerAccountClientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET,
		shopifyCustomerAccountApiVersion: process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION || "2026-01",
		appUrl: process.env.APP_URL,
	},
	compatibilityDate: "2025-07-15",
	vite: {
		plugins: [
			tailwindcss(),
		],
	},
	eslint: {
		config: {
			stylistic: {
				semi: true,
				quotes: "double",
				commaDangle: "always-multiline",
				indent: "tab",
			},
		},
	},
	shopify: {
		name: process.env.SHOPIFY_NAME,
		clients: {
			storefront: {
				apiVersion: process.env.STOREFRONT_API_VERSION,
				publicAccessToken: process.env.STOREFRONT_PUBLIC_ACCESS_TOKEN,
			},

			// admin: {
			// 	apiVersion: "2026-01",
			// 	accessToken: "YOUR_ACCESS_TOKEN",
			// },
		},
	},
});
