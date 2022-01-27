"use strict";

const htmlTagNames = require("html-tag-names");
const arrayToMap = require("./array-to-map.js");

const HTML_TAGS = arrayToMap(htmlTagNames);

module.exports = HTML_TAGS;
