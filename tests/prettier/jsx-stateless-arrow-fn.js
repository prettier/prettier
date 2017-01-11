const render1 = ({ styles }) => (
  <div style={styles} key="something">
    Keep the wrapping parens. Put each key on its own line.
  </div>
);

const render2 = ({ styles }) => <div style={styles} key="something">
  Create wrapping parens.
</div>;

const render3 = ({ styles }) => <div style={styles} key="something">Bump to next line without parens</div>;

const render4 = ({ styles }) => <div style={styles} key="something">Create wrapping parens and indent <strong>all the things</strong>.</div>;

const render5 = ({ styles }) => <div>Keep it on one line.</div>;

const notJSX = (aaaaaaaaaaaaaaaaa, bbbbbbbbbbb) => this.someLongCallWithParams(aaaaaa, bbbbbbb).anotherLongCallWithParams(cccccccccccc, dddddddddddddddddddddd)
