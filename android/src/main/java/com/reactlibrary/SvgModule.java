package com.xerdnu.blastedimage;

import android.content.Context;
import android.graphics.drawable.PictureDrawable;
import android.util.Log;

import androidx.annotation.NonNull;

import com.bumptech.glide.Glide;
import com.bumptech.glide.Registry;
import com.bumptech.glide.annotation.GlideModule;
import com.bumptech.glide.module.AppGlideModule;
import com.caverock.androidsvg.SVG;

import java.io.InputStream;

@GlideModule
public class SvgModule extends AppGlideModule {
    @Override
    public void registerComponents(@NonNull Context context, @NonNull Glide glide, @NonNull Registry registry) {
        Log.d("SvgModule", "Registering SVG support in Glide");
        registry
            .register(SVG.class, PictureDrawable.class, new SvgDrawableTranscoder())
            .append(InputStream.class, SVG.class, new SvgDecoder());
    }

    @Override
    public boolean isManifestParsingEnabled() {
        return false;
    }
}