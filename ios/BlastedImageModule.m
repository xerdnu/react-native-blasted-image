#import "BlastedImageModule.h"
#import <React/RCTEventEmitter.h>
#import <SDWebImage/SDWebImage.h>
#import <React/RCTConvert.h>

@implementation BlastedImageModule
{
    BOOL hasListeners; // Check if any listeners (ios specific)
}

RCT_EXPORT_MODULE(BlastedImage);

- (NSArray<NSString *> *)supportedEvents {
    return @[@"BlastedEventLoaded", 
             @"BlastedEventClearedMemory",
             @"BlastedEventClearedDisk",
             @"BlastedEventClearedAll"];
}

- (void)startObserving {
    hasListeners = YES;
}

- (void)stopObserving {
    hasListeners = NO;
}

- (void)sendEventWithName:(NSString *)name message:(NSString *)message {
    if (hasListeners) {
        [self sendEventWithName:name body:@{@"message": [[NSString alloc] initWithFormat:@"[BlastedImage] %@", message]}];
    }
}

RCT_EXPORT_METHOD(loadImage:(NSString *)imageUrl headers:(NSDictionary *)headers skipMemoryCache:(BOOL)skipMemoryCache resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    NSURL *url = [NSURL URLWithString:imageUrl];
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
    
    // Convert headers
    if (headers) {
        for (NSString *key in headers) {
            [request setValue:[RCTConvert NSString:headers[key]] forHTTPHeaderField:key];
        }
    }

    // Is skip skipMemoryCache set for image and should we store it only to disk?
    SDWebImageOptions options = 0;
    if (skipMemoryCache) {
        options |= SDWebImageAvoidAutoSetImage;
    }

    // Load/Show image using show and preload
    [[SDWebImageManager sharedManager] loadImageWithURL:url
                                                options:options
                                               progress:nil
                                              completed:^(UIImage *image, NSData *data, NSError *error, SDImageCacheType cacheType, BOOL finished, NSURL *imageURL) {
        if (error) {
            reject(@"ERROR", @"Failed to cache image", error);
        } else {
            if (skipMemoryCache) {
                [[SDImageCache sharedImageCache] removeImageForKey:imageUrl fromDisk:NO withCompletion:nil];
            }

            NSString *message;
            switch (cacheType) {
                case SDImageCacheTypeMemory:
                    message = [NSString stringWithFormat:@"(MEMORY) %@", imageURL];
                    break;
                case SDImageCacheTypeDisk:
                    message = [NSString stringWithFormat:@"(DISK) %@", imageURL];
                    break;
                default:
                    message = [NSString stringWithFormat:@"(NETWORK) %@", imageURL];
                    break;
            }
            
            [self sendEventWithName:@"BlastedEventLoaded" message:message];
            resolve(nil);
        }
    }];
}

// Clear memory cache
RCT_EXPORT_METHOD(clearMemoryCache:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [[SDImageCache sharedImageCache] clearMemory];
    NSString *message = @"Memory cache cleared"; 
    [self sendEventWithName:@"BlastedEventClearedMemory" message:message];
    resolve(nil);
}

// Clear disk cache
RCT_EXPORT_METHOD(clearDiskCache:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [[SDImageCache sharedImageCache] clearDiskOnCompletion:^{
        NSString *message = @"Disk cache cleared"; 
        [self sendEventWithName:@"BlastedEventClearedDisk" message:message];
        resolve(nil);
    }];
}

// Clear all caches
RCT_EXPORT_METHOD(clearAllCaches:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [[SDImageCache sharedImageCache] clearWithCacheType:SDImageCacheTypeAll completion:^{
        NSString *message = @"All caches cleared"; 
        [self sendEventWithName:@"BlastedEventClearedAll" message:message];
        resolve(nil);
    }];
}

@end
