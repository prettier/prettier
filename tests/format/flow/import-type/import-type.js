// @flow

type Bare = import("package-name");
type Qualified = import("package-name").Exported;
type Nested = import("package-name").Namespace.DeeplyNestedExport<string, number>;
type TypeofImport = typeof import("package-name").value;
type Long = import("a/very/long/module/path/that/does/not/need/to/break").AReallyLongExportName;
type Commented = import(/* before */ 'package-name' /* after */).Exported;
type Parenthesized = Array<import("package-name").First | import("package-name").Second>;
