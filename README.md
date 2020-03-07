# Tzientist

A Scientist-like library for Node.js, implemented in TypeScript.

It permits comparing legacy and refactored code paths in production environments,
verifying both functional and non-functional requirements.
This is also known as the Parallel Run pattern.

## Installation

`npm i tzientist`

or

`yarn add tzientist`

## Getting started

```TypeScript
import * as scientist from 'tzientist';

const experiment = scientist.experiment({
  name: 'trial1',
  control: (s: string) => 'Control ' + s,
  candidate: (s: string) => 'not quite right ' + s
});

console.log(experiment('C'));
```

This uses the default options and prints:

```
Experiment trial1: difference found
Control C
```

## Notes

**BREAKING CHANGE COMING**

I realized that if you **always** publish results, you don't need a comparison option.
The `publish` function can do (or delegate) that.
Similarly, you don't need clean or ignore options.
`publish` should be fast, though. (Also it should **not** throw.)

## To do

- Improve default publish function
  - Separate function instance
  - Compare errors
  - Better message?
- Timer support.
- Async support.

## Why

GitHub's [Scientist](https://github.com/github/scientist) Ruby library is a brilliant concept. Unfortunately the Node.js alternatives aren't very TypeScript-friendly.

The goals of this project:

- Simplicity
- TypeScript support
- Easy setup
- Reasonable defaults
- Good documentation
- High test coverage

Feature parity with Scientist is _not_ a goal.

## Contributing

### Technology stack

- TypeScript v3.8
- Node v12 (should work on v8.17.0 or higher)
- npm v6 (I like yarn, but not everyone does)
- [Prettier](https://prettier.io/)
- ESLint
- Jest

### Standards

- TypeScript strict option
- No classes
- Prettier with single quotes
- No ESLint warnings/errors
- All tests pass
- No dependencies (other than devDependencies)

**Note**: I use Mac OS, which uses Unix style (LF) line breaks. I haven't added a .gitattributes file yet.

## Thanks to

- GitHub and all contributors for [Scientist](https://github.com/github/scientist)
- Microsoft and all contributors for TypeScript
- Rashauna, Dani, TC, Jon, and many others from Redox, Inc. for educating me about Scientist and TypeScript
  - Jon for his feedback
- Titian Cernicova-Dragomir for a key [Stack Overflow answer](https://stackoverflow.com/a/60469374/161457) on types
- The rest of the TypeScript community (particularly the maintainers of [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped))
- Michal Zalecki for the article [Creating a TypeScript library with a minimal setup](https://michalzalecki.com/creating-typescript-library-with-a-minimal-setup/)
- Linus Unnebäck for a [Stack Overflow answer](https://stackoverflow.com/a/50466512/161457)
- All of the creators, contributors, and maintainers of the open source used here
- Sam Newman for discussing the Parallel Run pattern in the book [Monolith to Microservices](https://samnewman.io/books/monolith-to-microservices/)
- OpenJS Foundation for Node.js
- Future contributors 😺

## About the name

I love puns, gaming, and vampires. Tzientist is named after the Tzimisce vampire clan from the game Vampire: The Masquerade; they are the ultimate scientists.

Tzimisce and Vampire: The Masquerade are copyrighted by or registered trademarks of CCP hf.
Node.js is a trademark of Joyent, Inc.
