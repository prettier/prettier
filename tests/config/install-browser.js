import makeSynchronized from "make-synchronized";
import { downloadBrowser } from "./browser/download-browser.js";

async function installBrowser() {
  const product =
    process.env.TEST_RUNTIME_BROWSER_PRODUCT?.toLowerCase() || "chrome";

  await downloadBrowser({ product });
}

export default makeSynchronized(import.meta, installBrowser);
