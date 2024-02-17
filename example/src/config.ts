const config = {
    GEMINI_API_KEY: "YOUR_API_KEY",
    generativeConfig:{
        temperature: 0.9,
        topP: 0.1,
        topK: 16,
        maxOutputTokens: 2000,
        stopSequences: ["red"],
    }
};

export default config;
