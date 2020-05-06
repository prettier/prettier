/* @flow */

export * from './typed_exports' // Ok
export type * from './typed_exports' // Ok

export * from './untyped_exports' // Error
export type * from './untyped_exports' // Error
