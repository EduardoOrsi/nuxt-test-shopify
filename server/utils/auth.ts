import type { H3Event } from "h3";

const SCOPES = "openid email customer-account-api:full";

interface TokenResponse {
	access_token: string;
	refresh_token: string;
	id_token: string;
	expires_in: number;
	token_type: string;
}

interface CustomerAccountConfig {
	storeId: string;
	clientId: string;
	clientSecret: string;
	apiVersion: string;
	appUrl: string;
}

function getConfig(): CustomerAccountConfig {
	const config = useRuntimeConfig();
	return {
		storeId: config.shopifyStoreId,
		clientId: config.shopifyCustomerAccountClientId,
		clientSecret: config.shopifyCustomerAccountClientSecret,
		apiVersion: config.shopifyCustomerAccountApiVersion,
		appUrl: config.appUrl,
	};
}

function getAuthorizationEndpoint(storeId: string): string {
	return `https://shopify.com/authentication/${storeId}/oauth/authorize`;
}

function getTokenEndpoint(storeId: string): string {
	return `https://shopify.com/authentication/${storeId}/oauth/token`;
}

function getLogoutEndpoint(storeId: string): string {
	return `https://shopify.com/authentication/${storeId}/logout`;
}

function getCustomerApiEndpoint(storeId: string, apiVersion: string): string {
	return `https://shopify.com/${storeId}/account/customer/api/${apiVersion}/graphql`;
}

export function generateRandomString(length = 64): string {
	const array = new Uint8Array(length);
	crypto.getRandomValues(array);
	return Array.from(array, byte => byte.toString(16).padStart(2, "0")).join("").slice(0, length);
}

export function buildAuthorizationUrl(): { url: string; state: string; nonce: string } {
	const config = getConfig();
	const state = generateRandomString(32);
	const nonce = generateRandomString(32);

	const params = new URLSearchParams({
		scope: SCOPES,
		client_id: config.clientId,
		response_type: "code",
		redirect_uri: `${config.appUrl}/api/auth/callback`,
		state,
		nonce,
	});

	const url = `${getAuthorizationEndpoint(config.storeId)}?${params.toString()}`;
	return { url, state, nonce };
}

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
	const config = getConfig();

	const credentials = btoa(`${config.clientId}:${config.clientSecret}`);
	const body = new URLSearchParams({
		grant_type: "authorization_code",
		client_id: config.clientId,
		redirect_uri: `${config.appUrl}/api/auth/callback`,
		code,
	});

	const response = await fetch(getTokenEndpoint(config.storeId), {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": `Basic ${credentials}`,
		},
		body: body.toString(),
	});

	if (!response.ok) {
		const error = await response.text();
		throw createError({
			statusCode: response.status,
			statusMessage: `Token exchange failed: ${error}`,
		});
	}

	return response.json() as Promise<TokenResponse>;
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
	const config = getConfig();

	const credentials = btoa(`${config.clientId}:${config.clientSecret}`);
	const body = new URLSearchParams({
		grant_type: "refresh_token",
		client_id: config.clientId,
		refresh_token: refreshToken,
	});

	const response = await fetch(getTokenEndpoint(config.storeId), {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": `Basic ${credentials}`,
		},
		body: body.toString(),
	});

	if (!response.ok) {
		const error = await response.text();
		throw createError({
			statusCode: response.status,
			statusMessage: `Token refresh failed: ${error}`,
		});
	}

	return response.json() as Promise<TokenResponse>;
}

export async function queryCustomerApi(accessToken: string, query: string, variables?: Record<string, unknown>) {
	const config = getConfig();

	const response = await fetch(getCustomerApiEndpoint(config.storeId, config.apiVersion), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": accessToken,
		},
		body: JSON.stringify({ query, variables }),
	});

	if (!response.ok) {
		const error = await response.text();
		throw createError({
			statusCode: response.status,
			statusMessage: `Customer API request failed: ${error}`,
		});
	}

	return response.json();
}

export function buildLogoutUrl(idToken: string): string {
	const config = getConfig();

	const params = new URLSearchParams({
		id_token_hint: idToken,
		post_logout_redirect_uri: config.appUrl,
	});

	return `${getLogoutEndpoint(config.storeId)}?${params.toString()}`;
}

const COOKIE_OPTIONS = {
	httpOnly: true,
	secure: true,
	sameSite: "lax" as const,
	path: "/",
};

export function setAuthCookies(event: H3Event, tokens: TokenResponse) {
	const expiresAt = Date.now() + tokens.expires_in * 1000;

	setCookie(event, "customer_access_token", tokens.access_token, {
		...COOKIE_OPTIONS,
		maxAge: tokens.expires_in,
	});
	setCookie(event, "customer_refresh_token", tokens.refresh_token, {
		...COOKIE_OPTIONS,
		maxAge: 60 * 60 * 24 * 30, // 30 days
	});
	setCookie(event, "customer_id_token", tokens.id_token, {
		...COOKIE_OPTIONS,
		maxAge: 60 * 60 * 24 * 30,
	});
	setCookie(event, "customer_token_expires_at", String(expiresAt), {
		...COOKIE_OPTIONS,
		maxAge: tokens.expires_in,
	});
}

export function clearAuthCookies(event: H3Event) {
	for (const name of ["customer_access_token", "customer_refresh_token", "customer_id_token", "customer_token_expires_at"]) {
		deleteCookie(event, name, COOKIE_OPTIONS);
	}
}

export function getAuthTokens(event: H3Event) {
	return {
		accessToken: getCookie(event, "customer_access_token"),
		refreshToken: getCookie(event, "customer_refresh_token"),
		idToken: getCookie(event, "customer_id_token"),
		expiresAt: getCookie(event, "customer_token_expires_at"),
	};
}

export async function getValidAccessToken(event: H3Event): Promise<string | null> {
	const tokens = getAuthTokens(event);

	if (!tokens.accessToken && !tokens.refreshToken) {
		return null;
	}

	// Check if token is still valid (with 60s buffer)
	if (tokens.accessToken && tokens.expiresAt) {
		const expiresAt = Number(tokens.expiresAt);
		if (Date.now() < expiresAt - 60_000) {
			return tokens.accessToken;
		}
	}

	// Try to refresh
	if (tokens.refreshToken) {
		try {
			const newTokens = await refreshAccessToken(tokens.refreshToken);
			setAuthCookies(event, newTokens);
			return newTokens.access_token;
		}
		catch {
			clearAuthCookies(event);
			return null;
		}
	}

	return null;
}
