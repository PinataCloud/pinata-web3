import { convertIPFSUrl } from "../../src/core/gateway/convertIPFSUrl";
import type { PinataConfig } from "../../src";
import { containsCID } from "../../src/utils/gateway-tools";

// Mock the gateway-tools module
jest.mock("../../src/utils/gateway-tools", () => ({
	convertToDesiredGateway: jest.fn(async (url, gateway) => {
		if (url.includes("Qm")) {
			return `${gateway}/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG`;
		}
		throw new Error("url does not contain CID");
	}),
	containsCID: jest.fn(async (input) => {
		if (input.includes("Qm")) {
			return {
				containsCid: true,
				cid: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
			};
		}
		return { containsCid: false, cid: null };
	}),
}));

describe("convertIPFSUrl and containsCID", () => {
	const mockConfig: PinataConfig = {
		pinataJwt: "test-jwt",
		pinataGateway: "https://mygateway.mypinata.cloud",
		pinataGatewayKey: "my-gateway-key",
	};

	it("should convert IPFS URL with CID", async () => {
		const inputUrl = "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
		const expectedUrl =
			"https://mygateway.mypinata.cloud/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
		const result = await convertIPFSUrl(mockConfig, inputUrl);
		expect(result).toEqual(expectedUrl);
	});

	it("should convert HTTP URL with /ipfs/ path", async () => {
		const inputUrl =
			"https://ipfs.io/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
		const expectedUrl =
			"https://mygateway.mypinata.cloud/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
		const result = await convertIPFSUrl(mockConfig, inputUrl);
		expect(result).toEqual(expectedUrl);
	});

	it("should convert URL with CID in subdomain", async () => {
		const inputUrl =
			"https://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG.ipfs.dweb.link";
		const expectedUrl =
			"https://mygateway.mypinata.cloud/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
		const result = await convertIPFSUrl(mockConfig, inputUrl);
		expect(result).toEqual(expectedUrl);
	});

	it("should handle URLs without a gateway key", async () => {
		const configWithoutKey: PinataConfig = {
			pinataJwt: "test-jwt",
			pinataGateway: "https://mygateway.mypinata.cloud",
		};
		const inputUrl = "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
		const expectedUrl =
			"https://mygateway.mypinata.cloud/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
		const result = await convertIPFSUrl(configWithoutKey, inputUrl);
		expect(result).toEqual(expectedUrl);
	});

	it("should throw an error for invalid IPFS URLs", async () => {
		const invalidUrl = "https://example.com/not-an-ipfs-url";
		await expect(convertIPFSUrl(mockConfig, invalidUrl)).rejects.toThrow(
			"url does not contain CID",
		);
	});

	it("should not append gateway key to URL", async () => {
		const inputUrl = "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
		const expectedUrl =
			"https://mygateway.mypinata.cloud/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
		const result = await convertIPFSUrl(mockConfig, inputUrl);
		expect(result).toEqual(expectedUrl);
		expect(result).not.toContain("pinataGatewayToken");
	});

	// New test for optional gatewayPrefix
	it("should use optional gatewayPrefix when provided", async () => {
		const inputUrl = "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
		const gatewayPrefix = "https://custom-gateway.example.com";
		const expectedUrl =
			"https://custom-gateway.example.com/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
		const result = await convertIPFSUrl(mockConfig, inputUrl, gatewayPrefix);
		expect(result).toEqual(expectedUrl);
	});

	// Tests for containsCID
	it("should return true for URL containing CID", async () => {
		const inputUrl = "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
		const result = await containsCID(inputUrl);
		expect(result).toEqual({
			containsCid: true,
			cid: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
		});
	});

	it("should return false for URL not containing CID", async () => {
		const inputUrl = "https://example.com/not-an-ipfs-url";
		const result = await containsCID(inputUrl);
		expect(result).toEqual({ containsCid: false, cid: null });
	});
});
