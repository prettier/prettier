import assert from "node:assert/strict";
import puppeteer from "puppeteer";

const puppeteerBrowsers = ["chrome", "chrome-headless-shell", "firefox"];

async function downloadBrowser({ browser }) {
  const { downloadBrowsers } =
    await import("puppeteer/internal/node/install.js");
  const originalEnv = { ...process.env };

  const envOverrides = {
    npm_config_loglevel: "silent",
    PUPPETEER_SKIP_DOWNLOAD: JSON.stringify(false),
    ...Object.fromEntries(
      puppeteerBrowsers.map((name) => [
        `PUPPETEER_${name.replaceAll("-", "_").toUpperCase()}_SKIP_DOWNLOAD`,
        JSON.stringify(name !== browser),
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

async function isBrowserInstalled({ browser: browserName }) {
  try {
    const browser = await launchBrowser({ browser: browserName });
    await browser.close();
    return true;
  } catch {
    // Noop
  }

  return false;
}

async function launchBrowser({ browser: browserName }) {
  const browser = await puppeteer.launch({
    browser: browserName,
    enableExtensions: false,
    waitForInitialPage: false,
  });

  try {
    const version = await browser.version();
    assert.ok(version.toLowerCase().startsWith(`${browserName}/`));
  } catch (error) {
    await browser.close();
    throw error;
  }

  return browser;
}

async function installBrowser({ browser }) {
  if (await isBrowserInstalled({ browser })) {
    return;
  }

  await downloadBrowser({ browser });
}

export { downloadBrowser, installBrowser, isBrowserInstalled, launchBrowser };
