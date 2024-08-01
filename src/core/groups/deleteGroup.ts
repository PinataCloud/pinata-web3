/**
 * Deletes a specified group from Pinata.
 *
 * This function allows you to remove a group from your Pinata account.
 * Note that deleting a group does not delete the files within the group,
 * it only removes the group association.
 *
 * @async
 * @function deleteGroup
 * @param {PinataConfig | undefined} config - The Pinata configuration object containing the JWT.
 * @param {GetGroupOptions} options - The options for deleting a group.
 * @param {string} options.groupId - The ID of the group to be deleted.
 * @returns {Promise<string>} A promise that resolves to a string confirming the deletion.
 * @throws {ValidationError} If the Pinata configuration or JWT is missing.
 * @throws {AuthenticationError} If the authentication fails (e.g., invalid JWT).
 * @throws {NetworkError} If there's a network-related error during the API request.
 * @throws {PinataError} For any other errors that occur during the group deletion process.
 *
 * @example
 * import { PinataSDK } from "pinata";
 *
 * const pinata = new PinataSDK({
 *   pinataJwt: process.env.PINATA_JWT!,
 *   pinataGateway: "example-gateway.mypinata.cloud",
 * });
 *
 * const groups = await pinata.groups.delete({
 *	groupId: "3778c10d-452e-4def-8299-ee6bc548bdb0",
 * });
 */

import type { GetGroupOptions, PinataConfig } from "../types";

import {
	PinataError,
	NetworkError,
	AuthenticationError,
	ValidationError,
} from "../../utils/custom-errors";

export const deleteGroup = async (
	config: PinataConfig | undefined,
	options: GetGroupOptions,
): Promise<string> => {
	if (!config || !config.pinataJwt) {
		throw new ValidationError("Pinata configuration or JWT is missing");
	}

	try {
		const request = await fetch(
			`https://api.pinata.cloud/groups/${options.groupId}`,
			{
				method: "DELETE",
				headers: {
					Source: "sdk/deleteGroup",
					"Content-Type": "application/json",
					Authorization: `Bearer ${config?.pinataJwt}`,
				},
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

		const res: string = await request.text();
		return res;
	} catch (error) {
		if (error instanceof PinataError) {
			throw error;
		}
		if (error instanceof Error) {
			throw new PinataError(`Error processing deleteGroup: ${error.message}`);
		}
		throw new PinataError("An unknown error occurred while deleting a group");
	}
};
