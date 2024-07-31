/**
 * Converts an IPFS URL to a desired gateway URL.
 *
 * This function takes an IPFS URL and converts it to use a specified gateway.
 * If a Pinata Gateway Key is provided in the configuration, it will be appended
 * to the URL as a query parameter.
 *
 * @function convertIPFSUrl
 * @param {PinataConfig | undefined} config - The Pinata configuration object.
 * @param {string} config.pinataGateway - The desired gateway URL to use.
 * @param {string} [config.pinataGatewayKey] - Optional Pinata Gateway Key for authenticated access.
 * @param {string} url - The original IPFS URL to convert.
 * @returns {string} The converted URL using the specified gateway.
 *
 * @example
 * import { PinataSDK } from "pinata";
 *
 * const pinata = new PinataSDK({
 *   pinataJwt: process.env.PINATA_JWT!,
 *   pinataGateway: "example-gateway.mypinata.cloud",
 * });
 *
 * const url = pinata.gateways.convert(
 *   "ipfs://QmVLwvmGehsrNEvhcCnnsw5RQNseohgEkFNN1848zNzdng"
 * );
 */

import { convertToDesiredGateway } from "../../utils/gateway-tools";
import type { PinataConfig } from "../types";

export const convertIPFSUrl = (
	config: PinataConfig | undefined,
	url: string,
): string => {
	let newUrl: string;
	newUrl = convertToDesiredGateway(url, config?.pinataGateway);
	if (config?.pinataGatewayKey) {
		`${newUrl}?pinataGatewayToken=${config?.pinataGatewayKey}`;
	}
	return newUrl;
};
