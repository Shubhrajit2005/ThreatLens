import "dotenv/config";
import mongoose from "mongoose";
import AuditLog from "../src/models/AuditLog.js";
import env from "../src/config/env.js";

const BASE_URL = "http://localhost:5000";

const test = async () => {
  console.log("Testing Investigation API...\n");

  await mongoose.connect(env.mongoUri);

  console.log("PASS: Test MongoDB connection established");

  // --------------------------------------------------
  // 1. Analyst login
  // --------------------------------------------------

  const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identifier: "iocanalyst",
      password: "ThreatLens@123",
    }),
  });

  const loginData = await loginResponse.json();

  if (!loginResponse.ok || !loginData.success) {
    throw new Error("Analyst login failed");
  }

  const token = loginData.token;

  console.log("PASS: Analyst login successful");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // --------------------------------------------------
  // Investigation creation audit test
  // --------------------------------------------------

  const auditTestTitle = "Audit Test Investigation";

  const auditCreateResponse = await fetch(`${BASE_URL}/api/investigations`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: auditTestTitle,
      iocId: "6ab7fa386fe3e17f03275f40",
      priority: "medium",
    }),
  });

  const auditCreateData = await auditCreateResponse.json();

  if (!auditCreateResponse.ok || !auditCreateData.success) {
    throw new Error("Audit test investigation creation failed");
  }

  const auditTestInvestigation = auditCreateData.investigation;

  console.log("PASS: Investigation created for audit test");

  const auditLog = await AuditLog.findOne({
    action: "investigation_created",
    resourceType: "investigation",
    resourceId: auditTestInvestigation._id,
  }).sort({ timestamp: -1 });

  if (!auditLog) {
    throw new Error("Audit log was not created for investigation creation");
  }

  console.log("PASS: Investigation creation audit log created");

  if (auditLog.userId.toString() !== loginData.user?.id?.toString()) {
    throw new Error("Audit log userId is incorrect");
  }

  console.log("PASS: Investigation creation audit user is correct");

  if (auditLog.details?.title !== auditTestTitle) {
    throw new Error("Audit log investigation details are incorrect");
  }

  console.log("PASS: Investigation creation audit details are correct");

  // Cleanup test investigation and audit log
  await AuditLog.findByIdAndDelete(auditLog._id);

  await mongoose.connection.db.collection("investigations").deleteOne({
    _id: auditTestInvestigation._id,
  });

  console.log("PASS: Audit test data cleaned up");

  // --------------------------------------------------
  // 2. List investigations
  // --------------------------------------------------

  const listResponse = await fetch(`${BASE_URL}/api/investigations`, {
    headers,
  });

  const listData = await listResponse.json();

  if (!listResponse.ok || !listData.success) {
    throw new Error("Investigation list request failed");
  }

  console.log("PASS: Investigation list returned successfully");

  // --------------------------------------------------
  // 3. Verify investigation exists
  // --------------------------------------------------

  if (!Array.isArray(listData.investigations)) {
    throw new Error("Investigations is not an array");
  }

  if (listData.investigations.length === 0) {
    throw new Error("No investigation found for testing");
  }

  const investigation = listData.investigations[0];

  const investigationId = investigation._id;

  console.log(`PASS: Investigation found (${investigationId})`);

  // --------------------------------------------------
  // 4. Get investigation by ID
  // --------------------------------------------------

  const getResponse = await fetch(
    `${BASE_URL}/api/investigations/${investigationId}`,
    {
      headers,
    },
  );

  const getData = await getResponse.json();

  if (!getResponse.ok || !getData.success) {
    console.log("GET investigation response status:", getResponse.status);
    console.log("GET investigation response body:", getData);

    throw new Error("Get investigation by ID failed");
  }

  console.log("PASS: Investigation retrieved by ID");

  // --------------------------------------------------
  // 5. Verify populated IOC
  // --------------------------------------------------

  if (!getData.investigation.iocId) {
    throw new Error("Investigation IOC was not populated");
  }

  console.log("PASS: Investigation IOC populated");

  // --------------------------------------------------
  // 6. Verify populated analyst
  // --------------------------------------------------

  if (!getData.investigation.analystId) {
    throw new Error("Investigation analyst was not populated");
  }

  console.log("PASS: Investigation analyst populated");

  // --------------------------------------------------
  // 7. Investigation update
  // --------------------------------------------------

  const updateResponse = await fetch(
    `${BASE_URL}/api/investigations/${investigationId}`,
    {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        priority: "critical",
        status: "in_progress",
      }),
    },
  );

  const updateData = await updateResponse.json();

  if (!updateResponse.ok || !updateData.success) {
    throw new Error("Investigation update failed");
  }

  console.log("PASS: Investigation updated successfully");

  if (updateData.investigation.priority !== "critical") {
    throw new Error("Investigation priority was not updated");
  }

  if (updateData.investigation.status !== "in_progress") {
    throw new Error("Investigation status was not updated");
  }

  // --------------------------------------------------
  // Investigation update audit test
  // --------------------------------------------------

  const updateAuditLog = await AuditLog.findOne({
    action: "investigation_updated",
    resourceType: "investigation",
    resourceId: investigationId,
  }).sort({ timestamp: -1 });

  if (!updateAuditLog) {
    throw new Error("Audit log was not created for investigation update");
  }

  console.log("PASS: Investigation update audit log created");

  if (updateAuditLog.userId.toString() !== loginData.user?.id?.toString()) {
    throw new Error("Investigation update audit user is incorrect");
  }

  console.log("PASS: Investigation update audit user is correct");

  if (
    updateAuditLog.details?.priority !== "critical" ||
    updateAuditLog.details?.status !== "in_progress"
  ) {
    throw new Error("Investigation update audit details are incorrect");
  }

  console.log("PASS: Investigation update audit details are correct");

  // --------------------------------------------------
  // 8. Note author integrity
  // --------------------------------------------------

  const spoofedAuthorId = "111111111111111111111111";

  const noteResponse = await fetch(
    `${BASE_URL}/api/investigations/${investigationId}/notes`,
    {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: "Testing note author integrity.",
        authorId: spoofedAuthorId,
      }),
    },
  );

  const noteData = await noteResponse.json();

  if (!noteResponse.ok || !noteData.success) {
    throw new Error("Adding investigation note failed");
  }

  console.log("PASS: Investigation note added");

  if (!noteData.note.authorId) {
    throw new Error("Note authorId is missing");
  }

  if (noteData.note.authorId.toString() === spoofedAuthorId) {
    throw new Error("Client was able to spoof note author");
  }

  console.log("PASS: Client cannot spoof note author");

  // --------------------------------------------------
  // Investigation note audit test
  // --------------------------------------------------

  const noteAuditLog = await AuditLog.findOne({
    action: "investigation_note_added",
    resourceType: "investigation",
    resourceId: investigationId,
  }).sort({ timestamp: -1 });

  if (!noteAuditLog) {
    throw new Error("Audit log was not created for investigation note");
  }

  console.log("PASS: Investigation note audit log created");

  if (noteAuditLog.userId.toString() !== loginData.user?.id?.toString()) {
    throw new Error("Investigation note audit user is incorrect");
  }

  console.log("PASS: Investigation note audit user is correct");

  if (noteAuditLog.details?.noteText !== "Testing note author integrity.") {
    throw new Error("Investigation note audit details are incorrect");
  }

  console.log("PASS: Investigation note audit details are correct");
  // --------------------------------------------------
  // 9. Investigation create validation
  // --------------------------------------------------

  const invalidCreateResponse = await fetch(`${BASE_URL}/api/investigations`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "",
      iocId: investigation.iocId._id,
      priority: "invalid-priority",
    }),
  });

  if (invalidCreateResponse.status !== 400) {
    throw new Error(
      `Expected 400 for invalid investigation create, received ${invalidCreateResponse.status}`,
    );
  }

  console.log("PASS: Invalid investigation create rejected");

  // --------------------------------------------------
  // 10. Investigation update validation
  // --------------------------------------------------

  const invalidUpdateResponse = await fetch(
    `${BASE_URL}/api/investigations/${investigationId}`,
    {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "invalid-status",
      }),
    },
  );

  if (invalidUpdateResponse.status !== 400) {
    throw new Error(
      `Expected 400 for invalid investigation status, received ${invalidUpdateResponse.status}`,
    );
  }

  console.log("PASS: Invalid investigation status rejected");

  // --------------------------------------------------
  // 11. Empty investigation update validation
  // --------------------------------------------------

  const emptyUpdateResponse = await fetch(
    `${BASE_URL}/api/investigations/${investigationId}`,
    {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    },
  );

  if (emptyUpdateResponse.status !== 400) {
    throw new Error(
      `Expected 400 for empty investigation update, received ${emptyUpdateResponse.status}`,
    );
  }

  console.log("PASS: Empty investigation update rejected");

  // --------------------------------------------------
  // 12. Invalid GET ID
  // --------------------------------------------------

  const invalidId = "not-a-valid-id";

  const invalidGetResponse = await fetch(
    `${BASE_URL}/api/investigations/${invalidId}`,
    {
      headers,
    },
  );

  if (invalidGetResponse.status !== 400) {
    throw new Error(
      `Expected 400 for invalid investigation ID on GET, received ${invalidGetResponse.status}`,
    );
  }

  console.log("PASS: Invalid investigation ID rejected on GET");

  // --------------------------------------------------
  // 13. Invalid PATCH ID
  // --------------------------------------------------

  const invalidPatchResponse = await fetch(
    `${BASE_URL}/api/investigations/${invalidId}`,
    {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "resolved",
      }),
    },
  );

  if (invalidPatchResponse.status !== 400) {
    throw new Error(
      `Expected 400 for invalid investigation ID on PATCH, received ${invalidPatchResponse.status}`,
    );
  }

  console.log("PASS: Invalid investigation ID rejected on PATCH");

  // --------------------------------------------------
  // 14. Invalid note ID
  // --------------------------------------------------

  const invalidNoteResponse = await fetch(
    `${BASE_URL}/api/investigations/${invalidId}/notes`,
    {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: "This request should be rejected.",
      }),
    },
  );

  if (invalidNoteResponse.status !== 400) {
    throw new Error(
      `Expected 400 for invalid investigation ID on notes, received ${invalidNoteResponse.status}`,
    );
  }

  console.log("PASS: Invalid investigation ID rejected on notes");

  // --------------------------------------------------
  // 15. Unauthenticated request
  // --------------------------------------------------

  const unauthenticatedResponse = await fetch(`${BASE_URL}/api/investigations`);

  if (unauthenticatedResponse.status !== 401) {
    throw new Error(
      `Expected 401 without authentication, received ${unauthenticatedResponse.status}`,
    );
  }

  // --------------------------------------------------
  // 16. Viewer role security regression
  // --------------------------------------------------

  const viewerLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identifier: "iocviewer",
      password: "ThreatLens@123",
    }),
  });

  const viewerLoginData = await viewerLoginResponse.json();

  if (!viewerLoginResponse.ok || !viewerLoginData.success) {
    throw new Error("Viewer login failed");
  }

  const viewerToken = viewerLoginData.token;

  console.log("PASS: Viewer login successful");

  const viewerHeaders = {
    Authorization: `Bearer ${viewerToken}`,
  };

  // Viewer can list investigations
  const viewerListResponse = await fetch(`${BASE_URL}/api/investigations`, {
    headers: viewerHeaders,
  });

  if (viewerListResponse.status !== 200) {
    throw new Error(
      `Expected 200 for viewer investigation list, received ${viewerListResponse.status}`,
    );
  }

  console.log("PASS: Viewer can list investigations");

  // Viewer can view investigation details
  const viewerGetResponse = await fetch(
    `${BASE_URL}/api/investigations/${investigationId}`,
    {
      headers: viewerHeaders,
    },
  );

  if (viewerGetResponse.status !== 200) {
    throw new Error(
      `Expected 200 for viewer investigation detail, received ${viewerGetResponse.status}`,
    );
  }

  console.log("PASS: Viewer can view investigation details");

  // Viewer cannot create investigations
  const viewerCreateResponse = await fetch(`${BASE_URL}/api/investigations`, {
    method: "POST",
    headers: {
      ...viewerHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "Viewer should not create this investigation",
      iocId: investigation.iocId._id,
      priority: "medium",
    }),
  });

  if (viewerCreateResponse.status !== 403) {
    throw new Error(
      `Expected 403 for viewer investigation create, received ${viewerCreateResponse.status}`,
    );
  }

  console.log("PASS: Viewer cannot create investigations");

  // Viewer cannot update investigations
  const viewerUpdateResponse = await fetch(
    `${BASE_URL}/api/investigations/${investigationId}`,
    {
      method: "PATCH",
      headers: {
        ...viewerHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "resolved",
      }),
    },
  );

  if (viewerUpdateResponse.status !== 403) {
    throw new Error(
      `Expected 403 for viewer investigation update, received ${viewerUpdateResponse.status}`,
    );
  }

  console.log("PASS: Viewer cannot update investigations");

  // Viewer cannot add investigation notes
  const viewerNoteResponse = await fetch(
    `${BASE_URL}/api/investigations/${investigationId}/notes`,
    {
      method: "POST",
      headers: {
        ...viewerHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: "Viewer should not be able to add this note.",
      }),
    },
  );

  if (viewerNoteResponse.status !== 403) {
    throw new Error(
      `Expected 403 for viewer investigation note, received ${viewerNoteResponse.status}`,
    );
  }

  console.log("PASS: Viewer cannot add investigation notes");

  console.log("PASS: Unauthenticated investigation request rejected");

  console.log("\nInvestigation API test completed successfully.");
};

test().catch((error) => {
  console.error("\nFAIL:", error.message);
  process.exit(1);
});
