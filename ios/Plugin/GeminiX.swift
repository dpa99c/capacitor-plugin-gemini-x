import Foundation

@objc public class GeminiX: NSObject {
    @objc public func echo(_ value: String) -> String {
        print(value)
        return value
    }
}
