package com.xerdnu.blastedimage;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.facebook.react.module.annotations.ReactModule;

import com.bumptech.glide.Glide;
import com.bumptech.glide.request.RequestOptions;
import com.bumptech.glide.load.model.GlideUrl;
import com.bumptech.glide.load.engine.GlideException;
import com.bumptech.glide.request.RequestListener;
import com.bumptech.glide.request.target.Target;
import com.bumptech.glide.GlideBuilder;
import com.bumptech.glide.load.engine.cache.InternalCacheDiskCacheFactory;
import com.bumptech.glide.load.engine.cache.LruResourceCache;

import java.util.HashMap;
import java.util.Map;
import java.io.File;

import android.content.res.AssetManager;
import android.graphics.drawable.Drawable;
import android.util.Log;
import android.net.Uri;

@ReactModule(name = BlastedImageModule.NAME)
public class BlastedImageModule extends ReactContextBaseJavaModule {
    public static final String NAME = "BlastedImage";
    private final ReactApplicationContext mReactContext;

    private static boolean isGlideInitialized = false;

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void addListener(String eventName) {
        // Do nothing
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // Do nothing
    }

    public BlastedImageModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.mReactContext = reactContext;

        if (!isGlideInitialized) {
            Glide.init(reactContext, new GlideBuilder()
                .setDiskCache(new InternalCacheDiskCacheFactory(reactContext, 1024 * 1024 * 1024)) //1gb disk cache
                .setMemoryCache(new LruResourceCache(100 * 1024 * 1024)) // 100mb memory cache
            );
            isGlideInitialized = true;
        }        
    }

    private void sendEvent(ReactContext reactContext, String eventName, String message) {
        WritableMap params = Arguments.createMap();
        params.putString("message", "["+NAME+"] "+message);
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }

    public String extractImagePathFromUrl(String imageUrl, String cloudUrl) {
        String imagePath = imageUrl.replace(cloudUrl, "");
        imagePath = imagePath.split("\\?alt=media")[0];

        imagePath = imagePath.replace("%2F", "/");

        return "blasted-image/" + imagePath;
    }    

    public boolean doesFileExistInAssets(String filePath) {
        AssetManager assetManager = mReactContext.getAssets();
        try {
            assetManager.open(filePath);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Object prepareGlideUrl(String imageUrl, boolean hybridAssets, String cloudUrl, boolean showLog) throws Exception {
        String imagePath = "";
        Object glideUrl; 
        boolean fileExistsInAssets = false;

        if (hybridAssets){
            imagePath = extractImagePathFromUrl(imageUrl, cloudUrl);
            fileExistsInAssets = doesFileExistInAssets(imagePath);
        }

        if (fileExistsInAssets && hybridAssets) {
            if (showLog) sendEvent(getReactApplicationContext(), "BlastedEventLog", "Image is in local assets. Local url: " + imagePath);
            glideUrl = Uri.parse("file:///android_asset/" + imagePath);
            if (showLog) sendEvent(getReactApplicationContext(), "BlastedEventLog", "Glide Url: " + glideUrl.toString());
        } else {
            if (hybridAssets){
                if (showLog) sendEvent(getReactApplicationContext(), "BlastedEventLog", "Image is not in local assets (Use URL). Local url: " + imagePath + ". Remote url: " + imageUrl);
            } else {
                if (showLog) sendEvent(getReactApplicationContext(), "BlastedEventLog", "Local assets disabled. Use remote url: " + imageUrl);
            }

            glideUrl = new GlideUrl(imageUrl);
        }

        return glideUrl;
    }

    // Show/Preload the image
    @ReactMethod
    public void loadImage(String imageUrl, boolean skipMemoryCache, boolean hybridAssets, String cloudUrl, Promise promise) {

        try {
            Object glideUrl = prepareGlideUrl(imageUrl, hybridAssets, cloudUrl, true);

            // Is skip skipMemoryCache set for image and should we store it only to disk?
            RequestOptions requestOptions = new RequestOptions();
            if (skipMemoryCache) {
                requestOptions = requestOptions.skipMemoryCache(true);
                Log.d("BlastedImageModule", "Skip memory cache");
            } else {
                Log.d("BlastedImageModule", "Memory cache image");
            }

            Glide.with(getCurrentActivity() != null ? getCurrentActivity() : getReactApplicationContext())
                .load(glideUrl)
                .apply(requestOptions)
                .listener(new RequestListener<Drawable>() {
                    @Override
                    public boolean onLoadFailed(@Nullable GlideException e, Object model, Target<Drawable> target, boolean isFirstResource) {
                        promise.reject("ERROR", "Failed to cache image", e);
                        return false;
                    }

                    @Override
                    public boolean onResourceReady(Drawable resource, Object model, Target<Drawable> target, com.bumptech.glide.load.DataSource dataSource, boolean isFirstResource) {
                        String message;                      
                        
                        if (dataSource == com.bumptech.glide.load.DataSource.MEMORY_CACHE) {
                            message = "(MEMORY) " + model.toString();
                        } else if (model.toString().startsWith("file:///android_asset/")) {
                            message = "(LOCAL) " + model.toString();
                        } else if (dataSource == com.bumptech.glide.load.DataSource.DATA_DISK_CACHE || dataSource == com.bumptech.glide.load.DataSource.RESOURCE_DISK_CACHE) {
                            message = "(DISK) " + model.toString();
                        } else {
                            message = "(NETWORK) " + model.toString();
                        }

                        sendEvent(getReactApplicationContext(), "BlastedEventLoaded", message);
                        promise.resolve(true);
                        
                        return false;
                    }
                })
                .preload();
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to cache image", e);
        }
    }

    // Clear memory caache
    @ReactMethod
    public void clearMemoryCache(final Promise promise) {
        mReactContext.runOnUiQueueThread(new Runnable() {
            @Override
            public void run() {
                try {
                    Glide.get(mReactContext).clearMemory();
                    sendEvent(getReactApplicationContext(), "BlastedEventClearedMemory", "Memory cache cleared.");
                    promise.resolve(null);
                } catch (Exception e) {
                    Log.e("BlastedImageModule", "Error clearing Glide memory cache", e);
                    promise.reject("ERROR_CLEARING_MEMORY_CACHE", "Error clearing memory cache", e);
                }
            }
        });
    }

    // Clear disk cache
    @ReactMethod
    public void clearDiskCache(final Promise promise) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Glide.get(mReactContext).clearDiskCache();
                    sendEvent(getReactApplicationContext(), "BlastedEventClearedDisk", "Disk cache cleared.");
                    promise.resolve(null);
                } catch (Exception e) {
                    Log.e("BlastedImageModule", "Error clearing Glide disk cache", e);
                    promise.reject("ERROR_CLEARING_DISK_CACHE", "Error clearing disk cache", e);
                }
            }
        }).start();
    }

    // Clear all caches
    @ReactMethod
    public void clearAllCaches(final Promise promise) {
        // Clear memory cache on UI thread
        mReactContext.runOnUiQueueThread(new Runnable() {
            @Override
            public void run() {
                try {
                    Glide.get(mReactContext).clearMemory();
                    
                    // Clear disk cache on a background thread
                    new Thread(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                Glide.get(mReactContext).clearDiskCache();
                                sendEvent(getReactApplicationContext(), "BlastedEventClearedAll", "Memory and disk cache cleared.");
                                promise.resolve(null);
                            } catch (Exception e) {
                                Log.e("BlastedImageModule", "Error clearing Glide disk cache", e);
                                promise.reject("ERROR_CLEARING_DISK_CACHE", "Error clearing disk cache", e);
                            }
                        }
                    }).start();
                } catch (Exception e) {
                    Log.e("BlastedImageModule", "Error clearing Glide memory cache", e);
                    promise.reject("ERROR_CLEARING_MEMORY_CACHE", "Error clearing memory cache", e);
                }
            }
        });
    }

   
}