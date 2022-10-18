for (;;) {
  if (a) break; // comment
  else foo();

  if(a) continue; // comment
  else foo();

  if(a) debugger; // comment
  else foo();
}

for (;;) {

  if (true) break // comment
;
  else foo();

}

for (;;) {
  if (true)
    break; // comment
  else foo();
}
