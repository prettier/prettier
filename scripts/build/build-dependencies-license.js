import fs from "node:fs/promises";
import path from "node:path";
import { outdent } from "outdent";
import rollupPluginLicense from "rollup-plugin-license";
import { PROJECT_ROOT } from "../utils/index.js";

const separator = `\n${"-".repeat(40)}\n\n`;

function toBlockQuote(text) {
  return text
    .trim()
    .split("\n")
    .map((line) => (line ? `> ${line}` : ">"))
    .join("\n");
}

function getDependencies(results) {
  // A fake rollup chunk
  const chunk = {
    modules: Object.fromEntries(
      results
        .flatMap((result) =>
          Object.keys(result.esbuildResult?.metafile.inputs ?? {}),
        )
        .map((file) => [file, { renderedLength: 1 }]),
    ),
  };

  let dependencies;
  const plugin = rollupPluginLicense({
    cwd: PROJECT_ROOT,
    thirdParty: {
      includePrivate: true,
      output(_dependencies) {
        dependencies = _dependencies;
      },
    },
  });
  plugin.renderChunk("", chunk);
  plugin.generateBundle();

  return dependencies;
}

function getLicenseText(dependencies) {
  dependencies = dependencies.filter(
    (dependency, index) =>
      // Exclude ourself
      dependency.name !== "prettier" &&
      // Unique by `name` and `version`
      index ===
        dependencies.findIndex(
          ({ name, version }) =>
            dependency.name === name && dependency.version === version,
        ),
  );

  dependencies.sort(
    (dependencyA, dependencyB) =>
      dependencyA.name.localeCompare(dependencyB.name) ||
      dependencyA.version.localeCompare(dependencyB.version),
  );

  const licenses = [
    ...new Set(
      dependencies
        .filter(({ license }) => license)
        .map(({ license }) => license),
    ),
  ];

  const head = outdent`
    # Licenses of bundled dependencies

    The published Prettier artifact additionally contains code with the following licenses:
    ${new Intl.ListFormat("en-US", { type: "conjunction" }).format(licenses)}.
  `;

  const content = dependencies
    .map((dependency) => {
      let text = `## ${dependency.name}@v${dependency.version}\n`;

      const meta = [];

      if (dependency.description) {
        meta.push(toBlockQuote(dependency.description) + "\n");
      }

      if (dependency.license) {
        meta.push(`License: ${dependency.license}  `);
      }
      if (dependency.homepage) {
        meta.push(`Homepage: <${dependency.homepage}>  `);
      }
      if (dependency.repository?.url) {
        meta.push(`Repository: <${dependency.repository.url}>  `);
      }
      if (dependency.author) {
        meta.push(`Author: ${dependency.author.text()}  `);
      }
      if (dependency.contributors?.length > 0) {
        const contributors = dependency.contributors
          .map((contributor) => ` - ${contributor.text()}`)
          .join("\n");

        meta.push(`Contributors:\n${contributors}`);
      }

      if (meta.length > 0) {
        text += "\n" + meta.join("\n") + "\n";
      }

      if (dependency.licenseText) {
        text += "\n" + toBlockQuote(dependency.licenseText) + "\n";
      }
      return text;
    })
    .join(separator);

  return [head, content].join("\n\n");
}

async function buildDependenciesLicense({
  packageConfig,
  file,
  results,
  cliOptions,
}) {
  const { distDirectory, files } = packageConfig;

  const fileName = file.output.file;

  if (files.at(-1) !== file) {
    throw new Error(`${fileName} should be last file to build.`);
  }

  const shouldBuildLicense =
    !cliOptions.playground &&
    !cliOptions.files &&
    typeof cliOptions.minify !== "boolean";

  if (!shouldBuildLicense) {
    return { skipped: true };
  }

  const dependencies = getDependencies(results);

  if (dependencies.length === 0) {
    throw new Error("Fail to collect dependencies.");
  }

  const text = getLicenseText(dependencies);

  await fs.writeFile(path.join(distDirectory, fileName), text);
}

export default buildDependenciesLicense;
