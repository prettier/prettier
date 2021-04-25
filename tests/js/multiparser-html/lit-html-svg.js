import { LitElement, html, svg } from '@polymer/lit-element';

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
<header>
                    <p>This is HTML</p>
              </header>
        ${svg`
          <?xml version="1.0" encoding="UTF-8" standalone="no"?>
          <svg
    id="some-svg"
                  xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 125 70"
            version="1.1"
          ><defs>
              <path
                id="poly"
                d="m 0,10 20,10 20,-10 -20,-10 z"
                style="stroke:#000000;stroke-width:0.2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
              ></path>
              </defs>
              </svg>`}
              <footer>
              
              Good  bye</footer>
              `;
      }
}

customElements.define('my-element', MyElement);

