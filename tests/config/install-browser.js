import { createRequire } from "node:module";

function installBrowserSync() {
  const { default: makeSynchronized } = createRequire(import.meta.url)(
    "make-synchronized",
  );
  const { installBrowser } = makeSynchronized(
    new URL("./browser/browser.js", import.meta.url),
  );

  const product =
    process.env.TEST_RUNTIME_BROWSER_PRODUCT?.toLowerCase() || "chrome";

  installBrowser({ product });
}

export default installBrowserSync;
