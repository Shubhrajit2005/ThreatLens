import env from "../../config/env.js";

const enrichIP = async (ip) => {
  if (!ip) {
    throw new Error("IP address is required");
  }

  if (!env.ipinfoToken) {
    throw new Error("IPinfo token is not configured");
  }

  const response = await fetch(
    `https://api.ipinfo.io/lite/${ip}?token=${env.ipinfoToken}`,
  );

  if (!response.ok) {
    throw new Error(`IPinfo API request failed with status ${response.status}`);
  }
  const data = await response.json();

  if (data.bogon) {
    return {
      country: null,
      asn: null,
      organization: null,
      malwareFamily: null,
      reputation: null,
    };
  }

  return {
    country: data.country_code || null,
    asn: data.asn || null,
    organization: data.as_name || null,
    malwareFamily: null,
    reputation: null,
  };
};

export default enrichIP;
