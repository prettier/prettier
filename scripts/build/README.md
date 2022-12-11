# Prettier Build Script

## Requirements

- Node.js version `>= 14.18`.

## Usage

```sh
yarn build
```

## Flags

### `--clean`

Remove `dist` directory before bundle files.

```sh
yarn build --clean
```

### `--playground`

Run script with `--playground` flag will only build files needed for the website.

```sh
yarn build --playground
```

### `--print-size`

To print the bundled file sizes:

```sh
yarn build --print-size
```

### `--compare-size`

Print the file size changes compare to the last released version:

```sh
yarn build --compare-size
```

### `--file`

To build specific file(s):

```sh
yarn build --file=esm/parser-babel.mjs
```

```sh
yarn build --file=standalone.js --file=parser-meriyah.js
```

### `--save-as`

To save bundled file to a different location, this flag can only use together with ONE `--file` flag

```sh
yarn build --file=parser-babel.js --save-as=babel-for-test.js
```

### `--report`

Visualize and analyze your esbuild bundle to see which modules are taking up space.

Available reporter formats:

- `html` Generate a HTML report file, saved next to the bundled file with `.report.html` suffix.
- `text` Generate a plain text report file, saved next to the bundled file with `.report.txt` suffix.
- `stdout` Log report information in console.

```sh
yarn build --report
yarn build --report=stdout --report=text --report=html
```

**`--report` equals to `--report=html`**

### `--minify` and `--no-minify`

By default, the file minification is controlled by `config.mjs` and `bundler.mjs`, these flags are added to override that behavior.

These should only be used for debugging purposes, suggest to use them together with the `--file` flag.

Force minify files:

```sh
yarn build --file=index.js --minify
```

Disable minify files:

```sh
yarn build --file=parser-babel.js --no-minify
```

### `--no-babel`

Currently, we need babel to transform/shim following new language features:

- `Array#flat()` for Node.js 10
- `Array#flatMap()` for Node.js 10
- `Object.fromEntries()` for Node.js 10

When debugging the build script, we may want skip this step, so the build process can be faster.

Playground use this flag to speed up the build too.

`--babel` have no effect, don't use.

