import path from "node:path";
import { pathToFileURL } from "node:url";
import makeSynchronized from "make-synchronized";
import { SOURCE_DIR } from "../../../utilities/index.js";

const PUBLIC_MODULE_URL = pathToFileURL(
  path.join(SOURCE_DIR, "document/public.js"),
);

let publicDocFunctionalities;
async function getPublicDocFunctionalities() {
  if (!publicDocFunctionalities) {
    const publicDocModule = await import(PUBLIC_MODULE_URL);

    publicDocFunctionalities = new WeakMap();
    for (const [namespace, functionalities] of Object.entries(
      publicDocModule,
    )) {
      for (const [name, functionality] of Object.entries(functionalities)) {
        if (publicDocFunctionalities.has(functionality)) {
          continue;
        }

        publicDocFunctionalities.set(functionality, { namespace, name });
      }
    }
  }

  return publicDocFunctionalities;
}

async function isPublicDocFunctionality(name, file) {
  const [publicDocFunctionalities, { [name]: functionality }] =
    await Promise.all([
      getPublicDocFunctionalities(),
      import(pathToFileURL(file)),
    ]);

  return publicDocFunctionalities.get(functionality);
}

export default makeSynchronized(import.meta, isPublicDocFunctionality);
