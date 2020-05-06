//@flow

import type { T } from "./my_declarations/outer_decls";
import { t } from "./subdirectory/my_declarations/inner_decls";

import type { K } from "./my_ignores/outer_bogus" //should error
import { y } from "./my_untyped/outer_untyped"
