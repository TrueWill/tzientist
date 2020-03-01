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
- Node v12
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

**Note**: I use Mac OS, which uses Unix style (LF) line breaks. I haven't added a .gitattributes file yet.

## About the name

I love puns, gaming, and vampires. Tzientist is named after the Tzimisce vampire clan from the game Vampire: The Masquerade; they are the ultimate scientists.

Tzimisce and Vampire: The Masquerade are copyrighted by or registered trademarks of CCP hf.
