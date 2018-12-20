@Component({
       selector: 'app-test',
  template: `<ul>   <li>test</li>
  </ul>

  <div>
    <pre>
        test
      </pre>
    ~
</div>
  `,
  styles: [   `
  
 :host {
   color: red;
 } 
 div { background: blue
 }
`

]
})
class     TestComponent {}
