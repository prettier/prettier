// @flow

import declare_module_exports from "declare_module_exports";
(declare_module_exports: number);
(declare_module_exports: string); // Error: number ~> string

// Error: Has no named export "str"!
import {str} from "declare_m_e_with_other_value_declares";

import type {str2} from "declare_m_e_with_other_type_declares";
("asdf": str2);
(42: str2); // Error: number ~> string

/**
 * `declare var exports` is deprecated, so we have a grace period where both
 * syntaxes will work.
 */

import declare_var_exports from "declare_var_exports";
(declare_var_exports.exports: number); // ok
(declare_var_exports.exports: string); // Error: number ~> string

import declare_m_e_with_declare_var_e from "declare_m_e_with_declare_var_e";
(declare_m_e_with_declare_var_e: number);
(declare_m_e_with_declare_var_e: string); // Error: number ~> string

import { foo } from "declare_overloaded_function";
(foo(0): number);
(foo(0): string); // Error: number ~> string
(foo(""): string);
(foo(""): number); // Error: string ~> number
