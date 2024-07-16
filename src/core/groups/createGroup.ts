/**
 * Uploads multiple file types
 * @returns message
 */

import { PinataConfig, GroupOptions, GroupResponseItem } from "../types";

export const createGroup = async (
  config: PinataConfig | undefined,
  options: GroupOptions,
) => {
  try {
    const data = JSON.stringify(options);

    const request = await fetch(`https://api.pinata.cloud/groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config?.pinataJwt}`,
      },
      body: data,
    });
    const res: GroupResponseItem = await request.json();
    return res;
  } catch (error) {
    throw error;
  }
};
