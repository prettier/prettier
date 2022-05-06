import { htmlElementAttributes } from "html-element-attributes";
import mapObject from "./map-object.js";
import arrayToMap from "./array-to-map.js";

const HTML_ELEMENT_ATTRIBUTES = mapObject(htmlElementAttributes, arrayToMap);

export default HTML_ELEMENT_ATTRIBUTES;
