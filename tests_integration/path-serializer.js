"use strict";

const replaceCWD = text => {
  const cwd = process.cwd();
  while (text.indexOf(cwd) !== -1) {
    text = text.replace(cwd, "<cwd>");
  }

  return text;
};

module.exports = {
  test: value =>
    typeof value === "string" &&
    (value.indexOf("\\") > -1 || value.indexOf(process.cwd()) > -1),
  print: (value, serializer) =>
    serializer(replaceCWD(value).replace(/\\/g, "/"))
};
