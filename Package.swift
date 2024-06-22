// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "GeminiXPlugin",
    platforms: [.iOS(.v13)],
    products: [
        .library(
            name: "GeminiXPlugin",
            targets: ["GeminiXPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", branch: "main"),
        .package(url: "https://github.com/google/generative-ai-swift.git", branch: "main")
    ],
    targets: [
        .target(
            name: "GeminiXPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "GoogleGenerativeAI", package: "generative-ai-swift")
            ],
            path: "ios/Sources/GeminiXPlugin"),
        .testTarget(
            name: "GeminiXPluginTests",
            dependencies: ["GeminiXPlugin"],
            path: "ios/Tests/GeminiXPluginTests")
    ]
)
