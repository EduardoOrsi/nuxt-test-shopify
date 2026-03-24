export default defineEventHandler((event) => {
	const { idToken } = getAuthTokens(event);

	clearAuthCookies(event);

	if (idToken) {
		const logoutUrl = buildLogoutUrl(event, idToken);
		return sendRedirect(event, logoutUrl);
	}

	return sendRedirect(event, "/");
});
