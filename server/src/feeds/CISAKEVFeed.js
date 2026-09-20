import BaseFeed from "./BaseFeed.js";

class CISAKEVFeed extends BaseFeed {
  async fetch() {
    throw new Error("CISA KEV fetch() not implemented");
  }

  normalize(data) {
    if (!data) {
      throw new Error("CISA KEV data is required");
    }

    if (!data.cveID) {
      throw new Error("CISA KEV CVE ID is required");
    }

    return {
      value: data.cveID,
      type: "cve",
      source: {
        name: "CISA KEV",
        reference: data.cveID,
      },
      confidence: 100,
      firstSeen: data.dateAdded || null,
      lastSeen: data.dueDate || null,
      tags: [
        "known-exploited-vulnerability",
        data.vendorProject,
        data.product,
      ].filter(Boolean),
    };
  }
}

export default CISAKEVFeed;