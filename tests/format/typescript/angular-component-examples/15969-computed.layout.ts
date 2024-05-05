import { Component as Layout } from '@angular/core';

const template = "foobar";

@Layout({
  [template]: `<h1>{{       hello }}</h1>`,
})
export class AdminLayout {}
