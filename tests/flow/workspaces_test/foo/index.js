// @flow
import type {RootType} from 'root_lib';
import type {WorkspaceType} from 'workspace_lib';
import type {BarType} from 'bar';
export type FooRootType = RootType;
export type FooWorkspaceType = WorkspaceType;
export type FooBarType = BarType;

export const aWorkspaceType: WorkspaceType = 123; // OK
export const bWorkspaceType: WorkspaceType = '123'; // Error: string ~> number
