import { flatten } from "fp-ts/lib/Array";
import { Option, some, none, isNone } from "fp-ts/lib/Option";

// This is an example of an Applicative instance for Array

const applicativeArray = {
  map: <A, B>(fa: Array<A>, f: (a: A) => B): Array<B> => fa.map(f),
  of: <A>(a: A): Array<A> => [a],
  ap: <A, B>(fab: Array<(a: A) => B>, fa: Array<A>): Array<B> =>
    flatten(fab.map((f) => fa.map(f))),
};

const addWorld = (a: string) => a + " world";
const addAlex = (a: string) => a + " alex";

console.log("\n----- Test of Applicative instance for Array -----");
console.log(applicativeArray.map(applicativeArray.of("hello"), addWorld)); // [ 'hello world' ];
console.log(applicativeArray.ap([addWorld, addAlex], ["hello", "abc"])); // [ 'hello world', 'abc world', 'hello alex', 'abc alex' ]

// This is an example of an Applicative instance for Option

const applicativeOption = {
  map: <A, B>(fa: Option<A>, f: (a: A) => B): Option<B> =>
    isNone(fa) ? none : some(f(fa.value)),
  of: <A>(a: A): Option<A> => some(a),
  ap: <A, B>(fab: Option<(a: A) => B>, fa: Option<A>): Option<B> =>
    isNone(fab) ? none : applicativeOption.map(fa, fab.value),
};

console.log("\n----- Test of Applicative instance for Option -----");
console.log(applicativeOption.map(applicativeOption.of("hello"), addWorld)); // some("hello world")

const addWorldOption = (a: Option<string>) =>
  applicativeOption.ap(some(addWorld), a);
console.log(addWorldOption(some("hello"))); // some("hello world")
console.log(addWorldOption(none)); // none
