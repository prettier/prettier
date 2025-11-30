import parseSrcset from "@prettier/parse-srcset";
import { ifBreak, join, line } from "../../document/index.js";
import { getUnescapedAttributeValue } from "../utilities/index.js";
import { printExpand } from "./utilities.js";

/**
@import {Doc} from "../../document/index.js"
@import {AttributeValuePredicate, AttributeValuePrint} from "./attribute.js"
*/

/** @type {AttributeValuePredicate} */
const isSrcset = (path /* , options*/) =>
  path.node.fullName === "srcset" &&
  (path.parent.fullName === "img" || path.parent.fullName === "source");

const SRCSET_UNITS = { width: "w", height: "h", density: "x" };
const SRCSET_TYPES = Object.keys(SRCSET_UNITS);

/** @type {AttributeValuePrint} */
function printSrcset(
  textToDoc,
  print,
  path,
  /* , options*/
) {
  const value = getUnescapedAttributeValue(path.node);
  const srcset = parseSrcset(value);
  const types = SRCSET_TYPES.filter((type) =>
    srcset.some((candidate) => Object.hasOwn(candidate, type)),
  );

  if (types.length > 1) {
    throw new Error("Mixed descriptor in srcset is not supported");
  }

  const [key] = types;
  const unit = SRCSET_UNITS[key];

  const urls = srcset.map((src) => src.source.value);
  const maxUrlLength = Math.max(...urls.map((url) => url.length));

  const descriptors = srcset.map((src) =>
    src[key] ? String(src[key].value) : "",
  );
  const descriptorLeftLengths = descriptors.map((descriptor) => {
    const index = descriptor.indexOf(".");
    return index === -1 ? descriptor.length : index;
  });
  const maxDescriptorLeftLength = Math.max(...descriptorLeftLengths);

  return printExpand(
    join(
      [",", line],
      urls.map((url, index) => {
        /** @type {Doc[]} */
        const parts = [url];

        const descriptor = descriptors[index];
        if (descriptor) {
          const urlPadding = maxUrlLength - url.length + 1;
          const descriptorPadding =
            maxDescriptorLeftLength - descriptorLeftLengths[index];

          const alignment = " ".repeat(urlPadding + descriptorPadding);
          parts.push(ifBreak(alignment, " "), descriptor + unit);
        }

        return parts;
      }),
    ),
  );
}

export { isSrcset, printSrcset };
