---
id: vim
title: Vim Setup
---

Vim users can install either [vim-prettier](https://github.com/prettier/vim-prettier), which is Prettier specific, or [Neoformat](https://github.com/sbdchd/neoformat) or [ALE](https://github.com/w0rp/ale) which are generalized lint/format engines with support for Prettier.

## [vim-prettier](https://github.com/prettier/vim-prettier)

See the [vim-prettier](https://github.com/prettier/vim-prettier) readme for installation and usage instructions.

## [Neoformat](https://github.com/sbdchd/neoformat)

The best way to install Neoformat is with your favorite plugin manager for Vim, such as [vim-plug](https://github.com/junegunn/vim-plug):

```
Plug 'sbdchd/neoformat'
```

Run `:Neoformat` or `:Neoformat prettier` in a supported file to run Prettier.

To have Neoformat run Prettier on save:

```
autocmd BufWritePre *.js Neoformat
```

You can also make Vim format your code more frequently, by setting an `autocmd` for other events. Here are a couple of useful ones:

- `TextChanged`: after a change was made to the text in Normal mode
- `InsertLeave`: when leaving Insert mode

For example, you can format on both of the above events together with `BufWritePre` like this:

```
autocmd BufWritePre,TextChanged,InsertLeave *.js Neoformat
```

See `:help autocmd-events` in Vim for details.

It's recommended to use a [config file](configuration.md), but you can also add options in your `.vimrc`:

```
autocmd FileType javascript setlocal formatprg=prettier\ --stdin\ --parser\ flow\ --single-quote\ --trailing-comma\ es5
" Use formatprg when available
let g:neoformat_try_formatprg = 1
```

Each space in prettier options should be escaped with `\`.

## [ALE](https://github.com/w0rp/ale)

ALE requires either Vim 8 or Neovim as ALE makes use of the asynchronous abilities that both Vim 8 and Neovim provide.

The best way to install ALE is with your favorite plugin manager for Vim, such as [vim-plug](https://github.com/junegunn/vim-plug):

```
Plug 'w0rp/ale'
```

You can find further instructions on the [ALE repository](https://github.com/w0rp/ale#3-installation).

ALE will try to use Prettier installed locally before looking for a global installation.

Enable the Prettier fixer for the languages you use:

```
let g:ale_fixers = {
\   'javascript': ['prettier'],
\   'css': ['prettier'],
\}
```

You can then run `:ALEFix` in a JavaScript or CSS file to run Prettier.

To have ALE run Prettier on save:

```
let g:ale_fix_on_save = 1
```

It's recommended to use a [config file](configuration.md), but you can also add options in your `.vimrc`:

```
let g:ale_javascript_prettier_options = '--single-quote --trailing-comma es5'
```

## Running manually

If you want something really bare-bones, you can create a custom key binding. In this example, `gp` (mnemonic: "get pretty") is used to run prettier (with options) in the currently active buffer:

```
nnoremap gp :silent %!prettier --stdin --stdin-filepath % --trailing-comma all --single-quote<CR>
```

Note that if there's a syntax error in your code, the whole buffer will be replaced with an error message. You'll need to press `u` to get your code back.

Another disadvantage of this approach is that the cursor position won't be preserved.
