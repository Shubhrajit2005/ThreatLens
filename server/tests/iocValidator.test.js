import { validateIOC } from "../src/utils/iocValidator.js";

const tests = [
  {
    value: "192.168.1.10",
    type: "ipv4",
    expected: true,
  },
  {
    value: "999.999.999.999",
    type: "ipv4",
    expected: false,
  },
  {
    value: "2001:db8::1",
    type: "ipv6",
    expected: false,
  },
  {
    value: "example.com",
    type: "domain",
    expected: true,
  },
  {
    value: "invalid_domain",
    type: "domain",
    expected: false,
  },
  {
    value: "https://example.com/malware",
    type: "url",
    expected: true,
  },
  {
    value: "not a url",
    type: "url",
    expected: false,
  },
  {
    value: "d41d8cd98f00b204e9800998ecf8427e",
    type: "md5",
    expected: true,
  },
  {
    value: "da39a3ee5e6b4b0d3255bfef95601890afd80709",
    type: "sha1",
    expected: true,
  },
  {
    value:
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    type: "sha256",
    expected: true,
  },
];

let passed = 0;

for (const test of tests) {
  const result = validateIOC(test.value, test.type);

  if (result === test.expected) {
    console.log(
      `PASS: ${test.type} → ${test.value}`
    );
    passed++;
  } else {
    console.log(
      `FAIL: ${test.type} → ${test.value}`
    );
  }
}

console.log(
  `\n${passed}/${tests.length} IOC validation tests passed.`
);

if (passed !== tests.length) {
  process.exit(1);
}