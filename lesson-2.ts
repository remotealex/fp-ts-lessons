import { Either, tryCatch, fold } from "fp-ts/lib/Either";

// `Option` is great for wrapping functions which don't throw exceptions, but
// what about methods like JSON.parse which do. Well for that use case we can
// use a slightly different data-type, `Either`.

// The `Either` data-type in practice is an instance of either `Left` or
// `Right`. `Left` objects represent failed flows, while values wrapped in
// `Right` objects represent a successful flow.

// `Either` has a type signature:
// type Either<E, A> = Left<E> | Right<A>

// The main benefit of using `Either` over `Option` is that `Left` can hold
// some useful data (like an error message) whereas `None`, is always empty.

// Lets look at this custom (safe) JSON.parse function:
function parse(s: string): Either<Error, unknown> {
  return tryCatch(
    () => JSON.parse(s), // If successful the value will be wrapped in `Right`
    (reason) => Error(String(reason)) // If error, the value will be in `Left`
  );
}

// We can see that it returns an `Either` containing an `Error` in the failed
// case, and an `unknown` type in the success case. The `tryCatch` helper comes
// from the `Either` module and take a function (which might throw) as the
// first argument, and a function which will catch the error as the second
// argument.

const successfulParse = parse('{ "foo": "bar" }');
const failingParse = parse(""); // This will throw

console.log("\n----- Test of parse -----");
console.log(successfulParse); // Right({ foo: 'bar' })
console.log(failingParse); // Left(Error)

// Just like `Option` we can use `fold` and `getOrElse` to lift the value out
// of our `Either` objects:

// This is our `Left` handler
const onError = (errorMessage: Error) =>
  `Ooops there was an error: ${errorMessage.message}`;

// This is our `Right` handler
const onSuccess = (value: unknown) => `Woop, it worked: ${value}`;

// My curried function
const getJSON = fold(onError, onSuccess); // This returns a function

console.log("\n----- Test of fold -----");
console.log(getJSON(successfulParse)); // Woop, it worked: [object Object]
console.log(getJSON(failingParse)); // Ooops there was an error: SyntaxError: Unexpected end of JSON input
