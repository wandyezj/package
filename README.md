# package

Simple Package Template

## About

A template for NPM libraries with standard technologies to handle common library development scenarios.

Designed for TypeScript NPM libraries.

- developing
- linting
- styling
- testing
- documenting
- publishing

## Standard Technologies

- [GitHub](https://github.com/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [npm](https://www.npmjs.com/)
- [node](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [jest](https://jestjs.io/)
- [prettier](https://prettier.io/)
- [eslint](https://eslint.org/)

Eventual

- [api-extractor](https://api-extractor.com/)
- api-documenter
- api-extractor-run
- api-documenter-run
- GitHub actions

note: the template will need to be updated as technology changes.

## Visual Studio Code Extensions

- Bracket Pair Colorizer
    - Makes it easier to identify bracket pairs
- ESLint
    - config: `.eslintrc.json`
- Prettier
    - config: `.prettierrc.json`
- markdownlint
    - config: `.markdownlint.json`

## Features

- Visual Studio Code F5 Debugging for jest tests.

## Technology and Design Considerations

Technologies were chosen based on ubiquity and commitment to long term support.

Widely deployed technologies with long term support are more likely to remain stable platforms for the future.

Adopting every new technology that has some small benefit comes with a cost. It's preferable to pick good standards that will remain relevant into the future so that developers can focus on building new things instead of selecting and configuring tools. Standard widely adopted and well supported technologies are more likely to: have good support for common scenarios, have significant documentation, work together, and evolve together.

- Strong types, Strong contracts, implicitly difficult in a dynamically typed language
- Minimize Dependencies, document any reasons for dependencies, why they are required and how they are used
- Reduce Attack Surface Area, everyone is responsible to security, do not invent or implement your own hashing or cryptographic algorithms leave these things to experts
- Privacy do not send any data, do not cache or store any data
- Avoid Semantic versioning, every change is a potential breaking change, perhaps even unexpectedly, semantic versioning is a way to signal, but it needs to adhere to a specified contract about what is considered breaking, but it is still inaccurate in terms of how dependencies are taken, execution changes verses compilation changes

## Deploy

1. install

    > npm install

1. build

    > npm run build

1. test

    > npm run test

    - make sure all tests pass

1. patch

    > npm version patch

1. update [versions](versions)

1. publish

    > npm publish

1. commit

    > git commit -am "new version"

1. push
    > git push

## Versions

Description of changes between versions
New versions go before old version

### 0.0.0

    - initial version
