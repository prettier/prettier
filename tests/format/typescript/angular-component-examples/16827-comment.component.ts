@Component({
  template: `<div>{{title() // i18n(ph="title")}}</div>`
})
export class TestComponent {
  public title = signal('');
}
