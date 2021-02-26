import { "foo" as bar, "default" as qux } from "module-a";
export * as "foo", { default as "quux" } from "module-b";
