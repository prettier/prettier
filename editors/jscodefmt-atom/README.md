# atom-standard-formatter

Atom package to format your Javascript using [Standard Style](https://github.com/feross/standard)
, [Semi-Standard Style](https://github.com/Flet/semistandard)
or [Happiness Style](https://github.com/jedwatson/happiness).

![](https://cloud.githubusercontent.com/assets/5852428/8020717/adbf10c0-0c51-11e5-8537-2714c9f698e5.gif)

### Usage

#### Keybindings

Use `ctrl-alt-f` to format the current Javascript file. If a text selection is made, only the selected text will be formatted.

#### Format On Save

Automatically format your Javascript file on save by enabling the *Format On Save* package setting.  This is off by default.

#### Menu

*Packages > standard-formatter > Format*

### Settings

#### formatOnSave (default: false)

Format Javascript files when saving.

#### checkStyleDevDependencies (default: false)

Check code style in package.json `devDependencies`. If a valid style is not found it won't format.

| Note: This will use the nearest package.json

#### style (default: standard)

Choose the style formatter module you want to use. If `checkStyleDevDependencies` is `true` this setting will be ignored.

* [standard](https://github.com/feross/standard) - equivalent to running `standard --fix`
* [standard-format](https://github.com/maxogden/standard-format)
* [semistandard-format](https://github.com/ricardofbarros/semistandard-format)
* [happiness-format](https://github.com/martinheidegger/hapiness-format)

#### honorPackageConfig (default: true)

Don't auto-format files included in the package.json's `"ignore"` configuration for the detected style.

| Note: This will use the nearest package.json

### A note on formatting

This package relies on the excellent work from the following modules to perform formatting:

- [standard](https://github.com/feross/standard)
- [standard-format](https://github.com/maxogden/standard-format)
- [semistandard-format](https://github.com/ricardofbarros/semistandard-format)
- [happiness-format](https://github.com/martinheidegger/hapiness-format)

If parts of your Javascript are not being formatted as you'd expect, is is likely an issue with one of these modules and not this Atom package. To verify this, you can try to format your file directly using the above modules and examine the output.

For example, to format `my-file.js` and output to stdout:
```
$ npm install -g standard-format
$ standard-format my-file.js
```
