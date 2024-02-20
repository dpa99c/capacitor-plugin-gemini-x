import Foundation
import UIKit
import GoogleGenerativeAI

protocol HistoryPart {
    var type: String { get }
    var content: Any { get }
}

class TextHistoryPart: HistoryPart {
    var content: Any

    var type: String {
        return "text"
    }

    init(content: String) {
        self.content = content
    }
}

class ImageHistoryPart: HistoryPart {
    var content: Any

    var type: String {
        return "image"
    }

    init(content: UIImage) {
        self.content = content
    }
}

class BlobHistoryPart: HistoryPart {
    var content: Any
    var mimeType: String

    var type: String {
        return "blob"
    }

    init(content: Data, mimeType: String) {
        self.content = content
        self.mimeType = mimeType
    }
}

class HistoryItem {
    var parts: [HistoryPart]
    var isUser: Bool

    init(parts: [HistoryPart], isUser: Bool) {
        self.parts = parts
        self.isUser = isUser
    }
}

class ImageUriWithType : Codable{
    var uri: String
    var mimeType: String?
    
    init(uri:String, mimeType:String?){
        self.uri = uri
        self.mimeType = mimeType
    }
    
    required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        uri = try container.decode(String.self, forKey: .uri)
        mimeType = try container.decode(String.self, forKey: .mimeType)
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(uri, forKey: .uri)
        try container.encode(mimeType, forKey: .mimeType)
    }
    
    enum CodingKeys: String, CodingKey {
        case uri
        case mimeType
    }
}

class ImageDataWithType : Codable {
    var data: Data
    var mimeType: String?
    
    init(data: UIImage, mimeType: String?) {
        self.data = data.pngData()! // Convert UIImage to Data
        self.mimeType = mimeType
    }
    
    required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        data = try container.decode(Data.self, forKey: .data)
        mimeType = try container.decode(String.self, forKey: .mimeType)
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(data, forKey: .data)
        try container.encode(mimeType, forKey: .mimeType)
    }
    
    enum CodingKeys: String, CodingKey {
        case data
        case mimeType
    }
    
    func getImage() -> UIImage? {
        return UIImage(data: self.data)
    }
}


enum GeminiXError: Error {
    case invalidArgument(String)
}

class GeminiX {


    /****************
     * Internal properties
     ***********************/

    private static var model: GenerativeModel?
    private static var chat: Chat?

    /******************
     * Public functions
     **************************/

    static func initModel(onSuccess:() -> Void, onError:(String) -> Void, params:[String: Any]) {
        do{

            let modelName = params["modelName"] as? String ?? ""
            let apiKey = params["apiKey"] as? String ?? ""

            let temperature = params["temperature"] != nil ? params["temperature"] as? Float : nil
            let topK = params["topK"] != nil ? params["topK"] as? Int : nil
            let topP = params["topP"] != nil ? params["topP"] as? Float : nil
            let maxOutputTokens = params["maxOutputTokens"] != nil ? params["maxOutputTokens"] as? Int : nil
            let stopSequences = params["stopSequences"] != nil ? params["stopSequences"] as? [String] : nil

            let str_safetySettings = params["safetySettings"] != nil ? params["safetySettings"] as? [String: String] : nil
            var safetySettings = [] as [SafetySetting]
            for (key, value) in str_safetySettings! {
                safetySettings.append(SafetySetting(harmCategory: try getHarmCategory(category: key), threshold: try getHarmLevel(level: value)))
            }


            let generationConfig = GenerationConfig(
                temperature: temperature,
                topP: topP,
                topK: topK,
                maxOutputTokens: maxOutputTokens,
                stopSequences: stopSequences
            )

            self.model = GenerativeModel(name:modelName, apiKey:apiKey, generationConfig:generationConfig, safetySettings: safetySettings)
            self.chat = nil
            onSuccess()
        }catch{
            onError("\(error)")
        }
    }

    static func sendMessage(onSuccess:@escaping(String, Bool, _ callback:@escaping() -> Void) -> Void, onError:@escaping(String) -> Void, inputText:String, images:[ImageDataWithType]?, streamResponse:Bool?) {
        if((self.model == nil)){
            onError("Model not initialised")
            return
        }
        let inputContents = getInputContents(text:inputText, images:images ?? [], onError:onError)
        Task.detached(operation: {
            do{
                if(streamResponse == true){
                    var finalResponse = ""
                    guard let contentStream = model?.generateContentStream(inputContents) else {
                        onError("No content stream in response")
                        return;
                    }
                    let group = DispatchGroup()
                    for try await chunk in contentStream {
                        if let text = chunk.text {
                            finalResponse += text
                            group.enter()
                            onSuccess(text, false, {
                                group.leave()
                            }) 
                        }
                    }
                    group.notify(queue: .main) {
                        onSuccess(finalResponse, true, {})
                    }
                }else{
                    let response = try await self.model?.generateContent(inputContents)
                    let result = (response?.text)!
                    onSuccess(result, true, {})
                }
            }catch{
                onError("\(error)")
            }
        })

    }

