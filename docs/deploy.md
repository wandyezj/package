# Deploy

1. install

    > npm install

1. build

    > npm run build

1. test

    > npm run test

    - make sure all tests pass

1. patch

    > npm version patch

1. update [Changelog](../CHANGELOG.md)

1. publish

    > npm publish

    - if you get `Unable to authenticate` and have a .npmrc file that points to an Azure DevOps registry, run the following:
        > npx vsts-npm-auth -F -C .npmrc

1. commit

    > git commit -am "new version"

1. push
    > git push
