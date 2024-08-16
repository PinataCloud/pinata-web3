import type {
	TimeIntervalGatewayAnalyticsQuery,
	TimeIntervalGatewayAnalyticsResponse,
	PinataConfig,
} from "../types";
import {
	PinataError,
	NetworkError,
	AuthenticationError,
	ValidationError,
} from "../../utils/custom-errors";

export const analyticsTopUsage = async (
	config: PinataConfig | undefined,
	options?: TimeIntervalGatewayAnalyticsQuery,
): Promise<TimeIntervalGatewayAnalyticsResponse> => {
	if (!config || !config.pinataJwt) {
		throw new ValidationError("Pinata configuration or JWT is missing");
	}

	const params = new URLSearchParams({
		includesCount: "false",
	});

	if (options) {
		const {
			cid,
			gateway_domain,
			start_date,
			end_date,
			file_name,
			user_agent,
			country,
			region,
			referer,
			limit,
			sort_order,
			date_interval,
			sort_by,
		} = options;

		if (cid) params.append("cid", cid);
		if (gateway_domain) params.append("gateway_domain", gateway_domain);
		if (start_date) params.append("start_date", start_date);
		if (end_date) params.append("end_date", end_date);
		if (file_name) params.append("file_name", file_name);
		if (user_agent) params.append("user_agent", user_agent.toString());
		if (country) params.append("country", country.toString());
		if (region) params.append("region", region);
		if (referer) params.append("referer", referer.toString());
		if (limit) params.append("limit", limit.toString());
		if (sort_order) params.append("sort_order", sort_order);
		if (sort_by) params.append("sort_by", sort_by);
		if (date_interval) params.append("by", date_interval);
	}

	let endpoint: string = "https://api.pinata.cloud";

	if (config.endpointUrl) {
		endpoint = config.endpointUrl;
	}

	const url = `${endpoint}/v3/ipfs/gateway_analytics_top?${params.toString()}`;

	try {
		let headers: Record<string, string>;

		if (config.customHeaders && Object.keys(config.customHeaders).length > 0) {
			headers = { ...config.customHeaders };
		} else {
			headers = {
				Authorization: `Bearer ${config.pinataJwt}`,
				Source: "sdk/analyticsTopUsage",
			};
		}

		const request = await fetch(url, {
			method: "GET",
			headers: headers,
		});
		if (!request.ok) {
			const errorData = await request.json();
			if (request.status === 401) {
				throw new AuthenticationError(
					"Authentication failed",
					request.status,
					errorData,
				);
			}
			throw new NetworkError(
				`HTTP error! status: ${request.status}`,
				request.status,
				errorData,
			);
		}

		const res: TimeIntervalGatewayAnalyticsResponse = await request.json();
		return res;
	} catch (error) {
		if (error instanceof PinataError) {
			throw error;
		}
		if (error instanceof Error) {
			throw new PinataError(
				`Error processing anaytics usage: ${error.message}`,
			);
		}
		throw new PinataError(
			"An unknown error occurred while fetching gateway usage",
		);
	}
};
