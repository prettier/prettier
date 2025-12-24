import makeSynchronized from "make-synchronized";
import { downloadBrowser, isBrowserInstalled } from "./browser/browser.js";

async function installBrowser() {
  const product =
    process.env.TEST_RUNTIME_BROWSER_PRODUCT?.toLowerCase() || "chrome";

  if (await isBrowserInstalled({ product })) {
    return;
  }

  await downloadBrowser({ product });
}

export default makeSynchronized(import.meta, installBrowser);
