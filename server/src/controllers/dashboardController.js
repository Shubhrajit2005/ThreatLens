import IOC from "../models/IOC.js";
import Investigation from "../models/Investigation.js";

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

      IOC.countDocuments({
        status: "active",
      }),

      IOC.countDocuments({
        status: "reviewed",
      }),

      IOC.countDocuments({
        status: "false_positive",
      }),

      IOC.countDocuments({
        status: "archived",
      }),

      IOC.aggregate([
        {
          $group: {
            _id: "$risk.level",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]),

      IOC.aggregate([
        {
          $group: {
            _id: "$type",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
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

export const getDashboardOverview = async (req, res, next) => {
  try {
    const [
      totalIOCs,
      statusDistribution,
      riskDistribution,
      typeDistribution,
      feedStatistics,
      recentIOCs,
      recentInvestigations,
    ] = await Promise.all([
      IOC.countDocuments(),

      IOC.aggregate([
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]),

      IOC.aggregate([
        {
          $group: {
            _id: "$risk.level",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]),

      IOC.aggregate([
        {
          $group: {
            _id: "$type",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]),

      IOC.aggregate([
        {
          $unwind: "$sources",
        },
        {
          $group: {
            _id: "$sources.feedName",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]),

      IOC.find()
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .select(
          "value type risk confidence status sources createdAt"
        )
        .lean(),

      Investigation.find()
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .populate(
          "iocId",
          "value type risk status"
        )
        .populate(
          "analystId",
          "username"
        )
        .select(
          "title iocId analystId priority status createdAt updatedAt"
        )
        .lean(),
    ]);

    res.status(200).json({
      success: true,

      dashboard: {
        totalIOCs,

        statusDistribution,

        riskDistribution,

        typeDistribution,

        feedStatistics,

        recentIOCs,

        recentInvestigations,
      },
    });
  } catch (error) {
    next(error);
  }
};