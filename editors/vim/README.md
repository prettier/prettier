For Vim users there are two main approaches, one that leans on [sbdchd](https://github.com/sbdchd)/[neoformat](https://github.com/sbdchd/neoformat), which has the advantage of leaving the cursor in the same position despite changes, or a vanilla approach which can only approximate the cursor location, but might be good enough for your needs.

Vim users can add the following to their `.vimrc`:

```vim
autocmd FileType javascript set formatprg=prettier\ --stdin
```

This makes Prettier power the [`gq` command](http://vimdoc.sourceforge.net/htmldoc/change.html#gq)
for automatic formatting without any plugins. You can also add the following to your
`.vimrc` to run prettier when `.js` files are saved:

```vim
autocmd BufWritePre *.js :normal gggqG
```

If you want to restore cursor position after formatting, try this
(although it's not guaranteed that it will be restored to the same
place in the code since it may have moved):

```vim
autocmd BufWritePre *.js exe "normal! gggqG\<C-o>\<C-o>"
``` 
