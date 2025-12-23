import puppeteer from "puppeteer";
import { downloadBrowser } from "./download-browser.js";
import { startServer } from "./server.js";
import { deserializeErrorInNode, serializeOptionsInNode } from "./utilities.js";

async function getBrowserPrettier({ product = "chrome" } = {}) {
  await downloadBrowser({ product });

  const browser = await puppeteer.launch({ product });
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

      const result = await page.evaluate(
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

      if (result.status === "fulfilled") {
        return result.value;
      }

      throw deserializeErrorInNode(result.serializeError);
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
