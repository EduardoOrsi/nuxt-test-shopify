<script setup lang="ts">
definePageMeta({
	middleware: "auth",
});

const { customer, logout } = useCustomerAccount();

function formatDate(dateStr: string) {
	return new Date(dateStr).toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

function formatMoney(money: { amount: string; currencyCode: string } | null | undefined) {
	if (!money) return "—";
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: money.currencyCode,
	}).format(Number(money.amount));
}

const fulfillmentStatusMap: Record<string, string> = {
	UNFULFILLED: "Não enviado",
	PARTIALLY_FULFILLED: "Parcialmente enviado",
	FULFILLED: "Enviado",
	RESTOCKED: "Reestocado",
	PENDING_FULFILLMENT: "Pendente",
	OPEN: "Aberto",
	IN_PROGRESS: "Em andamento",
	ON_HOLD: "Em espera",
	SCHEDULED: "Agendado",
};

const financialStatusMap: Record<string, string> = {
	PENDING: "Pendente",
	AUTHORIZED: "Autorizado",
	PARTIALLY_PAID: "Parcialmente pago",
	PARTIALLY_REFUNDED: "Parcialmente reembolsado",
	VOIDED: "Cancelado",
	PAID: "Pago",
	REFUNDED: "Reembolsado",
};
</script>

