import "angular-html-parser/lib/compiler/src/ml_parser/ast";
import { HtmlTagDefinition } from "angular-html-parser/lib/compiler/src/ml_parser/html_tags";

declare module "angular-html-parser/lib/compiler/src/ml_parser/ast" {
  interface Attribute {
    startSourceSpan: never;
    endSourceSpan: never;
    // see restoreName in parser-html.js
    namespace?: string | null;
    hasExplicitNamespace?: boolean;
  }

  interface CDATA {
    startSourceSpan: never;
    endSourceSpan: never;
  }

  interface Comment {
    startSourceSpan: never;
    endSourceSpan: never;
  }

  interface DocType {
    startSourceSpan: never;
    endSourceSpan: never;
  }

  interface Element {
    tagDefinition: HtmlTagDefinition;
    // see restoreName in parser-html.js
    namespace?: string | null;
    hasExplicitNamespace?: boolean;
  }

  interface Text {
    startSourceSpan: never;
    endSourceSpan: never;
  }
}