    static func countTokens(onSuccess:@escaping(String) -> Void, onError:@escaping(String) -> Void, inputText:String, images:[ImageDataWithType]?) {
        if((self.model == nil)){
            onError("Model not initialised")
            return
        }
        let inputContents = getInputContents(text:inputText, images:images ?? [], onError:onError)
        Task.detached(operation:{
            do{
                let response = try await self.model?.countTokens(inputContents)
                let result = (response?.totalTokens)!
                onSuccess("\(result)")
            }catch{
                onError("\(error)")
            }
        })
    }

    static func initChat(onSuccess:() -> Void, onError:(String) -> Void, history:[HistoryItem]?) {
        if((self.model == nil)){
            onError("Model not initialised")
            return
        }

        var chatHistory:[ModelContent] = []
        if(history != nil){
            for item in history! {
                let userRole = item.isUser ? "user" : "model"
                for part in item.parts {
                    if(part.type == "text"){
                        chatHistory.append(ModelContent(role: userRole, parts: part.content as! String))
                    }else if(part.type == "image"){
                        chatHistory.append(ModelContent(role: userRole, parts: part.content as! UIImage))
                    }else if(part.type == "blob"){
                        let part = part as! BlobHistoryPart
                        let blob = part.content as! Data
                        let mimeType = part.mimeType
                        let dataPart = ModelContent.Part.data(mimetype: mimeType, blob)
                        chatHistory.append(ModelContent(role: userRole, parts: dataPart))
                    }
                }
            }
        }

        self.chat = self.model?.startChat(history: chatHistory)
        onSuccess()
    }
    
    static func sendChatMessage(onSuccess:@escaping(String, Bool, _ callback:@escaping() -> Void) -> Void, onError:@escaping(String) -> Void, inputText:String, images:[ImageDataWithType]?, streamResponse:Bool?) {
        if((self.model == nil)){
            onError("Model not initialised")
            return
        }
        if((self.chat == nil)){
            onError("Chat not initialised")
            return
        }
        let inputContents = getInputContents(text:inputText, images:images ?? [], onError:onError)
        Task.detached(operation: {
            do{
                if(streamResponse == true){
                    var finalResponse = ""
                    guard let contentStream = self.chat?.sendMessageStream(inputContents) else {
                        onError("No content stream in response")
                        return;
                    }
                    let group = DispatchGroup()
                    for try await chunk in contentStream {
                        if let text = chunk.text {
                            finalResponse += text
                            group.enter()
                            onSuccess(text, false, {
                                group.leave()
                            })
                        }
                    }
                    group.notify(queue: .main) {
                        onSuccess(finalResponse, true, {})
                    }
                }else{
                    let response = try await self.chat?.sendMessage(inputContents)
                    let result = (response?.text)!
                    onSuccess(result, true, {})
                }
            }catch{
                onError("\(error)")
            }
        })

    }

    static func countChatTokens(onSuccess:@escaping(String) -> Void, onError:@escaping(String) -> Void, inputText:String?, images:[ImageDataWithType]?) {
        if((self.model == nil)){
            onError("Model not initialised")
            return
        }
        if((self.chat == nil)){
            onError("Chat not initialised")
            return
        }
        Task.detached(operation:{
            do{
                var inputContents:[ModelContent] = self.chat?.history ?? []
                if(inputText != nil && images != nil && images!.count > 0){
                    let userInputContents = getInputContents(text:inputText ?? "", images:images ?? [], onError:onError)
                    inputContents.append(contentsOf:userInputContents)
                }
                
                let response = try await self.model?.countTokens(inputContents)
                let result = (response?.totalTokens)!
                onSuccess("\(result)")
            }catch{
                onError("\(error)")
            }
        })
    }

    static func getChatHistory(onSuccess:@escaping([HistoryItem]) -> Void, onError:@escaping(String) -> Void) {
        if((self.model == nil)){
            onError("Model not initialised")
            return
        }
        if((self.chat == nil)){
            onError("Chat not initialised")
            return
        }
        
        let chatHistory:[ModelContent] = self.chat?.history ?? []
        var history:[HistoryItem] = []
        for chatContent in chatHistory{
            let isUser = chatContent.role == "user"
            var historyParts:[HistoryPart] = []
            for chatPart in chatContent.parts {
                var historyPart:HistoryPart
                switch chatPart {
                  case let .text(textVal):
                    historyPart = TextHistoryPart(content: textVal)
                    historyParts.append(historyPart)
                  case let .data(mimetypeVal, dataVal):
                    if(mimetypeVal == "image/jpeg" || mimetypeVal == "image/png"){
                        let image = UIImage(data: dataVal)
                        historyPart = ImageHistoryPart(content: image!)
                        
                    }else{
                        historyPart = BlobHistoryPart(content: dataVal, mimeType: mimetypeVal)
                    }
                  }
                historyParts.append(historyPart)
            }
            let historyItem = HistoryItem(parts:historyParts, isUser:isUser)
            history.append(historyItem)
        }
        onSuccess(history)
    }
    
