<script>{`
const bar = 'bar';
console.log(   bar    );
`}</script>;

<script>{`
const bar = 'bar';
${"not formatted"}
console.log(   bar    );
`}</script>;

<script>{`
const bar = 'bar';
console.log(   bar    );
`}{`not.formatted();`}</script>;

<script>{`
  const bar = 'bar';
console.log(   bar    );
`}</script>;

<script type="module">{`
  const bar = 'bar';
console.log(   bar    );
`}</script>;

<script type="text/javascript">{`
  const bar = 'bar';
console.log(   bar    );
`}</script>;
