import mongoose from "mongoose";

const sourceSchema = new mongoose.Schema(
  {
    feedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feed",
    },

    feedName: {
      type: String,
      required: true,
    },

    sourceReference: {
      type: String,
    },

    firstSeen: {
      type: Date,
    },

    lastSeen: {
      type: Date,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const iocSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      trim: true,
    },

    normalizedValue: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "ipv4",
        "ipv6",
        "domain",
        "url",
        "md5",
        "sha1",
        "sha256",
      ],
    },

    risk: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      level: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "low",
      },
    },

    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    sources: {
      type: [sourceSchema],
      default: [],
    },

    enrichment: {
      country: String,
      asn: String,
      organization: String,
      malwareFamily: String,
      reputation: {
        type: Number,
        min: 0,
        max: 100,
      },
    },

    tags: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["active", "reviewed", "false_positive", "archived"],
      default: "active",
    },

    firstSeen: {
      type: Date,
    },

    lastSeen: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

iocSchema.index(
  { normalizedValue: 1, type: 1 },
  { unique: true }
);

iocSchema.index({ type: 1 });

iocSchema.index({ "risk.level": 1 });

iocSchema.index({ status: 1 });

iocSchema.index({ lastSeen: -1 });

iocSchema.index({ tags: 1 });

const IOC = mongoose.model("IOC", iocSchema);

export default IOC;