    static func getModelImage(imageUriWithType:ImageUriWithType) -> ImageDataWithType {
        let image = getImageForUri(imageUri: imageUriWithType.uri)
        let imageDataWithType = ImageDataWithType(data: image!, mimeType: imageUriWithType.mimeType)
        return imageDataWithType
    }
    
    static func getModelImages(imageUrisWithTypes:[ImageUriWithType]) -> [ImageDataWithType] {
        var modelImages:[ImageDataWithType] = []
        for imageUriWithType in imageUrisWithTypes {
            let imageDataWithType = getModelImage(imageUriWithType: imageUriWithType)
            modelImages.append(imageDataWithType)
        }
        return modelImages
    }
    
    static func getImagesForUris(imageUris:[String]) -> [UIImage]{
        var images:[UIImage] = []
        for uri in imageUris {
            if let image = getImageForUri(imageUri: uri){
                images.append(image)
            }
        }
        return images
    }
    
    static func getImageForUri(imageUri:String) -> UIImage?{
        var image:UIImage? = nil
        if let url = URL(string: imageUri) {
            if FileManager.default.fileExists(atPath: url.path) {
                if let _image = UIImage(contentsOfFile: url.path) {
                    image = _image;
                }
            }
        }
        return image
    }

    /******************
     * Internal functions
     **************************/
    
    private static func getHarmCategory(category:String) throws -> SafetySetting.HarmCategory{
        var harmCategory = SafetySetting.HarmCategory.unknown
        switch category {
        case "DANGEROUS_CONTENT":
            harmCategory = SafetySetting.HarmCategory.dangerousContent
        case "HARASSMENT":
            harmCategory = SafetySetting.HarmCategory.harassment
        case "HATE_SPEECH":
            harmCategory = SafetySetting.HarmCategory.hateSpeech
        case "SEXUALLY_EXPLICIT":
            harmCategory = SafetySetting.HarmCategory.sexuallyExplicit
        case "UNSPECIFIED":
            harmCategory = SafetySetting.HarmCategory.unspecified
        default:
            throw GeminiXError.invalidArgument("\(category) is not a valid Harm Category")
        }
        return harmCategory
    }
    
    private static func getHarmLevel(level:String) throws -> SafetySetting.BlockThreshold{
        var threshold = SafetySetting.BlockThreshold.unknown
        switch level {
        case "NONE":
            threshold = SafetySetting.BlockThreshold.blockNone
        case "ONLY_HIGH":
            threshold = SafetySetting.BlockThreshold.blockOnlyHigh
        case "MEDIUM_AND_ABOVE":
            threshold = SafetySetting.BlockThreshold.blockMediumAndAbove
        case "LOW_AND_ABOVE":
            threshold = SafetySetting.BlockThreshold.blockLowAndAbove
        case "UNSPECIFIED":
            threshold = SafetySetting.BlockThreshold.unspecified
        default:
            throw GeminiXError.invalidArgument("\(level) is not a valid Harm Level")
        }
        return threshold
    }
    

    private static func getInputContents(text:String, images:[ImageDataWithType], onError:@escaping(String) -> Void) -> [ModelContent] {
        var parts:[ModelContent.Part] = []
        if(text != ""){
            let textPart = ModelContent.Part.text(text)
            parts.append(textPart)
        }
    
        for image in images{
            if(image.mimeType != nil){
                if(image.mimeType == "image/png") {
                    if let data = image.getImage()!.pngData() {
                        let imagePart = ModelContent.Part.data(mimetype: "image/png", data)
                        parts.append(imagePart)
                    }
                }else if let data = image.getImage()!.jpegData(compressionQuality: 0.8) {
                    let imagePart = ModelContent.Part.data(mimetype: "image/jpeg", data)
                    parts.append(imagePart)
                }else{
                    onError("Unsupported mime type: "+image.mimeType!+" - only image/png and image/jpeg are supported on iOS")
                }
            }else if let data = image.getImage()!.jpegData(compressionQuality: 0.8) {
                let imagePart = ModelContent.Part.data(mimetype: "image/jpeg", data)
                parts.append(imagePart)
            }else{
                onError("Unable to create JPG from UIImage data")
            }
        }
        let inputContent = ModelContent(role: "user", parts: parts)
        let inputContents = [inputContent]
        return inputContents
    }
}
