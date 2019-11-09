"use strict";

module.exports = {
  test: value =>
    typeof value === "string" &&
    (value.indexOf("\\") > -1 || value.indexOf(process.cwd()) > -1),
  print: (value, serializer) =>
    serializer(value.replace(process.cwd(), "<cwd>").replace(/\\/g, "/"))
};
