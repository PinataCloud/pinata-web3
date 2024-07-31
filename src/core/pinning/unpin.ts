/**
 * Unpins multiple files from Pinata and IPFS.
 *
 * This function allows you to remove pins for multiple files from your Pinata account.
 * Unpinning a file means that Pinata will no longer guarantee its availability on IPFS,
 * although the content may still be available if pinned by other IPFS nodes.
 *
 * @async
 * @function unpinFile
 * @param {PinataConfig | undefined} config - The Pinata configuration object containing the JWT.
 * @param {string[]} files - An array of IPFS hashes (CIDs) of the files to unpin.
 * @returns {Promise<UnpinResponse[]>} A promise that resolves to an array of objects, each containing the status of the unpin operation for each file.
 * @throws {ValidationError} If the Pinata configuration or JWT is missing.
 * @throws {AuthenticationError} If the authentication fails (e.g., invalid JWT).
 * @throws {NetworkError} If there's a network-related error during the API request.
 * @throws {PinataError} For any other errors that occur during the unpinning process.
 *
 * @example
 * import { PinataSDK } from "pinata";
 *
 * const pinata = new PinataSDK({
 *   pinataJwt: process.env.PINATA_JWT!,
 *   pinataGateway: "example-gateway.mypinata.cloud",
 * });
 *
 * const unpin = await pinata.unpin([
 *   "bafkreih5aznjvttude6c3wbvqeebb6rlx5wkbzyppv7garjiubll2ceym4"
 * ])
 */

import type { PinataConfig, UnpinResponse } from "../types";
import {
	PinataError,
	NetworkError,
	AuthenticationError,
	ValidationError,
} from "../../utils/custom-errors";

const wait = (milliseconds: number): Promise<void> => {
	return new Promise((resolve) => {
		setTimeout(resolve, milliseconds);
	});
};

export const unpinFile = async (
	config: PinataConfig | undefined,
	files: string[],
): Promise<UnpinResponse[]> => {
	if (!config || !config.pinataJwt) {
		throw new ValidationError("Pinata configuration or JWT is missing");
	}

	const responses: UnpinResponse[] = [];

	for (const hash of files) {
		try {
			const response = await fetch(
				`https://api.pinata.cloud/pinning/unpin/${hash}`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${config.pinataJwt}`,
					},
				},
			);

			await wait(300);

			if (!response.ok) {
				const errorData = await response.json();
				if (response.status === 401) {
					throw new AuthenticationError(
						"Authentication failed",
						response.status,
						errorData,
					);
				}
				throw new NetworkError(
					`HTTP error! status: ${response.status}`,
					response.status,
					errorData,
				);
			}

			const result = await response.text();
			responses.push({
				hash: hash,
				status: result,
			});
		} catch (error) {
			let errorMessage: string;

			if (error instanceof PinataError) {
				errorMessage = error.message;
			} else if (error instanceof Error) {
				errorMessage = `Error unpinning file ${hash}: ${error.message}`;
			} else {
				errorMessage = `An unknown error occurred while unpinning file ${hash}`;
			}

			responses.push({
				hash: hash,
				status: errorMessage,
			});
		}
	}
	return responses;
};
