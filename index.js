import React, { useState, useEffect, useRef, useCallback } from 'react';
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

const BlastedImageView = requireNativeComponent('BlastedImageView');

const requestsCache = {};

export const loadImage = (imageUrl, skipMemoryCache = false, hybridAssets = false, cloudUrl = null, retries = 3) => {

	if (typeof retries !== 'number' || retries <= 0) {
		retries = 1;
	}

	if (hybridAssets && cloudUrl === null) {
		console.error("When using hybridAssets, you must specify a cloudUrl prop. This is the base URL where the local assets are hosted.");
		hybridAssets = false;
	}

	const cacheKey = `${imageUrl}::${!!skipMemoryCache}::${!!hybridAssets}::${cloudUrl || ''}`;


	if (!requestsCache[cacheKey]) {

        requestsCache[cacheKey] = new Promise(async (resolve, reject) => {

			let wasRetried = false;

            for (let attempt = 1; attempt <= retries; attempt++) {
				// sleep for 1 second before retrying if attempt > 1
				if (attempt > 1) {
					wasRetried = true;
					// await new Promise(resolve => setTimeout(resolve, 5000)); Keep for testing purposes
				}
                try {
                    await NativeBlastedImage.loadImage(imageUrl, skipMemoryCache, hybridAssets, cloudUrl);
                    resolve({ wasRetried });
                    return;
                } catch (error) {
                    console.warn(`[BlastedImage] Attempt ${attempt} failed for ${imageUrl}`);
                    if (attempt === retries) {
                        delete requestsCache[cacheKey]; // Clear failed cache entry
                        reject(error);
                    }
                }
            }
        });
	}

	return requestsCache[cacheKey];	
};

const BlastedImage = ({ 
	resizeMode = "cover",
	isBackground = false,
	returnSize = false,
	fallbackSource = null,
	tintColor = null,
	retries = 3,
	source,
	width, 
	onLoad, 
	onError, 
	height, 
	style, 
	children
}) => {
	const [error, setError] = useState(false);
	const errorRef = useRef({});
	const [renderKey, setRenderKey] = useState(null);
	const isDoneRef = useRef(false);
	
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
		if (typeof source === 'number' || (typeof source === 'object' && source.uri && source.uri.startsWith('file://'))) {
			return;
		}

        // Check if this image URI already failed
        if (errorRef.current[source.uri]) {
            setError(true);
            return;
        }		

		if (isDoneRef.current) {
			return;
		}		
		
		fetchImage();
	}, [source]);

	// Callback for fetching image to not cause re-renders
	const fetchImage = useCallback(async () => {
		if (!source?.uri) {
			console.error("Invalid source URI.");
			return;
		}

		/*
		try {
			setError(false);
			await loadImage(source.uri, false, source.hybridAssets, source.cloudUrl, retries);
			onLoad?.();
		} catch (err) {
			setError(true);
			errorRef.current[source.uri] = true;
			console.error(`Failed to load image: ${source.uri}`, err);
			onError?.(err);
		}
		*/

		loadImage(source.uri, false, source.hybridAssets, source.cloudUrl, retries)
		.then(({wasRetried}) => {
			// Finally succeeded
			isDoneRef.current = true;
			if (wasRetried) {
				const key = Math.random().toString(36).substring(2, 8);
				setRenderKey(key);
			}
			setError(false);
			//onLoad?.();
			
			if (returnSize) {
				Image.getSize(source.uri, (width, height) => {
					onLoad?.({ width, height });
				}, (error) => {
					console.warn('[BlastedImage] Failed to get image size:', error);
					onLoad?.(null);
				});			
			} else {
				onLoad?.();
			}
		})
		.catch((err) => {
			isDoneRef.current = true;
			setError(true);
			errorRef.current[source.uri] = true;
			console.error(`Failed to load image: ${source.uri}`, err);
			onError?.(err);
		});		
	}, [source, retries]);	

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
		console.log("[BlastedImage] For maximum performance, BlastedImage does not support width defined as a percentage");
		return;
	}

	if (typeof height === 'string' && height.includes('%')) {
		console.log("[BlastedImage] For maximum performance, BlastedImage does not support height defined as a percentage");
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
			{renderImageContent(error, source, fallbackSource, tintColor, adjustedHeight, adjustedWidth, resizeMode, renderKey)}
		  </View>
		) : (
		  renderImageContent(error, source, fallbackSource, tintColor, adjustedHeight, adjustedWidth, resizeMode, renderKey)
		)}
		{isBackground && <View style={childrenStyle}>{children}</View>}
	  </View>
	);
};

function renderImageContent(error, source, fallbackSource, tintColor, adjustedHeight, adjustedWidth, resizeMode, renderKey) {
	if (error) {
		if (fallbackSource) { // Error - Fallback specified, use native component
			return (
				<Image
				source={fallbackSource}
				style={{ width: adjustedWidth, height: adjustedHeight }}
				resizeMode={resizeMode}
				tintColor={tintColor}
				/>
			);
		} else { // Error - No fallback, use native component with static asset
			return (
				<Image
				source={require('./assets/image-error.png')}
				style={{ width: adjustedWidth, height: adjustedHeight }}
				resizeMode={resizeMode}
				tintColor={tintColor}
				/>
			);
		}
	} else if (typeof source === 'number') { // Success - with local asset (require), no need to use cache
		return (
			<Image
				source={source}
				style={{ width: adjustedWidth, height: adjustedHeight }}
				resizeMode={resizeMode}
				tintColor={tintColor}
			/>
		);
	} else if (typeof source === 'object' && source.uri && source.uri.startsWith('file://')) { // Success - with local asset (file://android_asset), no need to use cache
		return (
			<Image
				source={{ uri: source.uri }}
				style={{ width: adjustedWidth, height: adjustedHeight }}
				resizeMode={resizeMode}
				tintColor={tintColor}
			/>
		);
	} else { // Success - with remote asset (http/https), use native component with full cache support
		return renderKey != null ? (
			<BlastedImageView
			  key={renderKey} // Force re-render when image is retried
			  source={source}
			  width={adjustedWidth}
			  height={adjustedHeight}
			  resizeMode={resizeMode}
			  tintColor={tintColor}
			/>
		) : (
			<BlastedImageView
			  source={source}
			  width={adjustedWidth}
			  height={adjustedHeight}
			  resizeMode={resizeMode}
			  tintColor={tintColor}
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

BlastedImage.preload = (input, retries = 3) => {
	return new Promise((resolve) => {
		// single object
		if (typeof input === 'object' && input !== null && !Array.isArray(input)) {
			loadImage(input.uri, input.skipMemoryCache, input.hybridAssets, input.cloudUrl, retries)
				.then(() => {
					resolve();
				})
				.catch((err) => {
					console.error(`Error preloading single image: ${input.uri}`, err);
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
				loadImage(image.uri, image.skipMemoryCache, image.hybridAssets, image.cloudUrl, retries)
					.then(() => {
						loadedCount++;
						if (loadedCount === input.length) {
							resolve();
						}
					})
					.catch((err) => {
						console.error(`Error preloading one of the array images: ${image.uri}`, err);
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
