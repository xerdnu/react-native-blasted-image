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