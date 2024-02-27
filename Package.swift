// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorGeminiX",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "GeminiXPlugin",
            targets: ["GeminiXPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor6-spm-test.git", branch: "main"),
        .package(url: "https://github.com/google/generative-ai-swift.git", branch: "main")
    ],
    targets: [
        .target(
            name: "GeminiXPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor6-spm-test"),
                .product(name: "Cordova", package: "capacitor6-spm-test"),
                .product(name: "GoogleGenerativeAI", package: "generative-ai-swift")
            ],
            path: "ios/Sources/GeminiXPlugin"),
        .testTarget(
            name: "GeminiXPluginTests",
            dependencies: ["GeminiXPlugin"],
            path: "ios/Tests/GeminiXPluginTests")
    ]
)
