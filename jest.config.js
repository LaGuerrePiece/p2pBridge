/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const fs = require("fs")
const config = require("./dev.config.js")

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "vue", "js", "vue", "json"],
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
    "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js",
  },
  transform: {
    "^.+\\.vue$": "@vue/vue3-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  globals: {

  }
};
