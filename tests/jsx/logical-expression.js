<div>
  {a || "b"}
</div>;

<div>
  {a && "b"}
</div>;

<div>
  {a || <span></span>}
</div>;

<div>
  {a && <span></span>}
</div>;

<div>
  {a && <span>
    <div>
      <div></div>
    </div>
  </span>}
</div>;
