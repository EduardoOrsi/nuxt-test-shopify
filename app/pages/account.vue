<script setup lang="ts">
definePageMeta({
	middleware: "auth",
});

const { customer, logout } = useCustomerAccount();
</script>

<template>
	<div class="max-w-2xl mx-auto p-8">
		<h2 class="text-3xl font-bold mb-6">
			Minha Conta
		</h2>

		<div
			v-if="customer"
			class="space-y-4"
		>
			<div class="bg-gray-700/30 rounded-lg p-6 space-y-3">
				<div>
					<span class="text-gray-400 text-sm">Nome</span>
					<p class="text-lg">
						{{ customer.firstName }} {{ customer.lastName }}
					</p>
				</div>

				<div>
					<span class="text-gray-400 text-sm">Email</span>
					<p class="text-lg">
						{{ customer.emailAddress?.emailAddress }}
					</p>
				</div>

				<div v-if="customer.phoneNumber">
					<span class="text-gray-400 text-sm">Telefone</span>
					<p class="text-lg">
						{{ customer.phoneNumber.phoneNumber }}
					</p>
				</div>
			</div>

			<button
				class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
				@click="logout"
			>
				Sair
			</button>
		</div>
	</div>
</template>
