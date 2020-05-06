// @flow

/* The code in this test has a confusing error and should be improved.
 * Bindings that result from destructuring an annotation should themselves
 * behave like annotations. In some cases, annotations are not recursively
 * annotations, like the class example below.
 *
 * For now, we use some sketchy unification logic to pin things down, but it
 * does not behave sensibly for tvars with incompatible lower bounds.
 *
 * Ideally annotations would be recursively annotations, instead of shallowly.
 * Another possibility would be to forego the annotation behavior for these
 * kinds of destructurings.
 */

class C {
  p;
  m(cond: boolean) {
    if (cond) {
      this.p = 0;
    } else {
      this.p = "";
    }
  }
}

function f({
  p // weird: string ~/~> number. C#p is inferred, with both number and string inflows
}: C) {
  p = null; // weird: null ~/~> number. we pinned `p` to `number`
}
