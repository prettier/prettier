import { jest } from "@jest/globals";
import { getInjectedValues, initializeInjectedValues } from "./helpers.js";

jest.unstable_mockModule("../get-formatted-date", () => ({
  default: () => ({
    year: "2021",
    month: "09",
    day: "01",
  }),
}));

jest.unstable_mockModule("execa", () => ({
  default: jest.fn((command, args) => {
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

jest.spyOn(process.stdout, "write").mockImplementation((buffer) => buffer);

beforeEach(() => {
  jest.clearAllMocks();
  initializeInjectedValues();
});
