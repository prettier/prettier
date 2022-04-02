"use strict";

const { htmlTagNames } = require("../../../vendors/html-tag-names.json");
const arrayToMap = require("./array-to-map.js");

const HTML_TAGS = arrayToMap(htmlTagNames);

module.exports = HTML_TAGS;
