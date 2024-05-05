import { Component as Page } from '@angular/core';

const template = "foobar";

@Page({
  [template]: `<h1>{{       hello }}</h1>`,
})
export class PostsPage {}
