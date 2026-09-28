import Investigation from "../models/Investigation.js";
import IOC from "../models/IOC.js";
import createAuditLog from "../services/auditLogService.js";

export const createInvestigation = async (req, res, next) => {
  try {
    const { title, iocId, priority } = req.body;

    const ioc = await IOC.findById(iocId);

    if (!ioc) {
      return res.status(404).json({
        success: false,
        message: "IOC not found",
      });
    }

    const investigation = await Investigation.create({
      title,
      iocId,
      analystId: req.user.userId,
      priority: priority || "medium",
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "investigation_created",
      resourceType: "investigation",
      resourceId: investigation._id,
      ipAddress: req.ip,
      details: {
        title: investigation.title,
        iocId: investigation.iocId,
        priority: investigation.priority,
      },
    });

    res.status(201).json({
      success: true,
      message: "Investigation created successfully",
      investigation,
    });
  } catch (error) {
    next(error);
  }
};

export const getInvestigations = async (req, res, next) => {
  try {
    const investigations = await Investigation.find()
      .populate("iocId")
      .populate("analystId", "username email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: investigations.length,
      investigations,
    });
  } catch (error) {
    next(error);
  }
};

export const getInvestigationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const investigation = await Investigation.findById(id)
      .populate("iocId")
      .populate("analystId", "username email role");

    if (!investigation) {
      return res.status(404).json({
        success: false,
        message: "Investigation not found",
      });
    }

    res.status(200).json({
      success: true,
      investigation,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInvestigation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { priority, status } = req.body;

    const investigation = await Investigation.findById(id);

    if (!investigation) {
      return res.status(404).json({
        success: false,
        message: "Investigation not found",
      });
    }

    if (priority !== undefined) {
      investigation.priority = priority;
    }

    if (status !== undefined) {
      investigation.status = status;
    }

    await investigation.save();
    await createAuditLog({
      userId: req.user.userId,
      action: "investigation_updated",
      resourceType: "investigation",
      resourceId: investigation._id,
      ipAddress: req.ip,
      details: {
        priority: investigation.priority,
        status: investigation.status,
      },
    });

    res.status(200).json({
      success: true,
      message: "Investigation updated successfully",
      investigation,
    });
  } catch (error) {
    next(error);
  }
};

export const addInvestigationNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const investigation = await Investigation.findById(id);

    if (!investigation) {
      return res.status(404).json({
        success: false,
        message: "Investigation not found",
      });
    }

    investigation.notes.push({
      text,
      authorId: req.user.userId,
    });

    await investigation.save();

    await createAuditLog({
      userId: req.user.userId,
      action: "investigation_note_added",
      resourceType: "investigation",
      resourceId: investigation._id,
      ipAddress: req.ip,
      details: {
        noteText: text,
      },
    });

    res.status(201).json({
      success: true,
      message: "Investigation note added successfully",
      note: investigation.notes[investigation.notes.length - 1],
    });
  } catch (error) {
    next(error);
  }
};
