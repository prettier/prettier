"use strict";

require("jest-extended");
const path = require("path");
const loadToml = require("../../src/utils/load-toml");

describe("TOML", () => {
  const currentFile = path.join(__dirname, "load-toml.js");

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
    const parsedToml = loadToml(currentFile, exampleToml);
    expect(parsedToml).toBeObject();
    expect(parsedToml).toContainAllKeys(["title", "owner", "database"]);
  });

  test("throws error on incorrect toml", () => {
    expect(() => {
      loadToml(currentFile, wrongToml);
    }).toThrow();

    expect(() => {
      loadToml(currentFile, wrongToml);
    }).toThrowErrorMatchingSnapshot();
  });
});
