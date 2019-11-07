"use strict";

const replaceCWD = path => {
  const cwd = process.cwd();
  while (path.indexOf(cwd) !== -1) {
    path = path.replace(cwd, "<cwd>");
  }

  return path;
};

module.exports = {
  test: value =>
    typeof value === "string" &&
    (value.indexOf("\\") > -1 || value.indexOf(process.cwd()) > -1),
  print: (value, serializer) =>
    serializer(replaceCWD(value).replace(/\\/g, "/"))
};
