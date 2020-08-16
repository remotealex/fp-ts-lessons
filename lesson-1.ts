import { Option, none, some, fold, getOrElse, fromNullable } from 'fp-ts/lib/Option';

// `Option` is the data-type in same way that Array is a data-type.
// It is a way of collecting values in some construct.
// We can wrap our values in either `none`
// which represents a non-ideal state value and `some` which is our
// ideal state.
// A simplified type definition is:
// type Option<A> = None | Some<A>

// Idea of this example:
// ---------------------
// We can make our code safer by wrapping common prototype methods
// in a fp-ts data-type. In this example we wrap the array method
// `findIndex` in an Option data-type and return either a `none` or
// `some` object depending on the returning value.

// Questions?
// ----------
// What to do now with the `none` and `some` objects?
//   We can use `fold` from the `Option` module to apply a function
//   to any `some` value, and apply a "default" function in the `none`
//   case.
//   There is also `getOrElse` from the `Option` module, which returns
//   the value in the `some` case, or applies a given function in the
//   `none` case.

// Normally findIndex returns -1 if the predicate does not pass
// and returns the integer value of the index if the predicate does pass.
function findIndex<A>(arr: Array<A>, predicate: (a: A) => boolean): Option<number> {
  const index = arr.findIndex(predicate);
  return index === -1 ?
    none           // type Option<none>
    : some(index); // type Option<number>
}

// Actual example:
const testArr = [1, 2, 3];
const indexOfOne = findIndex(testArr, (n) => n === 1);
const indexOfTen = findIndex(testArr, (n) => n === 10);

console.log('----- Test of safe findIndex -----');
console.log(indexOfOne); // some(0) ~ positive case
console.log(indexOfTen); // none    ~ failed case

// Example of folding out our value
// Pass in to the "left"  ~ failed case
// Pass in to the "right" ~ success case
const foldTest = fold(
  ()  => `It's a none`,
  (n) => `It's a some(${n})`, // right === success
);

console.log('\n----- Test of fold -----');
console.log(foldTest(indexOfOne)); // "It's a some(0)"
console.log(foldTest(indexOfTen)); // "It's a none"

// Lift the value from our `some` or return 1000
const getOrElseTest = getOrElse(
  () => 1000 // this is the fail case
);

console.log('\n----- Test of getOrElse -----');
console.log(getOrElseTest(indexOfOne)); // 0
console.log(getOrElseTest(indexOfTen)); // 1000

// You can also use `fromNullable` from the `Option` module, which allows you
// to create an Option object straight from a potential nullable value:

function find<A>(arr: Array<A>, predicate: (a: A) => boolean): Option<A> {
  return fromNullable(arr.find(predicate));
}

console.log('\n----- Test of custom find -----');
console.log(find([1, 2, 3], n => n < 2)); // some(1)
console.log(find([1, 2, 3], n => n < 1)); // none
