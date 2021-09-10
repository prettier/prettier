import { jest } from "@jest/globals";

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
    const { stdout, stderr } = globalThis.INJECTED_VALUED.execa;
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

const INITIAL_INJECTED_VALUES = {
  execa: {
    stdout: "",
    stderr: "",
  },
};

beforeAll(() => {
  globalThis.INJECTED_VALUES = INITIAL_INJECTED_VALUES;
});

afterEach(() => {
  globalThis.INJECTED_VALUES = INITIAL_INJECTED_VALUES;
});
