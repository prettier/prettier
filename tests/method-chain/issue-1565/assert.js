// https://github.com/prettier/prettier/issues/1565#issuecomment-339801188
assert.equal(this.$().text().trim(), '1000');
assert.equal(
  this.$()
    .text()
    .trim(),
  '1000'
);
