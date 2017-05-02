# 1.3.0

[link](https://github.com/jlongster/prettier/compare/1.2.2...1.3.0)

* add printer branches for some TypeScript nodes (#1331) 	
* Skip trailing commas with FlowShorthandWithOneArg (#1364)
* add TSLastTypeNode and TSIndexedAccessType (#1370)
* add TSConstructorType (#1367) 	
* fix do-while break (#1373) 	
* Fix missing trailing commas on flow generics (#1381)
* Add example of using yarn test with arguments (#1383) 	
* Have --debug-check also run ast verification (#1337)
* Fix empty line in block with EmptyStatement (#1375) 	
* parent decides how to print type annotations (#1391)
* add TSTypeOperator (#1396)
* fix TSTypeReference not printing typeArguments (#1392)
* add TSMappedType and TSTypeParameter (#1393) 	
* fix TSFunctionType failing on TypeParameters (#1394)
* add TSIntersectionType (#1395) 	
* fix typeParameters printing TSFunctionType w/o breaking flow (#1397)
* Fix optional flow parenthesis (#1357) 	
* [experimental] Add linting step in test pipeline (#1172) 	
* fix VariableDeclarator not printing type parameters (#1415)
* add TSMethodSignature (#1416)
* Add TSParameterProperty, TSAbstractClassDeclaration and TSAbstractMethodDefinition (#1410)
* Inline nullable in flow generics (#1426)
* fixed method 'check' error 'format' of undefined (#1424) 	
* feat(typescript): add delcare modifier support for vars, classes and functions (#1436)
* Allow flow declarations to break on StringLiteralTypeAnnotations (#1437) 	
* Require '::a.b' to have a preceding ; in no-semi style (#1442)
* Require '(a || b).c++' to have a preceding ; in no-semi style (#1443)
* Upgrade flow parser to 0.45 (#1447) 	
* Add supertype tests and add TSAbstractClassProperty (#1467) 	
* Break class expression returned by arrow call (#1464)
* update typescript snapshots to account for #1464 (#1470)
* [WIP] add TSNamespaceExportDeclaration (#1459) 	
* update yarn.lock (#1471) 	
* [RFC] Do not indent calls with a single template literal argument (#873) 	
* Proper indentation for template literals (#1385) 	
* Add parenthesis for unusual nested ternaries (#1386) 	
* Preserve inline comment as last argument (#1390) 	
* Only add parenthesis on ternaries inside of arrow functions if doesn't break (#1450)
* Fix windows line ending on template literals (#1439) 	
* Add space around `=` for flow generics default arguments (#1476) 	
* Don't break for unparenthesised single argument flow function (#1452) 	
* Don't break on empty arrays and objects (#1440) 	
* Do not break on [0] (#1441) 	
* Reorder flow object props (#1451) 	
* Break inline object first in function arguments (#1453) 	
* Break inline object first in function arguments (#1453) (#1173) 	
* Inline template literals as arrow body (#1485)

# 1.2.2

[link](https://github.com/jlongster/prettier/compare/1.2.1...1.2.2)

* Only break for conditionals (#1350)

# 1.2.1

[link](https://github.com/jlongster/prettier/compare/1.2.0...1.2.1)

* Fix duplicate comments in classes (#1349)

# 1.2.0

[link](https://github.com/jlongster/prettier/compare/1.1.0...1.2.0)

* match jsx files in pre-commit hook (#1276)
* Fix isPreviousLineEmpty on Windows (#1263)
* Add --dev option to suggested install cmd (#1289)
* Write out change CLI changes synchronously. Fixes #1287. (#1292)
* Remove emoji part from lint-staged's name (#1302)
* omit 'doc' key from options object before passing it to format() (#1299)
* Skip globbing filenames with node-glob when the filename is not a glob (#1307)
* FIX: more documentation for jetbrains (#1265)
* Fix template literal comments (#1296)
* Double quotes for option values in Readme file (#1314)
* Do not print the sub-tree when using prettier-ignore (#1286)
* Bail when traversing === groups (#1294)
* Avoid breaking arguments for last arg expansion (#1305)
* Add typescript as a valid parser value (#1318)
* Add jestbrains filewatcher docs (#1310)
* Add prettier_d to Related Projects (#1328)
* Add parentheses for assignment as body of arrow (#1326)
* Add information about Vim's other autocmd events (#1333)
* add printer branch for TSFirstTypeNode (#1332)
* Optimize `prettier --help` for humans (#1340)
* Update link to @vjeux's React London presentation (#1330)
* Improve regex printing (#1341)
* Fix arrow function parenthesis with comments in flow (#1339)
* Break if () if conditional inside breaks (#1344)
* Don't inline paren at right of arguments (#1345)

# 1.1.0

[link](https://github.com/jlongster/prettier/compare/1.0.0...1.1.0)

* Prettier 1.0 is the stabler release we've been waiting for (#1242)
* fix small typo (#1255)
* Fix : ReferenceError: err is not defined (#1254)
* Document debugging strategies (#1253)
* Do not inline member expressions as part of assignments (#1256)
* Fix flow union params (#1251)
* Use a whitelist instead of blacklist for member breaking (#1261)
* Remove trailing whitespace (#1259)
* Get rid of fixFaultyLocations code (#1252)
* Fixing n.comments check in printer (#1239)
* [WIP] no-semi comments (#1257)

# 1.0.1

* change semi default

# 1.0.0

[link](https://github.com/jlongster/prettier/compare/0.22.0...1.0.0)

* See announcement blog post: [http://jlongster.com/prettier-1.0](http://jlongster.com/prettier-1.0)

# 0.22.0

[link](https://github.com/jlongster/prettier/compare/0.21.0...0.22.0)

* Run 0.21.0 (#876)
* Fix paren removal on UnionTypeAnnotation (#878)
* Fix typo (#891)
* Ensure no parens for JSX inside of an ArrayExpression (#895)
* Fix object expression in arrow function expression (#897)
* Fix unprinted comments in destructuring (#898)
* Fix bug with importing empty type (#904)
* Fix broken export comment (#899)
* Add CLI Example to Readme (#909)
* Fix 0.5e0 (#911)
* Fix binary expression instanceof in arrow function expression (#913)
* Improve readme CLI usage example (#910)
* Do not break long it/test calls when template literal (#893)
* Update lint-staged docs to use husky for less config. (#923)
* Fix files with comments only (#813)
* Update README.md (#928)
* Fix binary op as body in arrow expression (#921)
* cleanup needsParens (#935)
* [JSX] Break if opening element breaks (#942)
* Parenthesize function expressions in expression position (#941)
* update the README to add a pre-commit hook (#944)
* Fix #951: properly parenthesize ** expressions (#952)
* [WIP] TypeScript Parser (#915)
* Do not break long `describe` calls (#953)
* Recursively find leading comments inside ReturnStatements (#955)
* Fix `in` inside of a for in a nested way (#954)
* Make comments around empty parenthesis be inside (#957)
* Stabilize comment after object label (#958)
* Inline BinaryExpressions inside JSXExpression (#965)
* Only allow same-line arrow-less body for explicit nodes (#966)

# 0.21.0

[link](https://github.com/jlongster/prettier/compare/0.20.0...0.21.0)

* [JSX] Break before and after jsx whitespace (#836)
* re-run snapshot tests
* Run prettier 0.20.0 (#835)
* [JSX] Don't wrap JSX Elements in parentheses in {} (#845)
* Fix comment after the last argument of a function (#856)
* Fix travis build imag
* Do not break require calls (#841)
* Stabilize import as comments (#855)
* Fix jsx expression comment that break (#852)
* Inline last arg function arguments (#847)
* Keep parenthesis on export default function (#844)
* Inline short expressions for boolean operators too (#826)
* Introduce -l option (#854)
* Add parenthesis around assignments (#862)
* Do not put \n after label (#860)
* Fix comment for `call( // comment` (#858)
* Do not break long it calls (#842)
* Fix flow union comments (#853)

# 0.20.0

[link](https://github.com/jlongster/prettier/compare/0.19.0...0.20.0)

* Fix extra parens for update expressions (#796)    
* Fix empty options (#803)    
* Eagerly evaluate `ifBreak` when processing template literals (fixes #795    
* Fix function declaration params comments (#802)   
* Update flow to 0.40 (#808)    
* Correct link for travis   
* Fix function call args (#809)   
* Properly support `do` (#811)    
* Do not put parenthesis around not named default export (#819)   
* Adds another preset to related projects (#820)    
* Fix trailing commas in docs (#825)    
* Put short body of arrow functions on the same line (#829)   
* Preserve new lines for comments after `=` (#830)    
* Fix indentation of a merged group (#828)    
* Migrate class comments to the beginning (#831)    
* Update list of related projects (#833)    
* Allow breaking for logical expressions in member chains (#827)

# 0.19.0

[link](https://github.com/jlongster/prettier/compare/0.18.0...0.19.0)

* docs(README): use yarn add for consistency (#734)
* Make trailing-comma option support 2 different modes (#641)
* Update README with valid trailingComma options
* Fix await ternary parenthesis (#740)
* Fix missing dangling comment in exports (#741)
* Fix missing dangling comments in arrays (#744)
* Remove extra parenthesis around await inside of unary expression (#745)
* Fix missing dangling comments in for loop (#742)
* Add note about trailingComma option in versions 0.18.0 and below
* Add missing explanatory comment in ForStatement case (#748)
* Fix leading & operators in flow types (#738)
* Fix missing comments in assignment pattern (#704)
* Correctly place trailing comments in conditionals (#754)
* Use double quotes in script wildcards to support windows `cmd.exe`. (#761)
* Upgrade to Jest 19 (#762)
* Upgrade to Jest 19.0.1 (#779)
* Remove extra parens around ternary arguments of a new call (#776)
* Do not attach comments to EmptyStatements in try/catch (#763)
* Bump babylon & add test for async func decl (#790)
* Add `this` for Member factory whitelist and remove softline (#782)
* Do not expand empty catch (#783)
* Group [0] at the end of the previous chain instead of beginning of next one (#784)
* Do not format template literals (#749)
* Revert babylon bump (#792)
* Do not put trailing commas for function declaration in es5 mode (#791)
* [WIP] Fix comments in template literals (#643)
* Introduce line-suffix-boundary (#750)
* [RFC] Add parenthesis around && inside of || (#780)
* Fix tests on node 4

# 0.18.0

[link](https://github.com/jlongster/prettier/compare/0.17.0...0.18.0)

* fix --debug-check
* [JSX] Don't add newline following newline (#690)
* [Docs] Use replaceState API when demo code changes (#710)
* Do not inline new as last argument (#705)
* Inline objects & arrays as right part of a boolean expression (#692)
* [RFC] Remove parenthesis object special case (#689)
* Ensure importKind is printed (#718)
* [Docs]: update Readme to reference VS extension (#720)
* docs: Add pre-commit hook with 🚫💩 lint-staged section to the README (#714)
* [RFC] Preserve new lines between array elements (#707)
* Do not put \n inside of empty object method bodies (#706)
* Align boolean inside of arrow functions (#691)
* Fix trailing new lines preservation (#724)
* Unified Split

# 0.17.1

* Use `readline` api to manipulate `process.stdout` output. (#687)

# 0.17.0

[link](https://github.com/jlongster/prettier/compare/0.16.0...0.17.0)

* [JSX] Fix spurious newline (fixes #614) (#628)
* Add --debug-check cli option (#627)
* Remove last trailing line for directives-only files (#609)
* Expand vim instructions
* Fix formatting in readme
* Update snapshots
* Preserve empty line before last comment (#594)
* test on current release of node.js (#595)
* [JSX] jsx-whitespace breaks with parent (fixes #622) (#626)
* Log filename with [update] or [ignore] flags during `--write` process. (#584)
* Do not indent binary expressions inside of if (#604)
* Put short elements at right of single binary expression on same line (#605)
* Run prettier 0.16.0 on the codebase (#631)
* Preserve blank lines inside of objects (#606)
* fix typo in JetBrains External Tool config readme (#679)
* Fix dangling comments for arrays (#665)
* Print line-suffix in --debug-print-doc (#676)
* Avoid unneeded parenthesis for colon with comments (#673)
* Stabilize comments inside of if/then/else before { (#672)
* Soft break the first member of a chain (#667)
* Stabilize comments inside of ternaries (#666)
* Fix trailing commas with a trailing comment (#664)
* Fix Flow union type annotations indentation (#650)
* Ensure that all comments are printed (#571)
* Properly support member chains comments (#668)
* [WIP] Fix Flow DeclareTypeAlias (#669)
* Add option for putting > on the last line in jsx (#661)
* Always put a hardline before dangling comment (#675)
* Fix comments in return statement argument (#657)
* [RFC] Introduce prettier-ignore-next (#671)

# 0.16.0

[link](https://github.com/jlongster/prettier/compare/0.15.0...0.16.0)

* Revert "Print \x and \u escapes in strings and regexes lowercase (#522)
* Fix ternary indent bug (#577)
* jsx parentheses fix (#580)
* Run prettier on 0.15.0 (#558)
* Add parenthesis around single argument arrow if comments (#573)
* Use breakParent inside of last arrow expansion (#559)
* Support dangling comments in ClassBody (#570)
* Make all the member expressions but the last one part of the first group (#589)
* Break long imports (#590)
* Remove the concept of globalPrecedingNode (#561)
* Remove test.js and put it back in the gitignore
* Fix use strict as expression statement (#602)
* Use arrow function when inputted that way for flow objects (#608)
* Better support try/catch comments (#607)
* Print CallExpression comments inside of memberChain (#600)
* Do not attach comments to EmptyStatement (#599)
* Fix files with only comments on the flow parser (#598)
* Remove first line special case (#597)
* Fix single indented JSX comment (#596)
* Print dangling on ast on all the paths

# 0.15.0

[link](https://github.com/jlongster/prettier/compare/0.14.1...0.15.0)

* Fix syntax error in empty object with dangling comment (#533)
* Fix closing call expression commented out (#530)
* Update `bracketSpacing` comment to say it's about {} (#529)
* Add 0.14.1 to CHANGELOG (#525)
* Print \x and \u escapes in strings and regexes lowercase (#522)
* Fix Jetbrains example screenshot url. (#534)
* Preserve next line with trailing comment (#535)
* Break nested calls (#517)
* Update snapshot tests from conflicting PRs
* Reimplement MemberExpression printing (#469)
* Remove spurious test.js
* Fix small typo on Jetbrains section (#552)
* [JSX] Handle non-breaking space (#557)
* Make comments between if & else to look good (#544)
* Whitelist UnaryExpression for parentless objects (#545)
* Make comments inside of MemberExpression look good (#556)

# 0.14.1

[link](https://github.com/jlongster/prettier/compare/0.14.0...0.14.1)

* Fix range for object newline detection (#520)
  * a bugfix for "Keep expanded objects expanded" (#495)

# 0.14.0

[link](https://github.com/jlongster/prettier/compare/0.13.0...0.14.0)

* Only write to files if the change (#511)
* Remove extra group when printing object values (#502)
* Add documentation for JetBrains products. (#509)
* Don't print trailing commas for object destructuring and rest (#512)
* Mention eslint-config-prettier (#516)
* [RFC] Keep expanded objects expanded (#495)
* Do not always put an empty lines after directives (#505)
* Print numbers in a uniform way (#498)

# 0.13.0

[link](https://github.com/jlongster/prettier/compare/0.12.0...0.13.0)

* Simplify arrow functions that use blocks (#496)
* Properly print comments for BinaryExpression (#494)
* Preserve empty line after comment (#493)
* [JSX] Handle each line of text separately (#455)
* Proper support for dangling comments (#492)

# 0.12.0

[link](https://github.com/jlongster/prettier/compare/0.11.0...0.12.0)

* [WIP] Add rationale document (#372)
* Proper parenthesis for yield and await in conditional (#436)
* Don't print double newlines at EOF to stdout (#437)
* Explain the `--color` option in a comment (#434)
* Validate user-provided config with jest-validate (#301)
* Propagate breaks upwards automatically, introduce `breakParent` (#440)
* Fix typo in variable name (#441)
* Refactor traversal (#442)
* Do not put a newline on empty `{}` for functions (#447)
* Better error message for assertDoc (#449)
* Remove `multilineGroup` (#450)
* Ability to break on `:` for objects (#314)
* Update snapshots
* [RFC] Do not put spacing inside of arrays with bracketSpacing (#446)
* Fix integer CLI arguments (#452)
* Move tests around (#454)
* Update package.json, use ast-types 0.9.4 (#453)
* Update lockfile
* Support printing import("a") (#458)
* Explain that you can pass options to the spec runner (#460)
* Fix spurious whitespace (#463)
* Preserve new lines after directives (#464)
* Put decorators on the same line (#459)
* docs: add related projects (#456)
* Add break points for class declaration (#466)
* Added parens around in operator in for loops 🚀. (#468)
* CLI improvements (#478)
* [RFC] Hug Conditionals in JSX (#473)
* Refactor comment algorithm and improve newline/spaces detection (#482)
* Indent ternaries (#484)
* Indent computed member (#471)
* Maintain windows line ending (#472)
* Don't break up JSXOpeningElement if it only has a single text (#488)
* Add CallExpression to the last argument expansion whitelist (#470)
* Mention eslint-plugin-prettier in Related Projects (#490)
* Stop using conditionalGroup inside of UnionTypeAnnotation (#491)

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
