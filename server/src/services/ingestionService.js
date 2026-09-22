import { validateIOC } from "../utils/iocValidator.js";
import { normalizeIOC } from "./normalizationService.js";
import {
  deduplicateIOC,
  createIOCIfNotExists,
} from "./deduplicationService.js";
import enrichIOC from "./enrichmentService.js";
import calculateRiskScore, {
  getRiskLevel,
  getSourceReliability,
  calculateRecencyScore,
  getSeverityScore,
} from "./riskScoringService.js";

export const ingestIOCs = async (rawIOCs) => {
  if (!Array.isArray(rawIOCs)) {
    throw new Error("IOC data must be an array");
  }

  const results = {
    total: rawIOCs.length,
    created: 0,
    duplicates: 0,
    invalid: 0,
  };

  for (const rawIOC of rawIOCs) {
    try {
      const { value, type, source, confidence, severity, tags } = rawIOC;

      const isValid = validateIOC(value, type);

      if (!isValid) {
        results.invalid++;
        continue;
      }

      const normalizedValue = normalizeIOC(value, type);

      const duplicateResult = await deduplicateIOC({
        value,
        type,
        normalizedValue,
        source,
      });

      if (duplicateResult.isDuplicate) {
        results.duplicates++;
        continue;
      }

      const sourceReliability = getSourceReliability(source?.feedName);

      const recency = calculateRecencyScore(source?.lastSeen);

      const riskScore = calculateRiskScore({
        confidence: confidence ?? 0,
        sourceReliability,
        recency,
        sourceCount: source ? 1 : 0,
        severity: getSeverityScore(severity),
      });

      const createResult = await createIOCIfNotExists({
        value: value.trim(),
        normalizedValue,
        type,
        confidence: confidence ?? 0,
        risk: {
          score: riskScore,
          level: getRiskLevel(riskScore),
        },
        tags: tags ?? [],
        sources: source ? [source] : [],
      });

      if (createResult.created) {
        try {
          const enrichment = await enrichIOC({
            value: value.trim(),
            type,
          });

          createResult.ioc.enrichment = enrichment;

          await createResult.ioc.save();

          console.log(`Enrichment completed for IOC: ${value}`);
        } catch (error) {
          console.error(`Enrichment failed for IOC: ${value}`, error.message);
        }

        results.created++;
      }
    } catch (error) {
      console.error(
        `Failed to ingest IOC: ${rawIOC?.value || "unknown"}`,
        error.message,
      );
    }
  }

  return results;
};
