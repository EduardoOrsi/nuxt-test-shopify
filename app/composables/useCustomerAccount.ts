interface CustomerData {
	customer: {
		firstName: string;
		lastName: string;
		emailAddress: {
			emailAddress: string;
		};
		phoneNumber: {
			phoneNumber: string;
		} | null;
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
