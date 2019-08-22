<a href="https://cognite.com/">
    <img src="./cognite_logo.png" alt="Cognite logo" title="Cognite" align="right" height="80" />
</a>

# JavaScript parser for 3D web files

[![Build Status](https://travis-ci.org/cognitedata/3d-web-parser.svg?branch=master)](https://travis-ci.org/cognitedata/3d-web-parser)
[![codecov](https://codecov.io/gh/cognitedata/3d-web-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/cognitedata/3d-web-parser)

This module parses 3D data from Cognite Data Platform used in the 3D viewer.

### Using typescript

This module is written in native typescript, so no extra types need to be defined.

## License

[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

## Development

Run all tests:

```bash
$ yarn
$ yarn test
```

We use `jest` to run tests, see [their documentation](https://github.com/facebook/jest) for more information.

## Update protobuf schema

- Run `yarn run pbjs -t json -o src/proto/web_scene.json {path to web_scene.proto}`

## Releasing

### How to release a new patch version

New patch releases are usually based on the release branch for the given minor version.

1. Checkout the release branch for the previous minor version, named `releases/x.y`.
    ```bash
    git checkout release/x.y
    ```
2. Create a new branch for your changes
    ```bash
    git checkout -b yourusername/release/x.y.z
    ```
3. Cherry-pick your changes from the `master` branch or add new commits.
4. Create a version commit by running.
    ```
    $ npm version patch
    ```
4. Push your branch with tags
    ```
    git push --tags
    ```
5. Create a new pull requests from `yourusername/release/x.y.z` into the `release/x.y` branch.
6. A new version will be published when the PR is merged

### How to release a new minor or major version

New minor or major releases are usually based directly on the current version in `master`.

1. Checkout the `master` branch.
    ```bash
    git checkout master
    ```
2. Create a release branch.
    ```bash
    git checkout -b release/x.y
    ```
3. Push the branch.
    ```bash
    git push
    ```
4. Create a new branch for your changes:
    ```bash
    git checkout -b yourusername/release/x.y
    ```
5. Create a version commit by running.
    ```bash
    $ npm version [minor/major]
    # example: $ npm version minor
    ```
6. Push branch and push tags (`git push --tags`)
7. Create a new pull requests from `yourusername/release/x.y.z` into the `release/x.y` branch.
8. A new version will be published when the PR is merged
