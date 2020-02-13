module.exports = {
    verbose: true,
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src", "<rootDir>/lib"],
    testMatch: ["**/?(*.)+(spec|test).js?(x)"]
};
