import fetch from "node-fetch";
import { createInterface } from "readline";
import { Task, of } from "fp-ts/lib/Task";
import { TaskEither, tryCatch, fold } from "fp-ts/lib/TaskEither";

// Task is like `IO` but for async stuff. It's not really
// a class container. It's just a type.
// Also just like `IO`, `Task` should NEVER fail. If our
// computation can fail, we should use `TaskEither`.

const read: Task<string> = () =>
  new Promise<string>((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("What is your name? ", (answer) => {
      rl.close();
      resolve(answer);
    });
  });

// console.log("\n----- Test of our read -----");
// read().then(console.log); // Alex

// TASK EITHER
// In this example we are wrapping `fetch` which can fail.
function get(url: string): TaskEither<Error, string> {
  return tryCatch(
    () =>
      fetch(url)
        .then((res) => {
          if (!res.ok) {
            throw res.status.toString();
          }
          return res;
        })
        .then((res) => res.text()),
    (reason) => new Error(String(reason))
  );
}

const fetchTreesSuccess = get("https://public.ecologi.com/users/alex/trees");
const fetchTreesFail = get(
  "https://public.ecologi.com/users/kfnrewkfnerkfnekrnjfkejnrfnkejrn/trees"
);

console.log("\n----- Test of safe fetch -----");
console.log(fetchTreesSuccess().then(console.log)); // right('{"total":670}')
console.log(fetchTreesFail().then(console.log)); // left(Error(404))

// Now what? We want to get the data out so, lets use `fold` first!

const getJSONFromFetch = fold<Error, string, void>(
  (error) => of(console.error(`THERE WAS AN ERROR!! ${error.message}`)),
  (stringJSON) => {
    const jsonObj = JSON.parse(stringJSON);
    return of(console.log(`SUCCESS, you have ${jsonObj.total} trees`));
  }
);

console.log("\n----- Test of safe json -----");
getJSONFromFetch(fetchTreesSuccess)(); // "SUCCESS, you have 670 trees"
getJSONFromFetch(fetchTreesFail)(); // "THERE WAS AN ERROR!! 404"
