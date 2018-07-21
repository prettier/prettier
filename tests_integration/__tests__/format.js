"use strict";

const prettier = require("prettier/local");

test("yaml parser should handle CRLF correctly", () => {
  const input = "a:\r\n  123\r\n";
  expect(prettier.format(input, { parser: "yaml" })).toMatchSnapshot();
});

test("vue parser should work with range format", () => {
  const input = `<template>
  <p>Templates are not formatted yet ...
    </p>
</template>

<script>
let Prettier = format => { your.js('though') }
</script>

<style>
.and { css: too! important }
</style>`;
  expect(() =>
    prettier.format(input, {
      parser: "vue",
      rangeStart: 1,
      rangeEnd: input.length
    })
  ).not.toThrowError();
});
