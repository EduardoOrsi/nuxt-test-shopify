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
				id
				displayName
				firstName
				lastName
				creationDate
				imageUrl
				emailAddress {
					emailAddress
				}
				phoneNumber {
					phoneNumber
				}
				tags
				defaultAddress {
					id
					address1
					address2
					city
					company
					country
					firstName
					lastName
					name
					phoneNumber
					province
					territoryCode
					zip
					zoneCode
					formatted
					formattedArea
				}
				addresses(first: 10) {
					nodes {
						id
						address1
						address2
						city
						company
						country
						firstName
						lastName
						name
						phoneNumber
						province
						territoryCode
						zip
						zoneCode
						formatted
						formattedArea
					}
				}
				orders(first: 25, sortKey: CREATED_AT, reverse: true) {
					nodes {
						id
						name
						number
						createdAt
						processedAt
						updatedAt
						cancelledAt
						cancelReason
						currencyCode
						financialStatus
						fulfillmentStatus
						edited
						requiresShipping
						confirmationNumber
						email
						phone
						note
						poNumber
						statusPageUrl
						totalPrice {
							amount
							currencyCode
						}
						totalRefunded {
							amount
							currencyCode
						}
						totalShipping {
							amount
							currencyCode
						}
						subtotal {
							amount
							currencyCode
						}
						totalTax {
							amount
							currencyCode
						}
						totalDuties {
							amount
							currencyCode
						}
						totalTip {
							amount
							currencyCode
						}
						shippingAddress {
							id
							address1
							address2
							city
							company
							country
							firstName
							lastName
							name
							phoneNumber
							province
							zip
							formatted
						}
						billingAddress {
							id
							address1
							address2
							city
							company
							country
							firstName
							lastName
							name
							phoneNumber
							province
							zip
							formatted
						}
						lineItems(first: 50) {
							nodes {
								id
								title
								quantity
								originalTotalPrice {
									amount
									currencyCode
								}
								discountedTotalPrice {
									amount
									currencyCode
								}
								image {
									url
									altText
									width
									height
								}
								variantTitle
							}
						}
						fulfillments(first: 10) {
							nodes {
								id
								status
								createdAt
								updatedAt
								estimatedDeliveryAt
								trackingInformation {
									company
									number
									url
								}
							}
						}
						transactions {
							id
							processedAt
							paymentIcon {
								url
								altText
							}
							amount {
								amount
								currencyCode
							}
							status
							type
						}
					}
				}
				draftOrders(first: 10, sortKey: CREATED_AT, reverse: true) {
					nodes {
						id
						name
						status
						createdAt
						updatedAt
						email
						phone
						requiresShipping
						taxesIncluded
						taxExempt
						currencyCode
						subtotalPrice {
							amount
							currencyCode
						}
						totalPrice {
							amount
							currencyCode
						}
						totalShippingPrice {
							amount
							currencyCode
						}
						totalTax {
							amount
							currencyCode
						}
						invoiceUrl
						shippingAddress {
							id
							address1
							address2
							city
							company
							country
							firstName
							lastName
							name
							phoneNumber
							province
							zip
							formatted
						}
						billingAddress {
							id
							address1
							address2
							city
							company
							country
							firstName
							lastName
							name
							phoneNumber
							province
							zip
							formatted
						}
						lineItems(first: 50) {
							nodes {
								id
								title
								quantity
								image {
									url
									altText
									width
									height
								}
								originalTotalPrice {
									amount
									currencyCode
								}
								discountedTotalPrice {
									amount
									currencyCode
								}
							}
						}
					}
				}
				lastIncompleteCheckout {
					id
					createdAt
					currencyCode
					email
					note
					ready
					requiresShipping
					taxesIncluded
					taxExempt
					webUrl
					subtotalPrice {
						amount
						currencyCode
					}
					totalPrice {
						amount
						currencyCode
					}
					totalTax {
						amount
						currencyCode
					}
					totalDuties {
						amount
						currencyCode
					}
					paymentDue {
						amount
						currencyCode
					}
					lineItemsSubtotalPrice {
						amount
						currencyCode
					}
					lineItems(first: 50) {
						nodes {
							id
							title
							quantity
							unitPrice {
								amount
								currencyCode
							}
							variant {
								id
								title
								image {
									url
									altText
								}
								price {
									amount
									currencyCode
								}
							}
						}
					}
				}
				subscriptionContracts(first: 10) {
					nodes {
						id
						status
						createdAt
						updatedAt
						currencyCode
						nextBillingDate
						lastPaymentStatus
						lastBillingAttemptErrorType
						note
						revisionId
						deliveryPrice {
							amount
							currencyCode
						}
						deliveryPolicy {
							interval
							intervalCount
						}
						billingPolicy {
							interval
							intervalCount
							maxCycles
							minCycles
						}
						lines(first: 10) {
							nodes {
								id
								title
								quantity
								currentPrice {
									amount
									currencyCode
								}
								variantTitle
								variantImage {
									url
									altText
								}
							}
						}
					}
				}
				companyContacts(first: 10) {
					nodes {
						id
						title
						company {
							id
							name
						}
						locations(first: 10) {
							nodes {
								id
								name
							}
						}
					}
				}
				storeCreditAccounts(first: 5) {
					nodes {
						id
						balance {
							amount
							currencyCode
						}
					}
				}
			}
		}
	`;

	const result = await queryCustomerApi(accessToken, query);
	return result;
});
