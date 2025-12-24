import assert from "node:assert/strict";
import puppeteer from "puppeteer";

const puppeteerBrowsers = ["chrome", "chrome-headless-shell", "firefox"];

async function downloadBrowser({ product }) {
  const { downloadBrowsers } =
    await import("puppeteer/internal/node/install.js");
  const originalEnv = { ...process.env };

  const envOverrides = {
    PUPPETEER_SKIP_DOWNLOAD: JSON.stringify(false),
    ...Object.fromEntries(
      puppeteerBrowsers.map((browser) => [
        `PUPPETEER_${browser.replaceAll("-", "_").toUpperCase()}_SKIP_DOWNLOAD`,
        JSON.stringify(browser !== product),
      ]),
    ),
  };

  Object.assign(process.env, envOverrides);

  try {
    await downloadBrowsers();
  } finally {
    for (const env of Object.keys(envOverrides)) {
      if (Object.hasOwn(originalEnv)) {
        process.env[env] = originalEnv[env];
      } else {
        delete process.env[env];
      }
    }
  }
}

async function isBrowserInstalled({ product }) {
  try {
    const browser = await launchBrowser({ product });
    await browser.close();
    return true;
  } catch {
    // Noop
  }

  return false;
}

async function launchBrowser({ product }) {
  const browser = await puppeteer.launch({
    browser: product,
    enableExtensions: false,
    waitForInitialPage: false,
  });

  const version = await browser.version();
  assert.ok(version.toLowerCase().startsWith(`${product}/`));

  return browser;
}

export { downloadBrowser, isBrowserInstalled, launchBrowser };
