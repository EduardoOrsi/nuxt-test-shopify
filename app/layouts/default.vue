<script setup lang="ts">
const { isAuthenticated, fetchCustomer, login, logout } = useCustomerAccount();

onMounted(() => {
	fetchCustomer();
});
</script>

<template>
	<div>
		<div class="p-4 flex justify-between items-center bg-gray-700/30">
			<div class="flex items-baseline gap-8">
				<NuxtLink to="/">
					<h1 class="text-4xl text-green-300">
						Shop Store - Custom Account API
					</h1>
				</NuxtLink>
			</div>

			<nav class="flex items-center gap-4">
				<template v-if="isAuthenticated">
					<NuxtLink
						to="/account"
						class="text-green-300 hover:text-green-200 transition-colors"
					>
						Minha Conta
					</NuxtLink>
					<button
						class="text-gray-300 hover:text-white transition-colors cursor-pointer"
						@click="logout"
					>
						Sair
					</button>
				</template>
				<button
					v-else
					class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
					@click="login"
				>
					Entrar
				</button>
			</nav>
		</div>
		<main>
			<slot />
		</main>
	</div>
</template>
