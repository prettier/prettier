import { launchBrowser } from "./browser.js";
import { startServer } from "./server.js";
import { requestFromNode } from "./utilities.js";

async function getBrowserPrettier() {
  const browserName = process.env.TEST_RUNTIME_BROWSER ?? "chrome";
  const browser = await launchBrowser({ browser: browserName });

  process.once("exit", async () => {
    await browser.close();
  });

  const server = await startServer({ silent: true });
  process.once("exit", async () => {
    await server.close();
  });

  const page = await browser.newPage();
  await page.goto(server.url + "/esm.html");

  const proxyFunction = (accessPath, optionsIndex = 1) =>
    requestFromNode(
      (...arguments_) =>
        page.evaluate(
          ([arguments_, accessPath]) => {
            const prettier = globalThis.__prettier;
            let function_ = prettier;
            for (const property of accessPath.split(".")) {
              function_ = function_[property];
            }

            return function_(...arguments_);
          },
          [arguments_, accessPath],
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
