## [1.0.6] (2024-09-20)

#### Bug Fixes

-   Fixed a bug that caused `assetsPath` parameter not to be used on iOS.

## [1.0.5] (2024-09-20)

#### Improvements

-   Added `ASSETS_PATH` environment variable to support EAS.

## [1.0.4] (2024-09-20)

#### Improvements

-   Added `assetsPath` parameter to be specified in app.json.

#### Changes

-   Updated documentation.

## [1.0.3] (2024-08-18)

#### Bug Fixes

-   Fixed a bug that caused an infinite loading loop when an image failed to load.

## [1.0.2] (2024-08-16)

#### Bug Fixes

-   Fixed a bug where images was not sent into view on iOS.

## [1.0.1] (2024-08-16)

#### Improvements

-   Reworked the `source` parameter.
-   Reworked some code to create stability regarding the Hybrid Assets.

#### Changes
-   Updated TypeScript definitions.
-   Updated documentation.

#### Bug Fixes
-   Fixed a bug where the component would crash due to incorrect `hybridAssets` parameter.
-   Fixed a bug where changing the parameter for `hyberAssets` would not take effect.

## [1.0.0] (2024-08-14)

#### New Features

-   **Hybrid Assets:** Created a new feature called Hybrid Assets that makes it possible to bundle local assets within your build and only fetch from the network if assets are not included. This helps save bandwidth by bundling assets you know is gonna be used in your current version. To enable this just pass `hybridAssets` as `true` and provide a `cloudUrl`. If using Firebase, the component will automatically handle `%2F` replacements and trailing ?alt=media removal in the URL. Refer to the documentation for more details.
-   **Automatic Hybrid Assets Bundling:**  Implemented a function for automatic copying and bundling of hybrid assets to iOS and Android that also includes automatic reference creation in Xcode (Expo Only).
-   **TypeScript Support:** Added TypeScript support ([#15](https://github.com/xerdnu/react-native-blasted-image/pull/15), [#10](https://github.com/xerdnu/react-native-blasted-image/issues/10))

#### Improvements

-   Reworked the logic for how images are loaded and displayed
-   Reworked major parts of the component to include support for hybrid remote assets.
-   Reworked various parts of the components code that improves readability and fixes several bugs.
-   Maximum disk caching size is now static and set to 1GB.
-   Maximum memory caching size is now static and set to 100MB.
-   Fixed maximum lifetime of disk caching on iOS that ensures no maximum lifetime.

#### Changes

-   Changed return informational errors for better debugging.
-   Updated the logging events for better visibility.
-   Removed the ability to pass source headers due to stability concerns.   
-   Updated documentation.

#### Bug Fixes
-   Fixed a bug where the component would crash due to a destroyed activity. ([#13](https://github.com/xerdnu/react-native-blasted-image/issues/13))
-   Resolved a warning related to `defaultProps` deprecation and replaced them with javascript default parameters. ([#18](https://github.com/xerdnu/react-native-blasted-image/pull/18), [#16](https://github.com/xerdnu/react-native-blasted-image/issues/16))
-   Fixed a bug where no resolve occurred when an empty array was sent in preload. ([#15](https://github.com/xerdnu/react-native-blasted-image/pull/15), [#8](https://github.com/xerdnu/react-native-blasted-image/pull/8))

## [0.0.13] (2023-12-19)

#### Improvements

-   Added proper initialization value for `onLoad` callback. ([#4](https://github.com/xerdnu/react-native-blasted-image/pull/4))

## [0.0.12] (2023-10-31)

#### Improvements

-   Added proper `onLoad` and `onError` callbacks. ([#3](https://github.com/xerdnu/react-native-blasted-image/pull/3))
-   Added `fallbackSource` prop when image could not load. ([#3](https://github.com/xerdnu/react-native-blasted-image/pull/3))

#### Changes

-   Included static fallback image in cases where both the primary source and the fallbackSource fail to load.
-   Updated documentation.

## [0.0.11] (2023-10-31)

#### Changes

-   Changed package name.
-   Minor changes in JS code regarding logging.

## [0.0.10] (2023-10-24)

#### Improvements

-   Added the prop `isBackground` to act as a container background similar to the native `ImageBackground` component.

#### Bug Fixes

-   Fixed a bug that caused the error image not to display.

#### Changes

-   Updated documentation.

## [0.0.9] (2023-10-19)

#### Improvements

-   Added the possiblity to pass both `single objects` and `arrays` to `BlastedImage.preload`.
-   Added `promise` for `BlastedImage.preload` to indicate when the image has been processed.

#### Changes

-   Updated documentation.

## [0.0.8] (2023-10-17)

#### Improvements

-   Added the `skipMemoryCache` preload prop to preload images only to disk, keeping memory free.
-   Added return logs within the bridge.
-   Made a few minor fixes in the Android code.

#### Changes
-   Updated documentation.

## [0.0.7] (2023-10-16)

#### Changes

-   Updated documentation.

## [0.0.6] (2023-10-16)

#### Improvements

-   Added support for local images using `require`

#### Changes

-   Updated documentation.

## [0.0.5] (2023-10-16)

#### Bug Fixes

-   Fixed warning regarding event listeners on Android.

#### Changes

-   Updated documentation.

## [0.0.4] (2023-10-16)

#### Bug Fixes

-   Fixed peerDeps in package.json.
-   Fixed licensing details.

## [0.0.3] (2023-10-16)

#### Improvements

-   Added support for passing an array of styles.
-   Removed misc that was earlier used for debug.
-   Added image placeholder when it can not be loaded from uri.

#### Changes

-   Changed default of `resizeMode` from contain to cover.

## [0.0.2] (2023-10-16)

#### Added

-   Initial release (sync with npm).

## 0.0.1 (2023-10-15)

#### Added

-   Initial release.

[1.0.6]: https://github.com/xerdnu/react-native-blasted-image/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/xerdnu/react-native-blasted-image/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/xerdnu/react-native-blasted-image/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/xerdnu/react-native-blasted-image/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/xerdnu/react-native-blasted-image/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/xerdnu/react-native-blasted-image/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/xerdnu/react-native-blasted-image/compare/v0.0.13...v1.0.0
[0.0.13]: https://github.com/xerdnu/react-native-blasted-image/compare/v0.0.12...v0.0.13
[0.0.12]: https://github.com/xerdnu/react-native-blasted-image/compare/v0.0.11...v0.0.12
[0.0.11]: https://github.com/xerdnu/react-native-blasted-image/compare/v0.0.10...v0.0.11
[0.0.10]: https://github.com/xerdnu/react-native-blasted-image/compare/v0.0.9...v0.0.10
[0.0.9]: https://github.com/xerdnu/react-native-blasted-image/compare/v0.0.8...v0.0.9
[0.0.8]: https://github.com/xerdnu/react-native-blasted-image/compare/v0.0.7...v0.0.8
[0.0.7]: https://github.com/xerdnu/react-native-blasted-image/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/xerdnu/react-native-blasted-image/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/xerdnu/react-native-blasted-image/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/xerdnu/react-native-blasted-image/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/xerdnu/react-native-blasted-image/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/xerdnu/react-native-blasted-image/compare/v0.0.1...v0.0.2