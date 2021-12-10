---
id: webstorm
title: WebStorm Setup
---

## JetBrains IDEs (WebStorm, IntelliJ IDEA, PyCharm, etc.)

WebStorm comes with built-in support for Prettier. If you’re using other JetBrains IDE like IntelliJ IDEA, PhpStorm, or PyCharm, make sure you have this [plugin](https://plugins.jetbrains.com/plugin/10456-prettier) installed and enabled in _Preferences / Settings | Plugins_.

First, you need to install and configure Prettier. You can find instructions on how to do it [here](https://www.jetbrains.com/help/webstorm/prettier.html#ws_prettier_install).

Once it’s done, you can do a few things in your IDE. You can use the **Reformat with Prettier** action (_Opt+Shift+Cmd+P_ on macOS or _Alt+Shift+Ctrl+P_ on Windows and Linux) to format the selected code, a file, or a whole directory.

You can also configure WebStorm to run Prettier on save (_Cmd+S/Ctrl+S_) or use it as the default formatter (_Opt+Cmd+L/Ctrl+Alt+L_). For this, open _Preferences / Settings | Languages & Frameworks | JavaScript | Prettier_ and tick the corresponding checkbox: **On save** and/or **On ‘Reformat Code’** action.

![Example](/docs/assets/webstorm/prettier-settings.png)

By default, WebStorm will apply formatting to all _.js, .ts, .jsx_, and _.tsx_ files that you’ve edited in your project. To apply the formatting to other file types, or to limit formatting to files located only in specific directories, you can customize the default configuration by using [glob patterns](https://github.com/isaacs/node-glob).

For more information, see [WebStorm online help](https://www.jetbrains.com/help/webstorm/prettier.html).
