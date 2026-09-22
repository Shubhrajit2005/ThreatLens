import { SOURCE_RELIABILITY } from "../utils/constants.js";

const clampScore = (score) => {
  return Math.max(0, Math.min(100, score));
};

export const getSourceReliability = (sourceName) => {
  if (!sourceName) {
    return 0;
  }

  return SOURCE_RELIABILITY[sourceName] ?? 0;
};


export const calculateRecencyScore = (date) => {
  if (!date) {
    return 0;
  }

  const timestamp = new Date(date).getTime();

  if (Number.isNaN(timestamp)) {
    return 0;
  }

  const ageInDays =
    (Date.now() - timestamp) / (1000 * 60 * 60 * 24);

  if (ageInDays <= 1) {
    return 100;
  }

  if (ageInDays <= 7) {
    return 80;
  }

  if (ageInDays <= 30) {
    return 60;
  }

  if (ageInDays <= 90) {
    return 40;
  }

  if (ageInDays <= 180) {
    return 20;
  }

  return 0;
};

export const getSeverityScore = (severity) => {
  if (!severity) {
    return 0;
  }

  const normalizedSeverity = severity.toString().toLowerCase();

  const severityScores = {
    critical: 100,
    high: 80,
    medium: 60,
    low: 30,
  };

  return severityScores[normalizedSeverity] ?? 0;
};

const calculateRiskScore = ({
  confidence = 0,
  sourceReliability = 0,
  recency = 0,
  sourceCount = 0,
  severity = 0,
}) => {
  const normalizedConfidence = clampScore(confidence);
  const normalizedReliability = clampScore(sourceReliability);
  const normalizedRecency = clampScore(recency);
  const normalizedSeverity = clampScore(severity);

  const normalizedSourceCount = clampScore(sourceCount * 20);

  const score =
    normalizedConfidence * 0.30 +
    normalizedReliability * 0.25 +
    normalizedRecency * 0.15 +
    normalizedSourceCount * 0.20 +
    normalizedSeverity * 0.10;

  return Math.round(score);
};

export const getRiskLevel = (score) => {
  if (score >= 80) {
    return "critical";
  }

  if (score >= 60) {
    return "high";
  }

  if (score >= 30) {
    return "medium";
  }

  return "low";
};

export default calculateRiskScore;