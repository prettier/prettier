import assert from "node:assert";
import fs from "node:fs/promises";
import http from "node:http";
import { inspect } from "node:util";
import getPort from "get-port";

const distDirectory = new URL("../../../dist/", import.meta.url);

async function getContent(url) {
  assert.ok(url.startsWith("/"));
  url = url.slice(1);

  if (url === "index.html" || url === "main.js" || url === "utilities.js") {
    return await fs.readFile(new URL(url, import.meta.url), "utf8");
  }

  const file = new URL(url, distDirectory);
  assert.ok(file.href.startsWith(distDirectory.href));

  return await fs.readFile(file, "utf8");
}

async function startServer({ silent = false, port: preferredPort } = {}) {
  const port = await getPort({ port: preferredPort });

  const server = http.createServer(async (request, response) => {
    let { url } = request;
    if (!silent) {
      console.debug(url);
    }

    if (url === "/") {
      url = "/index.html";
    }

    // Only allow `.mjs`,  `.js` and `.html`
    if (!/\.(?:html|js|mjs)$/.test(url)) {
      response.statusCode = 404;
      return;
    }

    let content;

    try {
      content = await getContent(url);
    } catch (error) {
      if (!silent) {
        console.error(error);
      }

      response.statusCode = error.code === "ENOENT" ? 404 : 500;
      response.end(inspect(error));
      return;
    }

    response.statusCode = 200;
    response.setHeader(
      "Content-Type",
      url.endsWith(".mjs") || url.endsWith(".js")
        ? "application/javascript"
        : "text/html",
    );

    response.end(content);
  });

  // https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts
  const hostname = "127.0.0.1";
  server.listen(port, hostname);

  const url = `http://${hostname}:${port}`;

  const close = () =>
    new Promise((resolve) => {
      server.close(resolve);
    });

  return {
    url,
    close,
  };
}

export { startServer };
