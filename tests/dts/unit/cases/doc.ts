import * as doc from "../../../../src/document/public.js";

doc.builders.dedent(doc.builders.hardline);
doc.printer.printDocToString(["doc"], { printWidth: 80, tabWidth: 2 });
doc.utils.mapDoc(["doc"], (doc) => doc);
