# 0.11.0

[link](https://github.com/jlongster/prettier/compare/0.0.10...0.11.0)

Now using minor versions instead of patch versions for the releases.

 * Swap quotes (#355)
 * Drop jsesc (#357)
 * Use a Symbol instead of the private dep (#359)
 * Add parens for default export FunctionExpressions (#345)
 * Fix export extension output (#361)
 * Exit with an error if an unknown CLI option is passed (#365)
 * Warn if using deprecated CLI options (#364)
 * s/jscodefmt/prettier/ (#370)
 * Fix CLI options (#369)
 * Fix some parens cases for UpdateExpressions (#381)
 * Output strings with the minimum amount of escaped quotes (#390)
 * Ignore EmptyStatement inside of switch case (#391)
 * Support multiple standalones in import (#389)
 * Fix missing semi-colon in for loop and var body (#388)
 * Fix empty labels (#383)
 * Fix forced trailing comma (#382)
 * Empty switch should not have an empty line (#384)
 * add formatAST() for formatting ASTs directly (#393)
 * Fix class extends parenthesis (#396)
 * Fix class inside of binary expression missing parenthesis (#397)
 * Fix parenthesis in object as left-hand-side of template (#398)
 * Remove unneeded parens for FunctionExpression inside LogicalExpression (#399)
 * Remove trailing comma for array destructuring with rest (#400)
 * Fix +++x (#401)
 * Also do the class extend parenthesis for class expressions (#403)
 * Fix various parenthesis issues on the left side of template (#404)
 * Fix in inside of the first group of a for (#406)
 * Add parenthesis for arrow function inside of ternary (#408)
 * Add parenthesis around class expression when left side of call expression (#409)
 * Ensure computed method names don't lose quotes (#419)
 * Add parenthesis for yield inside of a conditional (#418)
 * Add parenthesis around assignment for arrow function body (#422)
 * Add parenthesis around export default assignments (#423)
 * Add parenthesis for class expression on left of member expression (#421)
 * Fix missing parens around object in MemberExpression (#424)
 * Re-run snapshot tests
 * Workaround flow bug around trailing comma (#427)
 * Add parenthesis when class expressions are left of a ternary (#428)
 * Revert "Workaround flow bug around trailing comma" (#429)
 * Update commands.md (#430)
 * Improve vim integration section (#416)
 * Add glob support to the CLI (#363)
 * Use babel-code-frame for syntax errors (#367)
 * Update yarn.lock


# 0.0.10

[link](https://github.com/jlongster/prettier/compare/0.0.9...0.0.10)

* Add description to package.json (#320)
* Fix crash for single rest on class declaration (#315)
* Add canonical link to Prettier SublimeText package. (#318)
* Properly escape JSXText (#329)
* Hug objects and arrays inside of JSXExpressionContainer (#213)
* Add quotes around unicode keys in flow parser (#328)
* Add tests for comments (#330)
* Print dangling comments in blocks (#331)
* Remove Printer module in favor of single function (#333)
* Split pp.js into doc-{printer,builders,utils}.js (#334)
* Fix node 4 (#336)
* Remove unused functions from recast (#337)
* Kill fromString (#335)
* Extract parser.js (#338)
* Normalize exports (#339)
* Refactor index.js (#340)
* Add semicolon to more default exports (#343)
* Introduce --parser/parser option and deprecate --flow-parser/useFlowParser (#342)
* Remove parens around AwaitExpression in ternary (#346)
* Indent while test the same way as if test (#352)
* Add debugging support for doc IR (#347)

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
