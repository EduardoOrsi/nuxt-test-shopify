export default defineNuxtRouteMiddleware(async () => {
	const { isAuthenticated, fetchCustomer } = useCustomerAccount();

	if (!isAuthenticated.value) {
		await fetchCustomer();
	}

	if (!isAuthenticated.value) {
		return navigateTo("/api/auth/login", { external: true });
	}
});
