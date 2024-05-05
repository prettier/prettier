import { Component as Layout } from '@angular/core';

const styles = "foobar";

@Layout({
    selector: 'admin-layout',
    template: `
        <h1>My App</h1>
        <app-todo-list></app-todo-list>
    `,
    [styles]: `h1 { color: blue }`
})
export class AdminLayout {}
