module.exports = {
    verbose: true,
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"]
};
