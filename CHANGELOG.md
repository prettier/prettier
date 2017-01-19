# 0.0.9

[link](https://github.com/jlongster/prettier/compare/0.0.8...0.0.9)

* Workaround flow bug parsing astral unicode characters (#277)
* Allow specifying the major mode that `defun-before-save` will use. (#276
* Fix space missing before `,` on export with bracket spacing off (#278)
* Fix space missing before `,` on import with bracket spacing off (#279)
* Add newline after shebang if necessary. (#215)
* Remove +1 from newline detection (#261)
* Fix path when printing member chains so parens work properly (fixes #243
* Ensure parens on NewExpression with function callee (#282)
* Fix missing semi when default exporting CallExpression (#287)
* Workaround flow parser bug with spread in arrays (#285)
* Update flow-parser to 0.38 (#290)
* Allow customizing args sent to prettier-command (#289)
* Do not output trailing commas with rest arguments (#283)
* Use exact versions in package.json (#291)
* Use js native String.repeat() (#293)
* Handle additional export default parens cases (#298)
* Fix parens around anonymous functions (#297)
* Introduce second argument to ifBreak (#302)
* Fix bracketSpacing typo in tests (#299)
* Remove unused variable (#304)
* Fix trailing whitespace (#300)
* add version flag (#294)
* Add --run-in-band to travis (#306)
* [JSX] Split elements on newlines and preserve whitespace (w/@yamafaktory) (#234)
* Print binary and logical expressions in a nicer format (#262)

# 0.0.8

[link](https://github.com/jlongster/prettier/compare/e447971...0192d58)

* Fix await parenthesis (#185)
* Add note about Sublime Test github issue in readme
* Remove legacy Recast code and simplify API. (#191)
* Don't break to new line if logical/loop statements are without brackets. (#194)
* Fix parenthesis for UpdateExpression (#198)
* Fix directives printing for empty functions (#199)
* Fix key quotes omission for flow parser (#203)
* Fix comma when an arrow function with no arguments breaks (#210)
* Last argument expansion works for arrow functions that return JSX (#211)
* Remove faulty location check on template literals that throws in Nuclide (#218)
* Add flow parser experimental options (#221)
* Fix empty exports (#225)
* Fix cases of missing parens with NewExpression (#230)
* Fix issue with ArrowFunctionExpression parens (#236)
* Add npm version badge (#240)
* Consolidate badges in readme
* Fix parens issue with nested UrnaryExpressions (#237)
* Escape strings using jsesc (#229)
* Add newline for empty blocks {} (#205)
* Fix empty export with from clause (#248)
* Fix missing parenthesis for typeof and arrow functions (#249)
* Fix FunctionExpression parens issues (#250)
* Fix last element of an array being null (#232)
* Make sure empty for loops generate valid code (#224)
* Fix parens for functions inside TaggedTemplateExpression (#259)
* Preserve the way numbers were written (#257)

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
