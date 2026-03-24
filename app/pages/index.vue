<script setup lang="ts">
const storefront = useStorefront();

const { data, error } = await useAsyncData("products", () =>
	storefront.request(`#graphql
		query FetchProducts($first: Int) {
			products(first: $first) {
				nodes {
					id
					title
					description
				}
			}
		}
	`, {
		variables: {
			first: 10,
		},
	}),
);
</script>

<template>
	<div class="p-8">
		<p
			v-if="error"
			class="text-red-400"
		>
			Erro ao carregar produtos: {{ error.message }}
		</p>
		<pre v-else>{{ data?.data?.products }}</pre>
	</div>
</template>
