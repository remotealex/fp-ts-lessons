import * as fs from "fs";
import fetch from "node-fetch";
import * as T from "fp-ts/lib/Task";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import * as O from "fp-ts/lib/Option";
import { createInterface } from "readline";
import { pipe, Lazy } from "fp-ts/lib/function";
import { log, error } from "fp-ts/lib/console";
import { google, GoogleApis } from "googleapis";
import { AuthPlus } from "googleapis/build/src/googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const TOKEN_PATH = "token.json"; // created automatically
const CREDENTIALS_PATH = "credentials.json";

// Spreadsheet Updater CLI tool

// 1. Accept some input from the user (URL of their sheet)
// 2. Process the sheet and get the column names

// 1. The input can be a correct one or gibbersh
// Option -> none/some()
// Either -> left()/right() // depends if we need a value in our false case (error message etc.)
//      One error could be that the sheet isn't public so we cant access it
//      Another error could be that the sheet isn't found (not a valid sheet URL)

// The reading from the CLI is done with the `readline` package, which we
// wrap in a `Task` for safety. Task is an async operation which NEVER fails.

const rl = createInterface({ input: process.stdin, output: process.stdout });

// Temp URL
const validUrl =
  "https://docs.google.com/spreadsheets/d/1M4Fz-LSK9L2tf3CtbEKZe3xmrepnjaIZXw5bBeNg1sU/edit?usp=sharing";

const formatPrompt = (s: string) => s + "\n> ";

/*
 * Ask the user for a Google Sheets URL
 */
const getSheetUrl: T.Task<string> = () =>
  new Promise<string>((resolve) => {
    rl.question(formatPrompt("What is URL of your Google Sheet?"), (answer) => {
      rl.close();
      //   resolve(validUrl);
      resolve(answer);
    });
  });

const getOAuthCode = (oAuth2Client: any) =>
  new Promise<object>((resolve) => {
    rl.question("Enter the code from that page here: ", (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err: string, token: object) => {
        if (err)
          return console.error(
            "Error while trying to retrieve access token",
            err
          );
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log("Token stored to", TOKEN_PATH);
        });
        resolve(oAuth2Client);
      });
    });
  });

/*
 * Validate the URL given by the user
 */
const validateUrl = (url: string): E.Either<string, string> => {
  const urlPrefix = "https://docs.google.com/spreadsheets";
  return url.startsWith(urlPrefix)
    ? E.right(url)
    : E.left("Not a valid Google Sheet URL");
};

const readFile = (
  filePath: string,
  errMsg: string
): TE.TaskEither<string, string> => () =>
  new Promise<E.Either<string, string>>((resolve) => {
    fs.readFile(filePath, (err, content) => {
      err
        ? resolve(E.left(errMsg))
        : resolve(E.right(content.toString("utf-8")));
    });
  });

const parse = <T>(s: string): E.Either<string, T> =>
  E.tryCatch(
    () => JSON.parse(s), // If successful the value will be wrapped in `Right`
    (reason) => String(reason) // If error, the value will be in `Left`
  );

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 */
interface Credentials {
  installed: {
    client_secret: string;
    client_id: string;
    redirect_uris: Array<string>;
  };
}

const authorize = async (
  credentials: Credentials,
  userToken: O.Option<object>
) => {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  O.fold(
    async () => await getNewToken(oAuth2Client), // fetch new token
    (userToken: object) => {
      console.log('User token found');
      return Promise.resolve(oAuth2Client.setCredentials(userToken))
    }
  )(userToken);
  return oAuth2Client;
};

const getNewToken = async (oAuth2Client: any) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:\n", authUrl);
  await getOAuthCode(oAuth2Client);
};

// const authorize = (credentials: Credentials) => {
//   const {client_secret, client_id, redirect_uris} = credentials.installed;
//   const oAuth2Client = new google.auth.OAuth2(
//       client_id, client_secret, redirect_uris[0]
//   );

//   // Check if we have previously stored a token.
//   fs.readFile(TOKEN_PATH, (err, token) => {
//     if (err) return getNewToken(oAuth2Client, callback);
//     oAuth2Client.setCredentials(JSON.parse(token));
//     callback(oAuth2Client);
//   });
// }

// In this example we are wrapping `fetch` which can fail.
const getSheetData = (url: string): TE.TaskEither<string, string> =>
  TE.tryCatch(
    () =>
      fetch(url)
        .then((res) => {
          if (!res.ok) {
            throw res.status.toString();
          }
          return res;
        })
        .then((res) => res.text()),
    (reason) => String(reason)
  );

const getCredentials = (): T.Task<Credentials> =>
  pipe(
    readFile(CREDENTIALS_PATH, "Error reading credentials file"),
    TE.chainEitherK((c) => parse<Credentials>(c)), // parse the credentials JSON
    TE.fold(
      (err) => {
        throw new Error(err);
      },
      (credentials) => T.of(credentials)
    )
  );

const getUserToken = (): T.Task<object> =>
  pipe(
    readFile(TOKEN_PATH, "Error reading your OAuth token file"), // read the user token JSON file
    TE.chainEitherK((c) => parse<Credentials>(c)), // parse the credentials JSON
    TE.fold(
      () => T.of(undefined),
      (credentials) => T.of(credentials)
    )
  );

(async () => {
  const credentials = await getCredentials()();
  const userToken = await getUserToken()();
  const userTokenO: O.Option<object> = userToken ? O.some(userToken) : O.none;
  const authClient = await authorize(credentials, userTokenO);

  // TODO
  // 1. Get the Token from storage if it exists ✅
  // 2. If token, set the credentials on the OAuth client ✅
  //    If no token, ask for a new one

  //   const main = pipe(
  //     await getSheetUrl(),
  //     validateUrl,
  //     TE.fromEither,
  //     TE.chain(getSheetData),
  //     // TODO: Do something with the data
  //     TE.fold(
  //       (s) => T.of(error(s)),
  //       (s) => T.of(log(s))
  //     )
  //   );

  //   await main();
})();
