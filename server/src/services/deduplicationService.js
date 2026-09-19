import IOC from "../models/IOC.js";

export const findExistingIOC = async (
  normalizedValue,
  type
) => {
  if (!normalizedValue || !type) {
    throw new Error("Normalized IOC value and type are required");
  }

  return await IOC.findOne({
    normalizedValue,
    type,
  });
};

export const deduplicateIOC = async ({
  value,
  type,
  normalizedValue,
  source,
}) => {
  if (!value || !type || !normalizedValue) {
    throw new Error(
      "IOC value, type, and normalized value are required"
    );
  }

  const existingIOC = await findExistingIOC(
    normalizedValue,
    type
  );

  if (!existingIOC) {
    return {
      isDuplicate: false,
      ioc: null,
    };
  }

  if (source) {
    const sourceExists = existingIOC.sources.some(
      (existingSource) =>
        existingSource.feedName === source.feedName &&
        existingSource.sourceReference === source.sourceReference
    );

    if (!sourceExists) {
      existingIOC.sources.push(source);
      await existingIOC.save();
    }
  }

  return {
    isDuplicate: true,
    ioc: existingIOC,
  };
};

export const createIOCIfNotExists = async (iocData) => {
  try {
    const existingIOC = await findExistingIOC(
      iocData.normalizedValue,
      iocData.type
    );

    if (existingIOC) {
      return {
        created: false,
        duplicate: true,
        ioc: existingIOC,
      };
    }

    const newIOC = await IOC.create(iocData);

    return {
      created: true,
      duplicate: false,
      ioc: newIOC,
    };
  } catch (error) {
    // MongoDB duplicate key error
    if (error.code === 11000) {
      const existingIOC = await findExistingIOC(
        iocData.normalizedValue,
        iocData.type
      );

      return {
        created: false,
        duplicate: true,
        ioc: existingIOC,
      };
    }

    throw error;
  }
};