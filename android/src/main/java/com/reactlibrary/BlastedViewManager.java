package com.xerdnu.blastedimage;

import com.bumptech.glide.Glide;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;

import android.widget.ImageView;
import android.view.View;
import android.view.ViewOutlineProvider;
import android.view.ViewGroup;

import android.graphics.Outline;
import android.graphics.drawable.Drawable;
import android.graphics.Rect;

import android.util.Log;


public class BlastedViewManager extends SimpleViewManager<ImageView> {

    public static final String REACT_CLASS = "BlastedImageView";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected ImageView createViewInstance(ThemedReactContext reactContext) {
        Log.d("BlastedViewManager", "BlastedImageView instance created");
        return new ImageView(reactContext);
    }

    @ReactProp(name = "source")
    public void setSource(ImageView view, ReadableMap source) {
        if (source == null) {
            Log.e("BlastedViewManager", "Source is null");
            return;
        }
        
        Log.d("BlastedViewManager", "source value: " + source);

        try {
            String uri = source.hasKey("uri") ? source.getString("uri") : null;
            boolean hybridAssets = source.hasKey("hybridAssets") && source.getBoolean("hybridAssets");
            String cloudUrl = source.hasKey("cloudUrl") ? source.getString("cloudUrl") : null;
            
            ThemedReactContext themedReactContext = (ThemedReactContext) view.getContext();
            ReactApplicationContext reactContext = (ReactApplicationContext) themedReactContext.getReactApplicationContext();
            BlastedImageModule blastedImageModule = new BlastedImageModule(reactContext);

            Object glideUrl = blastedImageModule.prepareGlideUrl(uri, hybridAssets, cloudUrl, false); // false = Dont show logs when not preload

            Log.d("BlastedViewManager", "glideUrl value: " + glideUrl.toString());

            if (glideUrl != null && !glideUrl.toString().isEmpty()) {
                Glide.with(reactContext.getCurrentActivity() != null ? reactContext.getCurrentActivity() : view.getContext())
                    .load(glideUrl)
                    .into(view);
                view.setVisibility(View.VISIBLE);  // glideUrl is valid so show ImageView
            } else {
                view.setVisibility(View.INVISIBLE);  // Hide the ImageView
            }
        } catch (Exception e) {
            Log.e("BlastedViewManager", "Error setting glideUrl: " + e.getMessage());
            view.setVisibility(View.INVISIBLE); // Hide the ImageView
        }
    }

    @ReactProp(name = "resizeMode")
    public void setResizeMode(ImageView view, String resizeMode) {
        Log.d("BlastedImageViewManager", "resizeMode value: " + resizeMode);

        // If resizeMode is not specified or is invalid, set to cover
        if (resizeMode == null || resizeMode.isEmpty() || "undefined".equals(resizeMode)) {
            resizeMode = "cover";
        }

        if ("contain".equals(resizeMode)) {
            view.setScaleType(ImageView.ScaleType.FIT_CENTER);
        } else if ("stretch".equals(resizeMode)) {
            view.setScaleType(ImageView.ScaleType.FIT_XY);
        } else if ("cover".equals(resizeMode)) {
            view.setScaleType(ImageView.ScaleType.CENTER_CROP);
        } else if ("center".equals(resizeMode)) {
            view.setScaleType(ImageView.ScaleType.CENTER);
        } else {
            view.setScaleType(ImageView.ScaleType.CENTER_CROP); // Default to cover
        }

    }

    @ReactProp(name = "width")
    public void setWidth(ImageView view, int width) {
        if (width <= 0) {
            width = 100; // default 100
        }
        ViewGroup.LayoutParams layoutParams = view.getLayoutParams();
        if (layoutParams != null) {
            layoutParams.width = width;
            view.setLayoutParams(layoutParams);
        }
    }

    @ReactProp(name = "height")
    public void setHeight(ImageView view, int height) {
        if (height <= 0) {
            height = 100; // default 100
        }
        ViewGroup.LayoutParams layoutParams = view.getLayoutParams();
        if (layoutParams != null) {
            layoutParams.height = height;
            view.setLayoutParams(layoutParams);
        }
    }

    // more properties... :)
}
