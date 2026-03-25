interface Money {
	amount: string;
	currencyCode: string;
}

interface Image {
	url: string;
	altText: string | null;
	width?: number;
	height?: number;
}

interface Address {
	id: string;
	address1: string | null;
	address2: string | null;
	city: string | null;
	company: string | null;
	country: string | null;
	firstName: string | null;
	lastName: string | null;
	name: string | null;
	phoneNumber: string | null;
	province: string | null;
	territoryCode: string | null;
	zip: string | null;
	zoneCode: string | null;
	formatted: string[];
	formattedArea: string | null;
}

interface LineItem {
	id: string;
	title: string;
	quantity: number;
	originalTotalPrice: Money;
	discountedTotalPrice: Money;
	image: Image | null;
	variantTitle: string | null;
}

interface Fulfillment {
	id: string;
	status: string;
	createdAt: string;
	updatedAt: string;
	estimatedDeliveryAt: string | null;
	trackingInformation: {
		company: string | null;
		number: string | null;
		url: string | null;
	}[];
}

interface OrderTransaction {
	id: string;
	processedAt: string;
	paymentIcon: Image | null;
	amount: Money;
	status: string;
	type: string;
}

interface Order {
	id: string;
	name: string;
	number: number;
	createdAt: string;
	processedAt: string;
	updatedAt: string;
	cancelledAt: string | null;
	cancelReason: string | null;
	currencyCode: string;
	financialStatus: string | null;
	fulfillmentStatus: string;
	edited: boolean;
	requiresShipping: boolean;
	confirmationNumber: string | null;
	email: string | null;
	phone: string | null;
	note: string | null;
	poNumber: string | null;
	statusPageUrl: string;
	totalPrice: Money;
	totalRefunded: Money;
	totalShipping: Money;
	subtotal: Money | null;
	totalTax: Money | null;
	totalDuties: Money | null;
	totalTip: Money | null;
	shippingAddress: Address | null;
	billingAddress: Address | null;
	lineItems: { nodes: LineItem[] };
	fulfillments: { nodes: Fulfillment[] };
	transactions: OrderTransaction[];
}

interface DraftOrder {
	id: string;
	name: string;
	status: string;
	createdAt: string;
	updatedAt: string;
	email: string | null;
	phone: string | null;
	requiresShipping: boolean;
	taxesIncluded: boolean;
	taxExempt: boolean;
	currencyCode: string;
	subtotalPrice: Money;
	totalPrice: Money;
	totalShippingPrice: Money;
	totalTax: Money;
	invoiceUrl: string | null;
	shippingAddress: Address | null;
	billingAddress: Address | null;
	lineItems: { nodes: LineItem[] };
}

interface CheckoutLineItem {
	id: string;
	title: string;
	quantity: number;
	unitPrice: Money | null;
	variant: {
		id: string;
		title: string;
		image: Image | null;
		price: Money;
	} | null;
}

interface Checkout {
	id: string;
	createdAt: string;
	currencyCode: string;
	email: string | null;
	note: string | null;
	ready: boolean;
	requiresShipping: boolean;
	taxesIncluded: boolean;
	taxExempt: boolean;
	webUrl: string;
	subtotalPrice: Money;
	totalPrice: Money;
	totalTax: Money;
	totalDuties: Money | null;
	paymentDue: Money;
	lineItemsSubtotalPrice: Money;
	lineItems: { nodes: CheckoutLineItem[] };
}

interface SubscriptionLine {
	id: string;
	title: string;
	quantity: number;
	currentPrice: Money;
	variantTitle: string | null;
	variantImage: Image | null;
}

interface SubscriptionContract {
	id: string;
	status: string;
	createdAt: string;
	updatedAt: string;
	currencyCode: string;
	nextBillingDate: string | null;
	lastPaymentStatus: string | null;
	lastBillingAttemptErrorType: string | null;
	note: string | null;
	revisionId: string;
	deliveryPrice: Money;
	deliveryPolicy: {
		interval: string;
		intervalCount: number;
	};
	billingPolicy: {
		interval: string;
		intervalCount: number;
		maxCycles: number | null;
		minCycles: number | null;
	};
	lines: { nodes: SubscriptionLine[] };
}

interface CompanyContact {
	id: string;
	title: string | null;
	company: {
		id: string;
		name: string;
	} | null;
	locations: {
		nodes: {
			id: string;
			name: string;
		}[];
	};
}

interface StoreCreditAccount {
	id: string;
	balance: Money;
}

interface CustomerData {
	customer: {
		id: string;
		displayName: string;
		firstName: string | null;
		lastName: string | null;
		creationDate: string;
		imageUrl: string;
		emailAddress: {
			emailAddress: string;
		} | null;
		phoneNumber: {
			phoneNumber: string;
		} | null;
		tags: string[];
		defaultAddress: Address | null;
		addresses: { nodes: Address[] };
		orders: { nodes: Order[] };
		draftOrders: { nodes: DraftOrder[] };
		lastIncompleteCheckout: Checkout | null;
		subscriptionContracts: { nodes: SubscriptionContract[] };
		companyContacts: { nodes: CompanyContact[] };
		storeCreditAccounts: { nodes: StoreCreditAccount[] };
	};
}

export function useCustomerAccount() {
	const customer = useState<CustomerData["customer"] | null>("customer", () => null);
	const isAuthenticated = computed(() => !!customer.value);

	async function fetchCustomer() {
		try {
			const { data } = await useFetch<{ data: CustomerData }>("/api/auth/customer");
			if (data.value?.data?.customer) {
				customer.value = data.value.data.customer;
			}
		}
		catch {
			customer.value = null;
		}
	}

	function login() {
		navigateTo("/api/auth/login", { external: true });
	}

	function logout() {
		customer.value = null;
		navigateTo("/api/auth/logout", { external: true });
	}

	return {
		customer,
		isAuthenticated,
		fetchCustomer,
		login,
		logout,
	};
}
