const ignoredWarnings = new Set([
  // Duplicated case clause
  "This case clause will never be evaluated because it duplicates an earlier case clause",
]);

export default function esbuildPluginThrowWarnings() {
  return {
    name: "throw-warnings",
    setup(build) {
      build.onEnd((result) => {
        if (result.errors.length > 0) {
          return;
        }

        for (const warning of result.warnings) {
          if (ignoredWarnings.has(warning.text)) {
            continue;
          }

          console.log(warning);
          throw new Error(warning.text);
        }
      });
    },
  };
}
