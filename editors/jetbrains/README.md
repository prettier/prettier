### Configure External Tool

Go to *File | Settings | Tools | External Tools* for Windows and Linux or *WebStorm | Preferences | Tools | External Tools* for OS X and click **+** to add a new tool. Let’s name it **Prettify**.

In **Program** set `prettier`

In **Parameters** set `--write [other opts] $FilePathRelativeToProjectRoot$` 

In **Working directory** set `$ProjectFileDir$`

![Example](https://raw.githubusercontent.com/jlongster/prettier/master/editors/jetbrains/with-prettier.png)

If on the other hand you have `prettier` installed locally, replace the **Program** with `./node_modules/.bin/prettier` (on OS X and Linux) or `.\node_modules\.bin\prettier.cmd` (on Windows).

### Configure Keymap

Now when you setup **External Tool** I guess you want to add hotkey for it. Go to *File | Settings | Keymap* for Windows and Linux *WebStorm | Preferences | Keymap* and type external tool name in search box.

See [this documentation](https://www.jetbrains.com/help/webstorm/configuring-keyboard-shortcuts.html) about configuring keyboard shortcuts.
