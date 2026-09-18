import mongoose from "mongoose";
import env from "../src/config/env.js";

import User from "../src/models/User.js";
import IOC from "../src/models/IOC.js";
import Feed from "../src/models/Feed.js";
import Investigation from "../src/models/Investigation.js";
import AuditLog from "../src/models/AuditLog.js";

const runDatabaseTest = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(env.mongoUri);

    console.log("MongoDB connected successfully.\n");

    // --------------------------------------------------
    // 1. CREATE
    // --------------------------------------------------

    console.log("1. Testing CREATE...");

    const testUser = await User.create({
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@threatlens.local`,
      passwordHash: "test-password-hash",
      role: "analyst",
    });

    console.log("User created:", testUser.username);

    const testFeed = await Feed.create({
      name: `Test Feed ${Date.now()}`,
      type: "urlhaus",
      description: "Temporary feed for database testing",
      enabled: true,
      schedule: "manual",
    });

    console.log("Feed created:", testFeed.name);

    const testIOC = await IOC.create({
      value: "192.0.2.10",
      normalizedValue: "192.0.2.10",
      type: "ipv4",
      confidence: 85,
      risk: {
        score: 75,
        level: "high",
      },
      sources: [
        {
          feedId: testFeed._id,
          feedName: testFeed.name,
          sourceReference: "test-reference-001",
          confidence: 85,
          firstSeen: new Date(),
          lastSeen: new Date(),
        },
      ],
      tags: ["test", "malware"],
      status: "active",
      firstSeen: new Date(),
      lastSeen: new Date(),
    });

    console.log("IOC created:", testIOC.value);

    const investigation = await Investigation.create({
      title: "Test IOC Investigation",
      iocId: testIOC._id,
      analystId: testUser._id,
      priority: "high",
      status: "open",
      notes: [
        {
          text: "Initial database test investigation.",
          authorId: testUser._id,
        },
      ],
    });

    console.log(
      "Investigation created:",
      investigation.title
    );

    const auditLog = await AuditLog.create({
      userId: testUser._id,
      action: "DATABASE_TEST",
      resourceType: "system",
      details: {
        message: "ThreatLens database CRUD test",
      },
    });

    console.log(
      "Audit log created:",
      auditLog.action
    );

    // --------------------------------------------------
    // 2. READ
    // --------------------------------------------------

    console.log("\n2. Testing READ...");

    const foundIOC = await IOC.findById(testIOC._id);

    console.log(
      "IOC found:",
      foundIOC ? foundIOC.value : "Not found"
    );

    // --------------------------------------------------
    // 3. UPDATE
    // --------------------------------------------------

    console.log("\n3. Testing UPDATE...");

    const updatedIOC = await IOC.findByIdAndUpdate(
      testIOC._id,
      {
        $set: {
          status: "reviewed",
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    console.log(
      "IOC status:",
      updatedIOC.status
    );

    // --------------------------------------------------
    // 4. DUPLICATE TEST
    // --------------------------------------------------

    console.log("\n4. Testing IOC deduplication...");

    try {
      await IOC.create({
        value: "192.0.2.10",
        normalizedValue: "192.0.2.10",
        type: "ipv4",
        confidence: 50,
      });

      console.log(
        "ERROR: Duplicate IOC was allowed."
      );
    } catch (error) {
      if (error.code === 11000) {
        console.log(
          "Duplicate IOC correctly rejected."
        );
      } else {
        throw error;
      }
    }

    // --------------------------------------------------
    // 5. DELETE
    // --------------------------------------------------

    console.log("\n5. Testing DELETE...");

    await AuditLog.findByIdAndDelete(auditLog._id);
    await Investigation.findByIdAndDelete(
      investigation._id
    );
    await IOC.findByIdAndDelete(testIOC._id);
    await Feed.findByIdAndDelete(testFeed._id);
    await User.findByIdAndDelete(testUser._id);

    console.log("Test documents deleted.");

    console.log("\n=================================");
    console.log("DATABASE TEST COMPLETED");
    console.log("=================================");
  } catch (error) {
    console.error(
      "\nDatabase test failed:",
      error.message
    );
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

runDatabaseTest();