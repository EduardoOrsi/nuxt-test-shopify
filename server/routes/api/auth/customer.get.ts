export default defineEventHandler(async (event) => {
	const accessToken = await getValidAccessToken(event);

	if (!accessToken) {
		throw createError({
			statusCode: 401,
			statusMessage: "Not authenticated",
		});
	}

	const query = `
		query {
			customer {
				firstName
				lastName
				emailAddress {
					emailAddress
				}
				phoneNumber {
					phoneNumber
				}
			}
		}
	`;

	const result = await queryCustomerApi(accessToken, query);
	return result;
});
