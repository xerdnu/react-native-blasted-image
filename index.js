import React, { useState, useEffect } from 'react';
import { requireNativeComponent, NativeModules, Platform, Image, View } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-blasted-image' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const NativeBlastedImage = NativeModules.BlastedImage
  ? NativeModules.BlastedImage
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
  );

  export const loadImage = (imageUrl, headers = {}, skipMemoryCache = false) => {
    return NativeBlastedImage.loadImage(imageUrl, headers, skipMemoryCache);
  };

const BlastedImageView = requireNativeComponent('BlastedImageView');

const BlastedImage = ({ source, width, height, style, resizeMode }) => {
  const [error, setError] = useState(false);

  if (!source || (!source.uri && typeof source !== 'number')) {
    if (!source) {
        console.error("Source not specified for BlastedImage.");
    } else {
        console.error("Source should be either a URI <BlastedImage source={{ uri: 'https://example.com/image.jpg' }} /> or a local image using <BlastedImage source={ require('https://example.com/image.jpg') } />");
    }
    return null;
  }

  useEffect(() => {
    if (typeof source === 'number') {
      return;
    }

    const fetchImage = async () => {
      try {
        await loadImage(source.uri, source.headers);
      } catch (err) {
        setError(true);
        console.error(err);
      }
    };

    fetchImage();
  }, [source]);

  // Flatten styles if provided as an array, otherwise use style as-is
  const flattenedStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;

  const defaultStyle = { overflow: 'hidden', backgroundColor: style?.borderColor || 'transparent' }; // Use border color as background

  const {
    width: styleWidth,  // Get width from style
    height: styleHeight, // Get height from style
    ...remainingStyle // All other styles excluding above
  } = flattenedStyle || {};

  // Override width and height if they exist in style
  width = width || styleWidth || 100; // First check the direct prop, then style, then default to 100
  height = height || styleHeight || 100; // First check the direct prop, then style, then default to 100

  const {
      borderWidth = 0,
      borderTopWidth = borderWidth,
      borderBottomWidth = borderWidth,
      borderLeftWidth = borderWidth,
      borderRightWidth = borderWidth,
  } = remainingStyle;

  if (typeof width === 'string' && width.includes('%')) {
    console.log("Percentage-based width is not yet supported in BlastedImage. Please open an issue on github if you have a need for this.");
    return;
  }
  
  if (typeof height === 'string' && height.includes('%')) {
    console.log("Percentage-based height is not yet supported in BlastedImage. Please open an issue on github if you have a need for this.");
    return;
  }

  // Calculate the adjusted width and height
  const adjustedWidth = width - (borderLeftWidth + borderRightWidth);
  const adjustedHeight = height - (borderTopWidth + borderBottomWidth);

  const viewStyle = {
    ...defaultStyle,
    ...remainingStyle,
    width,
    height,
  };

  return (
    <View style={viewStyle}>
      {error ? (
        <Image source={require('./assets/image-error.png')} style={{width:adjustedHeight,height:adjustedHeight}} resizeMode={resizeMode} />
      ) : (typeof source === 'number') ? (
        <Image source={source} style={{ width: adjustedWidth, height: adjustedHeight }} resizeMode={resizeMode} />
      ) : (
        <BlastedImageView 
          sourceUri={source.uri} 
          width={adjustedWidth}
          height={adjustedHeight}
          resizeMode={resizeMode}
        />
      )}
    </View>
  );
};

BlastedImage.defaultProps = {
  resizeMode: "cover"
};

// clear memory cache
BlastedImage.clearMemoryCache = () => {
  return NativeBlastedImage.clearMemoryCache();
};

// clear disk cache
BlastedImage.clearDiskCache = () => {
  return NativeBlastedImage.clearDiskCache();
};

// clear disk and memory cache
BlastedImage.clearAllCaches = () => {
  return NativeBlastedImage.clearAllCaches();
};

BlastedImage.preload = (images) => {
  images.forEach(image => {
    loadImage(image.uri, image.headers, image.skipMemoryCache).catch(() => {
      // Log errors later if necessary
    });
  });
};

export default BlastedImage;
