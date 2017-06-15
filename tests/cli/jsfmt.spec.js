const stream = require("stream");
const stringToStream = require("string-to-stream");
const prettierCli = require("../../bin/prettier");

test("can pass arguments, stdin/stdout/stderr to CLI programmatically", done => {
  const stdin = stringToStream("0");

  let output = "";
  const stdout = new stream.Writable({
    write: function(chunk, encoding, next) {
      output += chunk.toString();
      next();
      if (output === "0;\n") {
        done();
      }
    }
  });

  const stderr = new stream.Writable({
    write: function(chunk, encoding, next) {
      next();
    }
  });

  const result = prettierCli.cli(["--stdin"], stdin, stdout, stderr);
  expect(result.exitCode).toEqual(0);
  // the formatted code is checked by the stdout stream's write method
});
