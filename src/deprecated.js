"use strict";

const deprecated = {
  useFlowParser: config =>
`  The ${"\"useFlowParser\""} option is deprecated. Use ${"\"parser\""} instead.

  Prettier now treats your configuration as:
  {
    ${"\"parser\""}: ${config.seFlowParser ? "\"flow\"" : "\"babylon\""}
  }`
};

module.exports = deprecated;
