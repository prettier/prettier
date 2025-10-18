for (const p of ['fullName', 'organ', 'position', 'rank'])
  // 1
  form.setValue(`${prefix}.data.${p}`, response[p])

for (const p of ['fullName', 'organ', 'position', 'rank'])
// 2
{form.setValue(`${prefix}.data.${p}`, response[p])}

for (const p of ['fullName', 'organ', 'position', 'rank'])
// 3
{}

for (const p of ['fullName', 'organ', 'position', 'rank'])
// 4
;

for(x of y)
  // comment
  bar();

for(x in y)
  // comment
  bar();

for(;;)
  // comment
  bar();

for(x of y)
  // comment1
  // comment2
  bar();

for(x in y)
  // comment1
  // comment2
  bar();

for(;;)
  // comment1
  // comment2
  bar();

for(x of y)
  /* comment */
  bar();

for(x in y)
  /* comment */
  bar();

for(;;)
  /* comment */
  bar();
