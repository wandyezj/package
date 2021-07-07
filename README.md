# package

Simple Package Template

![example branch parameter](https://github.com/wandyezj/package/actions/workflows/main.yml/badge.svg?branch=main)

## About

A template for NPM libraries with standard technologies to handle common library development scenarios.

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

Eventual

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
