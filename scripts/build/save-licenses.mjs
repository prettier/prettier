import path from "node:path";
import { promises as fs } from "node:fs";
import { outdent } from "outdent";
import { DIST_DIR } from "../utils/index.mjs";

const file = path.join(DIST_DIR, "LICENSE");
const separator = `\n${"-".repeat(40)}\n\n`;

async function saveLicenses(dependencies) {
  // Unique by `name` and `version`
  dependencies = dependencies.filter(
    (dependency, index) =>
      index ===
      dependencies.findIndex(
        ({ name, version }) =>
          dependency.name === name && dependency.version === version
      )
  );

  dependencies.sort(
    (dependencyA, dependencyB) =>
      dependencyA.name.localeCompare(dependencyB.name) ||
      dependencyA.version.localeCompare(dependencyB.version)
  );

  const prettierLicense = await fs.readFile(file, "utf8");

  const licenses = [
    ...new Set(
      dependencies
        .filter(({ license }) => license)
        .map(({ license }) => license)
    ),
  ];
  const text = outdent`
    # Prettier license

    Prettier is released under the MIT license:

    ${prettierLicense.trim()}

    ## Licenses of bundled dependencies

    The published Prettier artifact additionally contains code with the following licenses:
    ${licenses.join(", ")}

    ## Bundled dependencies
  `;

  const content = dependencies
    .map((dependency) => {
      let text = `### ${dependency.name}@v${dependency.version}\n`;

      const meta = [];

      if (dependency.license) {
        meta.push(`License: ${dependency.license}`);
      }
      if (dependency.author?.name) {
        meta.push(`By: ${dependency.author.name}`);
      }
      if (dependency.repository?.url) {
        meta.push(`Repository: <${dependency.repository.url}>`);
      }

      if (meta.length > 0) {
        text += "\n" + meta.join("\n") + "\n";
      }

      if (dependency.licenseText) {
        text +=
          "\n" +
          dependency.licenseText
            .trim()
            .split("\n")
            .map((line) => (line ? `> ${line}` : ">"))
            .join("\n") +
          "\n";
      }
      return text;
    })
    .join(separator);

  await fs.writeFile(file, text + "\n\n" + content);
}

export default saveLicenses;
