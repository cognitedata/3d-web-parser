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

## Release

How to release a new version:

1. Create a new branch
2. Commit changes (if any)
3. Run
   ```bash
   $ npm version [patch/minor/major]
   # example: $ npm version patch
   ```
4. Push branch and push tags (`git push --tags`)
5. Create a new pull requests
6. A new version will be published when the PR is merged
