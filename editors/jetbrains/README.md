### Configure External Tool

Go to *File | Settings | Tools | External Tools* for Windows and Linux or *WebStorm | Preferences | Tools | External Tools* for OS X and click **+** to add a new tool. Let’s name it **Prettify**.

#### If you installed prettier globally

In **Program** set `prettier`

In **Parameters** set `--write [other opts] $FilePathRelativeToProjectRoot$` 

In **Working directory** set `$ProjectFileDir$`

![With `prettier`](https://github.com/jlongster/prettier/tree/master/editors/jetbrains/with-prettier.png "With Prettier")

#### If you are using npm script to run prettier

In **Program** set `npm`

In **Parameters** set `run prettify $FilePathRelativeToProjectRoot$` (I'm using `prettify` script for this example)

In **Working directory** set `$ProjectFileDir$`

![With `npm run`](https://github.com/jlongster/prettier/tree/master/editors/jetbrains/with-npm-run.png "With npm run")

#### If you are using npm script but run with yarn

In **Program** set `yarn`

In **Parameters** set `prettify $FilePathRelativeToProjectRoot$` (I'm using `prettify` script for this example)

In **Working directory** set `$ProjectFileDir$`

![With `yarn`](https://github.com/jlongster/prettier/tree/master/editors/jetbrains/with-yarn.png "With yarn")



### Configure Keymap

Now when you setup **Extarnal Tool** I guess you what to add hotkey for it. Go to *File | Settings | Keymap* for Windows and Linux *WebStorm | Preferences | Keymap* and type external tool name in search box.

See [this documentation](https://www.jetbrains.com/help/webstorm/configuring-keyboard-shortcuts.html) about configuring keyboard shortcuts.