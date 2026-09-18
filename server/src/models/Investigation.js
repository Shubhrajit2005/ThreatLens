import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const investigationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    iocId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IOC",
      required: true,
    },

    analystId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    status: {
      type: String,
      enum: [
        "open",
        "in_progress",
        "resolved",
        "false_positive",
      ],
      default: "open",
    },

    notes: {
      type: [noteSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

investigationSchema.index({ iocId: 1 });

investigationSchema.index({ analystId: 1 });

investigationSchema.index({ status: 1 });

investigationSchema.index({ priority: 1 });

const Investigation = mongoose.model(
  "Investigation",
  investigationSchema
);

export default Investigation;