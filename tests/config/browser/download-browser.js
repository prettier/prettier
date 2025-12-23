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

export { downloadBrowser };
