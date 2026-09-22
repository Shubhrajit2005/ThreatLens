import IOC from "../models/IOC.js";
import { normalizeIOC } from "../services/normalizationService.js";
import { validateIOC } from "../utils/iocValidator.js";
import enrichIOC from "../services/enrichmentService.js";
import calculateRiskScore, {
  getRiskLevel,
} from "../services/riskScoringService.js";

export const createIOC = async (req, res, next) => {
  try {
    const { value, type, confidence, tags } = req.body;

    if (!value || !type) {
      return res.status(400).json({
        success: false,
        message: "IOC value and type are required",
      });
    }

    const isValid = validateIOC(value, type);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid IOC value for the specified type",
      });
    }

    const normalizedValue = normalizeIOC(value, type);

    const existingIOC = await IOC.findOne({
      normalizedValue,
      type,
    });

    if (existingIOC) {
      return res.status(409).json({
        success: false,
        message: "IOC already exists",
        data: existingIOC,
      });
    }

const riskScore = calculateRiskScore({
  confidence: confidence ?? 0,
  sourceReliability: 0,
  recency: 0,
  sourceCount: 0,
  severity: 0,
});

const ioc = await IOC.create({
  value: value.trim(),
  normalizedValue,
  type,
  confidence: confidence ?? 0,
  risk: {
    score: riskScore,
    level: getRiskLevel(riskScore),
  },
  tags: tags ?? [],
});

const enrichment = await enrichIOC({
  value: ioc.value,
  type: ioc.type,
});

ioc.enrichment = enrichment;

await ioc.save();

    res.status(201).json({
      success: true,
      message: "IOC created successfully",
      data: ioc,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllIOCs = async (req, res, next) => {
  try {
    const iocs = await IOC.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: iocs.length,
      data: iocs,
    });
  } catch (error) {
    next(error);
  }
};

export const getIOCById = async (req, res, next) => {
  try {
    const ioc = await IOC.findById(req.params.id);

    if (!ioc) {
      return res.status(404).json({
        success: false,
        message: "IOC not found",
      });
    }

    res.status(200).json({
      success: true,
      data: ioc,
    });
  } catch (error) {
    next(error);
  }
};

export const updateIOC = async (req, res, next) => {
  try {
    const { confidence, tags, status } = req.body;

    const ioc = await IOC.findById(req.params.id);

    if (!ioc) {
      return res.status(404).json({
        success: false,
        message: "IOC not found",
      });
    }

    if (confidence !== undefined) {
      ioc.confidence = confidence;

      const sourceCount = ioc.sources?.length ?? 0;

      const riskScore = calculateRiskScore({
        confidence,
        sourceReliability: 0,
        recency: 0,
        sourceCount,
        severity: 0,
      });

      ioc.risk.score = riskScore;
      ioc.risk.level = getRiskLevel(riskScore);
    }

    if (tags !== undefined) {
      ioc.tags = tags;
    }

    if (status !== undefined) {
      ioc.status = status;
    }

    await ioc.save();

    res.status(200).json({
      success: true,
      message: "IOC updated successfully",
      data: ioc,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteIOC = async (req, res, next) => {
  try {
    const ioc = await IOC.findByIdAndDelete(req.params.id);

    if (!ioc) {
      return res.status(404).json({
        success: false,
        message: "IOC not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "IOC deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};