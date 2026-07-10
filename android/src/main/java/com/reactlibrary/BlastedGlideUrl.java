package com.xerdnu.blastedimage;

import com.bumptech.glide.load.model.GlideUrl;
import com.bumptech.glide.load.model.Headers;

public class BlastedGlideUrl extends GlideUrl {

    private final String cacheKey;

    public BlastedGlideUrl(String url, String cacheKey) {
        super(url);
        this.cacheKey = cacheKey;
    }

    public BlastedGlideUrl(String url, String cacheKey, Headers headers) {
        super(url, headers);
        this.cacheKey = cacheKey;
    }

    @Override
    public String getCacheKey() {
        return (cacheKey != null && !cacheKey.isEmpty()) ? cacheKey : super.getCacheKey();
    }
}
