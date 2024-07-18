/**
 * Uploads multiple file types
 * @returns message
 */

import type { PinataConfig, UserPinnedDataResponse } from "../types";

export const pinnedFileCount = async (
  config: PinataConfig | undefined,
): Promise<number> => {
  const url = "https://api.pinata.cloud/data/userPinnedDataTotal";

  const request = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config?.pinataJwt}`,
    },
  });
  if (!request.ok) {
    throw new Error("Problem fetching pinned data totals");
  }
  const res: UserPinnedDataResponse = await request.json();
  return res.pin_count;
};
