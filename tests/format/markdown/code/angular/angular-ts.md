```angular-ts
type A ={
        Ugly:string
}

@Component({template: `
@if (orderForm.couponCode().disabled()) {
      <div class="info">
        @for (reason of orderForm.couponCode().disabledReasons(); track reason) {
<p>{{ reason.message }}</p>
        }</div>
    }
  `
})
export class Order {
}
```
