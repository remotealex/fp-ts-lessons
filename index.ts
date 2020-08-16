// import { Either, left, right, chain } from "fp-ts/lib/Either";
// import { pipe } from "fp-ts/lib/pipeable";

// const onlyStrings = (a: any): Either<string, string> =>
//   typeof a === "string" ? right(a) : left("Not a string");

// const onlyNonEmpty = (a: string | any[]): Either<string, string | any[]> =>
//   a.length > 0 ? right(a) : left("Is empty");

// const stringToNumber = (str: string): Either<string, number> => {
//   const num = parseInt(str, 10);
//   return num > -1 ? right(num) : left("Not valid");
// };

// const isNumberBetween = (a: number, b: number) => (
//   n: number
// ): Either<string, boolean> =>
//   n > a && n < b ? right(true) : left(`Not between ${a} and ${b}`);

// const validate = (a) =>
//   pipe(
//     onlyStrings(a),
//     chain(onlyNonEmpty),
//     chain(stringToNumber),
//     chain(isNumberBetween(15, 180))
//   );

// console.log(validate("200"));
// console.log(validate("100"));

import { fromNullable, mapNullable, chain, some, fold } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { traverse } from "fp-ts/lib/Array";
import {
  //   fold,
  either,
  left,
  right,
  map,
  getOrElse,
  flatten,
  Either,
} from "fp-ts/lib/Either";
import { flow } from "fp-ts/lib/function";
// const firstName = pipe(
//   fromNullable("alex price"),
//   mapNullable((name: string) => name.split(" ")[0])
// );
// const getFirstName = (name: string | null) =>
//   pipe(
//     fromNullable(name),
//     mapNullable((name) => name.split(" ")[0])
//   );

// const firstName = flow(
//   fromNullable,
//   chain((person: string) => getFirstName(person)),
//   getOrElse(() => "No name")
// );

// console.log(firstName("foo bar"));

const fib = (n: number, sum: number = 0) =>
  n <= 1 ? 1 : fib(n - 1, sum) + fib(n - 2, sum);

console.log(
  fold(
    () => "foo",
    (val) => val
  )(some(fib(1)))
);
