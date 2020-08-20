// From: https://dev.to/gcanti/getting-started-with-fp-ts-monoid-ja0
import { Semigroup } from "fp-ts/lib/Semigroup";
import { getStructMonoid, fold } from "fp-ts/lib/Monoid";
import {
  getApplyMonoid,
  some,
  none,
  getFirstMonoid,
  getLastMonoid,
} from "fp-ts/lib/Option";

// Today we're expanding our knowledge about Semi-groups by learning
// about Monoids.

// Monoids are any Semi-group which also have an _identity_ value. In
// fp-ts this is called `empty`.

// The following laws must hold:
// Right identity: concat(x, empty) = x, for all x in A
// Left identity: concat(empty, x) = x, for all x in A

interface Monoid<A> extends Semigroup<A> {
  readonly empty: A;
}

/** number `Monoid` under addition */
const monoidSum: Monoid<number> = {
  concat: (x, y) => x + y,
  empty: 0, // this is the identity
};

console.log("\n----- Test of summing Monoid -----");
console.log(monoidSum.concat(monoidSum.empty, 1)); // 1

// Not all semi-groups are Monoids. In this example there
// is no value for `empty` where concat(x, empty) === x
const semigroupSpace: Semigroup<string> = {
  concat: (x, y) => x + " " + y,
};

// Lets look at some more complex examples

type Point = {
  x: number;
  y: number;
};

const monoidPoint: Monoid<Point> = getStructMonoid({
  x: monoidSum,
  y: monoidSum,
});

console.log("\n----- Test of Point Monoid -----");
console.log(monoidPoint.concat(monoidPoint.empty, { x: 1, y: 1 })); // { x: 1, y: 1 }

// Folding with a Monoid is super easy as it can use the `empty` property
// as the starting value.

console.log(fold(monoidSum)([1, 2, 3, 4])); // 10

// We can also derive an Monoid instance for Option
const monoidForOption = getApplyMonoid(monoidSum);

console.log("\n----- Test of Monoid folding -----");
console.log(monoidForOption.concat(some(1), none)); // none
console.log(monoidForOption.concat(some(1), some(2))); // 3

// There is also getFirstMonoid and getLastMonoid which
// return the first left non-none value and
// first right non-none values from the Option respectively.

console.log("\n----- Test of Monoid first -----");
const M = getFirstMonoid<number>();
console.log(M.concat(some(1), none)); // some(1);

console.log("\n----- Test of Monoid last -----");
const M2 = getLastMonoid<number>();
console.log(M2.concat(some(1), none)); // none;
