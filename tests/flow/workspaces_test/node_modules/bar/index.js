// @flow
import type {RootType} from 'root_lib';
import type {WorkspaceType} from 'workspace_lib';
export type BarRootType = RootType;
export type BarWorkspaceType = WorkspaceType;

export const aWorkspaceType: WorkspaceType = '123'; // OK
export const bWorkspaceType: WorkspaceType = 123; // Error: number ~> string
export type BarType = 'bar';
