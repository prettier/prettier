// @flow

import typeof ImportedDefaultFunction from './exports-default-function';

import typeof ImportedDefaultInstance from "./exports-default-instance";
import typeof ImportedDefaultPolyInstance from "./exports-default-poly-instance";
import type ImportedTypeDefaultClass from "./exports-default-class";
import type ImportedTypeDefaultClassTwice from "./exports-default-class";
import type ImportedTypeDefaultPolyClass from "./exports-default-poly-class";
import typeof ImportedTypeofDefaultClass from "./exports-default-class";
import typeof ImportedTypeofDefaultClassTwice from "./exports-default-class";
import typeof ImportedTypeofDefaultPolyClass from "./exports-default-poly-class";
import typeof ImportedTypeofDefaultClassFuncall from "./exports-default-class-funcall-a";
import ImportedValueDefaultClassFuncall from "./exports-default-class-funcall-b";

declare var f1: ImportedDefaultInstance; // (Remote) A
declare var f2: ImportedDefaultPolyInstance; // (Remote) P<number>
declare var f3: ImportedTypeDefaultClass; // ImportedTypeDefaultClass
declare var f4: ImportedTypeDefaultPolyClass<number>; // ImportedTypeDefaultPolyClass<number>
declare var f5: ImportedTypeofDefaultClass; // ImportedTypeofDefaultClass
declare var f6: ImportedTypeofDefaultPolyClass; // ImportedTypeofDefaultPolyClass<number>
declare var f7: ImportedTypeofDefaultClassFuncall; // ImportedTypeofDefaultClassFuncall
declare var f8: ImportedValueDefaultClassFuncall; // ImportedValueDefaultClassFuncall
