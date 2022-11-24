import fs from "node:fs/promises";
import { visualizer as esbuildVisualizer } from "esbuild-visualizer/dist/plugin/index.js";

export default function esbuildPluginVisualizer({ formats }) {
  formats = Object.fromEntries(formats.map((format) => [format, true]));

  return {
    name: "visualizer",
    setup(build) {
      const { initialOptions: esbuildConfig, esbuild } = build;
      esbuildConfig.metafile = true;

      build.onEnd(async ({ metafile }) => {
        const files = Object.keys(metafile.outputs);

        if (files.length !== 1) {
          throw new Error("Unexpected `outputs`.");
        }

        if (formats.text || formats.stdout) {
          const report = await esbuild.analyzeMetafile(metafile, {
            verbose: true,
          });

          if (formats.stdout) {
            console.log(report);
          }

          if (formats.text) {
            await fs.writeFile(`${esbuildConfig.outfile}.report.txt`, report);
          }
        }

        if (formats.html) {
          const report = await esbuildVisualizer(metafile, {
            title: files[0],
          });

          await fs.writeFile(`${esbuildConfig.outfile}.report.html`, report);
        }
      });
    },
  };
}
