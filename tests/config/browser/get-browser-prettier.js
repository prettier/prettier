import { launchBrowser } from "./browser.js";
import { startServer } from "./server.js";
import {
  deserializeResponseInNode,
  serializeOptionsInNode,
} from "./utilities.js";

async function getBrowserPrettier() {
  const product =
    process.env.TEST_RUNTIME_BROWSER_PRODUCT?.toLowerCase() ?? "chrome";
  const browser = await launchBrowser({ product });

  process.once("exit", async () => {
    await browser.close();
  });

  const server = await startServer({ silent: true });
  process.once("exit", async () => {
    await server.close();
  });

  const page = await browser.newPage();
  await page.goto(server.url);

  const proxyFunction =
    (accessPath, optionsIndex = 1) =>
    async (...arguments_) => {
      arguments_[optionsIndex] = serializeOptionsInNode(
        arguments_[optionsIndex],
      );

      const response = await page.evaluate(
        ([arguments_, accessPath]) => {
          const prettier = globalThis.__prettier;
          let function_ = prettier;
          for (const property of accessPath.split(".")) {
            function_ = function_[property];
          }

          return function_(...arguments_);
        },
        [arguments_, accessPath],
      );

      const result = deserializeResponseInNode(response);

      if (result.status === "rejected") {
        throw result.reason;
      }

      return result.value;
    };

  return {
    formatWithCursor: proxyFunction("formatWithCursor"),
    getSupportInfo: proxyFunction("getSupportInfo", /* optionsIndex */ 0),
    __debug: {
      parse: proxyFunction("__debug.parse"),
    },
  };
}

export { getBrowserPrettier };
