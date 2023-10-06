module.exports = {
  transform: {
    "^.+\\.[tj]s$": [
      "ts-jest",
      { tsconfig: "<rootDir>/node_modules/@tsconfig/svelte/tsconfig.json" },
    ],
  },
  moduleNameMapper: {
    "^lodash-es$": "lodash",
  },
};
