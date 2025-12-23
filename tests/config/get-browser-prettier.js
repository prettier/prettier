import puppeteer from "puppeteer";
import { downloadBrowser } from "./browser/download-browser.js";
import { startServer } from "./browser/server.js";

async function getBrowserPrettier({ product = "chrome" } = {}) {
  await downloadBrowser({ product });

  const browser = await puppeteer.launch({ product });
  process.once("exit", async () => {
    await browser.close();
  });

  const page = await browser.newPage();

  const server = await startServer({ silent: true });
  process.once("exit", async () => {
    await server.close();
  });

  await page.goto(server.url);

  const proxyFunction =
    (accessPath) =>
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
      );

  return {
    formatWithCursor: proxyFunction("formatWithCursor"),
    getSupportInfo: proxyFunction("getSupportInfo"),
    __debug: {
      parse: proxyFunction("__debug.parse"),
    },
  };
}

export { getBrowserPrettier };
