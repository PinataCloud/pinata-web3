/**
 * Uploads a file to IPFS via Pinata.
 *
 * This function allows you to upload a single file to IPFS and pin it to Pinata.
 * It's useful for adding individual files to your Pinata account and IPFS network.
 *
 * @async
 * @function uploadFile
 * @param {PinataConfig | undefined} config - The Pinata configuration object containing the JWT.
 * @param {File} file - The file object to be uploaded.
 * @param {UploadOptions} [options] - Optional parameters for the upload.
 * @param {PinataMetadata} [options.metadata] - Metadata for the uploaded file.
 * @param {string} [options.metadata.name] - Custom name for the file (defaults to the original filename if not provided).
 * @param {Record<string, string | number>} [options.metadata.keyValues] - Custom key-value pairs for the file metadata.
 * @param {string} [options.keys] - Custom JWT to use for this specific upload.
 * @param {string} [options.groupId] - ID of the group to add the uploaded file to.
 * @param {0 | 1} [options.cidVersion] - Version of CID to use (0 or 1).
 * @returns {Promise<PinResponse>} A promise that resolves to an object containing the IPFS hash and other upload details.
 * @throws {ValidationError} If the Pinata configuration or JWT is missing.
 * @throws {AuthenticationError} If the authentication fails (e.g., invalid JWT).
 * @throws {NetworkError} If there's a network-related error during the API request.
 * @throws {PinataError} For any other errors that occur during the upload process.
 *
 * @example
 * import { PinataSDK } from "pinata";
 *
 * const pinata = new PinataSDK({
 *   pinataJwt: process.env.PINATA_JWT!,
 *   pinataGateway: "example-gateway.mypinata.cloud",
 * });
 *
 * const file = new File(["hello world!"], "hello.txt", { type: "text/plain" })
 * const upload = await pinata.upload.file(file)
 */

import type { PinataConfig, PinResponse, UploadOptions } from "../types";
import {
	PinataError,
	NetworkError,
	AuthenticationError,
	ValidationError,
} from "../../utils/custom-errors";

export const uploadFile = async (
	config: PinataConfig | undefined,
	file: File,
	options?: UploadOptions,
) => {
	if (!config || !config.pinataJwt) {
		throw new ValidationError("Pinata configuration or JWT is missing");
	}

	const jwt: string = options?.keys || config.pinataJwt;

	const data = new FormData();
	data.append("file", file, file.name);

	data.append(
		"pinataOptions",
		JSON.stringify({
			cidVersion: options?.cidVersion,
			groupId: options?.groupId,
		}),
	);

	data.append(
		"pinataMetadata",
		JSON.stringify({
			name: options?.metadata ? options.metadata.name : file.name,
			keyvalues: options?.metadata?.keyValues,
		}),
	);

	let headers: Record<string, string>;

	if (config.customHeaders && Object.keys(config.customHeaders).length > 0) {
		headers = { ...config.customHeaders };
	} else {
		headers = {
			Authorization: `Bearer ${jwt}`,
			Source: "sdk/file",
		};
	}

	try {
		const request = await fetch(
			"https://api.pinata.cloud/pinning/pinFileToIPFS",
			{
				method: "POST",
				headers: headers,
				body: data,
			},
		);

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
		const res: PinResponse = await request.json();
		return res;
	} catch (error) {
		if (error instanceof PinataError) {
			throw error;
		}
		if (error instanceof Error) {
			throw new PinataError(`Error uploading file: ${error.message}`);
		}
		throw new PinataError("An unknown error occurred while uploading the file");
	}
};
