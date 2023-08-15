"use strict";

const chalk = new Proxy(String, { get: () => chalk });

module.exports = chalk;
