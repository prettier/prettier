declare module "declare_module_exports" {
  declare module.exports: number;
}

declare module "declare_m_e_with_other_value_declares" {
  declare module.exports: number;
  declare var str: string;
}

declare module "declare_m_e_with_other_type_declares" {
  declare module.exports: number;
  declare type str2 = string;
}

/**
 * `declare var exports` used to determine the type of exports of the module,
 * but now behaves just like `declare var foo`, s/foo/exports.
 */

declare module "declare_var_exports" {
  declare var exports: number;
}

/**
 * Ensure that, if both are present, `declare module.exports` wins
 */
declare module "declare_m_e_with_declare_var_e" {
  declare module.exports: number;
  declare var exports: string;
}

/**
 * Ensure that the intersection of the two declarations is exported.
 */
declare module "declare_overloaded_function" {
  declare function foo(x: string): string;
  declare function foo(x: number): number;
}
