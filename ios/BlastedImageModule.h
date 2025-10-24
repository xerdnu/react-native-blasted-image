#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface BlastedImageModule : RCTEventEmitter <RCTBridgeModule>

- (void)sendEventWithName:(NSString *)name message:(NSString *)message;

- (NSURL *)prepareUrl:(NSString *)imageUrl
        hybridAssets:(BOOL)hybridAssets
            cloudUrl:(NSString *)cloudUrl
             headers:(NSDictionary *)headers
             showLog:(BOOL)showLog;

@end
