#import "BlastedImageModule.h"
#import <React/RCTEventEmitter.h>
#import <SDWebImage/SDWebImage.h>
#import <React/RCTConvert.h>
#import <SDWebImageSVGCoder/SDWebImageSVGCoder.h>
#import <SDWebImageAVIFCoder/SDWebImageAVIFCoder.h>

@implementation BlastedImageModule
{
    BOOL hasListeners;
}

RCT_EXPORT_MODULE(BlastedImage);

- (instancetype)init {
    self = [super init];
    if (self) {
        // Cache configuration
        SDImageCacheConfig *cacheConfig = [SDImageCache sharedImageCache].config;
        cacheConfig.maxDiskSize = 1024 * 1024 * 1024; // 1GB
        cacheConfig.maxDiskAge = NSIntegerMax; // No max time for disk cache
        cacheConfig.maxMemoryCost = 256 * 1024 * 1024; // 256MB memory cache

        // Add SVG support
        SDImageSVGCoder *svgCoder = [SDImageSVGCoder sharedCoder];
        [[SDImageCodersManager sharedManager] addCoder:svgCoder];  

        // Add AVIF support
        SDImageAVIFCoder *avifCoder = [SDImageAVIFCoder sharedCoder];
        [[SDImageCodersManager sharedManager] addCoder:avifCoder];              
    }
    return self;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[@"BlastedEventLoaded", 
            @"BlastedEventClearedMemory",
            @"BlastedEventClearedDisk",
            @"BlastedEventClearedAll",
            @"BlastedEventLog"
            ];
}

- (void)startObserving {
    hasListeners = YES;
}

- (void)stopObserving {
    hasListeners = NO;
}

- (void)sendEventWithName:(NSString *)name message:(NSString *)message {
    if (hasListeners) {
        NSString *formattedMessage = [NSString stringWithFormat:@"[BlastedImage] %@", message];
        [self sendEventWithName:name body:@{@"message": formattedMessage}];
    }
}

- (NSString *)extractImagePathFromUrl:(NSString *)imageUrl cloudUrl:(NSString *)cloudUrl {
    NSString *imagePath = [imageUrl stringByReplacingOccurrencesOfString:cloudUrl withString:@""];
    NSRange range = [imagePath rangeOfString:@"?alt=media"];
    if (range.location != NSNotFound) {
        imagePath = [imagePath substringToIndex:range.location];
    }
    imagePath = [imagePath stringByReplacingOccurrencesOfString:@"%2F" withString:@"/"];
    return [NSString stringWithFormat:@"blasted-image/%@", imagePath];
}

- (BOOL)doesFileExistInAssets:(NSString *)filePath {
    NSString *resourcePath = [[NSBundle mainBundle] pathForResource:filePath ofType:nil];
    BOOL fileExists = [[NSFileManager defaultManager] fileExistsAtPath:resourcePath];

    return fileExists;
}

- (NSURL *)prepareUrl:(NSString *)imageUrl
        hybridAssets:(BOOL)hybridAssets
            cloudUrl:(NSString *)cloudUrl
             showLog:(BOOL)showLog {
    
    NSString *imagePath = @"";
    NSURL *url;
    BOOL fileExistsInAssets = NO;

    if (hybridAssets) {
        imagePath = [self extractImagePathFromUrl:imageUrl cloudUrl:cloudUrl];
        fileExistsInAssets = [self doesFileExistInAssets:imagePath];
    }

    if (fileExistsInAssets && hybridAssets) {
        if (showLog) {
            [self sendEventWithName:@"BlastedEventLog" message:[NSString stringWithFormat:@"Image is in local assets. Local url: %@", imagePath]];

        }

        url = [NSURL fileURLWithPath:[[NSBundle mainBundle] pathForResource:imagePath ofType:nil]];

        if (showLog) {
            [self sendEventWithName:@"BlastedEventLog" message:[NSString stringWithFormat:@"Url:  %@", url.absoluteString]];                               
        }
    } else {
        if (hybridAssets) {
            if (showLog) {
                [self sendEventWithName:@"BlastedEventLog" message:[NSString stringWithFormat:@"Image is not in local assets (Use URL). Local url: %@. Remote url: %@", imagePath, imageUrl]];    
            }
        } else {
            if (showLog) {
                [self sendEventWithName:@"BlastedEventLog" message:[NSString stringWithFormat:@"Local assets disabled. Use remote url: %@", imageUrl]]; 
            }
        }

        url = [NSURL URLWithString:imageUrl];
    }

    return url;
}

RCT_EXPORT_METHOD(loadImage:(NSString *)imageUrl 
                skipMemoryCache:(BOOL)skipMemoryCache 
                hybridAssets:(BOOL)hybridAssets 
                cloudUrl:(NSString *)cloudUrl                 
                resolver:(RCTPromiseResolveBlock)resolve 
                rejecter:(RCTPromiseRejectBlock)reject) {

    // If showing image right after setting up NativeEventEmitters (BlastedEventLog etc.) the log might not show on iOS. Fix is to add a delay before showing the image but this is not a good solution or an option for production. Lets keep it as it is for now.
    NSURL *url = [self prepareUrl:imageUrl hybridAssets:hybridAssets cloudUrl:cloudUrl showLog:YES];

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
            if (cacheType == SDImageCacheTypeMemory) {
                message = [NSString stringWithFormat:@"(MEMORY) %@", imageURL];
            } else if ([imageURL isFileURL]) {
                message = [NSString stringWithFormat:@"(LOCAL) %@", imageURL];
            } else if (cacheType == SDImageCacheTypeDisk) {
                message = [NSString stringWithFormat:@"(DISK) %@", imageURL];
            } else {
                message = [NSString stringWithFormat:@"(NETWORK) %@", imageURL];
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
