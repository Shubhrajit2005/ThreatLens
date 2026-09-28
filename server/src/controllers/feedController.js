import { SOURCE_RELIABILITY } from "../utils/constants.js";

const FEED_METADATA = {
  OTX: {
    type: "Threat Intelligence",
    description: "AlienVault Open Threat Exchange community threat intelligence feed.",
    supportedIOCtypes: [
      "ipv4",
      "ipv6",
      "domain",
      "url",
      "md5",
      "sha1",
      "sha256",
    ],
  },

  URLhaus: {
    type: "Malware URLs",
    description: "Abuse.ch URLhaus feed containing malware distribution URLs.",
    supportedIOCtypes: [
      "url",
      "domain",
      "ipv4",
    ],
  },

  MalwareBazaar: {
    type: "Malware Samples",
    description: "Abuse.ch MalwareBazaar feed containing malware sample hashes.",
    supportedIOCtypes: [
      "md5",
      "sha1",
      "sha256",
    ],
  },

  "CISA KEV": {
    type: "Vulnerability Intelligence",
    description: "CISA Known Exploited Vulnerabilities catalog.",
    supportedIOCtypes: [],
  },
};

export const getFeeds = async (req, res, next) => {
  try {
    const feeds = Object.entries(SOURCE_RELIABILITY).map(
      ([name, reliability]) => ({
        name,
        reliability,
        enabled: true,
        type: FEED_METADATA[name]?.type || "Threat Intelligence",
        description:
          FEED_METADATA[name]?.description || "",
        supportedIOCtypes:
          FEED_METADATA[name]?.supportedIOCtypes || [],
      })
    );

    res.status(200).json({
      success: true,
      count: feeds.length,
      feeds,
    });
  } catch (error) {
    next(error);
  }
};