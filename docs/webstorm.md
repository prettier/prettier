---
id: webstorm
title: Webstorm Setup
---

## Configure External Tool

https://blog.jetbrains.com/webstorm/2016/08/using-external-tools/

Go to _File | Settings | Tools | External Tools_ for Windows and Linux or _WebStorm | Preferences | Tools | External Tools_ for OS X and click **+** to add a new tool. Let’s name it **Prettier**.

* **Program** set `prettier`

> If on the other hand you have `prettier` installed locally, replace the **Program** with `$ProjectFileDir$/node_modules/.bin/prettier` (on OS X and Linux) or `$ProjectFileDir$\node_modules\.bin\prettier.cmd` (on Windows).

* **Parameters** set `--write [other opts] $FilePathRelativeToProjectRoot$`
* **Working directory** set `$ProjectFileDir$`

![Example](/docs/assets/webstorm/with-prettier.png)

### Process directories

* Clone the External tool created above and name it `Prettier Directories`
* **Parameters** set `--write [other opts] $FileDirRelativeToProjectRoot$/**/{*.js,*.jsx}`

## Usage

* Cmd-Shift-A on OS X or Ctrl+Shift+A on Windows and Linux
* Type: 'prettier' and hit enter

### Configure Keymap

Now when you setup **External Tool** I guess you want to add hotkey for it. Go to _File | Settings | Keymap_ for Windows and Linux _WebStorm | Preferences | Keymap_ and type external tool name in search box.

See [this documentation](https://www.jetbrains.com/help/webstorm/configuring-keyboard-shortcuts.html) about configuring keyboard shortcuts.

## Using File Watcher

To automatically format using `prettier` on save, you can use a file watcher.

Go to _File | Settings | Tools | File Watchers_ for Windows and Linux or _WebStorm | Preferences | Tools | File Watchers_ for OS X and click **+** to add a new tool. Let’s name it **Prettier**.

* **File Type**: JavaScript
* **Scope**: Current File
* **Program** set `prettier` (if you have `prettier` installed locally, see ["Configure External Tool"](#configure-external-tool) above)
* **Arguments** set `--write [other opts] $FilePath$`
* **Working directory** set `$ProjectFileDir$`
* **Immediate file synchronization**: Uncheck to reformat on Save only (otherwise code will jump around while you type).

![Example](/docs/assets/webstorm/prettier-file-watcher.png)
