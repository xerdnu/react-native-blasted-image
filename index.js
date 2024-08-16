import React, { useState, useEffect/*, useRef*/ } from 'react';
import { requireNativeComponent, NativeModules, Platform, Image, View } from 'react-native';

const LINKING_ERROR =
	`The package 'react-native-blasted-image' doesn't seem to be linked. Make sure: \n\n` +
	Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
	'- You rebuilt the app after installing the package';

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

export const loadImage = (imageUrl, skipMemoryCache = false, hybridAssets = false, cloudUrl = null) => {

	if (hybridAssets && cloudUrl === null) {
		console.error("When using hybridAssets, you must specify a cloudUrl prop. This is the base URL where the local assets are hosted.");
		hybridAssets = false;
	}

	return NativeBlastedImage.loadImage(imageUrl, skipMemoryCache, hybridAssets, cloudUrl)
	.catch((error) => {
		console.error("Error loading image:", error);
		throw error;
	});
};

const BlastedImageView = requireNativeComponent('BlastedImageView');

const BlastedImage = ({ 
	resizeMode = "cover",
	isBackground = false,
	fallbackSource = null,
	source,
	width, 
	onLoad, 
	onError, 
	height, 
	style, 
	children 
}) => {
	const [error, setError] = useState(false);
	
	if (typeof source === 'object') {
		source = {
			uri: '',
			hybridAssets: false,
			cloudUrl: null,
			...source
		};

		if (source.hybridAssets && source.cloudUrl === null) {
			console.error("When using hybridAssets, you must specify a cloudUrl prop. This is the base URL where the local assets are hosted.");
			source.hybridAssets = false;
		}
	}

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
			setError(false);
			await loadImage(source.uri, false, source.hybridAssets, source.cloudUrl);
			onLoad?.();
		} catch (err) {
			setError(true);
			console.error(err);
			onError?.(err);
		}
		};
		
		fetchImage();
	}, [source]);

	// Flatten styles if provided as an array, otherwise use style as-is
	const flattenedStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;

	const defaultStyle = { overflow: 'hidden', position: 'relative', backgroundColor: style?.borderColor || 'transparent' }; // Use border color as background

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
		console.log("For maximum performance, BlastedImage does not support width defined as a percentage");
		return;
	}

	if (typeof height === 'string' && height.includes('%')) {
		console.log("For maximum performance, BlastedImage does not support height defined as a percentage");
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

	const childrenStyle = {
	  position: 'absolute',
	  top: 0,
	  left: 0,
	  justifyContent:'center',
	  alignItems:'center',
	  width: adjustedWidth,
	  height: adjustedHeight,
	};

	return (
	  <View style={!isBackground ? viewStyle : null}>
		{isBackground ? (
		  <View style={viewStyle}>
			{renderImageContent(error, source, fallbackSource, adjustedHeight, adjustedWidth, resizeMode)}
		  </View>
		) : (
		  renderImageContent(error, source, fallbackSource, adjustedHeight, adjustedWidth, resizeMode)
		)}
		{isBackground && <View style={childrenStyle}>{children}</View>}
	  </View>
	);
};

function renderImageContent(error, source, fallbackSource, adjustedHeight, adjustedWidth, resizeMode) {
	if (error) {
		if (fallbackSource) { // Error - Fallback specified, use native component
			return (
				<Image
				source={fallbackSource}
				style={{ width: adjustedHeight, height: adjustedHeight }}
				resizeMode={resizeMode}
				/>
			);
		} else { // Error - No fallback, use native component with static asset
			return (
				<Image
				source={require('./assets/image-error.png')}
				style={{ width: adjustedHeight, height: adjustedHeight }}
				resizeMode={resizeMode}
				/>
			);
		}
	} else if (typeof source === 'number') { // Success - with local asset
		return (
			<Image
				source={source}
				style={{ width: adjustedWidth, height: adjustedHeight }}
				resizeMode={resizeMode}
			/>
		);
	} else { // Success - with remote asset
		return (
			<BlastedImageView
				source={source}
				width={adjustedWidth}
				height={adjustedHeight}
				resizeMode={resizeMode}
			/>
		);
	}
}

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

BlastedImage.preload = (input) => {
	return new Promise((resolve) => {
		// single object
		if (typeof input === 'object' && input !== null && !Array.isArray(input)) {
			loadImage(input.uri, input.skipMemoryCache, input.hybridAssets, input.cloudUrl)
				.then(() => {
					resolve();
				})
				.catch((err) => {
					console.error("Error preloading single image:", err);
					resolve(); // Count as handled even if failed to continue processing
				});
		}
		// array
		else if (Array.isArray(input)) {
			let loadedCount = 0;

			if (input.length === 0) {
				resolve();
				return;
			}

			input.forEach(image => {
				loadImage(image.uri, image.skipMemoryCache, image.hybridAssets, image.cloudUrl)
					.then(() => {
						loadedCount++;
						if (loadedCount === input.length) {
							resolve();
						}
					})
					.catch((err) => {
						console.error("Error preloading one of the array images:", err);
						loadedCount++; // Count as handled even if failed to continue processing
						if (loadedCount === input.length) {
							resolve();
						}
					});
			});
		}
	});
};


export default BlastedImage;
