import "dotenv/config";

const BASE_URL = "http://localhost:5000";

const test = async () => {
  console.log("Testing Investigation API...\n");

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
// 7. Note author integrity
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
  }
);

const noteData = await noteResponse.json();

if (!noteResponse.ok || !noteData.success) {
  throw new Error("Adding investigation note failed");
}

console.log(
  "PASS: Investigation note added"
);

if (!noteData.note.authorId) {
  throw new Error(
    "Note authorId is missing"
  );
}

if (
  noteData.note.authorId.toString() ===
  spoofedAuthorId
) {
  throw new Error(
    "Client was able to spoof note author"
  );
}

console.log(
  "PASS: Client cannot spoof note author"
);

// --------------------------------------------------
// 8. Investigation create validation
// --------------------------------------------------

const invalidCreateResponse = await fetch(
  `${BASE_URL}/api/investigations`,
  {
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
  }
);

if (invalidCreateResponse.status !== 400) {
  throw new Error(
    `Expected 400 for invalid investigation create, received ${invalidCreateResponse.status}`
  );
}

console.log(
  "PASS: Invalid investigation create rejected"
);

// --------------------------------------------------
// 9. Investigation update validation
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
  }
);

if (invalidUpdateResponse.status !== 400) {
  throw new Error(
    `Expected 400 for invalid investigation status, received ${invalidUpdateResponse.status}`
  );
}

console.log(
  "PASS: Invalid investigation status rejected"
);

// --------------------------------------------------
// 10. Empty investigation update validation
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
  }
);

if (emptyUpdateResponse.status !== 400) {
  throw new Error(
    `Expected 400 for empty investigation update, received ${emptyUpdateResponse.status}`
  );
}

console.log(
  "PASS: Empty investigation update rejected"
);

  // --------------------------------------------------
  // 8. Invalid GET ID
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
  // 9. Invalid PATCH ID
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
  // 10. Invalid note ID
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
  // 11. Unauthenticated request
  // --------------------------------------------------

  const unauthenticatedResponse = await fetch(`${BASE_URL}/api/investigations`);

  if (unauthenticatedResponse.status !== 401) {
    throw new Error(
      `Expected 401 without authentication, received ${unauthenticatedResponse.status}`,
    );
  }

  // --------------------------------------------------
// 11. Viewer role security regression
// --------------------------------------------------

const viewerLoginResponse = await fetch(
  `${BASE_URL}/api/auth/login`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identifier: "iocviewer",
      password: "ThreatLens@123",
    }),
  }
);

const viewerLoginData =
  await viewerLoginResponse.json();

if (
  !viewerLoginResponse.ok ||
  !viewerLoginData.success
) {
  throw new Error("Viewer login failed");
}

const viewerToken = viewerLoginData.token;

console.log("PASS: Viewer login successful");

const viewerHeaders = {
  Authorization: `Bearer ${viewerToken}`,
};

// Viewer can list investigations
const viewerListResponse = await fetch(
  `${BASE_URL}/api/investigations`,
  {
    headers: viewerHeaders,
  }
);

if (viewerListResponse.status !== 200) {
  throw new Error(
    `Expected 200 for viewer investigation list, received ${viewerListResponse.status}`
  );
}

console.log(
  "PASS: Viewer can list investigations"
);

// Viewer can view investigation details
const viewerGetResponse = await fetch(
  `${BASE_URL}/api/investigations/${investigationId}`,
  {
    headers: viewerHeaders,
  }
);

if (viewerGetResponse.status !== 200) {
  throw new Error(
    `Expected 200 for viewer investigation detail, received ${viewerGetResponse.status}`
  );
}

console.log(
  "PASS: Viewer can view investigation details"
);

// Viewer cannot create investigations
const viewerCreateResponse = await fetch(
  `${BASE_URL}/api/investigations`,
  {
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
  }
);

if (viewerCreateResponse.status !== 403) {
  throw new Error(
    `Expected 403 for viewer investigation create, received ${viewerCreateResponse.status}`
  );
}

console.log(
  "PASS: Viewer cannot create investigations"
);

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
  }
);

if (viewerUpdateResponse.status !== 403) {
  throw new Error(
    `Expected 403 for viewer investigation update, received ${viewerUpdateResponse.status}`
  );
}

console.log(
  "PASS: Viewer cannot update investigations"
);

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
  }
);

if (viewerNoteResponse.status !== 403) {
  throw new Error(
    `Expected 403 for viewer investigation note, received ${viewerNoteResponse.status}`
  );
}

console.log(
  "PASS: Viewer cannot add investigation notes"
);

  console.log("PASS: Unauthenticated investigation request rejected");

  console.log("\nInvestigation API test completed successfully.");
};

test().catch((error) => {
  console.error("\nFAIL:", error.message);
  process.exit(1);
});
