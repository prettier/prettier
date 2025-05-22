// https://github.com/facebook/docusaurus/issues/10899
// https://github.com/defi-wonderland/handbook/blob/dev/plugins/llmsTxtPlugin.ts
import fs from "node:fs/promises";
import path from "node:path";

export default function llmsTxtPlugin(context) {
  return {
    name: "llms-txt-plugin",
    async loadContent() {
      const { siteDir } = context;
      const contentDir = path.join(siteDir, "versioned_docs/version-stable");
      const allMdx = [];
      const docsRecords = [];

      const getMdxFiles = async (dir, relativePath = "", depth = 0) => {
        const entries = await fs.readdir(dir, {
          withFileTypes: true,
        });

        entries.sort((a, b) => {
          if (a.isDirectory() && !b.isDirectory()) {
            return -1;
          }
          if (!a.isDirectory() && b.isDirectory()) {
            return 1;
          }
          return a.name.localeCompare(b.name);
        });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const currentRelativePath = path.join(relativePath, entry.name);

          if (entry.isDirectory()) {
            const dirName = entry.name
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
            const headingLevel = "#".repeat(depth + 2);
            allMdx.push(`\n${headingLevel} ${dirName}\n`);
            await getMdxFiles(fullPath, currentRelativePath, depth + 1);
          } else if (entry.name.endsWith(".md")) {
            const content = await fs.readFile(fullPath, "utf8");
            let title = entry.name.replace(".md", "");
            let description = "";

            const frontmatterMatch = content.match(/^---\n(.*?)\n---/su);
            if (frontmatterMatch) {
              const titleMatch = frontmatterMatch[1].match(/title:\s*(.+)/u);
              const descriptionMatch =
                frontmatterMatch[1].match(/description:\s*(.+)/u);

              if (titleMatch) {
                title = titleMatch[1].trim();
              }
              if (descriptionMatch) {
                description = descriptionMatch[1].trim();
              }
            }

            const headingLevel = "#".repeat(depth + 3);
            allMdx.push(`\n${headingLevel} ${title}\n\n${content}`);

            // Add to docs records for llms.txt
            docsRecords.push({
              title,
              path: currentRelativePath.replaceAll("\\", "/"),
              description,
            });
          }
        }
      };

      await getMdxFiles(contentDir);
      return { allMdx, docsRecords };
    },
    async postBuild({ content, outDir }) {
      const { allMdx, docsRecords } = content;

      // Write concatenated MDX content
      const concatenatedPath = path.join(outDir, "llms-full.txt");
      await fs.writeFile(concatenatedPath, allMdx.join("\n\n---\n\n"));

      // Create llms.txt with the requested format
      const llmsTxt = `# ${
        context.siteConfig.title
      }\n\n## Documentation\n\n${docsRecords
        .map(
          (doc) =>
            `- [${doc.title}](${context.siteConfig.url}/docs/${doc.path.replace(
              ".md",
              "",
            )}): ${doc.description}`,
        )
        .join("\n")}`;
      const llmsTxtPath = path.join(outDir, "llms.txt");
      await fs.writeFile(llmsTxtPath, llmsTxt);
    },
  };
}
