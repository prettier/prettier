
```
$ git clone https://github.com/jlongster/jscodefmt.git
$ cd jscodefmt
$ npm install -g .
$ jscodefmt file.js
```

It's most useful when integrated with your editor, so see `editors` to
for editor support. Currently only Emacs integration exists.

To integrate in Emacs, add the following code. This will format the
file when saved.

```elisp
(require 'jscodefmt)
(add-hook 'js-mode-hook
          (lambda ()
            (add-hook 'before-save-hook 'jscodefmt-before-save)))
```