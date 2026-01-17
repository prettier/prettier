import {
  ArgExpansionBailout,
  ConfigError,
  UndefinedParserError,
} from "../../src/common/errors.js";

it("ConfigError", () => {
  const error = new ConfigError("foo");
  expect(error.name).toBe("ConfigError");
  expect(error.message).toBe("foo");
});

it("UndefinedParserError", () => {
  const error = new UndefinedParserError("foo");
  expect(error.name).toBe("UndefinedParserError");
  expect(error.message).toBe("foo");
});

it("ArgExpansionBailout", () => {
  const error = new ArgExpansionBailout("foo");
  expect(error.name).toBe("ArgExpansionBailout");
  expect(error.message).toBe("foo");
});
