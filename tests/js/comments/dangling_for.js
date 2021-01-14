for // comment
(;;);

for /* comment */(;;);

for(/*a*/;/*b*/;/*c*/);
for(/*a*/a;/*b*/;/*c*/);
for(/*a*/;a/*b*/;/*c*/);
for(/*a*/;/*b*/;a/*c*/);

for(
  ; // no init!
  i > 0;
  i++
) {}

for(
  ; // no init!
  i > 0;
  // no update
) {}
