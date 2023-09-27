!foo in bar;
(!foo in bar); 
!(foo in bar);
(!foo) in bar;

!foo instanceof Bar;
(!foo instanceof Bar);
!(foo instanceof Bar);
(!foo) instanceof Bar;

void 0 in bar;
(void 0 in bar);
void (0 in bar);
(void 0) in bar;

+x in bar;
(+x in bar);
+(x in bar);
(+x) in bar;

++x instanceof bar; // not ambiguous, because ++(x instanceof bar) is obviously invalid