/**
 * Updates the information of a specified group in Pinata.
 *
 * This function allows you to modify the name of an existing group in your Pinata account.
 * It's useful for renaming groups to better organize your pinned content.
 *
 * @async
 * @function updateGroup
 * @param {PinataConfig | undefined} config - The Pinata configuration object containing the JWT.
 * @param {UpdateGroupOptions} options - The options for updating a group.
 * @param {string} options.groupId - The ID of the group to be updated.
 * @param {string} options.name - The new name for the group.
 * @returns {Promise<GroupResponseItem>} A promise that resolves to an object containing the updated group's details.
 * @throws {ValidationError} If the Pinata configuration or JWT is missing.
 * @throws {AuthenticationError} If the authentication fails (e.g., invalid JWT).
 * @throws {NetworkError} If there's a network-related error during the API request.
 * @throws {PinataError} For any other errors that occur during the group update process.
 *
 * @example
 * import { PinataSDK } from "pinata";
 *
 * const pinata = new PinataSDK({
 *   pinataJwt: process.env.PINATA_JWT!,
 *   pinataGateway: "example-gateway.mypinata.cloud",
 * });
 *
 * const groups = await pinata.groups.update({
 *	groupId: "3778c10d-452e-4def-8299-ee6bc548bdb0",
 *	name: "My New Group 2"
 * });
 */

import type {
	PinataConfig,
	GroupResponseItem,
	UpdateGroupOptions,
} from "../types";

import {
	PinataError,
	NetworkError,
	AuthenticationError,
	ValidationError,
} from "../../utils/custom-errors";

export const updateGroup = async (
	config: PinataConfig | undefined,
	options: UpdateGroupOptions,
): Promise<GroupResponseItem> => {
	if (!config || !config.pinataJwt) {
		throw new ValidationError("Pinata configuration or JWT is missing");
	}

	const data = JSON.stringify({
		name: options.name,
	});

	try {
		const request = await fetch(
			`https://api.pinata.cloud/groups/${options.groupId}`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${config?.pinataJwt}`,
				},
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

		const res: GroupResponseItem = await request.json();
		return res;
	} catch (error) {
		if (error instanceof PinataError) {
			throw error;
		}
		if (error instanceof Error) {
			throw new PinataError(`Error processing updateGroup: ${error.message}`);
		}
		throw new PinataError("An unknown error occurred while updating group");
	}
};
