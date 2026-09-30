export default {
  testEnvironment: "node",
  transform: {}, // Disable transformation for native ESM support
  verbose: true,
  testTimeout: 30000, // Increase timeout for integration tests
  setupFilesAfterEnv: ["./test/setup.js"],
};
