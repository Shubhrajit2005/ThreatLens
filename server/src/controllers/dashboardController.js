import IOC from "../models/IOC.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalIOCs,
      activeIOCs,
      reviewedIOCs,
      falsePositiveIOCs,
      archivedIOCs,
      riskDistribution,
      typeDistribution,
    ] = await Promise.all([
      IOC.countDocuments(),
      IOC.countDocuments({ status: "active" }),
      IOC.countDocuments({ status: "reviewed" }),
      IOC.countDocuments({ status: "false_positive" }),
      IOC.countDocuments({ status: "archived" }),

      IOC.aggregate([
        {
          $group: {
            _id: "$risk.level",
            count: { $sum: 1 },
          },
        },
      ]),

      IOC.aggregate([
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalIOCs,
        status: {
          active: activeIOCs,
          reviewed: reviewedIOCs,
          falsePositive: falsePositiveIOCs,
          archived: archivedIOCs,
        },
        riskDistribution,
        typeDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};