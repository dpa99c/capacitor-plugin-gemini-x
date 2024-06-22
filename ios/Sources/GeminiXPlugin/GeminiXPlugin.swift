import Foundation
import Capacitor

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@available(iOS 15.0, *)
@objc(GeminiXPlugin)
public class GeminiXPlugin: CAPPlugin {
    public let identifier = "GeminiXPlugin"
    public let jsName = "GeminiX"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "initModel", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "sendMessage", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "countTokens", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "initChat", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "sendChatMessage", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "countChatTokens", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getChatHistory", returnType: CAPPluginReturnPromise)
    ]
    
    let GeminiXResponseChunkEvent = "GeminiXResponseChunk"
    
    /**********************
     *  Plugin API functions
     ************************/
    @objc func initModel(_ call: CAPPluginCall) {
        let params = call.getObject("params") ?? [:];
        GeminiX.initModel(onSuccess: {
            call.resolve()
        }, onError: { error in
            call.reject(error)
        }, params:params)
    }
    
    @objc func sendMessage(_ call: CAPPluginCall) {
        let inputText = call.getString("inputText") ?? ""
        let options = call.getObject("options") ?? [:]
        let streamResponse = call.getBool("streamResponse") ?? false
        let modelImages:[ImageDataWithType] = GeminiX.getImagesFromOptions(options: options)
        
        GeminiX.sendMessage(onSuccess: { response, isComplete, success in
            let result = [
                "response": response,
                "isChat": false
            ]
            if(isComplete){
                call.resolve(result)
            }else{
                let resultString = (try? JSONSerialization.data(withJSONObject: result, options: []))?.base64EncodedString()
                self.bridge?.triggerWindowJSEvent(eventName: self.GeminiXResponseChunkEvent, data: resultString!)
            }
            success()
        }, onError: { error in
            call.reject(error)
        }, inputText: inputText, images: modelImages, streamResponse: streamResponse)
    }
    
    @objc func countTokens(_ call: CAPPluginCall) {
        let inputText = call.getString("inputText") ?? ""
        let options = call.getObject("options") ?? [:]
        let modelImages:[ImageDataWithType] = GeminiX.getImagesFromOptions(options: options)
        
        GeminiX.countTokens(onSuccess: { response in
            let result = [
                "count": response,
                "isChat": false
            ]
            call.resolve(result)
        }, onError: { error in
            call.reject(error)
        }, inputText: inputText, images: modelImages)
    }

    @objc func initChat(_ call: CAPPluginCall) {
        do{
            var history: [HistoryItem] = []
            if(call.hasOption("chatHistory")){
                let history_object = call.getObject("chatHistory") ?? [:]
                let history_json = try JSONSerialization.data(withJSONObject: history_object, options: [])
                if let history_array = try JSONSerialization.jsonObject(with: history_json, options: []) as? [[String: Any]] {
                    for item in history_array {
                        if let isUser = item["isUser"] as? Bool {
                            if let parts = item["parts"] as? [Any]{
                                var historyParts:[HistoryPart] = []
                                for _part in parts {
                                    if let part = _part as? [String:Any]{
                                        if let type = part["type"] as? String {
                                            if type == "text" {
                                                if let content = part["content"] as? String {
                                                    let textPart = TextHistoryPart(content: content)
                                                    historyParts.append(textPart)
                                                }
                                            }
                                            if type == "image" {
                                                if let uri = part["content"] as? String {
                                                    let image:UIImage? = GeminiX.getImageForUri(imageUri: uri)
                                                    if(image != nil){
                                                        let imagePart = ImageHistoryPart(content: image!)
                                                        historyParts.append(imagePart)
                                                    }else{
                                                        throw GeminiXError.invalidArgument("Image file not found: \(uri)")
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                let historyItem = HistoryItem(parts:historyParts, isUser:isUser)
                                history.append(historyItem)
                            }
                        }
                    }
                }
            }
            
            
            GeminiX.initChat(onSuccess: {
                call.resolve()
            }, onError: { error in
                call.reject(error)
            }, history: history)
        }catch{
            call.reject(error.localizedDescription)
        }
    }
    
    @objc func sendChatMessage(_ call: CAPPluginCall) {
        let inputText = call.getString("inputText") ?? ""
        let options = call.getObject("options") ?? [:]
        let streamResponse = call.getBool("streamResponse") ?? false
        let modelImages:[ImageDataWithType] = GeminiX.getImagesFromOptions(options: options)
        
        GeminiX.sendChatMessage(onSuccess: { response, isComplete, success in
            let result = [
                "response": response,
                "isChat": true
            ]
            if(isComplete){
                call.resolve(result)
            }else{
                let resultString = (try? JSONSerialization.data(withJSONObject: result, options: []))?.base64EncodedString()
                self.bridge?.triggerWindowJSEvent(eventName: self.GeminiXResponseChunkEvent, data: resultString!)
            }
            success()
        }, onError: { error in
            call.reject(error)
        }, inputText: inputText, images: modelImages, streamResponse: streamResponse)
    }
    
    @objc func countChatTokens(_ call: CAPPluginCall) {
        let inputText = call.getString("inputText") ?? ""
        let options = call.getObject("options") ?? [:]
        let modelImages:[ImageDataWithType] = GeminiX.getImagesFromOptions(options: options)
        
        GeminiX.countChatTokens(onSuccess: { response in
            let result = [
                "count": response,
                "isChat": true
            ]
            call.resolve(result)
        }, onError: { error in
            call.reject(error)
        }, inputText: inputText, images: modelImages)
    }
    
    @objc func getChatHistory(_ call: CAPPluginCall){
        GeminiX.getChatHistory(onSuccess: { history in
            var historyArray:[[String:Any]] = []
            for item in history {
                var itemParts:[[String:Any]] = []
                for part in item.parts {
                    var partDict:[String:Any] = [:]
                    if let textPart = part as? TextHistoryPart {
                        partDict["type"] = "text"
                        partDict["content"] = textPart.content
                    }
                    if let blobPart = part as? BlobHistoryPart {
                        partDict["type"] = blobPart.mimeType
                        if let content = blobPart.content as? Data{
                            partDict["content"] = content.base64EncodedString()
                        }
                    }
                    itemParts.append(partDict)
                }
                let itemDict:[String:Any] = [
                    "isUser": item.isUser,
                    "parts": itemParts
                ]
                historyArray.append(itemDict)
            }
            var result = JSObject()
            result["history"] = historyArray
            call.resolve(result)
        }, onError: { error in
            call.reject(error)
        })
    }
}
