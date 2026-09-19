import { normalizeIOC } from "../src/services/normalizationService.js";

const tests = [
  {
    value: "  Example.COM  ",
    type: "domain",
    expected: "example.com",
  },
  {
    value: "  D41D8CD98F00B204E9800998ECF8427E  ",
    type: "md5",
    expected: "d41d8cd98f00b204e9800998ecf8427e",
  },
  {
    value: " DA39A3EE5E6B4B0D3255BFEF95601890AFD80709 ",
    type: "sha1",
    expected: "da39a3ee5e6b4b0d3255bfef95601890afd80709",
  },
  {
    value:
      " E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855 ",
    type: "sha256",
    expected:
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  },
  {
    value: " 192.168.1.10 ",
    type: "ipv4",
    expected: "192.168.1.10",
  },
  {
    value: " 2001:db8::1 ",
    type: "ipv6",
    expected: "2001:db8::1",
  },
  {
  value: " https://Example.COM/malware ",
  type: "url",
  expected: "https://example.com/malware",
  },
  {
  value: "HTTP://EXAMPLE.COM/test",
  type: "url",
  expected: "http://example.com/test",
  },
  
];

let passed = 0;

for (const test of tests) {
  const result = normalizeIOC(test.value, test.type);

  if (result === test.expected) {
    console.log(`PASS: ${test.type} → ${result}`);
    passed++;
  } else {
    console.log(
      `FAIL: ${test.type} → expected "${test.expected}", got "${result}"`
    );
  }
}

console.log(`\n${passed}/${tests.length} normalization tests passed.`);

if (passed !== tests.length) {
  process.exit(1);
}