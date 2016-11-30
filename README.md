
```
$ git clone https://github.com/jlongster/jscodefmt.git
$ cd jscodefmt
$ npm install -g .
$ jscodefmt file.js
```

It's most useful when integrated with your editor, so see `editors` to
for editor support. Atom and Emacs is currently supported.

More docs on editor integration will come soon. To integrate in Emacs,
add the following code. This will format the file when saved.

```elisp
(require 'jscodefmt)
(add-hook 'js-mode-hook
          (lambda ()
            (add-hook 'before-save-hook 'jscodefmt-before-save)))
```