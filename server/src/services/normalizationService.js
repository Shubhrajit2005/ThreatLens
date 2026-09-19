const normalizeURL = (value) => {
  try {
    const url = new URL(value);

    url.hostname = url.hostname.toLowerCase();

    return url.toString();
  } catch {
    throw new Error("Invalid URL");
  }
};

export const normalizeIOC = (value, type) => {
  if (!value || !type) {
    throw new Error("IOC value and type are required");
  }

  const trimmedValue = value.trim();

  switch (type) {
    case "domain":
    case "md5":
    case "sha1":
    case "sha256":
      return trimmedValue.toLowerCase();

    case "ipv4":
    case "ipv6":
      return trimmedValue;

    case "url":
      return normalizeURL(trimmedValue);

    default:
      throw new Error(`Unsupported IOC type: ${type}`);
  }
};