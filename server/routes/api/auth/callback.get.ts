export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const code = query.code as string | undefined;
	const state = query.state as string | undefined;

	if (!code || !state) {
		throw createError({
			statusCode: 400,
			statusMessage: "Missing code or state parameter",
		});
	}

	// Validate state
	const savedState = getCookie(event, "auth_state");
	if (!savedState || savedState !== state) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid state parameter",
		});
	}

	// Clean up temporary cookies
	deleteCookie(event, "auth_state", { path: "/" });
	deleteCookie(event, "auth_nonce", { path: "/" });

	// Exchange code for tokens
	const tokens = await exchangeCodeForTokens(event, code);

	// Set auth cookies
	setAuthCookies(event, tokens);

	return sendRedirect(event, "/account");
});
