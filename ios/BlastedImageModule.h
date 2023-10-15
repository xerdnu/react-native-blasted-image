#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface BlastedImageModule : RCTEventEmitter <RCTBridgeModule>

- (void)sendEventWithName:(NSString *)name message:(NSString *)message;

@end
