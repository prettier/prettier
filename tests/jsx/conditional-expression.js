<div>
  {isCool ? "cool" : "very nice"}
</div>;

// should get formatted JSX style
const a = something ? "string" : <div />;

// should not get formatted JSX style
const a = something ? "string" : "other string";

<div>
  {reallyLongChainOfConditionalExpressions ? (
    "why"
  ) : yes ? (
    "it"
  ) : is ? (
    "!"
  ) : (
    ":)"
  )}
</div>;

<div>
  {reallyLongChainOfConditionalExpressions ? (
    <span>why</span>
  ) : yes ? (
    <span>it</span>
  ) : is ? (
    <span>!</span>
  ) : (
    <span>:)</span>
  )}
</div>;