```sh
yarn build --file=index.js --no-babel
```
GEM
  remote: https://rubygems.org/
  specs:
    activesupport (6.0.4.7)
      concurrent-ruby (~> 1.0, >= 1.0.2)
      i18n (>= 0.7, < 2)
      minitest (~> 5.1)
      tzinfo (~> 1.1)
      zeitwerk (~> 2.2, >= 2.2.2)
    addressable (2.8.0)
      public_suffix (>= 2.0.2, < 5.0)
    ast (2.4.2)
    coderay (1.1.3)
    coffee-script (2.4.1)
      coffee-script-source
      execjs
    coffee-script-source (1.11.1)
    colorator (1.1.0)
    commonmarker (0.23.6)
    concurrent-ruby (1.1.10)
    dnsruby (1.61.9)
      simpleidn (~> 0.1)
    em-websocket (0.5.3)
      eventmachine (>= 0.12.9)
      http_parser.rb (~> 0)
    ethon (0.15.0)
      ffi (>= 1.15.0)
    eventmachine (1.2.7)
    execjs (2.8.1)
    faraday (1.10.0)
      faraday-em_http (~> 1.0)
      faraday-em_synchrony (~> 1.0)
      faraday-excon (~> 1.1)
      faraday-httpclient (~> 1.0)
      faraday-multipart (~> 1.0)
      faraday-net_http (~> 1.0)
      faraday-net_http_persistent (~> 1.0)
      faraday-patron (~> 1.0)
      faraday-rack (~> 1.0)
      faraday-retry (~> 1.0)
      ruby2_keywords (>= 0.0.4)
    faraday-em_http (1.0.0)
    faraday-em_synchrony (1.0.0)
    faraday-excon (1.1.0)
    faraday-httpclient (1.0.1)
    faraday-multipart (1.0.3)
      multipart-post (>= 1.2, < 3)
    faraday-net_http (1.0.1)
    faraday-net_http_persistent (1.2.0)
    faraday-patron (1.0.0)
    faraday-rack (1.0.0)
    faraday-retry (1.0.3)
    fastimage (2.2.6)
    ffi (1.15.5)
    forwardable-extended (2.6.0)
    gemoji (3.0.1)
    github-pages (226)
      github-pages-health-check (= 1.17.9)
      jekyll (= 3.9.2)
      jekyll-avatar (= 0.7.0)
      jekyll-coffeescript (= 1.1.1)
      jekyll-commonmark-ghpages (= 0.2.0)
      jekyll-default-layout (= 0.1.4)
      jekyll-feed (= 0.15.1)
      jekyll-gist (= 1.5.0)
      jekyll-github-metadata (= 2.13.0)
      jekyll-include-cache (= 0.2.1)
      jekyll-mentions (= 1.6.0)
      jekyll-optional-front-matter (= 0.3.2)
      jekyll-paginate (= 1.1.0)
      jekyll-readme-index (= 0.3.0)
      jekyll-redirect-from (= 0.16.0)
      jekyll-relative-links (= 0.6.1)
      jekyll-remote-theme (= 0.4.3)
      jekyll-sass-converter (= 1.5.2)
      jekyll-seo-tag (= 2.8.0)
      jekyll-sitemap (= 1.4.0)
      jekyll-swiss (= 1.0.0)
      jekyll-theme-architect (= 0.2.0)
      jekyll-theme-cayman (= 0.2.0)
      jekyll-theme-dinky (= 0.2.0)
      jekyll-theme-hacker (= 0.2.0)
      jekyll-theme-leap-day (= 0.2.0)
      jekyll-theme-merlot (= 0.2.0)
      jekyll-theme-midnight (= 0.2.0)
      jekyll-theme-minimal (= 0.2.0)
      jekyll-theme-modernist (= 0.2.0)
      jekyll-theme-primer (= 0.6.0)
      jekyll-theme-slate (= 0.2.0)
      jekyll-theme-tactile (= 0.2.0)
      jekyll-theme-time-machine (= 0.2.0)
      jekyll-titles-from-headings (= 0.5.3)
      jemoji (= 0.12.0)
      kramdown (= 2.3.2)
      kramdown-parser-gfm (= 1.1.0)
      liquid (= 4.0.3)
      mercenary (~> 0.3)
      minima (= 2.5.1)
      nokogiri (>= 1.13.4, < 2.0)
      rouge (= 3.26.0)
      terminal-table (~> 1.4)
    github-pages-health-check (1.17.9)
      addressable (~> 2.3)
      dnsruby (~> 1.60)
      octokit (~> 4.0)
      public_suffix (>= 3.0, < 5.0)
      typhoeus (~> 1.3)
    html-pipeline (2.14.1)
      activesupport (>= 2)
      nokogiri (>= 1.4)
    http_parser.rb (0.8.0)
    httparty (0.20.0)
      mime-types (~> 3.0)
      multi_xml (>= 0.5.2)
    i18n (0.9.5)
      concurrent-ruby (~> 1.0)
    jekyll (3.9.2)
      addressable (~> 2.4)
      colorator (~> 1.0)
      em-websocket (~> 0.5)
      i18n (~> 0.7)
      jekyll-sass-converter (~> 1.0)
      jekyll-watch (~> 2.0)
      kramdown (>= 1.17, < 3)
      liquid (~> 4.0)
      mercenary (~> 0.3.3)
      pathutil (~> 0.9)
      rouge (>= 1.7, < 4)
      safe_yaml (~> 1.0)
    jekyll-avatar (0.7.0)
      jekyll (>= 3.0, < 5.0)
    jekyll-coffeescript (1.1.1)
      coffee-script (~> 2.2)
      coffee-script-source (~> 1.11.1)
    jekyll-commonmark (1.4.0)
      commonmarker (~> 0.22)
    jekyll-commonmark-ghpages (0.2.0)
      commonmarker (~> 0.23.4)
      jekyll (~> 3.9.0)
      jekyll-commonmark (~> 1.4.0)
      rouge (>= 2.0, < 4.0)
    jekyll-default-layout (0.1.4)
      jekyll (~> 3.0)
    jekyll-feed (0.15.1)
      jekyll (>= 3.7, < 5.0)
    jekyll-gist (1.5.0)
      octokit (~> 4.2)
    jekyll-github-metadata (2.13.0)
      jekyll (>= 3.4, < 5.0)
      octokit (~> 4.0, != 4.4.0)
    jekyll-include-cache (0.2.1)
      jekyll (>= 3.7, < 5.0)
    jekyll-mentions (1.6.0)
      html-pipeline (~> 2.3)
      jekyll (>= 3.7, < 5.0)
    jekyll-optional-front-matter (0.3.2)
      jekyll (>= 3.0, < 5.0)
    jekyll-paginate (1.1.0)
    jekyll-readme-index (0.3.0)
      jekyll (>= 3.0, < 5.0)
    jekyll-redirect-from (0.16.0)
      jekyll (>= 3.3, < 5.0)
    jekyll-relative-links (0.6.1)
      jekyll (>= 3.3, < 5.0)
    jekyll-remote-theme (0.4.3)
      addressable (~> 2.0)
      jekyll (>= 3.5, < 5.0)
      jekyll-sass-converter (>= 1.0, <= 3.0.0, != 2.0.0)
      rubyzip (>= 1.3.0, < 3.0)
    jekyll-sass-converter (1.5.2)
      sass (~> 3.4)
    jekyll-seo-tag (2.8.0)
      jekyll (>= 3.8, < 5.0)
    jekyll-sitemap (1.4.0)
      jekyll (>= 3.7, < 5.0)
    jekyll-swiss (1.0.0)
    jekyll-theme-architect (0.2.0)
      jekyll (> 3.5, < 5.0)
      jekyll-seo-tag (~> 2.0)
    jekyll-theme-cayman (0.2.0)
      jekyll (> 3.5, < 5.0)
      jekyll-seo-tag (~> 2.0)
    jekyll-theme-dinky (0.2.0)
      jekyll (> 3.5, < 5.0)
      jekyll-seo-tag (~> 2.0)
    jekyll-theme-hacker (0.2.0)
      jekyll (> 3.5, < 5.0)
      jekyll-seo-tag (~> 2.0)
    jekyll-theme-leap-day (0.2.0)
      jekyll (> 3.5, < 5.0)
      jekyll-seo-tag (~> 2.0)
    jekyll-theme-merlot (0.2.0)
      jekyll (> 3.5, < 5.0)
      jekyll-seo-tag (~> 2.0)
    jekyll-theme-midnight (0.2.0)
      jekyll (> 3.5, < 5.0)
      jekyll-seo-tag (~> 2.0)
    jekyll-theme-minimal (0.2.0)
      jekyll (> 3.5, < 5.0)
      jekyll-seo-tag (~> 2.0)
    jekyll-theme-modernist (0.2.0)
      jekyll (> 3.5, < 5.0)
      jekyll-seo-tag (~> 2.0)
    jekyll-theme-primer (0.6.0)
      jekyll (> 3.5, < 5.0)
      jekyll-github-metadata (~> 2.9)
      jekyll-seo-tag (~> 2.0)
    jekyll-theme-slate (0.2.0)
      jekyll (> 3.5, < 5.0)
      jekyll-seo-tag (~> 2.0)
    jekyll-theme-tactile (0.2.0)
      jekyll (> 3.5, < 5.0)
      jekyll-seo-tag (~> 2.0)
    jekyll-theme-time-machine (0.2.0)
      jekyll (> 3.5, < 5.0)
      jekyll-seo-tag (~> 2.0)
    jekyll-titles-from-headings (0.5.3)
      jekyll (>= 3.3, < 5.0)
    jekyll-watch (2.2.1)
      listen (~> 3.0)
    jemoji (0.12.0)
      gemoji (~> 3.0)
      html-pipeline (~> 2.2)
      jekyll (>= 3.0, < 5.0)
    kramdown (2.3.2)
      rexml
    kramdown-parser-gfm (1.1.0)
      kramdown (~> 2.0)
    liquid (4.0.3)
    listen (3.7.1)
      rb-fsevent (~> 0.10, >= 0.10.3)
      rb-inotify (~> 0.9, >= 0.9.10)
    mercenary (0.3.6)
    method_source (1.0.0)
    mime-types (3.4.1)
      mime-types-data (~> 3.2015)
    mime-types-data (3.2022.0105)
    minima (2.5.1)
      jekyll (>= 3.5, < 5.0)
      jekyll-feed (~> 0.9)
      jekyll-seo-tag (~> 2.1)
    minitest (5.15.0)
    multi_xml (0.6.0)
    multipart-post (2.1.1)
    nokogiri (1.13.9-arm64-darwin)
      racc (~> 1.4)
    nokogiri (1.13.9-x86_64-linux)
      racc (~> 1.4)
    octokit (4.22.0)
      faraday (>= 0.9)
      sawyer (~> 0.8.0, >= 0.5.3)
    parallel (1.22.1)
    parser (3.1.2.0)
      ast (~> 2.4.1)
    pathutil (0.16.2)
      forwardable-extended (~> 2.6)
    pry (0.14.1)
      coderay (~> 1.1)
      method_source (~> 1.0)
    public_suffix (4.0.7)
    racc (1.6.0)
    rainbow (3.1.1)
    rake (13.0.6)
    rb-fsevent (0.11.1)
    rb-inotify (0.10.1)
      ffi (~> 1.0)
    regexp_parser (2.3.0)
    rexml (3.2.5)
    rouge (3.26.0)
    rubocop (1.28.1)
      parallel (~> 1.10)
      parser (>= 3.1.0.0)
      rainbow (>= 2.2.2, < 4.0)
      regexp_parser (>= 1.8, < 3.0)
      rexml
      rubocop-ast (>= 1.17.0, < 2.0)
      ruby-progressbar (~> 1.7)
      unicode-display_width (>= 1.4.0, < 3.0)
    rubocop-ast (1.17.0)
      parser (>= 3.1.1.0)
    rubocop-performance (1.13.3)
      rubocop (>= 1.7.0, < 2.0)
      rubocop-ast (>= 0.4.0)
    ruby-progressbar (1.11.0)
    ruby2_keywords (0.0.5)
    rubyzip (2.3.2)
    safe_yaml (1.0.5)
    sass (3.7.4)
      sass-listen (~> 4.0.0)
    sass-listen (4.0.0)
      rb-fsevent (~> 0.9, >= 0.9.4)
      rb-inotify (~> 0.9, >= 0.9.7)
    sawyer (0.8.2)
      addressable (>= 2.3.5)
      faraday (> 0.8, < 2.0)
    simpleidn (0.2.1)
      unf (~> 0.1.4)
    terminal-table (1.8.0)
      unicode-display_width (~> 1.1, >= 1.1.1)
    thread_safe (0.3.6)
    typhoeus (1.4.0)
      ethon (>= 0.9.0)
    tzinfo (1.2.10)
      thread_safe (~> 0.1)
    unf (0.1.4)
      unf_ext
    unf_ext (0.0.8.1)
    unicode-display_width (1.8.0)
    webrick (1.7.0)
    zeitwerk (2.5.4)

PLATFORMS
  arm64-darwin-21
  x86_64-linux

DEPENDENCIES
  fastimage
  github-pages
  httparty
  minitest
  octokit
  pry
  rake
  rubocop
  rubocop-performance
  safe_yaml
  webrick

BUNDLED WITH
   2.3.12mouse/remote-functions
   AUTONATE ::
   Automate.yml :
   :Build::
  Puvlish /;;publish.yml/require.txt 
  BEGIN
  GLOW4
  # bitore.sigs/test :L
