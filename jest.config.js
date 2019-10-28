module.exports = {
    verbose: true,
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/lib"],
    testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"]
};
