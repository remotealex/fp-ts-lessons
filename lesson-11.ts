import { flatten, array } from "fp-ts/lib/Array";

// This lesson is all about Monads
// Lets look at a proper example of getting Twitter
// followers from a Twitter user.

interface User {
  followers: Array<User>;
}

const getFollowers = (user: User): Array<User> => user.followers;

declare const user: User;

// This is rubbish! We have [[]User] :(
// const followersOfFollowers: Array<Array<User>> = getFollowers(user).map(
//   getFollowers
// );

// This is better!! We have flattened them out.
// const followersOfFollowers: Array<User> = flatten(getFollowers(user).map(
//   getFollowers
// ));

// We can do ever better by using chain
const followersOfFollowers: Array<User> = array.chain(
  getFollowers(user),
  getFollowers
);
