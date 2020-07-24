"use strict";

const runPrettier = require("../runPrettier");

const unknownOptions = ["--unknown", "-0"];
const assertion = {
  status: 1,
  stderr: "",
  write: [],
};

for (const options of [
  ...unknownOptions.map((option) => [option]),
  unknownOptions,
]) {
  describe(`Exit on unknown options "${options.join(" ")}"}`, () => {
    runPrettier(__dirname, [".", ...options]).test(assertion);
  });
}
