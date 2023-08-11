import { resolveConfig } from "../../index.js";

async function getOptionsOrDie(
  { logger, argv: { config, editorconfig } },
  filePath,
  getAllOverrides = false,
) {
  try {
    if (config === false) {
      logger.debug("'--no-config' option found, skip loading config file.");
      return null;
    }

    logger.debug(
      config
        ? `load config file from '${config}'`
        : `resolve config from '${filePath}'`,
    );

    const options = await resolveConfig(filePath, {
      editorconfig,
      config,
      // @ts-expect-error -- internal option
      getAllOverrides,
    });

    logger.debug("loaded options `" + JSON.stringify(options) + "`");
    return options;
  } catch (/**@type {any} */ error) {
    logger.error(
      `Invalid configuration for file "${filePath}":\n` + error.message,
    );
    process.exit(2);
  }
}

export default getOptionsOrDie;
