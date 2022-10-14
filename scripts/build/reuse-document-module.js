import path from "node:path";
import outdent from "outdent";
import * as doc from "../../src/document/index.js";
import { PROJECT_ROOT } from "../utils/index.mjs";

function reuseDocumentModule() {
  return Object.entries(doc).map(([name, module]) => ({
    module: path.join(PROJECT_ROOT, `src/document/${name}.js`),
    text: outdent`
      import {${name}} from "./index.js";

      export const {
      ${Object.keys(module)
          .map((specifier) => `  ${specifier},`)
          .join("\n")}
      } = ${name};
    `,
  }));
}

export default reuseDocumentModule;
