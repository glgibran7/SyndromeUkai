#import <React/RCTBridgeModule.h>
#import <UIKit/UIKit.h>

@interface FlagSecure : NSObject <RCTBridgeModule>
@end

@implementation FlagSecure {
  UIView *_secureView;
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(enable)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    UIWindow *keyWindow = [UIApplication sharedApplication].keyWindow;
    if (!self->_secureView && keyWindow) {
      self->_secureView = [[UIView alloc] initWithFrame:keyWindow.bounds];
      self->_secureView.backgroundColor = [UIColor blackColor];
      self->_secureView.userInteractionEnabled = NO;
      self->_secureView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
      [keyWindow addSubview:self->_secureView];
    }
  });
}

RCT_EXPORT_METHOD(disable)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self->_secureView) {
      [self->_secureView removeFromSuperview];
      self->_secureView = nil;
    }
  });
}

@end
