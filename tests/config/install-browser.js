import { createRequire } from "node:module";

function installBrowserSync() {
  const { default: makeSynchronized } = createRequire(import.meta.url)(
    "make-synchronized",
  );
  const { installBrowser } = makeSynchronized(
    new URL("./browser/browser.js", import.meta.url),
  );

  const browser = process.env.TEST_RUNTIME_BROWSER || "chrome";

  installBrowser({ browser });
}

export default installBrowserSync;
