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

```Text
Experiment trial1: difference found
Control C
```

Note that `scientist.experiment` is a factory; it returns a function (named `experiment` in the example) that matches the signature of the `control` and the `candidate`.

The `control` is the source of truth. It's typically the legacy code you're trying to replace. The `experiment` (the function returned by `scientist.experiment`) will always return whatever the `control` returns (**or will throw if the `control` throws**). You would replace the original call to `control` in your codebase with a call to `experiment`.

The `candidate` is the new code you're testing that's intended to replace the `control` eventually. The `experiment` runs this code and publishes the result (along with the `control` result). The `experiment` will swallow any errors thrown by the `candidate`.

The `experiment` runs both the `control` and the `candidate`, and it publishes the results to a callback function. Normally you will provide a custom `publish` function in the options that will report the results to some location for later analysis.

### Publishing results

```TypeScript
function publish(results: scientist.Results<[string], string>): void {
  if (results.candidateResult !== results.controlResult) {
    console.log(
      `Experiment ${results.experimentName}: expected "${results.controlResult}" but got "${results.candidateResult}"`
    );
  }
}

const experiment = scientist.experiment({
  name: 'trial2',
  control: (s: string) => 'Control ' + s,
  candidate: (s: string) => 'not quite right ' + s,
  options: { publish }
});

console.log(experiment('C'));
```

This prints:

```Text
Experiment trial2: expected "Control C" but got "not quite right C"
Control C
```

You will probably want to check `results.candidateError` and `results.controlError` as well.

Typically you would replace `console.log` in `publish` with a call to a logging framework, persisting to a database, sending metrics to Grafana, etc.

The results include the arguments passed to the experiment (`experimentArguments`).

### Sampling

Running experiments can be expensive. Both the control and the candidate execute. If either may be slow or if the experiment runs in a performance-sensitive context, you may want to run the experiment on a percentage of traffic. You can provide a custom `enabled` function in the options. If `enabled` returns `false`, the experiment will still return what the control returns but it will not call the candidate nor will it publish results. If `enabled` returns `true`, the experiment will run normally. Tzientist passes the arguments to the experiment to the `enabled` function in case you want to base the sampling on them.

Note: `enabled` receives the same arguments as the experiment, where `publish` receives a `Results` object with `experimentArguments` and other properties.

```TypeScript
function enabled(_: string): boolean {
  // Run candidate 25% of the time
  return Math.floor(Math.random() * 100 + 1) <= 25;
}

const experiment = scientist.experiment({
  name: 'trial3',
  control: (s: string) => 'Control ' + s,
  candidate: (s: string) => 'not quite right ' + s,
  options: { enabled }
});
```

### Asynchronous code

If your functions are async (returning a Promise), use `experimentAsync`. The resulting experiment function will return a Promise.

```TypeScript
const experiment = scientist.experimentAsync({
  name: 'async trial1',
  control: myAsyncControl,
  candidate: myAsyncCandidate,
  options: { publish }
});

const result: number = await experiment(1, 2);
```

The `control` and the `candidate` will be run in parallel (that is, concurrently). Options are the same as for a normal `experiment`.

Note that Node applications run on a single thread, so if the functions are CPU-intensive then the experiment may take significantly longer than just running the original code.

If your functions use callbacks, look at wrapping them with [util.promisify](https://nodejs.org/api/util.html#util_util_promisify_original).

### Timing / profiling

Published results now include timings for both the control and the candidate. Timings are in milliseconds (ms). Note that other queued tasks could affect asynchronous timings, at least in theory.

## FAQ

Q. Why would I use this library?

A. You want to refactor or replace existing code, but that code is difficult or impossible to test with automated unit or integration tests. Perhaps it's nondeterministic. It might rely on data or on user input that is only available in a production environment. It could be a combinatorial explosion of states that requires too many test cases. Typically you would use this for high-risk changes, since you'll want to run the experiment for some time in production and check the results.

---

Q. What if my candidate or control have side effects (such as updating a database)?

A. In general, don't use Tzientist in those cases.

---

Q. My candidate and control take different parameters. How do I handle that?

A. Create a facade for one or both so that the parameters match. You don't need to use all of the parameters in both functions.

---

Q. How do I configure custom compare, clean, or ignore functions?

A. Tzientist always publishes results, so you can do all of the above in your `publish` function. `publish` can also delegate to other functions.

---

Q. How do I configure a custom run_if function to conditionally disable an experiment?

A. Tzientist passes the arguments to the experiment to the `enabled` function (if this is present in the options). If `enabled` returns `false`, the experiment will still return what the control returns but it will not call the candidate nor will it publish results.

---

Q. What are some guidelines for writing `publish` and `enabled` functions?

A.

- Both `publish` and `enabled` should be fast
- Both `publish` and `enabled` should **not** throw (they should catch any errors)

---

Q. Why doesn't Tzientist randomize the order in which the control and the candidate are run?

A. Because those functions should not have side effects.

---

Q. What if the results always differ due to the data containing timestamps, GUIDs, etc.?

A. One technique is to match those with regular expressions and replace them with a placeholder before comparing.

---

Q. Will this work with [Deno](https://deno.land/)?

A. No; instead, please check out [paleontologist](https://github.com/TrueWill/paleontologist).

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
- Node v12 (should work on v8.17.0 or higher, but tests require v12)
- npm v6 (I like yarn, but not everyone does)
- [Prettier](https://prettier.io/)
- ESLint
- Jest

### Standards

- TypeScript strict option
- No classes
- Prettier 2 with single quotes and no trailing commas
- No ESLint warnings/errors
- All tests pass
- No dependencies (other than devDependencies)
- [Semantic Versioning 2.0.0](https://semver.org/)

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

## Legal

Tzimisce and Vampire: The Masquerade are copyrighted by or registered trademarks of CCP hf.

Node.js is a trademark of Joyent, Inc.

Tzientist is not published by, affiliated with, or endorsed by any of these organizations.
