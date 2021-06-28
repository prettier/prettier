"use strict";

const parseSrcset = require("parse-srcset");
const getLast = require("../utils/get-last");
const {
  builders: { group, ifBreak, indent, join, line, softline },
} = require("../document");

function printImgSrcset(value) {
  const srcset = parseSrcset(value, {
    logger: {
      error(message) {
        throw new Error(message);
      },
    },
  });

  const hasW = srcset.some(({ w }) => w);
  const hasH = srcset.some(({ h }) => h);
  const hasX = srcset.some(({ d }) => d);

  if (hasW + hasH + hasX > 1) {
    throw new Error("Mixed descriptor in srcset is not supported");
  }

  const key = hasW ? "w" : hasH ? "h" : "d";
  const unit = hasW ? "w" : hasH ? "h" : "x";

  const getMax = (values) => Math.max(...values);

  const urls = srcset.map((src) => src.url);
  const maxUrlLength = getMax(urls.map((url) => url.length));

  const descriptors = srcset
    .map((src) => src[key])
    .map((descriptor) => (descriptor ? descriptor.toString() : ""));
  const descriptorLeftLengths = descriptors.map((descriptor) => {
    const index = descriptor.indexOf(".");
    return index === -1 ? descriptor.length : index;
  });
  const maxDescriptorLeftLength = getMax(descriptorLeftLengths);

  return join(
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
    })
  );
}

const prefixDelimiters = [":", "__", "--", "_", "-"];

function getClassPrefix(className) {
  const startIndex = className.search(/[^_-]/);
  if (startIndex !== -1) {
    for (const delimiter of prefixDelimiters) {
      const delimiterIndex = className.indexOf(delimiter, startIndex);
      if (delimiterIndex !== -1) {
        return className.slice(0, delimiterIndex);
      }
    }
  }
  return className;
}

function printClassNames(value) {
  const classNames = value.trim().split(/\s+/);

  // Try keeping consecutive classes with the same prefix on one line.
  const groupedByPrefix = [];
  let previousPrefix;
  for (let i = 0; i < classNames.length; i++) {
    const prefix = getClassPrefix(classNames[i]);
    if (
      prefix !== previousPrefix &&
      // "home-link" and "home-link_blue_yes" should be considered same-prefix
      prefix !== classNames[i - 1]
    ) {
      groupedByPrefix.push([]);
    }
    getLast(groupedByPrefix).push(classNames[i]);
    previousPrefix = prefix;
  }

  return [
    indent([
      softline,
      join(
        line,
        groupedByPrefix.map((classNames) => group(join(line, classNames)))
      ),
    ]),
    softline,
  ];
}

module.exports = {
  printImgSrcset,
  printClassNames,
};
