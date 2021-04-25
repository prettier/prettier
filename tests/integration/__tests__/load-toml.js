"use strict";

const loadToml = require("../../../src/utils/load-toml");

describe("TOML", () => {
  const exampleFilePath = "example.toml";

  const exampleToml = `
# This is a TOML document.
title = "TOML Example"
[owner]
name = "Tom Preston-Werner"
dob = 1979-05-27T07:32:00-08:00 # First class dates
[database]
server = "192.168.1.1"
ports = [ 8001, 8001, 8002 ]
connection_max = 5000
enabled = true
`;

  const wrongToml = "///ERROR///";

  test("loads toml successfully", () => {
    const parsedToml = loadToml(exampleFilePath, exampleToml);
    expect(parsedToml).toMatchSnapshot();
  });

  test("throws error on incorrect toml", () => {
    expect(() => {
      loadToml(exampleFilePath, wrongToml);
    }).toThrow();

    expect(() => {
      loadToml(exampleFilePath, wrongToml);
    }).toThrowErrorMatchingSnapshot();
  });
});
