switch (a) { case 1: // c
{ b; } }

switch (a) { case (a + b) // c
: { b; } }

switch (a) { case (a + b // c
): { b; } }

switch (a) { case 1: // c
{} }

switch (a) { case 1: // c
{ b; } c; }
