import BaseFeed from "./BaseFeed.js";

class URLhausFeed extends BaseFeed {
  async fetch() {
    throw new Error("URLhaus fetch() not implemented");
  }

  normalize(data) {
    if (!data) {
      throw new Error("URLhaus data is required");
    }

    if (!data.url) {
      throw new Error("URLhaus URL is required");
    }

    return {
      value: data.url,
      type: "url",
      source: {
        name: "URLhaus",
        reference: data.id || data.urlhaus_link || null,
      },
      confidence: data.threat_score ?? 0,
      firstSeen: data.dateadded || null,
      lastSeen: data.last_online || null,
      tags: data.tags || [],
    };
  }
}

export default URLhausFeed;