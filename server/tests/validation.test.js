import { registerSchema, loginSchema } from "../src/utils/authValidation.js";
import { createIOCSchema } from "../src/utils/iocValidation.js";
import validate from "../src/middleware/validation.js";
import { updateIOCSchema } from "../src/utils/iocUpdateValidation.js";

const createMockResponse = () => {
  const response = {
    statusCode: null,
    body: null,

    status(code) {
      this.statusCode = code;
      return this;
    },

    json(data) {
      this.body = data;
      return this;
    },
  };

  return response;
};

const runValidationTest = (schema, body) => {
  const req = { body };
  const res = createMockResponse();

  let nextCalled = false;

  const next = () => {
    nextCalled = true;
  };

  validate(schema)(req, res, next);

  return {
    req,
    res,
    nextCalled,
  };
};

console.log("\n--- Validation Test Started ---");

// Invalid registration
const invalidRegister = runValidationTest(registerSchema, {
  username: "ab",
  email: "invalid-email",
  password: "123",
});

if (
  invalidRegister.res.statusCode === 400 &&
  !invalidRegister.nextCalled
) {
  console.log("PASS: Invalid registration rejected");
} else {
  console.log("FAIL: Invalid registration was accepted");
}

// Valid registration
const validRegister = runValidationTest(registerSchema, {
  username: "testuser",
  email: "test@example.com",
  password: "password123",
});

if (
  validRegister.nextCalled &&
  validRegister.res.statusCode === null
) {
  console.log("PASS: Valid registration accepted");
} else {
  console.log("FAIL: Valid registration was rejected");
}

// Invalid login
const invalidLogin = runValidationTest(loginSchema, {
  identifier: "",
  password: "",
});

if (
  invalidLogin.res.statusCode === 400 &&
  !invalidLogin.nextCalled
) {
  console.log("PASS: Invalid login rejected");
} else {
  console.log("FAIL: Invalid login was accepted");
}

// Valid login
const validLogin = runValidationTest(loginSchema, {
  identifier: "testuser",
  password: "password123",
});

if (
  validLogin.nextCalled &&
  validLogin.res.statusCode === null
) {
  console.log("PASS: Valid login accepted");
} else {
  console.log("FAIL: Valid login was rejected");
}

const invalidIOC = runValidationTest(
  createIOCSchema,
  {
    value: "192.0.2.10",
    type: "invalid-type",
    confidence: 150,
    tags: [],
  }
);

if (
  invalidIOC.res.statusCode === 400 &&
  !invalidIOC.nextCalled
) {
  console.log("PASS: Invalid IOC request rejected");
} else {
  console.log("FAIL: Invalid IOC request was accepted");
}

const invalidIOCUpdate = runValidationTest(
  updateIOCSchema,
  {
    confidence: 150,
    status: "invalid-status",
  }
);

if (
  invalidIOCUpdate.res.statusCode === 400 &&
  !invalidIOCUpdate.nextCalled
) {
  console.log("PASS: Invalid IOC update rejected");
} else {
  console.log("FAIL: Invalid IOC update was accepted");
}

console.log("\nVALIDATION TEST COMPLETED");