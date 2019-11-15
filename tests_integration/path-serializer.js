"use strict";

const replaceCWD = text => {
  const cwd = process.cwd();
  while (text.includes(cwd)) {
    text = text.replace(cwd, "<cwd>");
  }

  return text;
};

module.exports = {
  test: value =>
    typeof value === "string" &&
    (value.includes("\\") || value.includes(process.cwd())),
  print: (value, serializer) =>
    serializer(replaceCWD(value).replace(/\\/g, "/"))
};
