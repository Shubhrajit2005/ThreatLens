import BaseFeed from "./BaseFeed.js";

class OTXFeed extends BaseFeed {
  async fetch() {
    throw new Error("OTX fetch() not implemented");
  }

  normalize(data) {
    if (!data) {
      throw new Error("OTX data is required");
    }

const typeMap = {
  IPv4: "ipv4",
  IPv6: "ipv6",
  domain: "domain",
  hostname: "domain",
  URL: "url",
  URI: "url",
  "FileHash-MD5": "md5",
  "FileHash-SHA1": "sha1",
  "FileHash-SHA256": "sha256",
};
    const type = typeMap[data.type];

    if (!type) {
      throw new Error(`Unsupported OTX indicator type: ${data.type}`);
    }

    return {
      value: data.indicator,
      type,
      source: {
        name: "OTX",
        reference: data.id || null,
      },
      confidence: data.confidence ?? 0,
      firstSeen: data.created || null,
      lastSeen: data.modified || null,
      tags: data.tags || [],
    };
  }
}

export default OTXFeed;