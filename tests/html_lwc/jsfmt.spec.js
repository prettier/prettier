run_spec(__dirname, ["lwc"], { parser: "lwc" });
run_spec(__dirname, ["lwc"], { parser: "lwc", trailingComma: "es5" });
run_spec(__dirname, ["lwc"], { parser: "lwc", semi: false });
run_spec(__dirname, ["lwc"], { parser: "lwc", htmlTopLevelIndent: "auto" });
run_spec(__dirname, ["lwc"], { parser: "lwc", htmlTopLevelIndent: "always" });
run_spec(__dirname, ["lwc"], { parser: "lwc", htmlTopLevelIndent: "never" });
