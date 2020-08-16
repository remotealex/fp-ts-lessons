import * as fs from "fs";
import { of as toIO, IO } from "fp-ts/lib/IO";
import { IOEither, tryCatch, fold } from "fp-ts/lib/IOEither";

// To handle synchronous side-effects we can use the IO module.
// IO<A> represents a non-deterministic synchronous computation.
// That computation can cause side effects, yields a value of type A
// but it must never fail.

// Notice that IO is a type, not a type-class like `Option` or `Either`.
// It does not wrap the value in a container, in other words, it's never IO(value)

const random: IO<number> = () => Math.random();

console.log("\n----- Test of random -----");
console.log(random()); // 0.9102052911195271 NOT IO(0.9102052911195271)

// If you want to represent a synchronous computation that may fail,
// we use the IOEither data-type:

function readFileSync(path: string): IOEither<Error, string> {
  return tryCatch(
    () => fs.readFileSync(path, "utf8"),
    (reason) => new Error(String(reason))
  );
}

const readLesson1 = readFileSync("./lesson-1.ts");
const readLessonFoo = readFileSync("./foo.ts");

console.log("\n----- Test of safe read file -----");
console.log(readLesson1()); // right(<file_contents>)
console.log(readLessonFoo()); // left(Error: ENOENT: no such file or directory...)

// Now we want to get the values from the containers, so just like `Either`
// we can use the `fold` function.
const getLessonData = fold<Error, string, string>(
  (err) => toIO(err.message),
  (fileContents) => toIO(fileContents)
);

console.log("\n----- Test getting file contents -----");
console.log(getLessonData(readLesson1)()); // file_contents
console.log(getLessonData(readLessonFoo)()); // Error: ENOENT: no such file or directory...

// We can also use IO to type our global state computations:

// function getItem(key: string): IO<Option<string>> {
//   return () => fromNullable(localStorage.getItem(key));
// }
