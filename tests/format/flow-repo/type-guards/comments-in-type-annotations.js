type F = (x: mixed) /* C1 */ => /* C2 */ x /* C3 */ is /* C4 */ number;

function f(x: any) /* C1 */ : /* C2 */ x /* C3 */ is /* C4 */ number /* C5 */ { return true; }

const arrow = (x: any): /* C1 */ x is (number /* C2 */ => /* C3 */ x /* C4 */ is /* C5 */ string /* C6 */ => /* C7 */ x /* C8 */ is /* C9 */ boolean) => true;
