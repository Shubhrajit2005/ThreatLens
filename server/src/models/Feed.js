import mongoose from "mongoose";

const feedSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "otx",
        "urlhaus",
        "malwarebazaar",
        "cisa_kev",
      ],
    },

    description: {
      type: String,
      trim: true,
    },

    enabled: {
      type: Boolean,
      default: true,
    },

    schedule: {
      type: String,
      default: "manual",
    },

    lastSync: {
      type: Date,
      default: null,
    },

    lastSyncStatus: {
      type: String,
      enum: ["success", "failed", "running"],
      default: "failed",
    },

    totalImported: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Feed = mongoose.model("Feed", feedSchema);

export default Feed;