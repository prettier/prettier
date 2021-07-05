// [prettierx] test script notice:
// This test script runs for test files in another directory,
// **not** on any files in *this* directory.

const dirPath = `${__dirname}/../../../../html_tags`;

run_spec(dirPath, ["html"], { htmlVoidTags: true });
