# Change Log

## 0.1.0

### Minor Changes

- Switching to use ^ for semver ranges of internal @clerk/ production dependencies. ([#4664](https://github.com/clerk/javascript/pull/4664)) by [@jacekradko](https://github.com/jacekradko)

### Patch Changes

- Improve environment variable loading for certain values ([#4747](https://github.com/clerk/javascript/pull/4747)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`9d656c16bc78ac31b59b5edbd25118dfc33c4469`](https://github.com/clerk/javascript/commit/9d656c16bc78ac31b59b5edbd25118dfc33c4469), [`ffa631d2480cfe77bf08c61b1302ace308e5b630`](https://github.com/clerk/javascript/commit/ffa631d2480cfe77bf08c61b1302ace308e5b630), [`0266f6a73fc34748a86603bc89b6125d6bbb679b`](https://github.com/clerk/javascript/commit/0266f6a73fc34748a86603bc89b6125d6bbb679b)]:
  - @clerk/clerk-react@5.20.0
  - @clerk/backend@1.21.0
  - @clerk/shared@2.20.0

## 0.0.2

### Patch Changes

- Updated dependencies [[`cd72a27a75863dfd94b0a00ed5b2d03231556bc0`](https://github.com/clerk/javascript/commit/cd72a27a75863dfd94b0a00ed5b2d03231556bc0)]:
  - @clerk/types@4.39.2
  - @clerk/backend@1.20.3
  - @clerk/clerk-react@5.19.3
  - @clerk/shared@2.19.4

## 0.0.1

### Patch Changes

- Initial beta release of `@clerk/react-router`. ([#4621](https://github.com/clerk/javascript/pull/4621)) by [@LekoArts](https://github.com/LekoArts)

  [React Router v7](https://remix.run/blog/react-router-v7) was released and Clerk's existing `@clerk/remix` SDK isn't compatible anymore. Thus the need for a brand new SDK came up. `@clerk/react-router` allows you to use React Router v7 + Clerk both in framework/library mode.

  Read the [React Router quickstart](https://clerk.com/docs/quickstarts/react-router) and [reference documenation](https://clerk.com/docs/references/react-router/overview) to learn more.

- Updated dependencies [[`fe75ced8a7d8b8a28839430444588ee173b5230a`](https://github.com/clerk/javascript/commit/fe75ced8a7d8b8a28839430444588ee173b5230a), [`1b86a1da34ce4bc309f69980ac13a691a0a633c2`](https://github.com/clerk/javascript/commit/1b86a1da34ce4bc309f69980ac13a691a0a633c2)]:
  - @clerk/backend@1.20.2
  - @clerk/types@4.39.1
  - @clerk/clerk-react@5.19.2
  - @clerk/shared@2.19.3
