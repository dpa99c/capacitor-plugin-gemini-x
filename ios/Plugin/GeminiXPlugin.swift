import Foundation
import Capacitor

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(GeminiXPlugin)
public class GeminiXPlugin: CAPPlugin {
    
    
    @objc func initModel(_ call: CAPPluginCall) {
        let params = call.getObject("params") ?? [:];
        GeminiX.initModel(onSuccess: {
            //self.sendPluginSuccess(command: command, keepCallback:false)
        }, onError: { error in
            //self.sendPluginError(command: command, error: "\(error)", keepCallback:false)
        }, params:params)
    }

}
