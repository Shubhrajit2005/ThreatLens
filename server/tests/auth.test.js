import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";
import { register } from "../src/controllers/authController.js";

dotenv.config();

const testEmail = "security-test@threatlens.local";
const testUsername = "securitytest";

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

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("\n--- Authentication Security Test Started ---");

    await User.deleteOne({
      email: testEmail,
    });

    const req = {
      body: {
        username: testUsername,
        email: testEmail,
        password: "TestPassword123!",
        role: "admin",
      },
    };

    const res = createMockResponse();

    let testError = null;

    await register(req, res, (error) => {
      testError = error;
    });

    if (testError) {
      throw testError;
    }

    const createdUser = await User.findOne({
      email: testEmail,
    });

    if (!createdUser) {
      console.log("FAIL: Test user was not created");
      return;
    }

    if (createdUser.role === "viewer") {
      console.log(
        "PASS: Public registration cannot create an admin"
      );
    } else {
      console.log(
        `FAIL: Public registration created role: ${createdUser.role}`
      );
    }

    await User.deleteOne({
      email: testEmail,
    });

    console.log("Test user deleted");
    console.log("\nAUTHENTICATION SECURITY TEST COMPLETED");
  } catch (error) {
    console.error("Authentication security test failed:", error);
  } finally {
    await mongoose.connection.close();
  }
};

runTest();