import React, { useState, useEffect } from 'react';
import { requireNativeComponent, NativeModules, Platform, Text, View } from 'react-native';

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

export const loadImage = (imageUrl, headers = {}) => {
  return NativeBlastedImage.loadImage(imageUrl, headers);
};

const BlastedImageView = requireNativeComponent('BlastedImageView');

const BlastedImage = ({ source, width, height, style, resizeMode }) => {
  const [error, setError] = useState(false);
  const [loadingSource, setLoadingSource] = useState(null); 

  if (!source || !source.uri) {
    console.log("Source not specified correctly -> <BlastedImage source={{ uri: 'https://example.com/image.jpg' }} />");
    return null;
  }

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const result = await loadImage(source.uri, source.headers);
        setLoadingSource(result); // Set the source of the image (memory, disk, network)
      } catch (err) {
        console.error(err);
      }
    };

    fetchImage();
  }, [source]);

  const defaultStyle = { overflow: 'hidden', backgroundColor: style?.borderColor || 'transparent' }; // Use border color as background

  const {
    width: styleWidth,  // Get width from style
    height: styleHeight, // Get height from style
    ...remainingStyle // All other styles excluding above
  } = style || {};

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
      <BlastedImageView 
        sourceUri={source.uri} 
        width={adjustedWidth}
        height={adjustedHeight}
        resizeMode={resizeMode}
        onError={() => setError(true)} 
      />
      {loadingSource && <Text>{loadingSource}</Text>}
    </View>
  );
};

BlastedImage.defaultProps = {
  resizeMode: "contain"
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
    loadImage(image.uri, image.headers).catch(() => {
      // Log errors later if necessary
    });
  });
};

export default BlastedImage;
