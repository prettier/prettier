## Configure External Tool

https://blog.jetbrains.com/webstorm/2016/08/using-external-tools/

Go to *File | Settings | Tools | External Tools* for Windows and Linux or *WebStorm | Preferences | Tools | External Tools* for OS X and click **+** to add a new tool. Let’s name it **Prettier**.

* **Program** set `prettier`

> If on the other hand you have `prettier` installed locally, replace the **Program** with `./node_modules/.bin/prettier` (on OS X and Linux) or `.\node_modules\.bin\prettier.cmd` (on Windows).

* **Parameters** set `--write [other opts] $FilePathRelativeToProjectRoot$` 
* **Working directory** set `$ProjectFileDir$`

![Example](https://raw.githubusercontent.com/jlongster/prettier/master/editors/jetbrains/with-prettier.png)

### Process directories

* Clone the External tool and name it `Prettier Directories`
* **Parameters** set `--write [other opts] $FilePathRelativeToProjectRoot$/**/(*.js|*.jsx)` 

## Usage

* Cmd-Shift-A on OS X or Ctrl+Shift+A on Windows and Linux
* Type: 'prettier' and hit enter

### Configure Keymap

Now when you setup **External Tool** I guess you want to add hotkey for it. Go to *File | Settings | Keymap* for Windows and Linux *WebStorm | Preferences | Keymap* and type external tool name in search box.

See [this documentation](https://www.jetbrains.com/help/webstorm/configuring-keyboard-shortcuts.html) about configuring keyboard shortcuts.
