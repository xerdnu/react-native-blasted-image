# :rocket: BlastedImage
[![npm downloads](https://img.shields.io/npm/dm/react-native-blasted-image.svg?style=for-the-badge)](https://www.npmjs.com/package/react-native-blasted-image)
[![platform - android](https://img.shields.io/badge/platform-Android-3ddc84.svg?logo=android&style=for-the-badge)](https://www.android.com)
[![platform - ios](https://img.shields.io/badge/platform-iOS-0067b8.svg?logo=apple&style=for-the-badge)](https://developer.apple.com/ios)

A simple yet powerful image component for React Native, powered by [Glide](https://github.com/bumptech/glide) (Android) and [SDWebImage](https://github.com/SDWebImage/SDWebImage) (iOS).

## Support My Work! 🎉
I truly appreciate your support! If you'd like to help me out, the best way is to check out my latest app — **LogoDuel**.

**LogoDuel** is a fun, fast-paced multiplayer trivia game where you challenge friends (or foes!) to guess famous logos. Test your brand knowledge and see who comes out on top!

👉 Download now and let the logo battle begin!

[![Get it on Google Play](https://img.shields.io/badge/Google_Play-Download-green?logo=google-play&style=for-the-badge)](https://play.google.com/store/apps/details?id=se.netblast.logoduellen) [![Download on the App Store](https://img.shields.io/badge/App_Store-Download-blue?logo=apple&style=for-the-badge)](https://apps.apple.com/us/app/logoduel/id6470379520)

## Description
Caching remote images has always been a challenge for me with the Image component in React Native. This simplified, yet powerful component, addresses that issue head-on. It offers a robust and performant mechanism for caching remote images, ensuring they're displayed quickly.<br><br>Leveraging the strengths of Glide and SDWebImage, it supports both memory and disk caching for remote images. The newly added Hybrid Assets feature allows you to bundle remote assets in your build, fetching from the network only when necessary. Notably, while it provides these enhanced capabilities for remote images, it seamlessly integrates with the standard React Native Image component when handling local assets using require.

## Features

- **Performance**: Bypasses the React Native Image component for remote images ensuring immediate and lightning-fast display of remote images.
- **Cross-Platform**: Works on both Android (with [Glide](https://github.com/bumptech/glide)) and iOS (with [SDWebImage](https://github.com/SDWebImage/SDWebImage))
- **Customizable**: Wrapped within a `View` for added layout and style customization.
- **Robust Caching**: Benefits from both memory and disk caching for maximum performance.
- **Hybrid Assets**: Bundle remote assets within your build and only fetch from the network if assets are not included.

## Installation
### With bare React Native 
#### Using npm:
```bash
npm install react-native-blasted-image --save
```
#### Using yarn:
```bash
yarn add react-native-blasted-image
```
#### Link native packages (iOS only)
```bash
cd ios && pod install
```

### With Expo
#### Using npm:
```bash
npx expo install react-native-blasted-image
```

## Usage
Here's a simple example to get you started:
```jsx
import BlastedImage from 'react-native-blasted-image';

<BlastedImage 
  source={{ uri: 'https://example.com/image.png' }} 
  resizeMode="cover"
  width={200}
  height={200}
  style={{ borderRadius: 10 }}
/>
```

## Paramaters
| Parameter    | Type              | Description                                                                                         | Default |
|--------------|-------------------|-----------------------------------------------------------------------------------------------------|---------|
| `source`     | `Object`&nbsp;or&nbsp;`require` | (**Required**) Can be an object containing a `uri` string for remote images or local images using `require`.<br><br>(Optional) The object containing `uri` can also contain `hybridAssets` and `cloudUrl` . See specific documentation regarding the source parameter below.     | -       |
| `width`      | `Number`          | (Optional) Specifies the width of the image. `Overrides width in style`                                                        | 100     |
| `height`     | `Number`          | (Optional) Specifies the height of the image. `Overrides height in style`                                                      | 100     |
| `resizeMode` | `String`          | (Optional) Resize the image with one of the options: `cover`&nbsp;`contain`&nbsp;`center`&nbsp;`stretch`  | cover |
| `isBackground` | `Boolean`          | (Optional) Makes the image act as a container background similar to the native `ImageBackground` component  | false |
| `fallbackSource` | `Object`          | (Optional) Object containing a `uri` string for a custom error image.  | - |
| `retries` | `Number`          | (Optional) Specifies the number of retry attempts if the image fails to load.  | 3 |
| `onLoad` | `Function`          | (Optional) Callback function that gets called when the image has loaded succesfully.  | - |
| `onError` | `Function`          | (Optional) Callback function that gets called when there was an error loading the image.  | - |
| `style`      | `Object`          | (Optional) Styles to be applied to the image, e.g., `{borderRadius:20}`.<br>See [View Style Props](https://reactnative.dev/docs/view-style-props) for all available styles.       
### Source Parameter
| Parameter    | Type              | Description                                                                                         | Default |
|--------------|-------------------|-----------------------------------------------------------------------------------------------------|---------|
| `uri`     | `String` | (**Required**) URI string for remote images or local images using require.     | -       |
| `hybridAssets`      | `Boolean`          | (Optional) Enables the Hybrid Assets feature to bundle remote assets locally and fetch from the network if not included.                                                        | false     |
| `cloudUrl`     | `String`          | (Optional) Leading URL to the remote assets for Hybrid Assets functionality.<br>(Required if `hybridAssets` is enabled)                                                       | null     |

## Methods
```jsx
import BlastedImage from 'react-native-blasted-image';

BlastedImage.preload([
  { uri: 'https://example.com/image1.jpg' },
  { uri: 'https://example.com/image2.jpg', skipMemoryCache: true },
  { uri: 'https://example.com/image3.jpg', skipMemoryCache: true, hybridAssets: true, cloudUrl: "https://www.example.com/" }
], 5);
```
> **Note**: The last parameter in preload is how many times the image should `retry`. If not specified it defaults to `3`.

| Method                          | PropType                  | Description                                              |
|---------------------------------|---------------------------|----------------------------------------------------------|
| `BlastedImage.preload()`        | `Array<{ uri: string, skipMemoryCache: bool, hybridAssets: bool, cloudUrl: string }>`  | Preloads remote images from an array of URIs, with the option to preload only to disk.                   |
| `BlastedImage.clearDiskCache()` | -                         | Clears the disk cache for all images.                    |
| `BlastedImage.clearMemoryCache()`| -                         | Clears the memory cache for all images.                  |
| `BlastedImage.clearAllCaches()` | -                         | Clears both disk and memory caches for all images.       |

## Hybrid Assets
The Hybrid Assets feature allows you to bundle remote assets directly into your build ensuring they are available locally while still enabling network fetching when necessary. This approach can significantly reduce bandwidth usage especially if you know in advance which assets will be used when you bundle your app.<br><br>To fully utilize the Hybrid Assets feature it's important to follow the same folder structure remotely as you do locally. This makes it easier to update your project with new assets while keeping everything organized and simplify the process of integrating updates.

### Automatic Bundling (Expo only)
When using Expo you can take advantage of the automatic asset bundling feature by adding this to your app.json file and running prebuild. The bundling feature will automatically copy and reference hybrid assets from the `./assets/blasted-image/*` directory on both iOS and Android platforms following the same folder structure as your remote assets.

#### app.json
```json
{
  "expo": {
    "plugins": [
      "react-native-blasted-image",
      {
        "assetsPath": "/project-root/assets/blasted-image"
      }
    ]
  }
}
```
> **Note**: The `assetsPath` property is optional. By default, it will use the path `./assets/blasted-image`
#### Run
```bash
npx expo prebuild
```

### Manual Bundling
If you prefer to manage your hybrid assets manually or if you are using `Bare React Native` you need to do the following.

#### Android
1. Copy your hybrid assets to ./android/app/src/main/assets/blasted-image/

#### iOS
1. Copy your hybrid assets to ./ios/Resources/blasted-image/
2. Reference your hybrid asset folder in Xcode (Resources -> blasted-image) and make sure it is included in the Build Phase.

### Hybrid Assets Example Structure
```
Local files                         # Files included in your build
│
├── assets                          # Inside root directory of your project
│   │
│   ├── blasted-image               # All images in this folder are checked against the matching location on your cloud storage.
│   │
│   ├────── image_or_folder_1	 
│   ├────── image_or_folder_2        
│   └────── ...    
└── ...
	
Remote files                        # Files in the cloud, for example Firebase etc.
│
├── image_or_folder_1               # Available in hybrid assets, not downloaded
├── image_or_folder_2               # Available in hybrid assets, not downloaded
├── image_or_folder_2               # Not available in hybrid assets, download and cache
└── ...
```
> **Note**: If you use manual bundling your hybrid assets should not be placed inside the root of your project directory but rather in Resources for iOS and assets for Android.


## Events
```jsx
import { NativeEventEmitter, NativeModules } from 'react-native';

const BlastedImageEvents = new NativeEventEmitter(NativeModules.BlastedImage);

useEffect(() => {
  const subscription = BlastedImageEvents.addListener('BlastedEventLoaded', (data) => {
    console.log(data.message);
  });

  return () => {
    subscription.remove();
  };
}, []);
```
| Event                          | Description                                              |
|---------------------------------|-------------------------------------------------------------------|
| `BlastedEventLoaded`        | Triggered when remote images are successfully loaded.                  |
| `BlastedEventClearedMemory` | Triggered when the memory cache for all images is cleared.                    |
| `BlastedEventClearedDisk`| Triggered when the disk cache for all images is cleared.                  |
| `BlastedEventClearedAll` | Triggered when both disk and memory caches for all images are cleared.       |
| `BlastedEventLog` | Provides detailed logging information for better debugging.       |

## Credits
This component was created with inspiration from [react-native-fast-image](https://github.com/DylanVann/react-native-fast-image) that also uses [Glide](https://github.com/bumptech/glide) and [SDWebImage](https://github.com/SDWebImage/SDWebImage). But due to its lack of ongoing maintenance i felt the need to develop this new image component to continue providing robust and performant caching functionality.

## Support My Work! 🎉
I truly appreciate your support! If you'd like to help me out, the best way is to check out my latest app — LogoDuel.

LogoDuel is a fun, fast-paced multiplayer trivia game where you challenge friends (or foes!) to guess famous logos. Test your brand knowledge and see who comes out on top!

👉 Download now and let the logo battle begin!

[![Get it on Google Play](https://img.shields.io/badge/Google_Play-Download-green?logo=google-play&style=for-the-badge)](https://play.google.com/store/apps/details?id=se.netblast.logoduellen) [![Download on the App Store](https://img.shields.io/badge/App_Store-Download-blue?logo=apple&style=for-the-badge)](https://apps.apple.com/us/app/logoduel/id6470379520)

## Contributing
Contributions are welcome! If you find a bug or have a feature request, please open an issue. If you want to contribute code, please open a pull request.

## License
-   BlastedImage - `MIT` :copyright: [xerdnu](https://github.com/xerdnu)
-   SDWebImage - `MIT`
-   Glide - `BSD`, part `MIT` and `Apache 2.0`. See the [LICENSE](https://github.com/bumptech/glide/blob/master/LICENSE) file for details.
