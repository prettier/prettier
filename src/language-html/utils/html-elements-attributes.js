"use strict";

const {
  htmlElementAttributes,
} = require("../../../vendors/html-element-attributes.json");
const mapObject = require("./map-object.js");
const arrayToMap = require("./array-to-map.js");

const HTML_ELEMENT_ATTRIBUTES = mapObject(htmlElementAttributes, arrayToMap);

module.exports = HTML_ELEMENT_ATTRIBUTES;
