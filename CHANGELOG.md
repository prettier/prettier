
# 0.0.6

[link](https://github.com/jlongster/prettier/compare/faed09ceea32fcdd58b525aa09b880afb9fa55b7...3af7da5748d64efaed781104ec198924c8c369f9)

3af7da5 Reprint all the files!
6be8928 Wrap ForStatement in a block for const decls (#172)
b429b24 include index.js in format:all script (#132)
47102bc Add regression tests for long JSX Expression contents
4fe16bd Multiline JSX opening tag breaks children out too (for #73)
2e1e6ee JSX maintains spaces that matter (fixes #30 and thus part of #73)
b09a020 Break JSXOpeningElement between attributes (fixes #15)
d91a28e Wrap Stateless JSX Arrow Functions and Assignment in Parens (fixes part of #73)
31a07fe Remove leftover `arrowParensAlways` option (#171)
0b70a0f Numeric literal callees should keep parens (#141)
df99ae5 Add test for shebang and move to index.js (#170)
ec5b0f7 Fix for Node 4
4ebccef Add tests for trailingComma option
63c87b6 Add tests for tabWiths option
7f9655e Add tests for quotes option
e54b980 Add tests for bracketSpacing option
3e0ac6c Update run_spec to support options
958ea21 Add trailing comma support for multiline exports (#168)
3dcf46c Do not put spaces on empty for loop (#169)
8e0f97e Break multiline imports (#167)
ecb26b3 treat shebang outside of parsing (#137)
fb9c1e8 Fix misprinting of computed properties in method chains. (#157)
aab3008 Use group instead of conditionalGroup
1549936 Break long `exports` into multiple lines.
291440b Support method generics on babylon parser
afca3d7 Minimize string escapes
62bfdcd Fix old name reference in tests_config
7fee158 Add title and encoding to the REPL
0af65c6 Use `setq' instead of `infc' and `decf'
35fb28b Support type annotation for rest argument on babylon parser
c9c560b Fix typo in README.
80f280d remove unused recast ref
a6cdede Always use double quotes for JSX and properly escape
1b5c7b3 remove recast (not used)
eabc400 update yarn.lock
b9cf404 v0.0.5 -- Accidentally didn't push this commit out before others landed; 0.0.5 is actually based on commit faed09ceea32fcdd58b525aa09b880afb9fa55b7
4685164 Add prettier-browser
18f5400 Do not unquote string properties
a673fc4 add instructions for Visual Studio plugin
57a73b8 add gitter badge to readme
477e745 chore: link prettier package to its github project
466d850 Update snapshots
884bae1 remove node 0.10 from travis config, add travis badge to readme
be8f65d Format property names consistently
