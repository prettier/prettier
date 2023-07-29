import { createIsIgnoredFunction } from "./prettier-internal.js";

export async function createIsIgnoredFromContextOrDie({
  logger,
  argv: { ignorePath, withNodeModules },
}) {
  try {
    return await createIsIgnoredFunction(ignorePath, withNodeModules);
  } catch (/** @type { any } */ e) {
    logger.error(e.message);
    process.exit(2);
  }
}
