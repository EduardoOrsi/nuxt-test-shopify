<script setup lang="ts">
const storefront = useStorefront();

const { data } = await storefront.request(`#graphql
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
});
</script>

<template>
	<pre>{{ data?.products }}</pre>
</template>
