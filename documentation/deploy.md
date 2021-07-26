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

    - if you get `Unable to authenticate` have a .npmrc file to connect to Azure DevOps, run the following:
        > npm install -g vsts-npm-auth

        > vsts-npm-auth -F -config .npmrc

1. commit

    > git commit -am "new version"

1. push
    > git push