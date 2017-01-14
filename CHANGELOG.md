
# 0.0.7

[link](https://github.com/jlongster/prettier/compare/7e31610...6f5df0e2b6b7db252e28ce80ebc54814fdc61497)

* Update live editor to 0.0.6
* Adds various prettier-browser changes (#175)
* Fix `[(0)]` (#179)
* Do not advance for forward skipSpaces (#176)
* Fix windows line-endings (#177)
* add license to package.json (#178)
* Fix exponent in babylon (#181)
* Make `declare type` consistent between babylon and flow (#183)
* Fix DeclareInterface (#182)
* Change test to workaround babylon bug (#184)

# 0.0.6

[link](https://github.com/jlongster/prettier/compare/faed09ceea32fcdd58b525aa09b880afb9fa55b7...3af7da5748d64efaed781104ec198924c8c369f9)

* Format property names consistently
* remove node 0.10 from travis config, add travis badge to readme
* Update snapshots
* chore: link prettier package to its github project
* add gitter badge to readme
* add instructions for Visual Studio plugin
* Do not unquote string properties
* Add prettier-browser
* v0.0.5 -- Accidentally didn't push this commit out before others landed; 0.0.5 is actually based on commit faed09ceea32fcdd58b525aa09b880afb9fa55b7
* update yarn.lock
* remove recast (not used)
* Always use double quotes for JSX and properly escape
* remove unused recast ref
* Fix typo in README.
* Support type annotation for rest argument on babylon parser
* Use `setq' instead of `infc' and `decf'
* Add title and encoding to the REPL
* Fix old name reference in tests_config
* Minimize string escapes
* Support method generics on babylon parser
* Break long `exports` into multiple lines.
* Use group instead of conditionalGroup
* Fix misprinting of computed properties in method chains. (#157)
* treat shebang outside of parsing (#137)
* Break multiline imports (#167)
* Do not put spaces on empty for loop (#169)
* Add trailing comma support for multiline exports (#168)
* Update run_spec to support options
* Add tests for bracketSpacing option
* Add tests for quotes option
* Add tests for tabWiths option
* Add tests for trailingComma option
* Fix for Node 4
* Add test for shebang and move to index.js (#170)
* Numeric literal callees should keep parens (#141)
* Remove leftover `arrowParensAlways` option (#171)
* Wrap Stateless JSX Arrow Functions and Assignment in Parens (fixes part of #73)
* Break JSXOpeningElement between attributes (fixes #15)
* JSX maintains spaces that matter (fixes #30 and thus part of #73)
* Multiline JSX opening tag breaks children out too (for #73)
* Add regression tests for long JSX Expression contents
* include index.js in format:all script (#132)
* Wrap ForStatement in a block for const decls (#172)
* Reprint all the files!
