# Changelog

## [2.0.1](https://github.com/voxpelli/peowly/compare/v2.0.0...v2.0.1) (2026-08-03)


### 🩹 Fixes

* display boolean default:true flags as --[no-]flag ([#43](https://github.com/voxpelli/peowly/issues/43)) ([1ac2b70](https://github.com/voxpelli/peowly/commit/1ac2b705e9050afdf2e3e09566ab0a7903cf960c))


### 🧹 Chores

* **deps:** update dependency @types/node to ^22.20.1 ([#39](https://github.com/voxpelli/peowly/issues/39)) ([8e9bc02](https://github.com/voxpelli/peowly/commit/8e9bc02bd0476c694e6a3cffb2e61fc93770324c))

## [2.0.0](https://github.com/voxpelli/peowly/compare/v1.3.3...v2.0.0) (2026-08-02)


### ⚠ BREAKING CHANGES

* `--no-` prefix is now supported for boolean flags, meaning `--no-color` sets a boolean flag `color` to `false` instead of being treated as an unknown flag. Defining flag names that start with `no-` now throws an error. Minimum Node.js version raised to 22.13.0 and minimum TypeScript version raised to 5.9. The `groupBy` export has been removed from `utils.js` in favor of the built-in `Object.groupBy()`.

### 🌟 Features

* add number flags, long-form aliases, and unparseFlags ([#38](https://github.com/voxpelli/peowly/issues/38)) ([ffc7ad4](https://github.com/voxpelli/peowly/commit/ffc7ad43d9da050a486712505555f4b8db14661a))


### 📚 Documentation

* add DeepWiki badge to README ([3b431c6](https://github.com/voxpelli/peowly/commit/3b431c61d23607b6afaf0db866f3d9fab2583daa))


### 🧹 Chores

* add ast-grep and remark linting tooling ([#41](https://github.com/voxpelli/peowly/issues/41)) ([be63155](https://github.com/voxpelli/peowly/commit/be6315579b02a2384d569273f0440a2dbe841d91))
* add context7.json with URL and public key ([cb7e83d](https://github.com/voxpelli/peowly/commit/cb7e83d7b22052f99bee934f3a39ab42dec7bcf6))
* **deps:** update dev dependencies ([8161aa3](https://github.com/voxpelli/peowly/commit/8161aa3332b300ca111cb2924cf641f02aebe875))
* fix new linting finds / opinions ([689a6b5](https://github.com/voxpelli/peowly/commit/689a6b5340cb758bdeae478e1a501f253456e333))

## [1.3.3](https://github.com/voxpelli/peowly/compare/v1.3.2...v1.3.3) (2026-02-10)


### 🩹 Fixes

* type definitions for multi flags ([#34](https://github.com/voxpelli/peowly/issues/34)) ([d12fb75](https://github.com/voxpelli/peowly/commit/d12fb7590c351cc7437c9d577f1645e87f5133d6))


### 📚 Documentation

* restructure README for clarity ([#25](https://github.com/voxpelli/peowly/issues/25)) ([7645f89](https://github.com/voxpelli/peowly/commit/7645f89d6250d613dff4cec9ae9e9d0510f54cc1))


### 🧹 Chores

* add type tests + improve unit tests ([#29](https://github.com/voxpelli/peowly/issues/29)) ([bd3aee0](https://github.com/voxpelli/peowly/commit/bd3aee0b547ad27d3af54db80b97e9124256471f))
* **deps:** update dependency @voxpelli/eslint-config to v22 ([#19](https://github.com/voxpelli/peowly/issues/19)) ([b256df8](https://github.com/voxpelli/peowly/commit/b256df803396544a1b52305e03b57c2c306deb0c))
* **deps:** update dependency tstyche to ^6.2.0 ([#35](https://github.com/voxpelli/peowly/issues/35)) ([a350f25](https://github.com/voxpelli/peowly/commit/a350f250c9abdb6c014eeae92f4611ec897db386))
* **deps:** update dev dependencies ([9596e5e](https://github.com/voxpelli/peowly/commit/9596e5ed7b4cec073734feeabe019536459dc8a0))
* **deps:** update linting dependencies ([#18](https://github.com/voxpelli/peowly/issues/18)) ([bdd888f](https://github.com/voxpelli/peowly/commit/bdd888fc57760d7573a3b1ca2e84e490821b22fe))
* **deps:** update linting dependencies ([#21](https://github.com/voxpelli/peowly/issues/21)) ([76c4d34](https://github.com/voxpelli/peowly/commit/76c4d34a70e4d0b4b548ff8feb2c8350e41a9a5b))
* **deps:** update linting dependencies ([#3](https://github.com/voxpelli/peowly/issues/3)) ([0f7f2da](https://github.com/voxpelli/peowly/commit/0f7f2dae34b968e72eeb0af8b273f01b4549cb37))
* **deps:** update test dependencies ([#11](https://github.com/voxpelli/peowly/issues/11)) ([a5deb20](https://github.com/voxpelli/peowly/commit/a5deb20071382ec41c13ec91b6ed6787ff165900))
* **deps:** update test dependencies ([#16](https://github.com/voxpelli/peowly/issues/16)) ([2ddf18c](https://github.com/voxpelli/peowly/commit/2ddf18c77f010a18a1b0b9894dc8c52eca994add))
* **deps:** update type dependencies ([#2](https://github.com/voxpelli/peowly/issues/2)) ([6b771e1](https://github.com/voxpelli/peowly/commit/6b771e17e044379327a55f902d65e1dffdb8c8b7))

## [1.3.2](https://github.com/voxpelli/peowly/compare/v1.3.1...v1.3.2) (2024-06-29)


### 🧹 Chores

* **deps:** update dev dependencies ([247300a](https://github.com/voxpelli/peowly/commit/247300af3154411c964b439f51d41824f365a494))
* **deps:** update linting ([b6f2e07](https://github.com/voxpelli/peowly/commit/b6f2e0730ff9bd603c238b09397133e08075a5c5))
* swap to neostandard based linting ([46b2114](https://github.com/voxpelli/peowly/commit/46b2114ee4543abc5bdbfb24fbe8c2540b024f50))
* update dev dependencies ([18983b3](https://github.com/voxpelli/peowly/commit/18983b3f49c37bff8324bb417e8d6a76bab6bb35))
* use @voxpelli/eslint-config ^20.0.0-beta.1 ([6e917ef](https://github.com/voxpelli/peowly/commit/6e917ef92a620311f4a4b07ed778f238bc1fc62e))

## [1.3.1](https://github.com/voxpelli/peowly/compare/v1.3.0...v1.3.1) (2024-06-20)


### 🩹 Fixes

* `--help` / `--version` takes precedence ([d93ea18](https://github.com/voxpelli/peowly/commit/d93ea18f7e373ad81b51878ecc87f5e5cbcb1e78))


### 🧹 Chores

* fix type error ([154facc](https://github.com/voxpelli/peowly/commit/154facc10eadf107dd4fa5c0d4eb7d00fa88ae09))
