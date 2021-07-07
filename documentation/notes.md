# Notes

Designed for TypeScript NPM libraries.

- build
- lint
- style
- test
- document
- publish

## Standard Technologies

- [GitHub](https://github.com/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [npm](https://www.npmjs.com/)
- [node](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [jest](https://jestjs.io/)
- [prettier](https://prettier.io/)
- [eslint](https://eslint.org/)
- [api-extractor](https://api-extractor.com/)
    - api-documenter
    - api-extractor-run
    - api-documenter-run
- [ts-node](https://github.com/TypeStrong/ts-node)
- GitHub actions

note: the template will need to be updated as technology changes.

## Visual Studio Code Extensions

- Bracket Pair Colorizer
    - Makes it easier to identify bracket pairs
- ESLint
    - config: `.eslintrc.json`
- Prettier
    - config: `config\prettier.json`
    - requires command line option `--config`
- markdownlint
    - config: `config\.markdownlint.json`
    - requires .vscode\settings.json extends

## Features

- Visual Studio Code F5 Debugging for jest tests.

## Recommendations

### Tools

- [gh - GitHub command line](https://cli.github.com/manual/gh_help_reference)

### Libraries

Libraries for solving common problems

- [jsonc-parser](https://www.npmjs.com/package/jsonc-parser)
    - parse JSON with comments using `stripComments`

- [JSDOM](https://www.npmjs.com/package/jsdom)
    - parse html in node

- [terser](https://terser.org/)
    - JavaScript minifier

## NPM Version Issues

`npm@7.5.4` does not allow script execution with unit style paths as in the package.json instead revert to an older version of npm that allows this behavior `npm install -g npm@6.14.9`

The above shows the importance of versioning tools together.

## NPM Script Search Path

npm looks first in the node_modules directory for the tool. Then it looks in the global installs before falling back to the path.

In order to require that only the tools specified as part of the package be run it's important to use the specific path `./node_modules/.bin` https://github.com/npm/cli/issues/2638

Benefits:

- A fixed tool version allows everyone to use the same version of the tool.
- Automation workflows only node needs to be installed (comes with npm) and only npm ci needs to be run before the `npm run <script>` commands ave available to use.
- Avoids cluttering the global namespace with tools.
- Ensures that the same tool version is run for everyone across environments.

## Windows cmd search path

Windows cmd does not need the extension on the tool to work. `cmd.exe` has a precedence list for executing items in the path without the extension's presence by looking for the command without the extension (i.e. hello will call hello.exe, hello.bat, hello.cmd, etc.. in that order as it searches the path).


## eslint disables

[eslint disabling rules](https://eslint.org/docs/user-guide/configuring/rules#disabling-rules)

```typescript

// disables for the next line
// eslint-disable-next-line no-use-before-define

// eslint-disable-line @typescript-eslint/triple-slash-reference
```

## prettier disables

[prettier ignore code](https://prettier.io/docs/en/ignore.html)

```typescript
// disables prettier for the next node
// prettier-ignore
```

## Technology and Design Considerations

Technologies were chosen based on ubiquity and commitment to long term support.

Widely deployed technologies with long term support are more likely to remain stable platforms for the future.

Adopting every new technology that has some small benefit comes with a cost. It's preferable to pick good standards that will remain relevant into the future to enable developers to focus on building new things instead of selecting and configuring tools. Standard widely adopted and well supported technologies are more likely to: have good support for common scenarios, have significant documentation, work together, and evolve together.

- Strong types, Strong contracts, implicitly difficult in a dynamically typed language
- Minimize Dependencies, document any reasons for dependencies, why they are required and how they are used
- Reduce Attack Surface Area, everyone is responsible to security, do not invent or implement your own hashing or cryptographic algorithms leave these things to experts
- Privacy do not send any data, do not cache or store any data
- Avoid Semantic versioning, every change is a potential breaking change, perhaps even unexpectedly, semantic versioning is a way to signal, but it needs to adhere to a specified contract about what is considered breaking, but it is still inaccurate in terms of how dependencies are taken, execution changes verses compilation changes

Move all possible configs under the config folder:

- have clarity where configs exist
- have clarity on what calls the configs

