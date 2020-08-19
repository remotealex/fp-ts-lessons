// From: https://dev.to/gcanti/getting-started-with-fp-ts-semigroup-2mf7
import {
  Semigroup,
  getMeetSemigroup,
  getJoinSemigroup,
  semigroupSum,
  getStructSemigroup,
  getFunctionSemigroup,
  semigroupAll,
  fold,
} from "fp-ts/lib/Semigroup";
import { ordNumber } from "fp-ts/lib/Ord";
import { getApplySemigroup, some, none } from "fp-ts/lib/Option";

// Semi-groups essentially takes 2 objects of type A and returns 1 object
// of type A.

/** number `Semigroup` under multiplication */
const semigroupProduct: Semigroup<number> = {
  concat: (x, y) => x * y,
};

console.log("\n----- Test of number multiplication semi-group -----");
console.log(semigroupProduct.concat(2, 3)); // 6

const semigroupAddition: Semigroup<number> = {
  concat: (x, y) => x + y,
};

console.log("\n----- Test of number addition semi-group -----");
console.log(semigroupAddition.concat(2, 3)); // 5

const semigroupString: Semigroup<string> = { concat: (x, y) => x + y };

console.log("\n----- Test of string concatenation semi-group -----");
console.log(semigroupString.concat("foo", "bar")); // "foobar"

// If you can't find an associative operation on your type (A), you
// can still create a semi-group with these trivial functions:

/** Always return the first argument */
// Not the `A = never` type here. This is saying that by default,
// A is never, so it forces you to pass the type parameter when you
// use the function in your code. If you do not pass a type, you will
// get a intellisense type error.
const getFirstSemigroup = <A = never>(): Semigroup<A> => {
  return { concat: (x, y) => x };
};

/** Always return the second argument */
function getLastSemigroup<A = never>(): Semigroup<A> {
  return { concat: (x, y) => y };
}

console.log("\n----- Test of semi-group for non-associative operation -----");
console.log(getFirstSemigroup<string>().concat("foo", "bar")); // "foo"
console.log(getLastSemigroup<string>().concat("foo", "bar")); // "bar"

// We can create a semi-group for arrays called a "free semi-group".
// "The free semigroup of A is the semigroup whose elements are all
//  possible non - empty finite sequences of elements of A."
function getArraySemigroup<A = never>(): Semigroup<Array<A>> {
  return { concat: (x, y) => x.concat(y) };
}

const of = <A>(a: A): Array<A> => [a];

console.log("\n----- Test of free semi-group -----");
console.log(getArraySemigroup<string>().concat(of("foo"), of("bar"))); // ["foo", "bar"]
console.log(getArraySemigroup<number>().concat(of(1), of(2))); // [1, 2]

// We can _turn_ other types (like Ord) into semi-groups:

const semigroupMin: Semigroup<number> = getMeetSemigroup(ordNumber);
const semigroupMax: Semigroup<number> = getJoinSemigroup(ordNumber);

console.log("\n----- Test of semi-group min and max -----");
console.log(semigroupMin.concat(2, 3)); // 2
console.log(semigroupMax.concat(2, 3)); // 3

type Point = {
  x: number;
  y: number;
};

const semigroupPoint: Semigroup<Point> = {
  concat: (p1, p2) => ({
    x: semigroupSum.concat(p1.x, p2.x),
    y: semigroupSum.concat(p1.y, p2.y),
  }),
};

console.log("\n----- Test of semi-group min and max -----");
console.log(semigroupPoint.concat({ x: 1, y: 1 }, { x: 2, y: 3 })); // { x: 3, y: 4 }

// This is mostly boilerplate though. We can use the `getStructSemigroup` function from
// the Semigroup module to simplify it.

const semigroupPoint2: Semigroup<Point> = getStructSemigroup({
  x: semigroupSum,
  y: semigroupSum,
});

console.log("\n----- Test of struct semi-group -----");
console.log(semigroupPoint2.concat({ x: 1, y: 1 }, { x: 2, y: 3 })); // { x: 3, y: 4 }

type Vector = {
  from: Point;
  to: Point;
};

const semigroupVector: Semigroup<Vector> = getStructSemigroup({
  from: semigroupPoint,
  to: semigroupPoint,
});

const P1 = { x: 1, y: 1 };
const P2 = { x: 2, y: 3 };

console.log(
  semigroupVector.concat(
    { from: P1, to: P2 },
    { from: { x: 1, y: 1 }, to: { x: 2, y: 3 } }
  )
); // { from: {x: 2, y: 2 }, to: { x: 4, y: 6 } }

// Another thing:

/** `semigroupAll` is the boolean semigroup under conjunction */
// All semi-groups have a concat method on them which NEED to have
// two parameters passed. In this example, we pass one function for
// our X operation and one for our Y operation.
const semigroupPredicate: Semigroup<(
  p: Point
) => boolean> = getFunctionSemigroup(semigroupAll)<Point>();

const positiveCartesianPlane = semigroupPredicate.concat(
  ({ x }: Point) => x >= 0,
  ({ y }: Point) => y >= 0
);

console.log("\n----- Test of getFunctionSemigroup -----");
console.log(positiveCartesianPlane(P1)); // true
const P3 = { x: -1, y: 1 };
console.log(positiveCartesianPlane(P3)); // false

// By definition, concat only accepts two params. What if we
// want to pass more?
// - This is where `fold` comes in!

// The `fold` function has two type definitions:
//  - The first is a normal, 2 parameter function (x, y)
//  - The second is a curried function, which accepts 1 parameter,
//    and returns a function, waiting for the second parameter.
const sum = fold(semigroupSum);

console.log("\n----- Test of semi-group fold -----");

// normal `sum` function which accepts two params
console.log(sum(1, [1, 2])); // 4

// curried `sum` function which accepts one param, and
// returns a function for the second param.
console.log(sum(1)([1, 2])); // 4

// Another example:
const add10ToNumber = sum(10);
console.log(add10ToNumber(of(1))); // 11

// We can "merge" two Option instance (some/none) by using
// the getApplySemigroup function from the Option module:

const S = getApplySemigroup(semigroupSum);

console.log("\n----- Test of Option semi-group -----");
console.log(S.concat(some(1), none)); // none
console.log(S.concat(some(1), some(1))); // some(2);
