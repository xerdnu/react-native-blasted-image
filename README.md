# :rocket: BlastedImage
[![npm downloads](https://img.shields.io/npm/dm/react-native-blasted-image.svg?style=for-the-badge)](https://www.npmjs.com/package/react-native-blasted-image)
[![platform - android](https://img.shields.io/badge/platform-Android-3ddc84.svg?logo=android&style=for-the-badge)](https://www.android.com)
[![platform - ios](https://img.shields.io/badge/platform-iOS-0067b8.svg?logo=apple&style=for-the-badge)](https://developer.apple.com/ios)

A simple yet powerful image component for React Native, powered by [Glide](https://github.com/bumptech/glide) (Android) and [SDWebImage](https://github.com/SDWebImage/SDWebImage) (iOS).

## Description
Caching has always been a challenge for me with the Image component in React Native. This simplified, yet powerful component, addresses that issue head-on.  It offers a robust and performant mechanism for caching remote images, ensuring they're displayed quickly.<br><br>With the strengths of Glide and SDWebImage, it supports both memory and disk caching. Notably, it achieves all of this without relying on the standard React Native Image component.

## Features

- **Performance**: Bypasses the React Native Image component for remote images, ensuring immediate and lightning-fast display.
- **Cross-Platform**: Works on both Android (with [Glide](https://github.com/bumptech/glide)) and iOS (with [SDWebImage](https://github.com/SDWebImage/SDWebImage))
- **Customizable**: Wrapped within a `View` for added layout and style customization.
- **Robust Caching**: Benefits from both memory and disk caching for maximum performance.

## Installation
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

## Usage
Here's a simple example to get you started:
```jsx
import BlastedImage from 'react-native-blasted-image';

// Remote image
<BlastedImage 
  source={{ uri: 'https://example.com/image.png' }} 
  resizeMode="cover"
  width={200}
  height={200}
  style={{ borderRadius: 10 }}
/>

// Local image
<BlastedImage 
  source={ require('./assets/image.png') } 
  resizeMode="cover"
  width={200}
  height={200}
  style={{ borderRadius: 10 }}
/>
```

## Paramaters
| Parameter    | Type              | Description                                                                                         | Default |
|--------------|-------------------|-----------------------------------------------------------------------------------------------------|---------|
| `source`     | `Object` or `require` | (**Required**) Can be an object containing a `uri` string for remote images or local images using `require`.     | -       |
| `width`      | `Number`          | (Optional) Specifies the width of the image. `Overrides width in style`                                                        | 100     |
| `height`     | `Number`          | (Optional) Specifies the height of the image. `Overrides height in style`                                                      | 100     |
| `resizeMode` | `String`          | (Optional) Resize the image with one of the options: `cover` `contain` `center` `stretch`  | cover |
| `style`      | `Object`          | (Optional) Styles to be applied to the image, e.g., `{borderRadius:20}`.<br>See [View Style Props](https://reactnative.dev/docs/view-style-props) for all available styles.                            | -       |

## Methods
```jsx
import BlastedImage from 'react-native-blasted-image';

BlastedImage.preload([
  { uri: 'https://example.com/image1.jpg' },
  { uri: 'https://example.com/image2.jpg' },
]);
```
| Method                          | PropType                  | Description                                              |
|---------------------------------|---------------------------|----------------------------------------------------------|
| `BlastedImage.preload()`        | `Array<{ uri: string }>`  | Preloads remote images from an array of URIs.                   |
| `BlastedImage.clearDiskCache()` | -                         | Clears the disk cache for all images.                    |
| `BlastedImage.clearMemoryCache()`| -                         | Clears the memory cache for all images.                  |
| `BlastedImage.clearAllCaches()` | -                         | Clears both disk and memory caches for all images.       |

## Events
```jsx
import { NativeEventEmitter, NativeModules } from 'react-native';

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

## Credits
This component was created with inspiration from [react-native-fast-image](https://github.com/DylanVann/react-native-fast-image) that also uses [Glide](https://github.com/bumptech/glide) and [SDWebImage](https://github.com/SDWebImage/SDWebImage). But due to its lack of ongoing maintenance i felt the need to develop this new image component to continue providing robust and performant caching functionality.

## Contributing
Contributions are welcome! If you find a bug or have a feature request, please open an issue. If you want to contribute code, please open a pull request.

## License
-   BlastedImage - `MIT` :copyright: [xerdnu](https://github.com/xerdnu)
-   SDWebImage - `MIT`
-   Glide - `BSD`, part `MIT` and `Apache 2.0`. See the [LICENSE](https://github.com/bumptech/glide/blob/master/LICENSE) file for details.