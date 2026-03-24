export default defineEventHandler((event) => {
	const { url, state, nonce } = buildAuthorizationUrl();

	const cookieOptions = {
		httpOnly: true,
		secure: true,
		sameSite: "lax" as const,
		path: "/",
		maxAge: 300, // 5 minutes
	};

	setCookie(event, "auth_state", state, cookieOptions);
	setCookie(event, "auth_nonce", nonce, cookieOptions);

	return sendRedirect(event, url);
});
