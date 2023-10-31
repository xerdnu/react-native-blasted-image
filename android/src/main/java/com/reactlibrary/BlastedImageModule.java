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
import com.bumptech.glide.load.model.LazyHeaders;
import com.bumptech.glide.load.model.Headers;
import com.bumptech.glide.load.engine.GlideException;
import com.bumptech.glide.request.RequestListener;
import com.bumptech.glide.request.target.Target;

import java.util.HashMap;
import java.util.Map;

import android.graphics.drawable.Drawable;

import android.util.Log;

@ReactModule(name = BlastedImageModule.NAME)
public class BlastedImageModule extends ReactContextBaseJavaModule {
    public static final String NAME = "BlastedImage";

    private void sendEvent(ReactContext reactContext, String eventName, String message) {
        WritableMap params = Arguments.createMap();
        params.putString("message", "["+NAME+"] "+message);
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }

    private final ReactApplicationContext mReactContext;

    public BlastedImageModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.mReactContext = reactContext;
    }

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

    // Show/Preload the image
    @ReactMethod
    public void loadImage(String imageUrl, ReadableMap headersMap, boolean skipMemoryCache, Promise promise) {
        try {
            GlideUrl glideUrl;
            if (headersMap != null && !headersMap.toHashMap().isEmpty()) {
                HashMap<String, Object> tempHeaders = headersMap.toHashMap();
                HashMap<String, String> headers = new HashMap<>();

                for (Map.Entry<String, Object> entry : tempHeaders.entrySet()) {
                    headers.put(entry.getKey(), String.valueOf(entry.getValue()));
                }
                
                LazyHeaders.Builder headersBuilder = new LazyHeaders.Builder();
                for (Map.Entry<String, String> entry : headers.entrySet()) {
                    headersBuilder.addHeader(entry.getKey(), entry.getValue());
                }
                glideUrl = new GlideUrl(imageUrl, headersBuilder.build());
            } else {
                glideUrl = new GlideUrl(imageUrl);
            }

            // Is skip skipMemoryCache set for image and should we store it only to disk?
            RequestOptions requestOptions = new RequestOptions();
            if (skipMemoryCache) {
                requestOptions = requestOptions.skipMemoryCache(true);
            }

            Glide.with(getReactApplicationContext())
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