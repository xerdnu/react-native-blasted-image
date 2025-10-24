#import "BlastedViewManager.h"
#import "BlastedImageModule.h"
#import <React/RCTViewManager.h>
#import <React/RCTConvert.h>
#import <React/RCTBridge.h>
#import <React/RCTBridgeModule.h>
#import <SDWebImage/SDWebImage.h>
#import <objc/runtime.h>

@implementation BlastedViewManager

RCT_EXPORT_MODULE(BlastedImageView);

- (UIView *)view {
    UIImageView *imageView = [[UIImageView alloc] init];
    return imageView;
}

- (BOOL)isEmptyString:(NSString *)str {
    return (!str || ![str isKindOfClass:[NSString class]] || [str isEqualToString:@""]);
}

- (UIColor *)colorFromHexString:(NSString *)hexString {
    if ([hexString hasPrefix:@"#"]) {
        hexString = [hexString substringFromIndex:1];
    }

    if (hexString.length == 6) {
        unsigned rgbValue = 0;
        NSScanner *scanner = [NSScanner scannerWithString:hexString];
        [scanner scanHexInt:&rgbValue];

        return [UIColor colorWithRed:((rgbValue & 0xFF0000) >> 16) / 255.0
            green:((rgbValue & 0x00FF00) >> 8) / 255.0
            blue:(rgbValue & 0x0000FF) / 255.0
            alpha:1.0];
    }

    SEL colorSelector = NSSelectorFromString([hexString stringByAppendingString:@"Color"]);
    if ([UIColor respondsToSelector:colorSelector]) {
        return [UIColor performSelector:colorSelector];
    }

    // Return black if no match is found
    return [UIColor blackColor];
}

RCT_CUSTOM_VIEW_PROPERTY(source, NSDictionary, UIImageView) {

    BlastedImageModule *blastedImageModule = [self.bridge moduleForClass:[BlastedImageModule class]];

    if ([self isEmptyString:json[@"uri"]]) {
        [blastedImageModule sendEventWithName:@"BlastedEventLog" message:@"Source is empty"]; 
        [view setHidden:YES];
        return;
    }

    NSString *uri = [RCTConvert NSString:json[@"uri"]];
    BOOL hybridAssets = [RCTConvert BOOL:json[@"hybridAssets"]];
    NSString *cloudUrl = [RCTConvert NSString:json[@"cloudUrl"]];
    NSDictionary *headers = [RCTConvert NSDictionary:json[@"headers"]];
    NSString *tintColorHex = [RCTConvert NSString:json[@"tintColor"]];

    NSURL *url = [blastedImageModule prepareUrl:uri hybridAssets:hybridAssets cloudUrl:cloudUrl headers:headers showLog:NO];

    if (url != nil && ![url.absoluteString isEqualToString:@""]) {
        UIColor *storedTintColor = objc_getAssociatedObject(view, @selector(tintColor));
        
        // Create context with headers if provided
        SDWebImageContext *context = nil;
        if (headers && headers.count > 0) {
            SDWebImageDownloaderRequestModifier *requestModifier = [[SDWebImageDownloaderRequestModifier alloc] initWithBlock:^NSURLRequest * _Nullable(NSURLRequest * _Nonnull request) {
                NSMutableURLRequest *mutableRequest = [request mutableCopy];
                for (NSString *key in headers) {
                    [mutableRequest setValue:headers[key] forHTTPHeaderField:key];
                }
                return [mutableRequest copy];
            }];
            context = @{SDWebImageContextDownloadRequestModifier: requestModifier};
        }

        if (!storedTintColor) {
            if (context) {
                [[SDWebImageManager sharedManager] loadImageWithURL:url options:0 context:context progress:nil completed:^(UIImage *image, NSData *data, NSError *error, SDImageCacheType cacheType, BOOL finished, NSURL *imageURL) {
                    if (image) {
                        view.image = image;
                    }
                }];
            } else {
                [view sd_setImageWithURL:url];
            }
        } else {
            if (context) {
                [[SDWebImageManager sharedManager] loadImageWithURL:url options:0 context:context progress:nil completed:^(UIImage *image, NSData *data, NSError *error, SDImageCacheType cacheType, BOOL finished, NSURL *imageURL) {
                    if (error) return;

                    dispatch_async(dispatch_get_main_queue(), ^{
                        view.tintColor = storedTintColor;
                        view.image = [image imageWithRenderingMode:UIImageRenderingModeAlwaysTemplate];
                        [view setNeedsDisplay];
                    });
                }];
            } else {
                [view sd_setImageWithURL:url completed:^(UIImage *image, NSError *error, SDImageCacheType cacheType, NSURL *imageURL) {
                    if (error) return;

                    dispatch_async(dispatch_get_main_queue(), ^{
                        view.tintColor = storedTintColor;
                        view.image = [image imageWithRenderingMode:UIImageRenderingModeAlwaysTemplate];
                        [view setNeedsDisplay];
                    });
                }];
            }
        }

        [view setHidden:NO];
    } else {
        [view setHidden:YES];
    }
}

RCT_CUSTOM_VIEW_PROPERTY(resizeMode, NSString, UIImageView) {
    NSString *resizeMode = [RCTConvert NSString:json];

    // Check if resizeMode is nil, empty, or "undefined" then set default
    if (!resizeMode || [resizeMode isEqualToString:@""] || [resizeMode isEqualToString:@"undefined"]) {
        resizeMode = @"cover";
    }

    if ([resizeMode isEqualToString:@"contain"]) {
        [view setContentMode:UIViewContentModeScaleAspectFit];
    } else if ([resizeMode isEqualToString:@"stretch"]) {
        [view setContentMode:UIViewContentModeScaleToFill];
    } else if ([resizeMode isEqualToString:@"cover"]) {
        [view setContentMode:UIViewContentModeScaleAspectFill];
    } else if ([resizeMode isEqualToString:@"center"]) {
        [view setContentMode:UIViewContentModeCenter];
    } else {
        [view setContentMode:UIViewContentModeScaleAspectFill]; // Default to cover
    }
}

RCT_CUSTOM_VIEW_PROPERTY(width, NSNumber, UIImageView) {
    CGFloat width = [RCTConvert CGFloat:json];
    CGRect frame = view.frame;
    frame.size.width = width;
    view.frame = frame;
}

RCT_CUSTOM_VIEW_PROPERTY(height, NSNumber, UIImageView) {
    CGFloat height = [RCTConvert CGFloat:json];
    CGRect frame = view.frame;
    frame.size.height = height;
    view.frame = frame;
}

RCT_CUSTOM_VIEW_PROPERTY(tintColor, NSString, UIImageView) {
    if ([self isEmptyString:json]) {
        return;
    }

    UIColor *uiColor = [self colorFromHexString:json];
    objc_setAssociatedObject(view, @selector(tintColor), uiColor, OBJC_ASSOCIATION_RETAIN_NONATOMIC);

    if (view.image) {
        view.image = [view.image imageWithRenderingMode:UIImageRenderingModeAlwaysTemplate];
        view.tintColor = uiColor;
    }

    [view setNeedsDisplay];
}

@end
