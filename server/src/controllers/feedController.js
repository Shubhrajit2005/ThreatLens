import { SOURCE_RELIABILITY } from "../utils/constants.js";

export const getFeeds = async (req, res, next) => {
  try {
    const feeds = Object.entries(SOURCE_RELIABILITY).map(
      ([name, reliability]) => ({
        name,
        reliability,
        enabled: true,
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