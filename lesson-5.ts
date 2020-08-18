// From: https://dev.to/gcanti/getting-started-with-fp-ts-setoid-39f3
import { getStructEq, contramap } from "fp-ts/lib/Eq";

// In FP-TS there are a bunch of type-classes which define various function
// programming paradigms. The fist one we'll look at is `Eq`.

// From the docs:
// "A type class Eq, intended to contain types that admit equality"
// "a type A belongs to type class Eq if there is a function
//  named `equal` of the appropriate type, defined on it"

interface Eq<A> {
  /** returns `true` if `x` is equal to `y` */
  readonly equals: (x: A, y: A) => boolean;
}

// We can create our own instances which meet the `Eq` interface:

const eqNumber: Eq<number> = {
  equals: (x, y) => x === y,
};

// Instances must satisfy the laws of FP:
// Reflexivity: equals(x, x) === true for all x in A
// Symmetry: equals(x, y) === equals(y, x) for all x, y in A
// Transitivity:
//  if   equals(x, y) === true
//  and  equals(y, z) === true
//  then equals(x, z) === true
//  for all x, y, z in A

// With this knowledge we can build Eq instances for more complex types

type Point = {
  x: number;
  y: number;
};

// const eqPoint: Eq<Point> = {
//   equals: (p1, p2) => p1.x === p2.x && p1.y === p2.y
// }

// This is a lot of boilerplate though. We can use fp-ts to
// streamline it a bit. We just need to pass the `Eq` instance
// for each field on the type.

// We're telling fp-ts that for x and y on Point, use the eqNumber
// function (a type of `combinator`)from above to make the comparison.
const eqPoint: Eq<Point> = getStructEq({ x: eqNumber, y: eqNumber });

// We can compose these to build up more complex types
type Vector = {
  from: Point;
  to: Point;
};
const eqVector: Eq<Vector> = getStructEq({ from: eqPoint, to: eqPoint });

const p1: Point = { x: 1, y: 1 };
const p2: Point = { x: 2, y: 2 };
const p3: Point = { x: 3, y: 3 };
const v1: Vector = { from: p1, to: p2 };
const v2: Vector = { from: p2, to: p3 };
console.log("\n----- Test of vector eq -----");
console.log(eqVector.equals(v1, v1)); // true
console.log(eqVector.equals(v1, v2)); // false

// There are other _combinators_ too. Here is one that derives an `Eq`
// instance for arrays:

import { getEq } from "fp-ts/lib/Array";

// We can create an Eq instance for number[] by using the `getEq`
// helper from the Array module.
const eqArrayOfNumbers: Eq<Array<number>> = getEq(eqNumber);

// Note that the order of the array is important!
console.log("\n----- Test of array number eq -----");
console.log(eqArrayOfNumbers.equals([1, 2], [1, 2])); // true
console.log(eqArrayOfNumbers.equals([1, 2], [2, 1])); // false

// We can do the same for more complex types like Point:
const eqArrayOfPoints: Eq<Array<Point>> = getEq(eqPoint);

// Order of array points is still important
console.log("\n----- Test of array points eq -----");
console.log(eqArrayOfPoints.equals([p1, p2], [p1, p2])); // true
console.log(eqArrayOfPoints.equals([p2, p1], [p1, p2])); // false
console.log(eqArrayOfPoints.equals([p1, p2], [p2, p3])); // false

// The final way to create a new Eq instance is the `contramap` combinator:
// Here's the type:
// (f: (b: B) => A) => (fa: Eq<A>) => Eq<B>;

// And broken down:
// (f: (b: B) => A) => .       pass    a function
//    (fa: Eq<A>) =>           pass    an Eq instance for A
// .      Eq<B>                returns an Eq instance for B

// The first parameter is a function mapping an object (B) to a comparison property (A),
// in this case is a function mapping a `User` (B) object to it's `userId` (A).
// This returns a function which accepts an instant of Eq<A> do make the comparison under
// the hood. Finally, the function returned is an instance of Eq<B> which we can use!

type User = {
  userId: number;
  name: string;
};

// Two users are equal if their `userId` field is equal
// const eqUser = contramap((user: User) => user.userId)(eqNumber);
const eqUser = contramap(
  (user: User) => user.userId // function mapping B => A
)(eqNumber); //                  Eq<A> instance

console.log("\n----- Test of Eq<User> -----");
console.log(
  eqUser.equals({ userId: 1, name: "Alex" }, { userId: 1, name: "Foo" })
); // true
console.log(
  eqUser.equals({ userId: 1, name: "Alex" }, { userId: 2, name: "Gurjit" })
); // false
