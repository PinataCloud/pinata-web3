/**
 * Uploads multiple file types
 * @returns message
 */

import type { PinataConfig, PinResponse, UploadOptions } from "../types";

export const uploadUrl = async (
  config: PinataConfig | undefined,
  url: string,
  options?: UploadOptions,
) => {
  let jwt: string | undefined;
  if (options?.keys) {
    jwt = options.keys;
  } else {
    jwt = config?.pinataJwt;
  }
  const data = new FormData();

  const stream = await fetch(url);

  if (!stream.ok) {
    throw new Error("Problem fetching URL");
  }

  const arrayBuffer = await stream.arrayBuffer();

  const blob = new Blob([arrayBuffer]);

  const name = options?.metadata?.name ?? "url_upload";

  const file = new File([blob], name);

  data.append("file", file, name);

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
      name: name,
      keyvalues: options?.metadata?.keyValues,
    }),
  );

  const request = await fetch(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: data,
    },
  );
  if (!request.ok) {
    throw new Error("Problem uploading URL");
  }
  const res: PinResponse = await request.json();
  return res;
};
