import net from "node:net";

const ipv4Regex =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

const domainRegex =
  /^(?=.{1,253}$)(?!-)([a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$/;

const urlRegex =
  /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

const md5Regex =
  /^[a-fA-F0-9]{32}$/;

const sha1Regex =
  /^[a-fA-F0-9]{40}$/;

const sha256Regex =
  /^[a-fA-F0-9]{64}$/;

export const validateIOC = (value, type) => {
  if (!value || !type) {
    return false;
  }

  const normalizedValue = value.trim();

  switch (type) {
    case "ipv4":
      return ipv4Regex.test(normalizedValue);

    case "ipv6":
      return net.isIPv6(normalizedValue);

    case "domain":
      return domainRegex.test(normalizedValue);

    case "url":
      return urlRegex.test(normalizedValue);

    case "md5":
      return md5Regex.test(normalizedValue);

    case "sha1":
      return sha1Regex.test(normalizedValue);

    case "sha256":
      return sha256Regex.test(normalizedValue);

    default:
      return false;
  }
};