run_spec(__dirname, ["html", "angular", "vue"], {
  errors: {
    vue: ["input-void-element.html"], // [TBD] no error with `vue` in prettierX 0.18.x
  },
  bogus1: true, // [improve consistency of snapshot with prettierX 0.18.x]
});

run_spec(__dirname, ["html"], { htmlVoidTags: true });

run_spec(__dirname, ["angular", "vue"], {
  errors: {
    vue: ["input-void-element.html"], // [TBD] no error with `vue` in prettierX 0.18.x
  },
  htmlVoidTags: true,
});
