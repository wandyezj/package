/** @type {import('jest').Config} */
const config = {
    rootDir: "../",
    // Only run test files with postfix .test.ts
    testRegex: ".*test.ts",
    preset: "ts-jest",
    testEnvironment: "node",
    coverageDirectory: "./temp/coverage",
};

// eslint-disable-next-line no-undef
module.exports = config;
