import path from "node:path";
import { parseArgs } from "node:util";
import { DIST_DIR } from "../utils/index.js";

function parseArguments() {
  const { values } = parseArgs({
    options: {
      playground: { type: "boolean", default: false },
      "print-size": { type: "boolean", default: false },
      "compare-size": { type: "boolean", default: false },
      minify: { type: "boolean" },
      "no-minify": { type: "boolean" },
      clean: { type: "boolean", default: false },
      file: { type: "string", multiple: true },
      "save-as": { type: "string" },
      report: { type: "string", multiple: true },
    },
  });

  if (values.minify && values["no-minify"]) {
    throw new Error("'--minify' and '--no-minify' can't be used together.");
  }

  const result = {
    files: Array.isArray(values.file) ? new Set(values.file) : undefined,
    playground: values.playground,
    printSize: values["print-size"],
    compareSize: values["compare-size"],
    minify: values.minify ? true : values["no-minify"] ? false : undefined,
    clean: values.clean,
    saveAs: values["save-as"],
    reports: values.report,
  };

  if (result.saveAs) {
    if (result.files?.size !== 1) {
      throw new Error(
        "'--save-as' can only use together with one '--file' flag",
      );
    }

    // TODO: Support package name
    const distDirectory = path.join(DIST_DIR, "prettier");
    if (!path.join(distDirectory, result.saveAs).startsWith(distDirectory)) {
      throw new Error("'--save-as' can only relative path");
    }
  }

  if (result.compareSize) {
    if (result.minify === false) {
      throw new Error(
        "'--compare-size' can not use together with '--no-minify' flag",
      );
    }

    if (result.saveAs) {
      throw new Error(
        "'--compare-size' can not use together with '--save-as' flag",
      );
    }
  }

  if (Array.isArray(result.reports) && result.reports.includes("all")) {
    if (result.reports.length !== 1) {
      throw new Error(
        "'--report=all' can not use with another '--report' flag",
      );
    }

    result.reports = ["html", "text", "stdout"];
  }

  return result;
}

export default parseArguments;
