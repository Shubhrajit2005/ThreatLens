import enrichIP from "./providers/ipEnrichmentProvider.js";



const enrichDomain = async (ioc) => {
  return {
    country: null,
    asn: null,
    organization: "Example Organization",
    malwareFamily: null,
    reputation: 50,
  };
};

const enrichURL = async (ioc) => {
  return {
    country: null,
    asn: null,
    organization: null,
    malwareFamily: null,
    reputation: 50,
  };
};

const enrichHash = async (ioc) => {
  return {
    country: null,
    asn: null,
    organization: null,
    malwareFamily: "Unknown",
    reputation: 50,
  };
};

const enrichIOC = async (ioc) => {
  if (!ioc) {
    throw new Error("IOC is required");
  }

  if (!ioc.type) {
    throw new Error("IOC type is required");
  }
  
  switch (ioc.type) {
    case "ipv4":
    case "ipv6":
      return await enrichIP(ioc.value);

    case "domain":
      return await enrichDomain(ioc);

    case "url":
      return await enrichURL(ioc);

    case "md5":
    case "sha1":
    case "sha256":
      return await enrichHash(ioc);

    default:
      throw new Error(`Unsupported IOC type: ${ioc.type}`);
  }
};

export default enrichIOC;