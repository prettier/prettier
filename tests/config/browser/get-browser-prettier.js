import { launchBrowser } from "./browser.js";
import { startServer } from "./server.js";
import { requestFromNode } from "./utilities.js";

async function getBrowserPrettier() {
  /** @type {"chrome" | "firefox"} */
  const browserName = process.env.TEST_RUNTIME_BROWSER ?? "chrome";
  /** @type {"esm" | "umd"} */
  const prettierBundleFormat = process.env.TEST_BUNDLE_FORMAT ?? "esm";
  const browser = await launchBrowser({ browser: browserName });

  process.once("exit", async () => {
    await browser.close();
  });

  const server = await startServer({ silent: true });
  process.once("exit", async () => {
    await server.close();
  });

  const page = await browser.newPage();
  await page.goto(server.url);

  const proxyFunction = (accessPath, optionsIndex = 1) =>
    requestFromNode(
      (...arguments_) =>
        page.evaluate(
          ([arguments_, accessPath, prettierBundleFormat]) => {
            const prettier = globalThis[`__prettier_${prettierBundleFormat}`];
            let function_ = prettier;
            for (const property of accessPath.split(".")) {
              function_ = function_[property];
            }

            return function_(...arguments_);
          },
          [arguments_, accessPath, prettierBundleFormat],
        ),
      {
        browser: browserName,
        accessPath,
        optionsIndex,
      },
    );

  return {
    formatWithCursor: proxyFunction("formatWithCursor"),
    getSupportInfo: proxyFunction("getSupportInfo", /* optionsIndex */ 0),
    __debug: {
      parse: proxyFunction("__debug.parse"),
    },
  };
}

export { getBrowserPrettier };
