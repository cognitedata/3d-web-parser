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
6. Merge the pull request by rebasing.
7. A new version will be published when the PR is merged

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
8. Merge the pull request by rebasing.
9. A new version will be published when the PR is merged
