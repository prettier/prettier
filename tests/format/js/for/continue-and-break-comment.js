for(;;) continue // comment1
;

for (;;) break // comment2
;

label1: for (;;) continue label1 // comment3
;

label2: {
    break label2 // comment4
    ;
};
