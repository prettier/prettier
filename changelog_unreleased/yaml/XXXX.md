#### Do not wrap more-indented lines in folded YAML block scalars (#XXXX by @jianyunyi)

In a folded block scalar (`>`), a line that is indented more than the rest of the scalar keeps its line breaks, so wrapping it changes the value of the scalar. Prettier now leaves such lines as they are when `proseWrap` is `"always"`.

<!-- prettier-ignore -->
```yaml
# Input (--prose-wrap always --print-width 40)
key: >
  Ordinary text is wrapped as usual.
    This more-indented line is wider than the print width.
  More ordinary text.

# Prettier stable
key: >
  Ordinary text is wrapped as usual.
    This more-indented line is wider
  than the print width.
  More ordinary text.

# Prettier main
key: >
  Ordinary text is wrapped as usual.
    This more-indented line is wider than the print width.
  More ordinary text.
```
