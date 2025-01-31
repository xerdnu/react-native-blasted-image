package com.xerdnu.blastedimage;

import android.graphics.drawable.PictureDrawable;
import androidx.annotation.NonNull;
import com.bumptech.glide.load.engine.Resource;

public class SvgDrawableResource implements Resource<PictureDrawable> {
    private final PictureDrawable drawable;

    public SvgDrawableResource(PictureDrawable drawable) {
        if (drawable == null) {
            throw new NullPointerException("PictureDrawable must not be null");
        }
        this.drawable = drawable;
    }

    @NonNull
    @Override
    public Class<PictureDrawable> getResourceClass() {
        return PictureDrawable.class;
    }

    @NonNull
    @Override
    public PictureDrawable get() {
        return drawable;
    }

    @Override
    public int getSize() {
        return 1; 
    }

    @Override
    public void recycle() {
        // Do nothing here
    }
}