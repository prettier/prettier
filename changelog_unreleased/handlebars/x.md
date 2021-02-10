#### Move Handlebars support out of alpha to release (#x by @dcyriller)

<!-- prettier-ignore -->
```hbs
{{!-- Input --}}
{{mustache   "with"
this.propA}}

{{!-- Prettier stable --}}
{{mustache   "with"
this.propA}}

{{!-- Prettier main --}}
{{mustache "with" this.propA}}
```