<template>
	<div class="max-w-5xl mx-auto p-8">
		<h2 class="text-3xl font-bold mb-6">
			Minha Conta
		</h2>

		<div
			v-if="customer"
			class="space-y-8"
		>
			<!-- Perfil -->
			<div class="bg-gray-700/30 rounded-lg p-6">
				<div class="flex items-center gap-4 mb-4">
					<img
						v-if="customer.imageUrl"
						:src="customer.imageUrl"
						:alt="customer.displayName"
						class="w-16 h-16 rounded-full"
					>
					<div>
						<h3 class="text-xl font-semibold">
							{{ customer.displayName }}
						</h3>
						<p class="text-gray-400 text-sm">
							Cliente desde {{ formatDate(customer.creationDate) }}
						</p>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<span class="text-gray-400 text-sm">Nome</span>
						<p>{{ customer.firstName }} {{ customer.lastName }}</p>
					</div>
					<div>
						<span class="text-gray-400 text-sm">Email</span>
						<p>{{ customer.emailAddress?.emailAddress ?? "—" }}</p>
					</div>
					<div>
						<span class="text-gray-400 text-sm">Telefone</span>
						<p>{{ customer.phoneNumber?.phoneNumber ?? "—" }}</p>
					</div>
					<div v-if="customer.tags?.length">
						<span class="text-gray-400 text-sm">Tags</span>
						<div class="flex flex-wrap gap-1 mt-1">
							<span
								v-for="tag in customer.tags"
								:key="tag"
								class="bg-green-600/20 text-green-300 text-xs px-2 py-0.5 rounded"
							>
								{{ tag }}
							</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Endereço Padrão -->
			<div
				v-if="customer.defaultAddress"
				class="bg-gray-700/30 rounded-lg p-6"
			>
				<h3 class="text-xl font-semibold mb-4">
					Endereço Padrão
				</h3>
				<p
					v-for="(line, i) in customer.defaultAddress.formatted"
					:key="i"
				>
					{{ line }}
				</p>
			</div>

			<!-- Todos os Endereços -->
			<div
				v-if="customer.addresses?.nodes?.length > 1"
				class="bg-gray-700/30 rounded-lg p-6"
			>
				<h3 class="text-xl font-semibold mb-4">
					Endereços ({{ customer.addresses.nodes.length }})
				</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div
						v-for="addr in customer.addresses.nodes"
						:key="addr.id"
						class="bg-gray-800/40 rounded p-4"
					>
						<p class="font-medium mb-1">
							{{ addr.name }}
						</p>
						<p
							v-for="(line, i) in addr.formatted"
							:key="i"
							class="text-sm text-gray-300"
						>
							{{ line }}
						</p>
					</div>
				</div>
			</div>

			<!-- Pedidos -->
			<div
				v-if="customer.orders?.nodes?.length"
				class="bg-gray-700/30 rounded-lg p-6"
			>
				<h3 class="text-xl font-semibold mb-4">
					Pedidos ({{ customer.orders.nodes.length }})
				</h3>
				<div class="space-y-4">
					<div
						v-for="order in customer.orders.nodes"
						:key="order.id"
						class="bg-gray-800/40 rounded-lg p-4"
					>
						<div class="flex flex-wrap justify-between items-start gap-2 mb-3">
							<div>
								<p class="font-semibold text-lg">
									{{ order.name }}
								</p>
								<p class="text-gray-400 text-sm">
									{{ formatDate(order.createdAt) }}
								</p>
							</div>
							<div class="text-right">
								<p class="font-semibold text-lg">
									{{ formatMoney(order.totalPrice) }}
								</p>
								<div class="flex gap-2 mt-1">
									<span class="text-xs px-2 py-0.5 rounded bg-blue-600/20 text-blue-300">
										{{ financialStatusMap[order.financialStatus ?? ''] ?? order.financialStatus }}
									</span>
									<span class="text-xs px-2 py-0.5 rounded bg-purple-600/20 text-purple-300">
										{{ fulfillmentStatusMap[order.fulfillmentStatus] ?? order.fulfillmentStatus }}
									</span>
								</div>
							</div>
						</div>

						<!-- Line Items -->
						<div
							v-if="order.lineItems?.nodes?.length"
							class="space-y-2 mb-3"
						>
							<div
								v-for="item in order.lineItems.nodes"
								:key="item.id"
								class="flex items-center gap-3"
							>
								<img
									v-if="item.image"
									:src="item.image.url"
									:alt="item.image.altText ?? item.title"
									class="w-12 h-12 rounded object-cover"
								>
								<div
									v-else
									class="w-12 h-12 rounded bg-gray-600/30 flex items-center justify-center text-gray-500 text-xs"
								>
									Sem img
								</div>
								<div class="flex-1 min-w-0">
									<p class="truncate">
										{{ item.title }}
									</p>
									<p class="text-gray-400 text-sm">
										Qtd: {{ item.quantity }}
									</p>
								</div>
								<p class="text-sm font-medium whitespace-nowrap">
									{{ formatMoney(item.discountedTotalPrice) }}
								</p>
							</div>
						</div>

						<!-- Resumo financeiro -->
						<div class="border-t border-gray-600/30 pt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
							<div>
								<span class="text-gray-400">Subtotal</span>
								<p>{{ formatMoney(order.subtotal) }}</p>
							</div>
							<div>
								<span class="text-gray-400">Frete</span>
								<p>{{ formatMoney(order.totalShipping) }}</p>
							</div>
							<div>
								<span class="text-gray-400">Impostos</span>
								<p>{{ formatMoney(order.totalTax) }}</p>
							</div>
							<div v-if="order.totalRefunded && Number(order.totalRefunded.amount) > 0">
								<span class="text-gray-400">Reembolsado</span>
								<p class="text-red-400">
									{{ formatMoney(order.totalRefunded) }}
								</p>
							</div>
						</div>

						<!-- Fulfillments / Rastreio -->
						<div
							v-if="order.fulfillments?.nodes?.length"
							class="border-t border-gray-600/30 pt-3 mt-3"
						>
							<p class="text-gray-400 text-sm mb-2">
								Entregas
							</p>
							<div
								v-for="ful in order.fulfillments.nodes"
								:key="ful.id"
								class="text-sm"
							>
								<span class="text-purple-300">{{ ful.status }}</span>
								<span class="text-gray-400 ml-2">{{ formatDate(ful.createdAt) }}</span>
								<div
									v-for="(track, ti) in ful.trackingInformation"
									:key="ti"
									class="ml-4 mt-1"
								>
									<a
										v-if="track.url"
										:href="track.url"
										target="_blank"
										class="text-green-400 hover:underline"
									>
										{{ track.company }} - {{ track.number }}
									</a>
									<span v-else>{{ track.company }} - {{ track.number }}</span>
								</div>
							</div>
						</div>

						<div class="mt-3">
							<a
								:href="order.statusPageUrl"
								target="_blank"
								class="text-green-400 hover:underline text-sm"
							>
								Ver status do pedido
							</a>
						</div>
					</div>
				</div>
			</div>

			<!-- Draft Orders -->
			<div
				v-if="customer.draftOrders?.nodes?.length"
				class="bg-gray-700/30 rounded-lg p-6"
			>
				<h3 class="text-xl font-semibold mb-4">
					Rascunhos de Pedido ({{ customer.draftOrders.nodes.length }})
				</h3>
				<div class="space-y-4">
					<div
						v-for="draft in customer.draftOrders.nodes"
						:key="draft.id"
						class="bg-gray-800/40 rounded-lg p-4"
					>
						<div class="flex justify-between items-start mb-3">
							<div>
								<p class="font-semibold">
									{{ draft.name }}
								</p>
								<p class="text-gray-400 text-sm">
									{{ formatDate(draft.createdAt) }}
								</p>
							</div>
							<div class="text-right">
								<p class="font-semibold">
									{{ formatMoney(draft.totalPrice) }}
								</p>
								<span class="text-xs px-2 py-0.5 rounded bg-yellow-600/20 text-yellow-300">
									{{ draft.status }}
								</span>
							</div>
						</div>
						<div
							v-for="item in draft.lineItems?.nodes"
							:key="item.id"
							class="flex items-center gap-3"
						>
							<img
								v-if="item.image"
								:src="item.image.url"
								:alt="item.image.altText ?? item.title"
								class="w-10 h-10 rounded object-cover"
							>
							<p class="flex-1 truncate text-sm">
								{{ item.title }} x{{ item.quantity }}
							</p>
							<p class="text-sm">
								{{ formatMoney(item.discountedTotalPrice) }}
							</p>
						</div>
						<a
							v-if="draft.invoiceUrl"
							:href="draft.invoiceUrl"
							target="_blank"
							class="text-green-400 hover:underline text-sm mt-2 inline-block"
						>
							Ver fatura
						</a>
					</div>
				</div>
			</div>

			<!-- Checkout Incompleto -->
			<div
				v-if="customer.lastIncompleteCheckout"
				class="bg-gray-700/30 rounded-lg p-6"
			>
				<h3 class="text-xl font-semibold mb-4">
					Checkout Incompleto
				</h3>
				<div class="bg-gray-800/40 rounded-lg p-4">
					<div class="flex justify-between items-start mb-3">
						<p class="text-gray-400 text-sm">
							{{ formatDate(customer.lastIncompleteCheckout.createdAt) }}
						</p>
						<p class="font-semibold">
							{{ formatMoney(customer.lastIncompleteCheckout.totalPrice) }}
						</p>
					</div>
					<div
						v-for="item in customer.lastIncompleteCheckout.lineItems?.nodes"
						:key="item.id"
						class="flex items-center gap-3 mb-2"
					>
						<img
							v-if="item.variant?.image"
							:src="item.variant.image.url"
							:alt="item.variant.image.altText ?? item.title"
							class="w-10 h-10 rounded object-cover"
						>
						<p class="flex-1 truncate text-sm">
							{{ item.title }} x{{ item.quantity }}
						</p>
						<p class="text-sm">
							{{ formatMoney(item.unitPrice) }}
						</p>
					</div>
					<a
						:href="customer.lastIncompleteCheckout.webUrl"
						target="_blank"
						class="text-green-400 hover:underline text-sm mt-2 inline-block"
					>
						Retomar checkout
					</a>
				</div>
			</div>

			<!-- Assinaturas -->
			<div
				v-if="customer.subscriptionContracts?.nodes?.length"
				class="bg-gray-700/30 rounded-lg p-6"
			>
				<h3 class="text-xl font-semibold mb-4">
					Assinaturas ({{ customer.subscriptionContracts.nodes.length }})
				</h3>
				<div class="space-y-4">
					<div
						v-for="sub in customer.subscriptionContracts.nodes"
						:key="sub.id"
						class="bg-gray-800/40 rounded-lg p-4"
					>
						<div class="flex justify-between items-start mb-2">
							<span class="text-xs px-2 py-0.5 rounded bg-green-600/20 text-green-300">
								{{ sub.status }}
							</span>
							<p class="text-gray-400 text-sm">
								A cada {{ sub.billingPolicy.intervalCount }} {{ sub.billingPolicy.interval }}
							</p>
						</div>
						<div
							v-for="line in sub.lines?.nodes"
							:key="line.id"
							class="flex items-center gap-3 mb-1"
						>
							<img
								v-if="line.variantImage"
								:src="line.variantImage.url"
								:alt="line.variantImage.altText ?? line.title"
								class="w-10 h-10 rounded object-cover"
							>
							<p class="flex-1 truncate text-sm">
								{{ line.title }}
								<span
									v-if="line.variantTitle"
									class="text-gray-400"
								>- {{ line.variantTitle }}</span>
								x{{ line.quantity }}
							</p>
							<p class="text-sm">
								{{ formatMoney(line.currentPrice) }}
							</p>
						</div>
						<div
							v-if="sub.nextBillingDate"
							class="text-sm text-gray-400 mt-2"
						>
							Próxima cobrança: {{ formatDate(sub.nextBillingDate) }}
						</div>
					</div>
				</div>
			</div>

			<!-- Empresa / B2B -->
			<div
				v-if="customer.companyContacts?.nodes?.length"
				class="bg-gray-700/30 rounded-lg p-6"
			>
				<h3 class="text-xl font-semibold mb-4">
					Empresas
				</h3>
				<div
					v-for="contact in customer.companyContacts.nodes"
					:key="contact.id"
					class="bg-gray-800/40 rounded-lg p-4 mb-2"
				>
					<p class="font-semibold">
						{{ contact.company?.name }}
					</p>
					<p
						v-if="contact.title"
						class="text-gray-400 text-sm"
					>
						{{ contact.title }}
					</p>
					<div
						v-if="contact.locations?.nodes?.length"
						class="mt-2"
					>
						<p class="text-gray-400 text-xs">
							Locais:
						</p>
						<span
							v-for="loc in contact.locations.nodes"
							:key="loc.id"
							class="text-sm mr-2"
						>
							{{ loc.name }}
						</span>
					</div>
				</div>
			</div>

			<!-- Store Credit -->
			<div
				v-if="customer.storeCreditAccounts?.nodes?.length"
				class="bg-gray-700/30 rounded-lg p-6"
			>
				<h3 class="text-xl font-semibold mb-4">
					Crédito na Loja
				</h3>
				<div
					v-for="account in customer.storeCreditAccounts.nodes"
					:key="account.id"
					class="bg-gray-800/40 rounded-lg p-4"
				>
					<p class="text-2xl font-semibold text-green-300">
						{{ formatMoney(account.balance) }}
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
