import enrichIOC from "../src/services/enrichmentService.js";

const runTest = async () => {
  try {
    console.log("\n--- Enrichment Service Test Started ---");

    const testIOC = {
      value: "8.8.8.8",
      type: "ipv4",
    };

    const result = await enrichIOC(testIOC);

    if (result) {
      console.log("PASS: Enrichment service returned a result");
    } else {
      console.log("FAIL: Enrichment service returned no result");
    }

    const expectedFields = [
      "country",
      "asn",
      "organization",
      "malwareFamily",
      "reputation",
    ];

    const allFieldsPresent = expectedFields.every((field) =>
      Object.hasOwn(result, field),
    );

    if (allFieldsPresent) {
      console.log("PASS: All enrichment fields are present");
    } else {
      console.log("FAIL: Enrichment fields are missing");
    }

    // ----------------------------------------
    // IP enrichment test
    // ----------------------------------------

    // IP enrichment test
    if (
      typeof result.country === "string" &&
      result.country.length > 0 &&
      typeof result.asn === "string" &&
      result.asn.length > 0 &&
      typeof result.organization === "string" &&
      result.organization.length > 0 &&
      result.malwareFamily === null &&
      result.reputation === null
    ) {
      console.log("PASS: IP enrichment data is correct");
    } else {
      console.log("FAIL: IP enrichment data is incorrect");
    }
    // ----------------------------------------
    // Domain enrichment test
    // ----------------------------------------

    const domainResult = await enrichIOC({
      value: "example.com",
      type: "domain",
    });

    if (
      domainResult.country === null &&
      domainResult.asn === null &&
      domainResult.organization === "Example Organization" &&
      domainResult.malwareFamily === null &&
      domainResult.reputation === 50
    ) {
      console.log("PASS: Domain enrichment data is correct");
    } else {
      console.log("FAIL: Domain enrichment data is incorrect");
    }

    // ----------------------------------------
    // URL enrichment test
    // ----------------------------------------

    const urlResult = await enrichIOC({
      value: "https://example.com/test",
      type: "url",
    });

    if (
      urlResult.country === null &&
      urlResult.asn === null &&
      urlResult.organization === null &&
      urlResult.malwareFamily === null &&
      urlResult.reputation === 50
    ) {
      console.log("PASS: URL enrichment data is correct");
    } else {
      console.log("FAIL: URL enrichment data is incorrect");
    }

    // ----------------------------------------
    // Hash enrichment test
    // ----------------------------------------

    const hashResult = await enrichIOC({
      value: "d41d8cd98f00b204e9800998ecf8427e",
      type: "md5",
    });

    if (
      hashResult.country === null &&
      hashResult.asn === null &&
      hashResult.organization === null &&
      hashResult.malwareFamily === "Unknown" &&
      hashResult.reputation === 50
    ) {
      console.log("PASS: Hash enrichment data is correct");
    } else {
      console.log("FAIL: Hash enrichment data is incorrect");
    }

    console.log("\nENRICHMENT SERVICE TEST COMPLETED");
  } catch (error) {
    console.error("ENRICHMENT SERVICE TEST FAILED:", error.message);

    process.exit(1);
  }
};

runTest();
