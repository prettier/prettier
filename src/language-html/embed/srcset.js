import parseSrcset from "@prettier/parse-srcset";
import { ifBreak, join, line } from "../../document/builders.js";
import { getUnescapedAttributeValue } from "../utils/index.js";
import { printExpand } from "./utils.js";

function printSrcset(path /*, options*/) {
  if (
    path.node.fullName === "srcset" &&
    (path.parent.fullName === "img" || path.parent.fullName === "source")
  ) {
    return () => printSrcsetValue(getUnescapedAttributeValue(path.node));
  }
}

function printSrcsetValue(value) {
  const srcset = parseSrcset(value);

  const hasW = srcset.some(({ width }) => width);
  const hasH = srcset.some(({ height }) => height);
  const hasX = srcset.some(({ density }) => density);

  if (hasW + hasH + hasX > 1) {
    throw new Error("Mixed descriptor in srcset is not supported");
  }

  const key = hasW ? "width" : hasH ? "height" : "density";
  const unit = hasW ? "w" : hasH ? "h" : "x";

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

export default printSrcset;
