// this should remain as-is
<div>
 {/* prettier-ignore */}
 <style jsx global>{ComponentStyles}</style>
</div>;

// this should remain as-is
<div>
 {/* prettier-ignore */}
 <span     ugly  format=''   />
</div>;

// this should remain as-is
f(
  <Component>
    {/*prettier-ignore*/}
    <span     ugly  format=''   />
  </Component>
);

// this be formatted
<div>
  {/* prettier-ignore */} foo
  <Bar   excessive    spaces    />
</div>;

// this should remain as-is
<div>
{
  /* prettier-ignore */
  foo ( )
}
</div>;

// this should remain as-is
<div>
{
  /* prettier-ignore */
  x     ?   <Y/> : <Z/>
}
</div>;

