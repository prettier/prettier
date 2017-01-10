## 2.4.0 - Support `standard --fix`

- Use `standard --fix` as the default formatter for Standard Style
- Keep existing `standard-format` module as a formatter option

## 1.0.0 - Honor Package Settings
- Format On Save honors any `ignore` configuration in the file's nearest package.json.
- JSX files are supported

## 0.7.0 - Multiple Styles
- Support standard and semi-standard styles using settings
- Fix: Editor selection is ignored when formatting on save

## 0.6.0 - Format selection
- If a text selection is made, `ctrl-alt-f` will format the selection only. Otherwise
`ctrl-alt-f` will format file contents as normal.

## 0.5.1 - Cursor position and syntax error handling
- Maintain cursor position after format/save
- Catch errors thrown by transform due to syntax errors

## 0.5.0 - Format on save and Javascript instead of Coffeescript
- **Format on save**: Added setting to enable format on save. Defaults to off.
- **Less irony**: This package is now written in Javascript using Javascript Standard Style.
- **Faster startup time**

## 0.1.0 - First Release
* Use [standard-format](https://github.com/maxogden/standard-format) to format current Javascript file
* `ctrl-alt-f` keybinding
