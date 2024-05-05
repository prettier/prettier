import { Component as Page } from '@angular/core';

const styles = "foobar";

@Page({
    selector: 'posts-page',
    template: `
        <h1>My App</h1>
        <app-todo-list></app-todo-list>
    `,
    [styles]: `h1 { color: blue }`
})
export class PostsPage {}
