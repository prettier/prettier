import { jest as jestGlobals } from "@jest/globals";
import { getInjectedValues, initializeInjectedValues } from "./helpers.js";

jest.unstable_mockModule("../get-formatted-date", () => ({
  default: () => ({
    year: "2021",
    month: "09",
    day: "01",
  }),
}));

jestGlobals.unstable_mockModule("execa", () => ({
  default: jestGlobals.fn((command, args) => {
    const receivedCommand = `${command} ${args.join(" ")}`;
    const {
      execa: { stdout, stderr },
    } = getInjectedValues();
    const result = {
      command: receivedCommand,
      escapedCommand: command,
      stdout,
      stderr,
      all: "",
      failed: false,
      timeOut: false,
      isCancelled: false,
      killed: false,
    };
    return Promise.resolve(result);
  }),
}));

beforeEach(() => {
  initializeInjectedValues();
});
