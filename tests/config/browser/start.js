import process from "node:process";
import { startServer } from "./server.js";

const server = await startServer({ port: 3000 });

console.log(`Server started, navigate to ${server.url} start debug.`);

process.once("exit", async () => {
  await server.close();
});
