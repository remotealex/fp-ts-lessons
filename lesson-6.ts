// From: https://dev.to/gcanti/getting-started-with-fp-ts-ord-5f1e
import { Ord, fromCompare, contramap, getDualOrd } from "fp-ts/lib/Ord";

// `Ord` just an extension of `Eq`. It adds a `compare` method
// to the type definition of `Eq` and this comparison function
// returns `-1` if x < y when `compare(x, y)`
// returns `0` if x === y when `compare(x, y)`
// returns `1` if x > y when `compare(x, y)`

// Just like `Eq` we can define our own instances of `Ord`:
const ordNumber: Ord<number> = {
  equals: (x, y) => x === y,
  compare: (x, y) => (x < y ? -1 : x > y ? 1 : 0),
};

// The `Ord` module exports and helper function `fromCompare`
// which helps us define Ord instances by simply defining a
// valid comparison function:

const ordNumber2: Ord<number> = fromCompare((x, y) =>
  x < y ? -1 : x > y ? 1 : 0
);

console.log("\n----- Test of Ord<number> -----");
console.log(ordNumber2.compare(2, 1)); // 1
console.log(ordNumber2.compare(3, 3)); // 0
console.log(ordNumber2.compare(2, 3)); // -1
console.log(ordNumber2.equals(2, 3)); // false
console.log(ordNumber2.equals(3, 3)); // true

// Using our new Ord instance we can create a `min` function:

// This is a generic `min` function. We can pass in any `Ord`
// and it will give us a `min` function for that `Ord` type.
function min<A>(O: Ord<A>): (x: A, y: A) => A {
  return (x, y) => (O.compare(x, y) === 1 ? y : x);
}

const minNumber = min(ordNumber2);

console.log("\n----- Test of minNumber -----");
console.log(minNumber(1, 2)); // 1
console.log(minNumber(10, 2)); // 2
console.log(minNumber(5, 5)); // 5

const ordLength = fromCompare((x: string | any[], y: string | any[]) =>
  x.length < y.length ? -1 : x.length > y.length ? 1 : 0
);

const minLength = min(ordLength);

console.log("\n----- Test of minArrLength -----");
console.log(minLength("foo", "barbaz")); // 'foo'
console.log(minLength([1, 2, 3], "bar")); // [1, 2, 3]

type User = {
  name: string;
  age: number;
};

// Just like the `Eq` lesson, we can use `contramap` to build
// `Ord` instances with less boilerplate:

// const byAge: Ord<User> = fromCompare((x, y) => ordNumber2.compare(x.age, y.age));
const byAge: Ord<User> = contramap((user: User) => user.age)(ordNumber2);
const byNameLength: Ord<User> = contramap((user: User) => user.name.length)(
  ordNumber2
);

const getYounger = min(byAge);
const getShortestName = min(byNameLength);

const user1 = { name: "Alex", age: 48 };
const user2 = { name: "Gurjit", age: 45 };

const youngerUser = getYounger(user1, user2);
const shortestName = getShortestName(user1, user2);

console.log("\n----- Test of custom min functions -----");
console.log(youngerUser); // { name: 'Gurjit', age: 45 }
console.log(shortestName); // { name: 'Alex', age: 48 }

// The `dual` is the _reverse_ of something. So we can use `getDualOrd`
// to flip our functions:

function max<A>(O: Ord<A>): (x: A, y: A) => A {
  return min(getDualOrd(O));
}

const getOlder = max(byAge);

console.log("\n----- Test of custom max functions -----");
console.log(getOlder(user1, user2)); // { name: 'Alex', age: 48 }
