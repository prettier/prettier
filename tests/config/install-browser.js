import makeSynchronized from "make-synchronized";

async function installBrowser() {
  const product =
    process.env.TEST_RUNTIME_BROWSER_PRODUCT?.toLowerCase() || "chrome";

  // Syntax error on Node.js v14
  const { downloadBrowser, isBrowserInstalled } =
    await import("./browser/browser.js");

  if (await isBrowserInstalled({ product })) {
    return;
  }

  await downloadBrowser({ product });
}

export default makeSynchronized(import.meta, installBrowser);
