import {
  hashPassword,
  comparePassword,
} from "../src/utils/password.js";

const runPasswordTest = async () => {
  try {
    const originalPassword = "ThreatLensTest123!";

    console.log("1. Hashing password...");

    const passwordHash = await hashPassword(
      originalPassword
    );

    console.log("Password hash generated.");
    console.log(
      "Hash starts with:",
      passwordHash.substring(0, 4)
    );

    console.log("\n2. Testing correct password...");

    const correctPassword = await comparePassword(
      originalPassword,
      passwordHash
    );

    console.log(
      "Correct password:",
      correctPassword
    );

    console.log("\n3. Testing incorrect password...");

    const incorrectPassword = await comparePassword(
      "WrongPassword123!",
      passwordHash
    );

    console.log(
      "Incorrect password:",
      incorrectPassword
    );

    if (
      correctPassword === true &&
      incorrectPassword === false
    ) {
      console.log(
        "\n================================="
      );
      console.log(
        "PASSWORD TEST PASSED"
      );
      console.log(
        "================================="
      );
    } else {
      console.log(
        "\nPASSWORD TEST FAILED"
      );
    }
  } catch (error) {
    console.error(
      "Password test failed:",
      error.message
    );
  }
};

runPasswordTest();