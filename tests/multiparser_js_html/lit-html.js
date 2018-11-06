import { LitElement, html } from '@polymer/lit-element';

class MyElement extends LitElement {
  static get properties() {
    return {
      mood: { type: String }
    };
  }

  constructor() {
    super();
    this.mood = 'happy';
  }

  render() {
    return html`
      <style
      
      
      >
                  .mood { color: green; }
      </style
      
      
      
      >

         Web            Components         are     <span 
      
      
      class="mood"      >${
        this.mood
      
      }</span
      
           >!
    `;
  }
}

customElements.define('my-element', MyElement);

const someHtml1 = html`<div       > hello ${world} </div     >`;
const someHtml2 = /* HTML */ `<div      > hello ${world} </div     >`;

html``
