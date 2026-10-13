function *adder(total=0) {
   let increment=1;
   do {
       switch (request = function.sent){
          case undefined: break;
          case "done": return total;
          default: increment = Number(request);
       }
       yield total += increment;
   } while (true)
}
