import calculateRiskScore, {
  getRiskLevel,
  getSourceReliability,
  calculateRecencyScore,
  getSeverityScore,
} from "../src/services/riskScoringService.js";

console.log("\n--- Risk Scoring Test Started ---");

// Test 1: Maximum score
const criticalScore = calculateRiskScore({
  confidence: 100,
  sourceReliability: 100,
  recency: 100,
  sourceCount: 5,
  severity: 100,
});

if (criticalScore === 100) {
  console.log("PASS: Maximum risk score is 100");
} else {
  console.log(`FAIL: Expected 100, got ${criticalScore}`);
}

if (getRiskLevel(100) === "critical") {
  console.log("PASS: 100 classified as critical");
} else {
  console.log("FAIL: 100 classification incorrect");
}

// Test 2: Minimum score
const lowScore = calculateRiskScore({
  confidence: 0,
  sourceReliability: 0,
  recency: 0,
  sourceCount: 0,
  severity: 0,
});

if (lowScore === 0) {
  console.log("PASS: Minimum risk score is 0");
} else {
  console.log(`FAIL: Expected 0, got ${lowScore}`);
}

if (getRiskLevel(0) === "low") {
  console.log("PASS: 0 classified as low");
} else {
  console.log("FAIL: 0 classification incorrect");
}

// Test 3: Medium score
const mediumScore = calculateRiskScore({
  confidence: 60,
  sourceReliability: 60,
  recency: 60,
  sourceCount: 2,
  severity: 60,
});

if (mediumScore === 56) {
  console.log("PASS: Medium risk score calculated correctly");
} else {
  console.log(`FAIL: Expected 52, got ${mediumScore}`);
}

if (getRiskLevel(mediumScore) === "medium") {
  console.log("PASS: Medium score classified correctly");
} else {
  console.log("FAIL: Medium score classification incorrect");
}

// Test 4: High score
const highScore = calculateRiskScore({
  confidence: 90,
  sourceReliability: 80,
  recency: 80,
  sourceCount: 3,
  severity: 90,
});

if (highScore === 80) {
  console.log("PASS: High risk score calculated correctly");
} else {
  console.log(`FAIL: Expected 85, got ${highScore}`);
}

if (getRiskLevel(highScore) === "critical") {
  console.log("PASS: 80 classified as critical");
} else {
  console.log("FAIL: 80 classification incorrect");
}

// Test 5: Boundary levels
if (
  getRiskLevel(29) === "low" &&
  getRiskLevel(30) === "medium" &&
  getRiskLevel(59) === "medium" &&
  getRiskLevel(60) === "high" &&
  getRiskLevel(79) === "high" &&
  getRiskLevel(80) === "critical"
) {
  console.log("PASS: Risk level boundaries are correct");
} else {
  console.log("FAIL: Risk level boundaries are incorrect");
}

const otxReliability = getSourceReliability("OTX");
const urlhausReliability = getSourceReliability("URLhaus");
const malwareBazaarReliability =
  getSourceReliability("MalwareBazaar");
const unknownReliability =
  getSourceReliability("UnknownFeed");

if (
  otxReliability === 70 &&
  urlhausReliability === 80 &&
  malwareBazaarReliability === 85 &&
  unknownReliability === 0
) {
  console.log("PASS: Source reliability mapping works correctly");
} else {
  console.log("FAIL: Source reliability mapping is incorrect");
}

const now = new Date();

const oneDayOld = new Date(
  now.getTime() - 24 * 60 * 60 * 1000
);

const tenDaysOld = new Date(
  now.getTime() - 10 * 24 * 60 * 60 * 1000
);

const oneHundredDaysOld = new Date(
  now.getTime() - 100 * 24 * 60 * 60 * 1000
);

if (
  calculateRecencyScore(now) === 100 &&
  calculateRecencyScore(oneDayOld) === 100 &&
  calculateRecencyScore(tenDaysOld) === 60 &&
  calculateRecencyScore(oneHundredDaysOld) === 20 &&
  calculateRecencyScore(null) === 0
) {
  console.log("PASS: Recency scoring works correctly");
} else {
  console.log("FAIL: Recency scoring is incorrect");
}

const criticalSeverity = getSeverityScore("critical");
const highSeverity = getSeverityScore("high");
const mediumSeverity = getSeverityScore("medium");
const lowSeverity = getSeverityScore("low");
const unknownSeverity = getSeverityScore("unknown");

if (
  criticalSeverity === 100 &&
  highSeverity === 80 &&
  mediumSeverity === 60 &&
  lowSeverity === 30 &&
  unknownSeverity === 0
) {
  console.log("PASS: Severity mapping works correctly");
} else {
  console.log("FAIL: Severity mapping is incorrect");
}

console.log("\nRISK SCORING TEST COMPLETED");